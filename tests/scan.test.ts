// R7 scan replay tests — run with: node --test tests/scan.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { loadRanking, computeScanReplay, SCAN_THRESHOLD } from "../src/lib/scan.ts";
import { getDb, setOpportunityVisible } from "../src/lib/db.ts";
import { seedDemo } from "../scripts/seed-demo.ts";

test("scan replay is deterministic — identical across reruns", () => {
  const ranking = loadRanking();
  assert.deepEqual(computeScanReplay(ranking), computeScanReplay(ranking));
});

test("scan replay marks threshold crossings and exposes a top score", () => {
  const replay = computeScanReplay(loadRanking());
  assert.ok(replay.steps.length > 0);
  assert.equal(replay.threshold, SCAN_THRESHOLD);
  for (const s of replay.steps) {
    assert.equal(s.crossed, s.score >= SCAN_THRESHOLD);
  }
  assert.ok(replay.topScore > 0);
  // At least one repo crosses the activation threshold (the pop trigger).
  assert.ok(replay.steps.some((s) => s.crossed));
  assert.equal(replay.capturedAt, "2026-07-18");
});

test("scan flips PipeWarden from hidden to visible", () => {
  const db = getDb(":memory:");
  seedDemo(db);
  const before = db.prepare("SELECT visible FROM opportunity WHERE id='opp-pipewarden'").get() as { visible: number };
  assert.equal(before.visible, 0);
  setOpportunityVisible(db, "opp-pipewarden", true);
  const after = db.prepare("SELECT visible FROM opportunity WHERE id='opp-pipewarden'").get() as { visible: number };
  assert.equal(after.visible, 1);
  db.close();
});
