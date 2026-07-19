// M4 memo tests — run with: node --test tests/memo.test.ts
// Covers the zod contract and R6 deterministic gap generation (no LLM here).
import { test } from "node:test";
import assert from "node:assert/strict";
import { computeGaps, parseMemo, safeParseMemo, GAP_NOTE, type Memo } from "../src/lib/memo.ts";

const validSection = { text: "Grounded prose.", citations: [{ ref: "c5", quote: "cross-harness portability" }] };
const validMemo: Memo = {
  sections: {
    thesisFit: validSection,
    team: validSection,
    market: validSection,
    product: validSection,
    risks: validSection,
  },
  gaps: [{ category: "Team", note: GAP_NOTE }],
  recommendation: "Deferred to the analyst decision.",
};

test("memo zod contract accepts a well-formed memo", () => {
  const parsed = parseMemo(validMemo);
  assert.equal(parsed.sections.product.text, "Grounded prose.");
  assert.equal(parsed.sections.product.citations[0].ref, "c5");
});

test("memo zod contract rejects a memo missing a section", () => {
  const bad = { ...validMemo, sections: { ...validMemo.sections } } as Record<string, unknown>;
  delete (bad.sections as Record<string, unknown>).risks;
  assert.equal(safeParseMemo(bad).success, false);
});

test("memo zod contract rejects an empty section text", () => {
  const bad = { ...validMemo, sections: { ...validMemo.sections, team: { text: "", citations: [] } } };
  assert.equal(safeParseMemo(bad).success, false);
});

test("R6 gap generation: ECC's disclosed facts leave undisclosed categories as gap rows", () => {
  // ECC discloses only sector/stage/ask; explicit unknowns are ARR + cap table.
  const facts = {
    sector: { value: "AI infra", evidenceIds: ["ev-ecc-why"] },
    stage: { value: "pre-seed", evidenceIds: ["ev-ecc-why"] },
    ask: { value: "$100K", evidenceIds: ["ev-ecc-why"] },
  };
  const gaps = computeGaps(facts, ["ARR", "cap table"]);
  assert.ok(gaps.length >= 1, "expected at least one gap row");
  // R6: gap rows are the fixed disclosure note, NEVER an inferred value.
  for (const g of gaps) assert.equal(g.note, GAP_NOTE);
  const cats = gaps.map((g) => g.category.toLowerCase());
  assert.ok(cats.some((c) => c.includes("team")), "Team should be an undisclosed gap");
  assert.ok(
    cats.some((c) => c.includes("cap table") || c.includes("financ")),
    "explicit unknowns should surface as gaps",
  );
});

test("R6 gap generation is deterministic", () => {
  const facts = { sector: { value: "AI infra", evidenceIds: ["e1"] } };
  assert.deepEqual(computeGaps(facts, ["ARR"]), computeGaps(facts, ["ARR"]));
});

test("R6: a fully-disclosed category is not double-listed", () => {
  const facts = { team: { value: "solo founder", evidenceIds: ["e1"] } };
  const gaps = computeGaps(facts, []);
  assert.ok(!gaps.some((g) => g.category.toLowerCase() === "team"));
});
