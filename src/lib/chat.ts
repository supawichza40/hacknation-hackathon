// Graph-grounded chat (VC-BRAIN-PLAN.md §0.5 d7). The model may answer ONLY from the
// opportunity's knowledge-graph nodes and MUST cite the node ids it used; if nothing in
// the graph grounds the question it refuses cleanly. This module holds the pure pieces —
// context building and the cite-or-refuse finalizer — so the SSE route and the tests
// share one contract. Live answers come from `claude -p`; on failure the route replays a
// captured Q&A (data/replay/chat/) for the rehearsed question.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import type { KnowledgeGraph } from "./graph/schema.ts";

export const CHAT_PROMPT_VERSION = "graph-chat-v1";
export const REFUSAL_TEXT =
  "I can only answer from this opportunity's knowledge graph, and I couldn't find a node that grounds that. Try asking about a specific file or concept shown in the graph.";

export const chatCitationSchema = z.object({
  nodeId: z.string().min(1),
  quote: z.string().min(1),
});
export type ChatCitation = z.infer<typeof chatCitationSchema>;

export const chatAnswerSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(chatCitationSchema),
  refused: z.boolean().optional(),
});
export type ChatAnswer = z.infer<typeof chatAnswerSchema>;

export type FinalAnswer = { answer: string; citations: ChatCitation[]; refused: boolean };

// Build the grounding context. When nodeId is given ("Ask about this" on a node drawer),
// prescope to that node plus its direct graph neighbours; otherwise use the whole graph.
export function buildGraphContext(
  graph: KnowledgeGraph,
  opts: { nodeId?: string; selection?: string } = {},
): { context: string; allowedNodeIds: Set<string> } {
  let nodes = graph.nodes;
  if (opts.nodeId && graph.nodes.some((n) => n.id === opts.nodeId)) {
    const neighbours = new Set<string>([opts.nodeId]);
    for (const e of graph.edges) {
      if (e.source === opts.nodeId) neighbours.add(e.target);
      if (e.target === opts.nodeId) neighbours.add(e.source);
    }
    nodes = graph.nodes.filter((n) => neighbours.has(n.id));
  }
  const allowedNodeIds = new Set(nodes.map((n) => n.id));
  const context = nodes
    .map((n) => `[${n.id}] (${n.type}) ${n.name} — ${n.summary} (src ${n.sourceRef.file}:${n.sourceRef.lines})`)
    .join("\n");
  return { context, allowedNodeIds };
}

export function buildChatPrompt(
  question: string,
  context: string,
  selection?: string,
): string {
  return `You answer questions about a software project using ONLY the knowledge-graph nodes provided. Output STRICT JSON only (no prose, no fences).

Schema EXACTLY: {"answer":string,"citations":[{"nodeId":string,"quote":string}],"refused":boolean}

Rules: Ground every claim in the nodes below and cite the node ids you used (nodeId MUST be an id in brackets below; quote is a short phrase from that node). If the nodes do not contain enough to answer, set "refused":true, give a one-line refusal in "answer", and leave "citations":[]. Never use outside knowledge. Keep "answer" to 2-4 sentences.

=== GRAPH NODES ===
${context}
${selection ? `\n=== SELECTED TEXT ===\n${selection}\n` : ""}
=== QUESTION ===
${question}`;
}

// Cite-or-refuse finalizer: parse the model output, drop citations that reference nodes
// outside the allowed set, and if nothing citable survives (or the model refused) return
// a clean refusal. Shared by the route and the citation-shape test.
export function finalizeChatAnswer(raw: unknown, allowedNodeIds: Set<string>): FinalAnswer {
  const parsed = chatAnswerSchema.safeParse(raw);
  if (!parsed.success) {
    return { answer: REFUSAL_TEXT, citations: [], refused: true };
  }
  if (parsed.data.refused) {
    return { answer: parsed.data.answer || REFUSAL_TEXT, citations: [], refused: true };
  }
  const citations = parsed.data.citations.filter((c) => allowedNodeIds.has(c.nodeId));
  if (citations.length === 0) {
    return { answer: REFUSAL_TEXT, citations: [], refused: true };
  }
  return { answer: parsed.data.answer, citations, refused: false };
}

// Normalizes a question for matching against the captured rehearsed Q&A.
export function normalizeQuestion(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}

export type ChatCapture = {
  question: string;
  answer: string;
  citations: ChatCitation[];
  slug: string;
  provenance?: unknown;
};

// Loads the captured rehearsed Q&A used as the chat-unavailable fallback.
export function loadChatCapture(slug: string, root: string = process.cwd()): ChatCapture | null {
  const p = join(root, `data/replay/chat/${slug}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8")) as ChatCapture;
}
