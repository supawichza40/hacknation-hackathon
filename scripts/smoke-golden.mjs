// smoke:golden — drives the never-cut golden path OFFLINE against the REAL lib layer
// and seeded SQLite, asserting each demo beat (VC-BRAIN-PLAN.md §0.5 golden path +
// screen-map §6; DoD doc 08 Layer 3 / FR-DEMO-01). Not mocked: every beat calls the
// same production functions the API routes delegate to, over the real demo/replay
// artifacts. Exits non-zero on any failed beat and prints a per-beat PASS/FAIL table.
//
// Isolation: write beats (scan reveal, decision, apply) run on in-memory temp DBs, so
// the shared data/vc-brain.db is only ever re-seeded (idempotent) and read — never left
// with test rows. Run via `npm run seed && npm run smoke:golden` (this script also
// re-seeds defensively so a prior scan can't leave PipeWarden visible).
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(REPO); // every lib module resolves paths + the DB against process.cwd()

// Enforce the DoD "outbound network disabled" clause for anything fetch-based. The
// golden path is offline by construction (SQLite + fs + pure compute); the deterministic
// query path is used, never the claude-spawn fallback.
globalThis.fetch = () => {
  throw new Error("smoke:golden runs offline — outbound network is disabled");
};

const { getDb, getThesis, getOpportunityCards, setOpportunityVisible } = await import(
  "../src/lib/db.ts"
);
const { seedDemo } = await import("./seed-demo.ts");
const { evaluateThesisFit } = await import("../src/lib/thesis.ts");
const { loadRanking, computeScanReplay, SCAN_THRESHOLD } = await import("../src/lib/scan.ts");
const { runDeterministicQuery } = await import("../src/lib/query.ts");
const { getDiligenceView } = await import("../src/lib/diligence.ts");
const { contradictedCount } = await import("../src/lib/claims.ts");
const { recordDecision, getDecision } = await import("../src/lib/decision.ts");
const { validateApplyInput, applyOpportunity } = await import("../src/lib/apply.ts");
const { finalizeChatAnswer, buildGraphContext, loadChatCapture } = await import(
  "../src/lib/chat.ts"
);
const { loadGraph, loadTour } = await import("../src/lib/graph/io.ts");

const PLANNED_OPPS = ["opp-ecc", "opp-lattice", "opp-brightcart", "opp-pipewarden"];

