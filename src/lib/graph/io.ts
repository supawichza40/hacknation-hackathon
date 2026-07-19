// Graph load by opportunity graph-slug (VC-BRAIN-PLAN.md §7 M2).
// Reads are static JSON imports (not runtime fs) so Turbopack/NFT traces the demo
// artifacts at build time — a dynamic `readFileSync(join(process.cwd(), slugVar))`
// made the whole project get traced unintentionally. The write path lives in
// io-write.ts (CLI-only) to keep this route-reachable module free of dynamic fs.
// 404-honest: loadGraph returns null when no graph is registered for a slug, so
// the page renders a "No graph available" state per the screen map.
import {
  parseGraph,
  provenanceSchema,
  tourSchema,
  type KnowledgeGraph,
  type Provenance,
  type Tour,
} from "./schema.ts";

// Precomputed demo artifacts. ecc: Wave-0 spike (real LLM). lattice-db: M2
// generalized-pipeline precompute (real LLM). Imported statically so the bundler
// includes them; the registries below gate which slugs resolve (unknown -> null).
import graphEcc from "../../../data/demo/graphs/ecc/knowledge-graph.json" with { type: "json" };
import graphLatticeDb from "../../../data/demo/graphs/lattice-db/knowledge-graph.json" with { type: "json" };
import provenanceEcc from "../../../data/replay/spike/provenance.json" with { type: "json" };
import provenanceLatticeDb from "../../../data/replay/lattice/provenance.json" with { type: "json" };
import tourEcc from "../../../data/demo/tours/tour-ecc.json" with { type: "json" };

const GRAPHS: Record<string, unknown> = {
  ecc: graphEcc,
  "lattice-db": graphLatticeDb,
};
const PROVENANCES: Record<string, unknown> = {
  ecc: provenanceEcc,
  "lattice-db": provenanceLatticeDb,
};
const TOURS: Record<string, unknown> = {
  ecc: tourEcc,
};

export function graphSlugs(): string[] {
  return Object.keys(GRAPHS);
}

// Returns the validated graph, or null when no graph is registered for slug.
export function loadGraph(slug: string): KnowledgeGraph | null {
  const raw = GRAPHS[slug];
  if (raw === undefined) return null;
  return parseGraph(raw);
}

// Provenance for the R5 reasoning drawer. null when the slug has no provenance.
export function loadProvenance(slug: string): Provenance | null {
  const raw = PROVENANCES[slug];
  if (raw === undefined) return null;
  const parsed = provenanceSchema.safeParse(raw);
  if (!parsed.success) {
    // Don't swallow a corrupt artifact silently (red-team N-3): log which slug
    // and why before disabling the R5 reasoning drawer.
    console.warn(
      `[graph/io] provenance for "${slug}" failed schema validation: ${parsed.error.message}`,
    );
    return null;
  }
  return parsed.data;
}

// R8 guided tour. null when no precomputed tour exists for the slug.
export function loadTour(slug: string): Tour | null {
  const raw = TOURS[slug];
  if (raw === undefined) return null;
  const parsed = tourSchema.safeParse(raw);
  if (!parsed.success) {
    // Don't swallow a corrupt artifact silently (red-team N-3): log which slug
    // and why before disabling the R8 guided tour.
    console.warn(
      `[graph/io] tour for "${slug}" failed schema validation: ${parsed.error.message}`,
    );
    return null;
  }
  return parsed.data;
}
