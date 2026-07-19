# Red-team findings — M1–M3 app code (diff b429eb7..HEAD, src/ + scripts/)

Date: 2026-07-19. Scope: adversarial review of committed app code only (no fixes; patches routed separately).
Verdict: **No CRITICAL findings. Golden path is demo-safe.** The past-event vulnerability class
(URL/route param reaching a filesystem read → path traversal) is present in the *loader helpers* but is
**not exploitable** through any route — every sink is gated upstream. All money is integer cents, all SQL
is parameterized, and the decision write is confirmed by read-back (no defaulted success).

## Lenses run

1. **Opus (this agent) — hands-on:** live dev server on :3939, traversal battery against both dynamic
   routes, `/api/decide` + `/api/scan` validation/injection probes, response-body inspection, silent-failure grep.
2. **SOL — Codex CLI (`codex exec --sandbox read-only`, gpt-5.x):** independent full read of the changed files.
   Produced a clean report; **independently agrees** with lens 1 on every traversal/SQL/scoring conclusion.
3. **gpt-oss text arm (`ccr_safe`): FAILED — unavailable.** First invocation blocked (default-deny, no `--task`);
   corrected invocation failed on routing misconfig ("model claude-sonnet-5 … may not exist or you may not have
   access"). **Fallback per task envelope:** an independent silent-failure lens (grep + manual) was run by lens 1
   and is folded in below. No third external opinion was obtained; 2-of-2 agreement is noted where lenses 1 and 2 overlap.

## Findings

### CRITICAL — none

### MAJOR

- **M-1 (posture) — API routes and diligence data are unauthenticated.** `src/app/api/decide/route.ts:11`,
  `src/app/api/scan/route.ts:11`, `src/lib/diligence.ts:89` (via `src/app/opportunities/[id]/page.tsx:14`).
  Anyone who can reach the server can append/override decisions, flip `opp-pipewarden` visible, and read all
  opportunity/founder/claims/scoring data. Repro: `curl -X POST localhost:3939/api/scan`;
  `curl -X POST localhost:3939/api/decide -d '{"opportunityId":"opp-ecc","verdict":"pass"}'`.
  *Lens: SOL. Reachable: yes.* **Assessment: acceptable for a local single-user demo** (there is no multi-tenant
  boundary and login is a scaffold by design). Flagged so it is a conscious choice, not an oversight — do NOT
  claim "secure/auth'd" in the pitch. Not a demo blocker.

### MINOR

- **N-1 — `/api/decide` leaks a raw internal DB error for a non-string `note`.** `src/app/api/decide/route.ts:12,38,41`.
  `note` is never type-checked; an object `note` reaches `better-sqlite3 .run()` and throws, and the catch returns
  the raw message. Confirmed repro: `curl -X POST .../api/decide -d '{"opportunityId":"opp-ecc","verdict":"invest","note":{"x":1}}'`
  → `{"error":"Too few parameter values were provided"}` (HTTP 500). No partial write occurs (bind throws before insert).
  *Lens: SOL + Opus (repro'd live). Fix hint: validate `typeof note === "string"` or coerce; return a generic 400.*

- **N-2 — `note` length is unbounded.** `src/app/api/decide/route.ts`. A 50 000-char note is accepted (HTTP 200).
  Not a real DoS on a demo, but there is no cap. *Lens: Opus (repro'd live).*

- **N-3 — silent artifact swallow.** `src/lib/graph/io.ts:64` (`loadProvenance`) and `:73` (`loadTour`) do
  `safeParse(...).success ? data : null` — a malformed/corrupt provenance or tour JSON silently returns `null`,
  disabling the R5 reasoning drawer / R8 tour with **no log and no error**. Demo-artifact files are trusted, so
  low risk, but a bad hand-edit would fail invisibly. *Lens: Opus (fallback silent-failure pass).*

## SAFE — verified not exploitable (with the gate that protects each)

- **Path traversal via `loadTour` / `loadProvenance` — SAFE (2-of-2: Opus live + SOL).** `src/lib/graph/io.ts:69`
  builds `data/demo/tours/tour-${slug}.json` from the raw slug and is traversal-capable *in isolation*, but its only
  caller (`src/app/opportunities/[id]/graph/page.tsx:36`) runs it **after** `loadGraph(id)` returns non-null, and
  `loadGraph` resolves paths **only** from the fixed `REGISTRY` (`io.ts:19`, keys `ecc`/`lattice-db`). Any other slug
  returns `null` → early "No graph available" return → `loadTour` never runs. Live proof:
  `GET /opportunities/..%2f..%2f..%2f..%2fetc%2fpasswd/graph` → 200 rendering **"No graph available"**, no file leak.
- **Path traversal via `loadClaimsForSlug` — SAFE (2-of-2).** `src/lib/diligence.ts:58` interpolates the slug into a
  path, but `getDiligenceView` (`:89`) first requires a DB row `WHERE o.id = 'opp-<slug>'` (`:93`); no route can create
  an attacker-chosen opportunity id, so a traversal slug misses the DB and returns `null` before the read. Live proof:
  `GET /opportunities/..%2F..%2Fpackage` → 200 "Opportunity not found".
- **SQL injection — SAFE.** Every statement in `src/lib/db.ts`, `decision.ts`, `diligence.ts` uses bound `?`/`@name`
  parameters. Live proof: `opportunityId: "opp-ecc' OR 1=1--"` is stored/compared as a literal → `{"error":"unknown opportunity opp-ecc' OR 1=1--"}`.
- **Money-as-float — SAFE.** All amounts are `*_cents INTEGER` (`db.ts` schema); `scoring.ts` is pure integer
  arithmetic with `Math.round`/clamp. No float money anywhere in the diff.
- **Defaulted success — SAFE (good).** `src/lib/decision.ts:57` inserts then re-reads the row by its own id and throws
  if the read-back fails — success is derived from a confirmed read, honoring project law.
- **`/api/decide` verdict validation — SAFE.** Allowlist (`VERDICTS`) rejects unknown verdicts with 400; bad JSON → 400.
- **`/api/scan` — SAFE for its purpose.** Deterministic replay of `data/replay/scan/ranking.json`, no live call, GET → 405.

## Notes for the fix pass (routed separately)

Only N-1 is worth a code change before the demo (one-line `typeof note` guard + generic 400). N-2/N-3 are optional
hardening. M-1 is a documentation/pitch-framing note, not a code fix, for a single-user demo.
