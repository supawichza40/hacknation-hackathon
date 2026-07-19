// M3 scoring tests — run with: node --test tests/scoring.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeAxisScores, type ScoringInput } from "../src/lib/scoring.ts";
import { parseClaims } from "../src/lib/claims.ts";

const claims = parseClaims(
  JSON.parse(readFileSync(join(process.cwd(), "data/demo/claims/ecc/claims.json"), "utf8")),
);

// The real ECC diligence inputs (seed-demo.ts + captured graph).
const eccInput: ScoringInput = {
  founderScore: 82,
  history: [{ appliedAt: "2025-10-01", founderScore: 61 }],
  claims,
  graph: { nodes: 42, edges: 49 },
  unknowns: ["ARR", "cap table"],
};

test("deterministic: identical inputs produce identical scores", () => {
  const a = computeAxisScores(eccInput);
  const b = computeAxisScores(eccInput);
  assert.deepEqual(a, b);
});

test("three separate axes, never blended into one number", () => {
  const axes = computeAxisScores(eccInput);
  assert.equal(axes.length, 3);
  const keys = axes.map((a) => a.axis).sort();
  assert.deepEqual(keys, ["founder", "idea_vs_market", "market"]);
});

test("founder axis reflects the score and 61->82 improving trend", () => {
  const founder = computeAxisScores(eccInput).find((a) => a.axis === "founder")!;
  assert.equal(founder.score, 82);
  assert.equal(founder.trend, "improving");
  assert.match(founder.because, /61.*82/);
  assert.equal(founder.evidenceCount, 2); // current + 1 prior observation
});

test("trend stays baseline until a second dated observation exists", () => {
  const noHistory = computeAxisScores({ ...eccInput, history: [] }).find((a) => a.axis === "founder")!;
  assert.equal(noHistory.trend, "baseline");
});

test("idea-vs-market axis is depressed by the one contradicted claim", () => {
  const axes = computeAxisScores(eccInput);
  const idea = axes.find((a) => a.axis === "idea_vs_market")!;
  const founder = axes.find((a) => a.axis === "founder")!;
  assert.match(idea.because, /contradicted/i);
  assert.ok(idea.score < founder.score, "contradiction should pull idea-vs-market below founder");
});

test("empty claims still scores the founder axis and gives honest baselines", () => {
  const axes = computeAxisScores({ ...eccInput, claims: [] });
  const market = axes.find((a) => a.axis === "market")!;
  assert.equal(market.score, 50);
  assert.match(market.because, /No market/i);
});
