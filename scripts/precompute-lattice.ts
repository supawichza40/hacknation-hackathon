// One-shot precompute of the Lattice-DB showcase graph (VC-BRAIN-PLAN.md §7 M2).
// Runs the generalized ingest pipeline ONCE against a real, shallow-cloned public
// AI-infra repo. Writes data/demo/graphs/lattice-db/knowledge-graph.json + honest
// provenance to data/replay/lattice/provenance.json.
// Usage: node scripts/precompute-lattice.ts <repoDir> <sourceLabel>
import { analyzeRepo } from "../src/lib/ingest/analyze.ts";

const repoDir = process.argv[2] ?? "data/demo/repos/lattice-db";
const source = process.argv[3] ?? "asg017/sqlite-vec (github.com/asg017/sqlite-vec)";

const { graph, provenance } = await analyzeRepo({
  repoDir,
  slug: "lattice-db",
  source,
  provenanceOut: "data/replay/lattice/provenance.json",
});

console.log(
  `Lattice-DB graph: ${graph.nodes.length} nodes / ${graph.edges.length} edges from ${source}; ` +
    `cost $${(provenance.totalCostUsd ?? 0).toFixed(4)}, ${provenance.steps.length} provenance steps`,
);
