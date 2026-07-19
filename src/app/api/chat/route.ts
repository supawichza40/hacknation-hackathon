// Graph-grounded chat API (VC-BRAIN-PLAN.md §0.5 d7). SSE stream: the answer streams
// token-by-token, then a final citations event lists the node ids it grounded on — or a
// clean refusal when nothing in the graph supports the question (cite-or-refuse). Answers
// come from a live `claude -p` call over the opportunity's knowledge-graph NODES; if that
// is unavailable the captured rehearsed Q&A (data/replay/chat/) is replayed instead.
import { spawnSync } from "node:child_process";
import { loadGraph } from "@/lib/graph/io";
import {
  buildGraphContext,
  buildChatPrompt,
  finalizeChatAnswer,
  loadChatCapture,
  normalizeQuestion,
  REFUSAL_TEXT,
  type FinalAnswer,
} from "@/lib/chat";

export const dynamic = "force-dynamic";

type Mode = "live" | "replay" | "refused";

function liveAnswer(prompt: string, allowedNodeIds: Set<string>): FinalAnswer | null {
  try {
    const res = spawnSync("claude", ["-p", "--output-format", "json"], {
      input: prompt,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      timeout: 60_000,
    });
    if (res.status !== 0 || !res.stdout) return null;
    const env = JSON.parse(res.stdout);
    if (env.is_error) return null;
    let s = String(env.result).trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fence) s = fence[1].trim();
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
    return finalizeChatAnswer(JSON.parse(s), allowedNodeIds);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: { slug?: string; question?: string; nodeId?: string; selection?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("invalid JSON body", { status: 400 });
  }
  const slug = (body.slug ?? "").trim();
  const question = (body.question ?? "").trim();
  if (!slug || !question) {
    return new Response("slug and question are required", { status: 400 });
  }

  const graph = loadGraph(slug);
  if (!graph) {
    return new Response(`no knowledge graph for ${slug}`, { status: 404 });
  }

  const { context, allowedNodeIds } = buildGraphContext(graph, {
    nodeId: body.nodeId,
    selection: body.selection,
  });
  const prompt = buildChatPrompt(question, context, body.selection);

  // 1) live claude, grounded in the graph nodes. 2) captured replay for the rehearsed
  // question. 3) clean refusal. Never an ungrounded answer.
  let mode: Mode = "live";
  let final: FinalAnswer | null = liveAnswer(prompt, allowedNodeIds);
  if (!final || final.refused) {
    const capture = loadChatCapture(slug);
    if (capture && normalizeQuestion(capture.question) === normalizeQuestion(question)) {
      const citations = capture.citations.filter((c) => allowedNodeIds.has(c.nodeId));
      if (citations.length > 0) {
        final = { answer: capture.answer, citations, refused: false };
        mode = "replay";
      }
    }
  }
  if (!final || final.refused) {
    final = { answer: final?.answer || REFUSAL_TEXT, citations: [], refused: true };
    mode = "refused";
  }

  const answer = final;
  const enc = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(enc.encode(`data: ${JSON.stringify(obj)}\n\n`));
      send({ type: "meta", mode, slug, nodeId: body.nodeId ?? null });
      const words = answer.answer.split(/(\s+)/);
      for (const w of words) {
        send({ type: "token", text: w });
        await new Promise((r) => setTimeout(r, 12));
      }
      send({ type: "citations", citations: answer.citations, refused: answer.refused });
      send({ type: "done", mode });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
