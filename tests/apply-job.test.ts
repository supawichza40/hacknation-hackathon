// Async /apply analysis job — run with: node --test tests/apply-job.test.ts
// Proves the lifecycle invariant: the background job always leaves a TERMINAL status
// (never a stuck "analyzing"), and with no ANTHROPIC_API_KEY it ends
// "analysis_unavailable" with an honest reason — never a fabricated score.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { getDb } from "../src/lib/db.ts";
import { validateApplyInput, applyOpportunity, applySlug } from "../src/lib/apply.ts";
import { runApplyAnalysis } from "../src/lib/apply-analyze.ts";

test("runApplyAnalysis with no API key ends 'analysis_unavailable', not stuck 'analyzing'", async () => {
  const dbPath = join(tmpdir(), `apply-job-${process.pid}-${Date.now()}.db`);

  // Seed an inbound apply opportunity (status starts "analyzing").
  const db = getDb(dbPath);
  const parsed = validateApplyInput({ companyName: "Acme AI", repoUrl: "https://github.com/sindresorhus/is" });
  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  const { opportunityId } = applyOpportunity(db, parsed.value);
  assert.equal(
    (db.prepare("SELECT analysis_status FROM opportunity WHERE id = ?").get(opportunityId) as { analysis_status: string })
      .analysis_status,
    "analyzing",
  );
  db.close();

  // Force the no-key path so the job never clones or bills Opus — deterministic + free.
  const savedKey = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const outcome = await runApplyAnalysis({
      opportunityId,
      slug: applySlug(opportunityId),
      cloneUrl: "https://github.com/sindresorhus/is.git",
      dbPath,
    });
    assert.equal(outcome.status, "analysis_unavailable");
    assert.ok(outcome.reason && /ANTHROPIC_API_KEY/.test(outcome.reason), "reason must be honest");
  } finally {
    if (savedKey !== undefined) process.env.ANTHROPIC_API_KEY = savedKey;
  }

  // The persisted status is terminal and honest — the whole point of DB-backed state.
  const db2 = getDb(dbPath);
  const row = db2
    .prepare("SELECT analysis_status, analysis_reason FROM opportunity WHERE id = ?")
    .get(opportunityId) as { analysis_status: string; analysis_reason: string | null };
  assert.notEqual(row.analysis_status, "analyzing", "must never be left stuck 'analyzing'");
  assert.equal(row.analysis_status, "analysis_unavailable");
  assert.ok(row.analysis_reason && row.analysis_reason.length > 0);
  db2.close();

  rmSync(dbPath, { force: true });
});
