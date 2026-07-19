// M3 decision tests — run with: node --test tests/decision.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { getDb } from "../src/lib/db.ts";
import { recordDecision, getDecision } from "../src/lib/decision.ts";

test("write + read-back: a saved decision is confirmed from the DB, not defaulted", () => {
  const db = getDb(":memory:");
  const row = recordDecision(db, { opportunityId: "opp-ecc", verdict: "invest", note: "strong founder" });
  // The returned row is the read-back, so it carries a real id and timestamp.
  assert.ok(row.id.startsWith("dec-opp-ecc-"));
  assert.equal(row.verdict, "invest");
  assert.equal(row.note, "strong founder");
  assert.match(row.decidedAt, /^\d{4}-\d{2}-\d{2}T/);

  // An independent read sees exactly the same row.
  const readBack = getDecision(db, "opp-ecc");
  assert.deepEqual(readBack, row);
  db.close();
});

test("getDecision returns the latest decision for an opportunity", () => {
  const db = getDb(":memory:");
  recordDecision(db, { opportunityId: "opp-ecc", verdict: "more_info", decidedAt: "2026-07-19T01:00:00.000Z" });
  recordDecision(db, { opportunityId: "opp-ecc", verdict: "invest", decidedAt: "2026-07-19T02:00:00.000Z" });
  assert.equal(getDecision(db, "opp-ecc")!.verdict, "invest");
  db.close();
});

test("getDecision returns null when no decision exists", () => {
  const db = getDb(":memory:");
  assert.equal(getDecision(db, "opp-ecc"), null);
  db.close();
});

test("an invalid verdict is rejected, never silently written", () => {
  const db = getDb(":memory:");
  assert.throws(
    () => recordDecision(db, { opportunityId: "opp-ecc", verdict: "yolo" as never }),
    /invalid verdict/,
  );
  assert.equal(getDecision(db, "opp-ecc"), null);
  db.close();
});
