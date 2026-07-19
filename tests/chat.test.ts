// M4 chat tests — run with: node --test tests/chat.test.ts
// Covers the cite-or-refuse finalizer and node-prescoped grounding (no LLM here).
import { test } from "node:test";
import assert from "node:assert/strict";
import { finalizeChatAnswer, buildGraphContext, REFUSAL_TEXT } from "../src/lib/chat.ts";
import { loadGraph } from "../src/lib/graph/io.ts";

const allowed = new Set(["n1", "n2"]);

test("a grounded answer with a valid citation passes through", () => {
  const out = finalizeChatAnswer(
    { answer: "It routes calls.", citations: [{ nodeId: "n1", quote: "router" }] },
    allowed,
  );
  assert.equal(out.refused, false);
  assert.equal(out.citations.length, 1);
  assert.equal(out.answer, "It routes calls.");
});

test("citations to unknown nodes are dropped, then cite-or-refuse kicks in", () => {
  const out = finalizeChatAnswer(
    { answer: "Made up.", citations: [{ nodeId: "ghost", quote: "nope" }] },
    allowed,
  );
  assert.equal(out.refused, true);
  assert.equal(out.citations.length, 0);
  assert.equal(out.answer, REFUSAL_TEXT);
});

test("an answer with zero citations refuses cleanly", () => {
  const out = finalizeChatAnswer({ answer: "No sources.", citations: [] }, allowed);
  assert.equal(out.refused, true);
  assert.equal(out.answer, REFUSAL_TEXT);
});

test("an explicit model refusal is preserved as a refusal", () => {
  const out = finalizeChatAnswer(
    { answer: "Not in the graph.", citations: [], refused: true },
    allowed,
  );
  assert.equal(out.refused, true);
});

test("malformed model output degrades to a refusal, never a throw", () => {
  const out = finalizeChatAnswer({ nonsense: true }, allowed);
  assert.equal(out.refused, true);
  assert.equal(out.answer, REFUSAL_TEXT);
});

test("node prescope narrows the grounding context to a node + neighbours", () => {
  const graph = loadGraph("ecc");
  assert.ok(graph, "ECC graph should load");
  const full = buildGraphContext(graph!);
  const firstId = graph!.nodes[0].id;
  const scoped = buildGraphContext(graph!, { nodeId: firstId });
  assert.ok(scoped.allowedNodeIds.has(firstId));
  assert.ok(scoped.allowedNodeIds.size <= full.allowedNodeIds.size);
});
