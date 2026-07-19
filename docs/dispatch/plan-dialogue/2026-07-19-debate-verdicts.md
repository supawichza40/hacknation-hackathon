# Two-model debate verdicts — swarm-audit verification (2026-07-19 08:15 BST)

**Read this if you are any other session working this repo.** A "swarm audit" report circulated
claiming P0 blockers. Claude Fable 5 and GPT-5.6 Sol (codex) adversarially verified all 26 of its
claims against the live tree (consensus reached round 2 of a 5-round cap). Most P0s were already
fixed by the overnight run or were wrong. Corrections below are applied and pushed; branch merged
to `main`.

## ⚠️ Warnings for other sessions (act on these)

1. **Never `npm rebuild better-sqlite3` on Node ≠ 26.** ABI 147 = Node 26 (the swarm's "147 =
   Node v23" is false — official registry: 22→127, 23→131, 26→147). The app requires Node 26
   (README Setup). A Node-22 rebuild produces ABI 127 and 500s every DB route. Verified working:
   Node 26.3.1 + ABI 147, `npm test` 62/62, 08:10 BST.
2. **Lovable prototype is a bun project** (`bun.lock`, `bunfig.toml`). Use `bun install` — never
   npm there. The untracked `lovable/Founder Graph Core/package-lock.json` is npm debris from the
   swarm; safe to delete. Its node_modules currently works (vite executable verified).
3. **Commit `f7f6069` wrote false evidence into 08-definition-of-done.md** — asserted
   `data/graphs/` is "present"; that path has never existed (real: `data/demo/graphs/{ecc,lattice-db}/`).
   Corrected in this session's commit. If you re-reconcile 08, verify paths with `ls`, not by
   trusting prior evidence lines.
4. **Uncommitted data-file modifications** (claims.json, memo.json, replay provenance) are the
   overnight run's **half-done claim-id migration** (56eab21 morning blocker). Deliberately left
   uncommitted here — finish or revert knowingly; do not sweep into an unrelated commit.
5. **`/api/brief` is NOT required** — consensus: FR-VOICE-01 acceptance needs only the local MP3 +
   text fallback (fallback ships in DiligenceClient). Treat the missing route as a non-issue unless
   M5b deliberately adds it.

## Verdict table (swarm claim → consensus)

| # | Swarm claim | Verdict | Reality |
|---|---|---|---|
| S1 | tsc clean | TRUE | exit 0 (Sol's FALSE was a sandbox tsbuildinfo write error; `--incremental false` exit 0) |
| S2 | build passes, 13 routes | PARTIAL | True since 62a1cc6; a PASS before that commit is implausible (recorded TS-worker failure) |
| S3 | ABI fix via Node-22 rebuild | FALSE+HARMFUL | Wrong ABI mapping; rebuild would break required Node 26 runtime |
| S4 | seed output 4 opps/3 visible | TRUE | seed-demo.ts:218 + db.test.ts |
| S5 | producer scripts output valid JSON | TRUE | all committed artifacts parse |
| S6 | data counts 140+/15 | PARTIAL | demo=3662 files (122 JSON), replay=23; all JSON parses |
| S7 | /api/apply exists w/ validation+dedup | TRUE | route + apply.ts + apply.test.ts |
| S8 | LICENSE missing, ISC | STALE | MIT LICENSE since 1119df8; package.json MIT since 867095c |
| S9 | NOTICE required+missing | FALSE as P0 | Missing but NOT required — no UA code vendored (README Attribution) |
| S10 | /api/brief missing = P0 | PARTIAL | Route absent; acceptance doesn't require it (see warning 5) |
| S11 | DEMO-SCRIPT.md missing | STALE | exists since 1119df8 |
| S12 | README setup missing | STALE | full Setup section since 6338009/1119df8 |
| S13 | Lovable build broken, use npm | FALSE+HARMFUL | vite executable now; bun is canonical; `rm -rf node_modules && npm install` = wrong tool |
| S14 | rubric §5 absent from DoD | STALE | added 6338009 (08:67) |
| S15 | no Innovation/Tech-depth checks | PARTIAL | literally true; now a recorded design decision (08:65 — whole-submission axes) |
| S16 | tour needs human ruling | STALE+WRONG | ruling existed (plan §0.5 d14); 08 fixed 6338009 |
| S17 | Lovable invisible in 08 | STALE | manifest row since 6338009 |
| S18 | manifest factual errors | PARTIAL | "eight docs"/LICENSE fixed earlier; data/graphs/ phantom (incl. f7f6069's) fixed THIS commit |
| S19 | 5 lib modules untested | PARTIAL | thesis + graph io/schema ARE tested (db.test, graph.test); diligence.ts + ingest/analyze.ts lack direct tests |
| S20 | W0 smokes untraced in 08 | STALE | all five named since 6338009 (08:154 + Layer 2) |
| S21 | reasoning-ecc.json missing | FALSE | exists since 9149ae2 |
| S22 | Layer-3 scripts absent | STALE | smoke:golden + check:done since 8804d20; no standalone lint/typecheck scripts (check:done runs tsc) |
| S23 | npm audit 2 moderate | TRUE | live output 08:05 BST; postcss via Next, accepted for hackathon |
| S24 | producer scripts not in manifest | TRUE→FIXED | row added THIS commit |
| S25 | 29/35 FR tested; AUTH untested | PARTIAL | AUTH/THESIS/GRAPH tests exist (swarm counted them in its own 62/62); only ANALYZE lacks direct test; 29/35 unsupported |
| S26 | data/graphs/ exists (f7f6069) | FALSE | `ls` MISSING; fixed THIS commit |

## Still open (nobody owns yet)

- Direct unit tests for `src/lib/diligence.ts` and `src/lib/ingest/analyze.ts` (smoke:golden covers behavior).
- 56eab21 morning blockers: half-done claim-id migration (uncommitted data files), ABI environment note.
- Cold-start Layer-1 box (08:16) flagged open by the reconcile pass — human/M-lane confirm.

Debate log: this file + Claude session 49f9ef72 + codex thread 019f7877-f8d7. Earlier DoD-audit
debate (same protocol): commit 6338009.
