// M4 Tavily-beat tests — run with: node --test tests/tavily.test.ts
// Deterministic replay of the captured Tavily run + name extraction (no live call).
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadTavilyCaptures,
  computeTavilyReplay,
  extractNames,
  TAVILY_THRESHOLD,
} from "../src/lib/tavily.ts";

test("tavily replay is deterministic across reruns", () => {
  const caps = loadTavilyCaptures();
  assert.deepEqual(computeTavilyReplay(caps), computeTavilyReplay(caps));
});

test("tavily replay ranks captures and tags source:tavily", () => {
  const replay = computeTavilyReplay(loadTavilyCaptures());
  assert.equal(replay.source, "tavily");
  assert.ok(replay.steps.length > 0);
  assert.equal(replay.threshold, TAVILY_THRESHOLD);
  // Sorted by score desc.
  for (let i = 1; i < replay.steps.length; i++) {
    assert.ok(replay.steps[i - 1].score >= replay.steps[i].score);
  }
  for (const s of replay.steps) assert.equal(s.crossed, s.score >= TAVILY_THRESHOLD);
  if (replay.surfaced) assert.equal(replay.surfaced.source, "tavily");
});

test("name extraction is deterministic and drops article stopwords", () => {
  const r = {
    url: "https://example.com/x",
    title: "Top 10 Open-Source AI Projects on GitHub",
    content: "The project LangFlow and the tool Ollama are trending this month.",
    score: 0.8,
  };
  const a = extractNames(r);
  const b = extractNames(r);
  assert.deepEqual(a, b);
  assert.ok(!a.includes("The"));
  assert.ok(!a.includes("GitHub"));
});
