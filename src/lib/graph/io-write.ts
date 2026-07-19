// Graph persistence (write path) for the ingest/precompute CLI scripts only.
// Kept out of io.ts so the route-reachable read module has no dynamic fs ops
// (a runtime `writeFileSync(join(process.cwd(), slugVar))` makes Turbopack/NFT
// trace the whole project). Never imported by an app route or client component.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { parseGraph, type KnowledgeGraph } from "./schema.ts";

// Registered write targets (mirrors io.ts read registry); unknown slugs fall
// back to the conventional per-slug path.
const GRAPH_PATHS: Record<string, string> = {
  ecc: "data/demo/graphs/ecc/knowledge-graph.json",
  "lattice-db": "data/demo/graphs/lattice-db/knowledge-graph.json",
};

// Writes a validated graph to the registered (or conventional) path for slug.
export function saveGraph(slug: string, graph: KnowledgeGraph): string {
  const rel = GRAPH_PATHS[slug] ?? `data/demo/graphs/${slug}/knowledge-graph.json`;
  const p = join(process.cwd(), rel);
  parseGraph(graph); // fail loudly rather than persist an invalid graph
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(graph, null, 2) + "\n", "utf8");
  return p;
}
