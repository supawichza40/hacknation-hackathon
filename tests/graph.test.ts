// M2 graph engine tests — run with: node --test tests/graph.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseGraph, safeParseGraph, type KnowledgeGraph } from "../src/lib/graph/schema.ts";
import { loadGraph, graphSlugs } from "../src/lib/graph/io.ts";

const sample: KnowledgeGraph = {
  nodes: [
    { id: "a", type: "file", name: "a.ts", summary: "entry", sourceRef: { file: "a.ts", lines: "1-10" } },
    { id: "b", type: "concept", name: "core", summary: "idea", sourceRef: { file: "a.ts", lines: "n/a" } },
  ],
  edges: [{ source: "a", target: "b", relation: "defines" }],
};

test("io roundtrip: save-shape survives JSON serialize/parse/validate", () => {
  const back = parseGraph(JSON.parse(JSON.stringify(sample)));
  assert.deepEqual(back, sample);
});

test("loadGraph('ecc'): real spike graph loads and validates", () => {
  const g = loadGraph("ecc");
  assert.ok(g, "ecc graph should exist");
  assert.equal(g!.nodes.length, 42);
  assert.equal(g!.edges.length, 49);
  // every edge endpoint references a real node id (schema invariant already enforced on load)
  const ids = new Set(g!.nodes.map((n) => n.id));
  for (const e of g!.edges) assert.ok(ids.has(e.source) && ids.has(e.target));
});

test("loadGraph: 404-honest — unknown slug returns null", () => {
  assert.equal(loadGraph("no-such-opportunity"), null);
});

test("schema rejects an edge referencing an unknown node", () => {
  const bad = safeParseGraph({
    nodes: sample.nodes,
    edges: [{ source: "a", target: "ghost", relation: "x" }],
  });
  assert.equal(bad.success, false);
});

test("schema rejects duplicate node ids", () => {
  const dup = safeParseGraph({
    nodes: [sample.nodes[0], sample.nodes[0]],
    edges: [],
  });
  assert.equal(dup.success, false);
});

test("registry exposes ecc + lattice-db slugs", () => {
  const slugs = graphSlugs();
  assert.ok(slugs.includes("ecc"));
  assert.ok(slugs.includes("lattice-db"));
});
