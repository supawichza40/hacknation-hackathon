// Deck-claims tests — run with: node --test tests/claims.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parseClaims, safeParseClaims, contradictedCount } from "../src/lib/claims.ts";

const claims = parseClaims(
  JSON.parse(readFileSync(join(process.cwd(), "data/demo/claims/ecc/claims.json"), "utf8")),
);

test("claims.json validates against the claims schema", () => {
  assert.ok(claims.length >= 1);
  for (const c of claims) assert.ok(c.evidence.length >= 1, `claim ${c.id} has no evidence`);
});

test("invariant: EXACTLY ONE contradicted claim", () => {
  assert.equal(contradictedCount(claims), 1);
});

test("the contradicted claim is slide 4's sub-100ms pitch, grounded in real evidence", () => {
  const c = claims.find((x) => x.status === "contradicted")!;
  assert.equal(c.slideNo, 4);
  assert.match(c.text, /sub-?100\s*ms|routing/i);
  // grounded: cites both the deck slide and a repo locator
  assert.ok(c.evidence.some((e) => e.locator.startsWith("deck://")));
  assert.ok(c.evidence.some((e) => /repos\/ecc|\.md:/.test(e.locator)));
});

test("schema rejects a claim with an invalid status", () => {
  const bad = safeParseClaims([
    { id: "x", text: "t", slideNo: 1, status: "true", evidence: [{ locator: "l", excerpt: "e" }] },
  ]);
  assert.equal(bad.success, false);
});

test("schema rejects a claim with no evidence", () => {
  const bad = safeParseClaims([{ id: "x", text: "t", slideNo: 1, status: "verified", evidence: [] }]);
  assert.equal(bad.success, false);
});
