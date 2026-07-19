// Precompute the ECC investment memo with ONE real `claude -p` call (LLM call #2).
// Writes the committed runtime artifact (data/demo/memos/ecc/memo.json), the honest
// replay capture (data/replay/memo/: raw output, prompt, provenance.json), and the memo
// row into the SQLite DB. Runnable: `node scripts/precompute-memo.ts`.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { getDb } from "../src/lib/db.ts";
import { seedDemo } from "./seed-demo.ts";
import { getDiligenceView } from "../src/lib/diligence.ts";
import { loadGraph } from "../src/lib/graph/io.ts";
import { generateMemo, saveMemo, type MemoInput } from "../src/lib/memo.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "ecc";

function conceptNames(): string[] {
  const g = loadGraph(SLUG);
  if (!g) return [];
  return g.nodes.filter((n) => n.type === "concept").slice(0, 8).map((n) => n.name);
}

function main(): void {
  // Ensure the DB is seeded so the diligence view (facts/claims/axes) is present.
  const seedDb = getDb();
  seedDemo(seedDb);
  seedDb.close();

  const view = getDiligenceView(SLUG);
  if (!view) throw new Error("ECC diligence view not found — seed first");

  const facts: MemoInput["facts"] = Object.fromEntries(
    view.facts.map((f) => [f.key, { value: f.value, evidenceIds: f.evidenceIds }]),
  );
  const input: MemoInput = {
    companyName: view.companyName,
    sector: view.sector,
    stage: view.stage,
    geo: view.geo,
    askLabel: `$${(view.askAmountCents / 100).toLocaleString("en-US")}`,
    facts,
    unknowns: view.unknowns,
    claims: view.claims.map((c) => ({ id: c.id, slideNo: c.slideNo, status: c.status, text: c.text })),
    axes: view.axes.map((a) => ({ axis: a.axis, label: a.label, score: a.score, because: a.because, trend: a.trend })),
    graph: { nodes: view.graph.nodes, edges: view.graph.edges, concepts: conceptNames() },
    slideTitles: view.slides.map((s) => `${s.slideNo}: ${s.title}`),
  };

  console.log("Calling claude -p for the ECC memo (real call, may take ~30-90s)…");
  const { memo, provenance, raw, prompt } = generateMemo({
    input,
    artifact: `memo:${SLUG}`,
    source: "ECC screening facts + deck claims + deterministic axis scores + knowledge graph",
    fallbackMemoPath: join(ROOT, "data/demo/memos/ecc/memo.json"),
  });

  const memoPath = saveMemo(SLUG, memo);
  console.log(`Wrote committed memo -> ${memoPath} (${memo.gaps.length} gap rows)`);

  const replayDir = join(ROOT, "data/replay/memo");
  mkdirSync(replayDir, { recursive: true });
  writeFileSync(join(replayDir, "raw-model-output.json"), raw + "\n", "utf8");
  writeFileSync(join(replayDir, "prompt.txt"), prompt + "\n", "utf8");
  writeFileSync(join(replayDir, "provenance.json"), JSON.stringify(provenance, null, 2) + "\n", "utf8");
  console.log(`Wrote replay capture -> ${replayDir}`);

  // Store to DB (requirement: memo persisted). Runtime read path stays the committed JSON.
  const db = getDb();
  db.prepare(
    `INSERT INTO memo (id, opportunity_id, version, sections, recommendation, thesis_fit, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET sections=excluded.sections, recommendation=excluded.recommendation,
       thesis_fit=excluded.thesis_fit, generated_at=excluded.generated_at`,
  ).run(
    `memo-${view.opportunityId}-v1`,
    view.opportunityId,
    1,
    JSON.stringify(memo.sections),
    memo.recommendation ?? "",
    view.axes.some((a) => a.axis === "founder") ? 1 : 0,
    provenance.isoTimestamp ?? new Date().toISOString(),
  );
  db.close();
  console.log("Stored memo row into data/vc-brain.db");
}

main();
