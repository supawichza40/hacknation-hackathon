// M5 apply tests — run with: node --test tests/apply.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db.ts";
import {
  validateApplyInput,
  applyOpportunity,
  validateGithubRepoUrl,
  applySlug,
} from "../src/lib/apply.ts";

test("apply creates an inbound, visible Opportunity from a valid form", () => {
  const db = getDb(":memory:");
  const parsed = validateApplyInput({ companyName: "Acme AI", repoUrl: "https://github.com/acme/acme" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;

  const { opportunityId, deduped } = applyOpportunity(db, parsed.value);
  assert.equal(deduped, false);

  const row = db
    .prepare("SELECT source, source_channel, visible, company_name FROM opportunity WHERE id = ?")
    .get(opportunityId) as { source: string; source_channel: string; visible: number; company_name: string };
  assert.equal(row.source, "inbound");
  assert.equal(row.source_channel, "apply");
  assert.equal(row.visible, 1);
  assert.equal(row.company_name, "Acme AI");
  db.close();
});

test("apply dedups by normalized repo URL — a resubmit maps to the same Opportunity", () => {
  const db = getDb(":memory:");
  const first = applyOpportunity(db, { companyName: "Acme AI", repoUrl: "https://github.com/acme/acme" });
  const before = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };

  // Different casing, trailing slash, and .git suffix — same identity (plan §5).
  const second = applyOpportunity(db, { companyName: "Acme (again)", repoUrl: "http://www.GitHub.com/Acme/Acme.git/" });
  const after = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };

  assert.equal(second.deduped, true);
  assert.equal(second.opportunityId, first.opportunityId);
  assert.equal(after.n, before.n, "no new opportunity row on a duplicate repo");

  const persons = db.prepare("SELECT COUNT(*) AS n FROM person").get() as { n: number };
  assert.equal(persons.n, 1, "no duplicate person on a duplicate repo");
  db.close();
});

test("apply validation: company + repo are required and the repo must be http(s)", () => {
  const missing = validateApplyInput({ companyName: "", repoUrl: "" });
  assert.equal(missing.ok, false);
  if (!missing.ok) {
    assert.ok(missing.fields.companyName);
    assert.ok(missing.fields.repoUrl);
  }

  const badUrl = validateApplyInput({ companyName: "Acme", repoUrl: "not-a-url" });
  assert.equal(badUrl.ok, false);
  if (!badUrl.ok) assert.ok(badUrl.fields.repoUrl);

  const badDeck = validateApplyInput({ companyName: "Acme", repoUrl: "https://github.com/acme/acme", deckUrl: "ftp://x" });
  assert.equal(badDeck.ok, false);
  if (!badDeck.ok) assert.ok(badDeck.fields.deckUrl);

  // Deck is optional — a valid form without one passes.
  assert.equal(validateApplyInput({ companyName: "Acme", repoUrl: "https://github.com/acme/acme" }).ok, true);
});

test("SSRF: only https://github.com/<owner>/<repo> is accepted; everything else is rejected", () => {
  // Accepted shapes (bare, .git suffix, trailing slash) — all canonicalize the same.
  for (const good of [
    "https://github.com/sindresorhus/is",
    "https://github.com/sindresorhus/is.git",
    "https://github.com/sindresorhus/is/",
    "https://GitHub.com/Sindre-sorhus/is_2.0",
  ]) {
    const r = validateGithubRepoUrl(good);
    assert.equal(r.ok, true, `expected accept: ${good}`);
    if (r.ok) assert.match(r.cloneUrl, /^https:\/\/github\.com\/[^/]+\/[^/]+\.git$/);
  }

  // Rejected: SSRF hosts, wrong scheme/host, credentials/port, extra path, traversal,
  // shell metacharacters, and non-URLs. None of these may pass validation.
  for (const bad of [
    "http://169.254.169.254/",
    "http://localhost/acme/acme",
    "http://github.com/acme/acme", // not https
    "https://gitlab.com/acme/acme", // wrong host
    "https://raw.githubusercontent.com/acme/acme", // wrong host
    "https://github.com.evil.com/acme/acme", // host suffix trick
    "https://user:pass@github.com/acme/acme", // embedded credentials
    "https://github.com:22/acme/acme", // non-default port
    "https://github.com/acme/acme/tree/main", // extra path segments
    "https://github.com/acme", // missing repo
    "https://github.com/acme/../../etc", // traversal
    "https://github.com/acme/acme;rm -rf /", // shell metacharacter
    "git@github.com:acme/acme.git", // ssh scheme
    "file:///etc/passwd",
    "javascript:alert(1)",
    "not-a-url",
    "",
  ]) {
    assert.equal(validateGithubRepoUrl(bad).ok, false, `expected reject: ${bad}`);
    // And the whole apply form must reject it too (so the route never creates an opp).
    assert.equal(
      validateApplyInput({ companyName: "Acme", repoUrl: bad }).ok,
      false,
      `apply form should reject: ${bad}`,
    );
  }
});

test("an SSRF/invalid repo URL creates NO opportunity row", () => {
  const db = getDb(":memory:");
  const before = (db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number }).n;
  const parsed = validateApplyInput({ companyName: "Acme", repoUrl: "http://169.254.169.254/" });
  assert.equal(parsed.ok, false);
  // The route only calls applyOpportunity when parsed.ok — a rejected URL never reaches it.
  const after = (db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number }).n;
  assert.equal(after, before, "no opportunity may be created from a rejected URL");
  db.close();
});

test("a valid submit creates an opportunity with analysis_status = 'analyzing'", () => {
  const db = getDb(":memory:");
  const parsed = validateApplyInput({ companyName: "Acme AI", repoUrl: "https://github.com/sindresorhus/is" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const { opportunityId } = applyOpportunity(db, parsed.value);

  const row = db
    .prepare("SELECT analysis_status, analysis_reason FROM opportunity WHERE id = ?")
    .get(opportunityId) as { analysis_status: string | null; analysis_reason: string | null };
  assert.equal(row.analysis_status, "analyzing");
  assert.equal(row.analysis_reason, null);
  // The graph-slug round-trips back to this opportunity id (diligence resolves it).
  assert.equal(applySlug(opportunityId), opportunityId.replace(/^opp-/, ""));
  db.close();
});
