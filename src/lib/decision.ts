// Investor decision persistence (VC-BRAIN-PLAN.md §7 M3, §12).
// Project law: a success state is confirmed ONLY by reading the row back —
// never defaulted on the write path. The decision table is created lazily here
// so the shared base schema (db.ts) stays untouched across concurrent build
// sessions; getDb() runs the base schema, this adds the decision table on first use.
import type { DB } from "./db.ts";

export type Verdict = "invest" | "pass" | "more_info";

export type DecisionRow = {
  id: string;
  opportunityId: string;
  verdict: Verdict;
  note: string | null;
  decidedAt: string;
};

export const VERDICTS: Verdict[] = ["invest", "pass", "more_info"];

export const MAX_NOTE_LEN = 2000;

// Route-boundary guard for the untyped `note` field (red-team N-1, N-2): it must
// be absent/null, or a string within the length cap. A non-string note would
// otherwise reach better-sqlite3 `.run()` and throw a raw DB error (leaked to the
// caller); an unbounded note has no cap. Keeps validation out of the write path.
export function isValidNote(note: unknown): boolean {
  return (
    note === undefined ||
    note === null ||
    (typeof note === "string" && note.length <= MAX_NOTE_LEN)
  );
}

export function ensureDecisionTable(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS decision (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      verdict TEXT NOT NULL,
      note TEXT,
      decided_at TEXT NOT NULL
    );
  `);
}

function mapRow(r: Record<string, unknown> | undefined): DecisionRow | null {
  if (!r) return null;
  return {
    id: r.id as string,
    opportunityId: r.opportunity_id as string,
    verdict: r.verdict as Verdict,
    note: (r.note as string) ?? null,
    decidedAt: r.decided_at as string,
  };
}

// Latest decision for an opportunity, or null. Pure read (also used for read-back).
export function getDecision(db: DB, opportunityId: string): DecisionRow | null {
  ensureDecisionTable(db);
  const r = db
    .prepare(
      "SELECT * FROM decision WHERE opportunity_id = ? ORDER BY decided_at DESC, rowid DESC LIMIT 1",
    )
    .get(opportunityId) as Record<string, unknown> | undefined;
  return mapRow(r);
}

// Writes a decision, then CONFIRMS it by reading the row back by its own id.
// Returns the read-back row. Throws if the read-back fails — never reports a
// defaulted success (project law).
export function recordDecision(
  db: DB,
  input: { opportunityId: string; verdict: Verdict; note?: string; decidedAt?: string },
): DecisionRow {
  if (!VERDICTS.includes(input.verdict)) {
    throw new Error(`invalid verdict: ${input.verdict}`);
  }
  ensureDecisionTable(db);
  const id = `dec-${input.opportunityId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const decidedAt = input.decidedAt ?? new Date().toISOString();
  db.prepare(
    "INSERT INTO decision (id, opportunity_id, verdict, note, decided_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id, input.opportunityId, input.verdict, input.note ?? null, decidedAt);

  const row = mapRow(
    db.prepare("SELECT * FROM decision WHERE id = ?").get(id) as
      | Record<string, unknown>
      | undefined,
  );
  if (!row || row.id !== id) {
    throw new Error("decision write could not be confirmed by read-back");
  }
  return row;
}
