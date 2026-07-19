// M5 decide note-guard tests (red-team N-1, N-2) — run with:
//   node --test tests/decide-guard.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isValidNote, MAX_NOTE_LEN } from "../src/lib/decision.ts";

test("note guard rejects a non-string note (N-1: no raw DB error leak)", () => {
  assert.equal(isValidNote({ x: 1 }), false);
  assert.equal(isValidNote(123), false);
  assert.equal(isValidNote(["a"]), false);
  assert.equal(isValidNote(true), false);
});

test("note guard accepts an absent or string note", () => {
  assert.equal(isValidNote(undefined), true);
  assert.equal(isValidNote(null), true);
  assert.equal(isValidNote(""), true);
  assert.equal(isValidNote("strong founder"), true);
});

test("note guard caps length at 2000 chars (N-2)", () => {
  assert.equal(isValidNote("x".repeat(MAX_NOTE_LEN)), true);
  assert.equal(isValidNote("x".repeat(MAX_NOTE_LEN + 1)), false);
});
