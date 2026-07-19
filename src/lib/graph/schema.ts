// Knowledge-graph schema (VC-BRAIN-PLAN.md §7 M2).
// Generalizes the Wave-0 ECC spike shape (data/demo/graphs/ecc/knowledge-graph.json)
// into a validated, reusable contract. Kept EXACTLY the spike node/edge shape so the
// existing React Flow renderer (GraphClient.tsx) works unchanged for any opportunity.
import { z } from "zod";

export const kgNodeType = z.enum(["file", "concept", "claim"]);
export type KGNodeType = z.infer<typeof kgNodeType>;

export const kgNodeSchema = z.object({
  id: z.string().min(1),
  type: kgNodeType,
  name: z.string().min(1),
  summary: z.string(),
  sourceRef: z.object({
    file: z.string(),
    lines: z.string(),
  }),
});
export type KGNode = z.infer<typeof kgNodeSchema>;

export const kgEdgeSchema = z.object({
  source: z.string().min(1),
  target: z.string().min(1),
  relation: z.string().min(1),
});
export type KGEdge = z.infer<typeof kgEdgeSchema>;

// Referential integrity: every edge endpoint must reference an existing node id.
export const knowledgeGraphSchema = z
  .object({
    nodes: z.array(kgNodeSchema).min(1),
    edges: z.array(kgEdgeSchema),
  })
  .superRefine((g, ctx) => {
    const ids = new Set(g.nodes.map((n) => n.id));
    if (ids.size !== g.nodes.length) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "duplicate node id" });
    }
    for (const e of g.edges) {
      if (!ids.has(e.source) || !ids.has(e.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `edge references unknown node: ${e.source}->${e.target}`,
        });
      }
    }
  });
export type KnowledgeGraph = z.infer<typeof knowledgeGraphSchema>;

// Parse + validate; throws a ZodError on invalid input. Callers that want the
// one-repair/fallback behaviour handle the throw (see src/lib/ingest/analyze.ts).
export function parseGraph(data: unknown): KnowledgeGraph {
  return knowledgeGraphSchema.parse(data);
}

export function safeParseGraph(data: unknown) {
  return knowledgeGraphSchema.safeParse(data);
}

// ---- provenance (R5 "Show reasoning" step timeline) ----
// Honest record of how a graph/claims artifact was produced. `steps` is the
// timeline the reasoning drawer renders (stage names + timestamps), never raw JSON.
export const provenanceStepSchema = z.object({
  stage: z.string().min(1),
  startedAt: z.string(), // ISO 8601
  model: z.string().nullable().optional(),
  promptVersion: z.string().nullable().optional(),
  note: z.string().optional(),
});
export type ProvenanceStep = z.infer<typeof provenanceStepSchema>;

export const provenanceSchema = z.object({
  artifact: z.string(),
  source: z.string(), // real source repo / deck, labeled honestly
  promptVersion: z.string().optional(),
  model: z.array(z.string()).optional(),
  generator: z.string().optional(),
  isoTimestamp: z.string().optional(),
  durationMs: z.number().optional(),
  totalCostUsd: z.number().optional(),
  steps: z.array(provenanceStepSchema).default([]),
});
export type Provenance = z.infer<typeof provenanceSchema>;
