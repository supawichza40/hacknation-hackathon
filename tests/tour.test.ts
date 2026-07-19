// R8 tour tests — run with: node --test tests/tour.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildTour } from "../scripts/build-tour.ts";
import { loadGraph } from "../src/lib/graph/io.ts";

test("tour has 7 steps, all pointing at real graph nodes", () => {
  const tour = buildTour("ecc");
  const graph = loadGraph("ecc")!;
  const ids = new Set(graph.nodes.map((n) => n.id));
  assert.equal(tour.steps.length, 7);
  for (const s of tour.steps) {
    assert.ok(ids.has(s.nodeId), `tour step references unknown node ${s.nodeId}`);
    assert.ok(s.caption.length > 0);
  }
});

test("tour node ids are unique", () => {
  const tour = buildTour("ecc");
  const ids = tour.steps.map((s) => s.nodeId);
  assert.equal(new Set(ids).size, ids.length);
});

test("tour is deterministic — reruns are identical", () => {
  assert.deepEqual(buildTour("ecc"), buildTour("ecc"));
});

test("tour spans multiple node types", () => {
  const types = new Set(buildTour("ecc").steps.map((s) => s.type));
  assert.ok(types.size >= 2, "tour should span more than one node type");
});
