// Graph load/save by opportunity graph-slug (VC-BRAIN-PLAN.md §7 M2).
// Server-only (node:fs). 404-honest: loadGraph returns null when no graph exists
// for a slug, so the page renders a "No graph available" state per the screen map.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import {
  parseGraph,
  provenanceSchema,
  tourSchema,
  type KnowledgeGraph,
  type Provenance,
  type Tour,
} from "./schema.ts";

const ROOT = process.cwd();

// Registry of precomputed demo graphs. Slug -> artifact locations.
// ecc: Wave-0 spike (real LLM). lattice-db: M2 generalized-pipeline precompute (real LLM).
const REGISTRY: Record<string, { graph: string; provenance: string }> = {
  ecc: {
    graph: "data/demo/graphs/ecc/knowledge-graph.json",
    provenance: "data/replay/spike/provenance.json",
  },
  "lattice-db": {
    graph: "data/demo/graphs/lattice-db/knowledge-graph.json",
    provenance: "data/replay/lattice/provenance.json",
  },
};

export function graphSlugs(): string[] {
  return Object.keys(REGISTRY);
}

export function graphPath(slug: string): string | null {
  const entry = REGISTRY[slug];
  return entry ? join(ROOT, entry.graph) : null;
}

// Returns the validated graph, or null when no graph is registered/present for slug.
export function loadGraph(slug: string): KnowledgeGraph | null {
  const p = graphPath(slug);
  if (!p || !existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8"));
  return parseGraph(raw);
}

// Writes a validated graph to the registered (or conventional) path for slug.
export function saveGraph(slug: string, graph: KnowledgeGraph): string {
  const rel = REGISTRY[slug]?.graph ?? `data/demo/graphs/${slug}/knowledge-graph.json`;
  const p = join(ROOT, rel);
  parseGraph(graph); // fail loudly rather than persist an invalid graph
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(graph, null, 2) + "\n", "utf8");
  return p;
}

// Provenance for the R5 reasoning drawer. null when the slug has no provenance file.
export function loadProvenance(slug: string): Provenance | null {
  const entry = REGISTRY[slug];
  if (!entry) return null;
  const p = join(ROOT, entry.provenance);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8"));
  const parsed = provenanceSchema.safeParse(raw);
  if (!parsed.success) {
    // Don't swallow a corrupt artifact silently (red-team N-3): log which file
    // and why before disabling the R5 reasoning drawer.
    console.warn(
      `[graph/io] provenance for "${slug}" failed schema validation (${entry.provenance}): ${parsed.error.message}`,
    );
    return null;
  }
  return parsed.data;
}

// R8 guided tour. null when no precomputed tour exists for the slug.
export function loadTour(slug: string): Tour | null {
  const p = join(ROOT, `data/demo/tours/tour-${slug}.json`);
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8"));
  const parsed = tourSchema.safeParse(raw);
  if (!parsed.success) {
    // Don't swallow a corrupt artifact silently (red-team N-3): log which file
    // and why before disabling the R8 guided tour.
    console.warn(
      `[graph/io] tour for "${slug}" failed schema validation (${p}): ${parsed.error.message}`,
    );
    return null;
  }
  return parsed.data;
}
