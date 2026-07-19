// M5 apply tests — run with: node --test tests/apply.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db.ts";
import { validateApplyInput, applyOpportunity } from "../src/lib/apply.ts";

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
