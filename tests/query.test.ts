// M4 R1 query tests — run with: node --test tests/query.test.ts
// Deterministic intent parse over the seeded founders' structured facts (no LLM).
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDb, getThesis, getOpportunityCards } from "../src/lib/db.ts";
import { seedDemo } from "../scripts/seed-demo.ts";
import { parseIntent, runDeterministicQuery } from "../src/lib/query.ts";

function cards() {
  const db = getDb(":memory:");
  seedDemo(db);
  const thesis = getThesis(db);
  const out = getOpportunityCards(db, thesis);
  db.close();
  return out;
}

test("parseIntent maps improving-score language", () => {
  assert.equal(parseIntent("founders with improving scores")?.key, "improving-score");
  assert.equal(parseIntent("who is rising")?.key, "improving-score");
});

test("improving query returns ECC with a citation on every row", () => {
  const result = runDeterministicQuery("founders with improving scores", cards());
  assert.ok(result, "expected a deterministic match");
  assert.equal(result!.usedLlm, false);
  assert.ok(result!.matches.length >= 1);
  assert.ok(result!.matches.some((m) => m.companyName === "ECC"));
  for (const m of result!.matches) {
    assert.ok(m.citation.locator.length > 0, "every row carries a citation locator");
    assert.ok(m.citation.excerpt.length > 0);
  }
});

test("off-thesis query surfaces BrightCart (over the $100K check cap)", () => {
  const result = runDeterministicQuery("show me off-thesis companies", cards());
  assert.ok(result);
  assert.ok(result!.matches.some((m) => m.companyName === "BrightCart"));
  for (const m of result!.matches) assert.ok(m.citation.locator.length > 0);
});

test("unknown free-form query returns null (deterministic layer declines)", () => {
  assert.equal(runDeterministicQuery("what is the airspeed of a swallow", cards()), null);
});

test("query is deterministic across reruns", () => {
  const c = cards();
  assert.deepEqual(
    runDeterministicQuery("improving", c),
    runDeterministicQuery("improving", c),
  );
});
