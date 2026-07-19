// Precompute ONE real rehearsed graph-grounded Q&A with `claude -p`, captured as the
// chat-unavailable fallback (data/replay/chat/ecc.json). Question: "What does the routing
// layer actually do?" over the ECC knowledge graph. Runnable: `node scripts/precompute-chat.ts`.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadGraph } from "../src/lib/graph/io.ts";
import {
  buildGraphContext,
  buildChatPrompt,
  finalizeChatAnswer,
  CHAT_PROMPT_VERSION,
} from "../src/lib/chat.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SLUG = "ecc";
const QUESTION = "What does the routing layer actually do?";

function main(): void {
  const graph = loadGraph(SLUG);
  if (!graph) throw new Error("ECC graph not found");
  const { context, allowedNodeIds } = buildGraphContext(graph);
  const prompt = buildChatPrompt(QUESTION, context);

  console.log("Calling claude -p for the rehearsed ECC chat answer (real call)…");
  const res = spawnSync("claude", ["-p", "--output-format", "json"], {
    input: prompt,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    timeout: 240_000,
  });
  if (res.status !== 0 || !res.stdout) {
    throw new Error(`claude -p failed (status ${res.status}): ${(res.stderr || "").slice(0, 400)}`);
  }
  const env = JSON.parse(res.stdout);
  if (env.is_error) throw new Error(`claude -p error: ${env.subtype ?? "unknown"}`);

  let s = String(env.result).trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  const final = finalizeChatAnswer(JSON.parse(s), allowedNodeIds);
  if (final.refused || final.citations.length === 0) {
    throw new Error("rehearsed answer came back uncited/refused — not capturing a bad fallback");
  }

  const capture = {
    question: QUESTION,
    slug: SLUG,
    answer: final.answer,
    citations: final.citations,
    provenance: {
      artifact: `chat:${SLUG}`,
      source: "ECC knowledge graph (nodes only) — rehearsed Q&A capture",
      promptVersion: CHAT_PROMPT_VERSION,
      model: env.modelUsage ? Object.keys(env.modelUsage) : [],
      generator: "claude -p --output-format json (subscription auth, headless)",
      isoTimestamp: new Date().toISOString(),
      durationMs: env.duration_ms ?? 0,
      totalCostUsd: env.total_cost_usd ?? 0,
    },
  };

  const dir = join(ROOT, "data/replay/chat");
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, `${SLUG}.json`), JSON.stringify(capture, null, 2) + "\n", "utf8");
  console.log(`Captured rehearsed Q&A -> data/replay/chat/${SLUG}.json (${final.citations.length} citations)`);
}

main();