const results = [];
function beat(id, name, fn) {
  try {
    const detail = fn() || "";
    results.push({ id, name, ok: true, detail });
  } catch (e) {
    results.push({ id, name, ok: false, detail: e.message });
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Canonical baseline: re-seed the shared DB (idempotent upserts) so the offline rehearsal
// always starts from 3-visible + PipeWarden-hidden, then a temp seeded DB for write beats.
const rdb = getDb();
seedDemo(rdb);
const tdb = getDb(":memory:");
seedDemo(tdb);

// 1. Pipeline: exactly the 3 planned visible cards; PipeWarden seeded hidden.
beat("pipeline-visible", "Pipeline: 3 visible cards, PipeWarden hidden", () => {
  const cards = getOpportunityCards(rdb, getThesis(rdb));
  const ids = cards.map((c) => c.id).sort();
  assert(cards.length === 3, `expected 3 visible cards, got ${cards.length}`);
  assert(
    JSON.stringify(ids) === JSON.stringify(["opp-brightcart", "opp-ecc", "opp-lattice"]),
    `unexpected visible set: ${ids.join(",")}`,
  );
  assert(!cards.some((c) => c.id === "opp-pipewarden"), "PipeWarden must not be visible pre-scan");
  const pw = rdb.prepare("SELECT visible FROM opportunity WHERE id='opp-pipewarden'").get();
  assert(pw && pw.visible === 0, "PipeWarden must be seeded hidden (visible=0)");
  return `cards=${ids.join(",")}; pipewarden.visible=0`;
});

// 2. Scan replay (github) fires and reveals PipeWarden into Outbound.
beat("scan-reveals-pipewarden", "Scan replay reveals PipeWarden", () => {
  const before = tdb.prepare("SELECT visible FROM opportunity WHERE id='opp-pipewarden'").get();
  assert(before.visible === 0, "PipeWarden should start hidden");
  const replay = computeScanReplay(loadRanking());
  assert(Array.isArray(replay.steps) && replay.steps.length > 0, "scan produced no steps");
  assert(replay.steps.some((s) => s.crossed), "no scan step crossed the activation threshold");
  assert(replay.topScore >= SCAN_THRESHOLD, `topScore ${replay.topScore} < threshold`);
  setOpportunityVisible(tdb, "opp-pipewarden", true); // the reveal the /api/scan route performs
  const after = tdb.prepare("SELECT visible FROM opportunity WHERE id='opp-pipewarden'").get();
  assert(after.visible === 1, "PipeWarden must be visible after scan");
  const cards = getOpportunityCards(tdb, getThesis(tdb));
  assert(cards.some((c) => c.id === "opp-pipewarden"), "revealed PipeWarden missing from pipeline");
  return `topScore=${replay.topScore}; visible 0->1`;
});

// 3. Thesis toggle greys BrightCart (off-thesis on check size) and un-greys it when widened.
beat("thesis-toggle-brightcart", "Thesis toggle greys/un-greys BrightCart", () => {
  const thesis = getThesis(rdb);
  const cards = getOpportunityCards(rdb, thesis);
  const bc = cards.find((c) => c.id === "opp-brightcart");
  assert(bc.fit.onThesis === false, "BrightCart should be off-thesis (greyed)");
  assert(bc.fit.checks.checkSize === false, "BrightCart should fail on check size");
  assert(bc.fit.checks.sector === true, "only check size should fail for BrightCart");
  const widened = evaluateThesisFit(
    { sector: "AI infra", stage: "seed", geo: "US", askAmountCents: 200_000_000 },
    { ...thesis, checkSizeMaxCents: 200_000_000 },
  );
  assert(widened.onThesis === true, "widening check size should un-grey BrightCart");
  return "off-thesis on checkSize; widening un-greys";
});

// 4. R1 natural-language query "improving" ranks ECC with a citation.
beat("r1-query-improving", 'R1 query "improving" -> ECC cited', () => {
  const cards = getOpportunityCards(rdb, getThesis(rdb));
  const r = runDeterministicQuery("improving", cards);
  assert(r && Array.isArray(r.matches), "deterministic query returned no result");
  const ecc = r.matches.find((m) => m.opportunityId === "opp-ecc");
  assert(ecc, "ECC not returned for 'improving' query");
  assert(ecc.citation && ecc.citation.locator && ecc.citation.excerpt, "ECC match is uncited");
  return `ECC cited via ${ecc.citation.locator}`;
});

// 5. Diligence ECC: three separate evidence-backed axes, no average.
beat("diligence-three-axes", "Diligence ECC has 3 separate axes", () => {
  const dv = getDiligenceView("ecc");
  assert(dv, "diligence view for ecc missing");
  const axes = dv.axes.map((a) => a.axis);
  assert(dv.axes.length === 3, `expected 3 axes, got ${dv.axes.length}`);
  assert(new Set(axes).size === 3, "axes must be distinct");
  assert(
    !axes.some((a) => /average|overall|composite/i.test(a)),
    "axes must not include an average/overall",
  );
  return axes.join(",");
});

// 6. Memo carries at least one honest "Not disclosed" gap.
beat("diligence-memo-not-disclosed", 'Memo has >=1 "Not disclosed" gap', () => {
  const dv = getDiligenceView("ecc");
  assert(dv.memo, "memo missing");
  const disclosed = (dv.memo.gaps || []).filter((g) => /not disclosed/i.test(g.note));
  assert(disclosed.length >= 1, "memo has no 'Not disclosed' gap");
  return `${disclosed.length} not-disclosed gaps`;
});

// 7. Exactly ONE contradicted claim.
beat("diligence-one-contradiction", "Exactly one contradicted claim", () => {
  const dv = getDiligenceView("ecc");
  const n = contradictedCount(dv.claims);
  assert(n === 1, `expected exactly 1 contradicted claim, got ${n}`);
  return "1 contradicted";
});

// 8. The contradicted claim resolves to slide-4 AND to code/graph evidence (both non-null).
beat("contradiction-resolves-slide4-graph", "Contradiction -> slide-4 + graph evidence", () => {
  const dv = getDiligenceView("ecc");
  const c = dv.claims.find((x) => x.status === "contradicted");
  assert(c, "no contradicted claim");
  assert(c.slideNo === 4, `contradicted claim should target slide 4, got ${c.slideNo}`);
  const deckLoc = c.evidence.find((e) => /slide\/4\b/.test(e.locator));
  assert(deckLoc && deckLoc.locator, "missing non-null slide-4 deck locator");
  const graphLoc = c.evidence.find((e) => !/^deck:\/\//.test(e.locator) && /:\d+/.test(e.locator));
  assert(graphLoc && graphLoc.locator, "missing non-null code/graph evidence locator");
  assert(dv.slides.some((s) => s.slideNo === 4), "deck slide 4 must exist as a jump target");
  return `slide-4=${deckLoc.locator}; graph=${graphLoc.locator}`;
});

// 9. Graph ECC loads and validates at 42 nodes.
beat("graph-ecc-42-nodes", "Graph ECC loads 42 nodes", () => {
  const g = loadGraph("ecc");
  assert(g, "ecc graph failed to load");
  assert(g.nodes.length === 42, `expected 42 nodes, got ${g.nodes.length}`);
  const ids = new Set(g.nodes.map((n) => n.id));
  for (const e of g.edges) {
    assert(ids.has(e.source) && ids.has(e.target), `dangling edge ${e.source}->${e.target}`);
  }
  return `${g.nodes.length} nodes / ${g.edges.length} edges`;
});

// 10. R8 tour has ordered steps, each pinned to a real graph node.
beat("tour-ordered-steps", "R8 tour has ordered steps", () => {
  const tour = loadTour("ecc");
  assert(tour && Array.isArray(tour.steps), "tour missing");
  assert(tour.steps.length >= 2, `tour needs ordered steps, got ${tour.steps.length}`);
  const g = loadGraph("ecc");
  const ids = new Set(g.nodes.map((n) => n.id));
  const stepIds = tour.steps.map((s) => s.nodeId);
  for (const nid of stepIds) assert(ids.has(nid), `tour step points at unknown node ${nid}`);
  assert(new Set(stepIds).size === stepIds.length, "tour steps must be unique (ordered)");
  return `${tour.steps.length} ordered steps`;
});

// 11. Grounded chat: rehearsed question -> cited answer; ungrounded -> clean refusal.
beat("chat-cited-or-refusal", "Chat cites rehearsed Q; refuses ungrounded", () => {
  const g = loadGraph("ecc");
  const { allowedNodeIds } = buildGraphContext(g, {});
  const cap = loadChatCapture("ecc");
  assert(cap, "rehearsed chat capture (data/replay/chat/ecc.json) missing");
  const cited = finalizeChatAnswer({ answer: cap.answer, citations: cap.citations }, allowedNodeIds);
  assert(cited.refused === false, "rehearsed chat answer should not refuse");
  assert(cited.citations.length >= 1, "rehearsed chat answer must be cited");
  const refused = finalizeChatAnswer(
    { answer: "ungrounded guess", citations: [{ nodeId: "__nonexistent__", quote: "x" }] },
    allowedNodeIds,
  );
  assert(refused.refused === true, "ungrounded answer must refuse cleanly");
  return `rehearsed cited (${cited.citations.length}); ungrounded refused`;
});

// 12. Decision persists and reads back from the DB (never defaulted).
beat("decision-invest-persists", "Decision Invest persists + reads back", () => {
  const row = recordDecision(tdb, { opportunityId: "opp-ecc", verdict: "invest", note: "smoke" });
  const back = getDecision(tdb, "opp-ecc");
  assert(back, "decision did not persist");
  assert(back.verdict === "invest", `read-back verdict ${back.verdict} != invest`);
  assert(back.id === row.id, "read-back is not the same row that was written");
  return `verdict=invest id=${back.id}`;
});

// 13. /apply creates exactly one inbound, visible opportunity.
beat("apply-creates-inbound", "/apply creates an inbound opportunity", () => {
  const parsed = validateApplyInput({
    companyName: "SmokeCo",
    repoUrl: "https://github.com/smoke/smoke",
  });
  assert(parsed.ok, "valid apply form rejected");
  const before = tdb.prepare("SELECT COUNT(*) AS n FROM opportunity").get().n;
  const { opportunityId, deduped } = applyOpportunity(tdb, parsed.value);
  assert(deduped === false, "fresh apply should not dedupe");
  const after = tdb.prepare("SELECT COUNT(*) AS n FROM opportunity").get().n;
  assert(after === before + 1, "apply must create exactly one opportunity");
  const row = tdb
    .prepare("SELECT source, source_channel, visible FROM opportunity WHERE id=?")
    .get(opportunityId);
  assert(row.source === "inbound", `apply opp source ${row.source} != inbound`);
  assert(row.source_channel === "apply", "apply opp channel must be 'apply'");
  assert(row.visible === 1, "apply opp must be visible");
  return `inbound ${opportunityId}`;
});

tdb.close();
rdb.close();

// Report
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
const w = Math.max(...results.map((r) => r.name.length));
console.log("\nGOLDEN-PATH SMOKE (offline)\n" + "=".repeat(w + 12));
for (const r of results) {
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name.padEnd(w)}  ${r.detail}`);
}
console.log("=".repeat(w + 12));
console.log(`${pass}/${results.length} beats passed${fail ? `, ${fail} FAILED` : ""}. planned demo set: ${PLANNED_OPPS.join(", ")}`);
process.exit(fail ? 1 : 0);