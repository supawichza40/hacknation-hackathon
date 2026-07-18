# FounderGraph smoke tests

Checkpoint smoke tests for the build blocks in `VC-BRAIN-PLAN.md` §0.5 and §7, plus the one-command golden-path smoke required by the suite design §1. This is a spec — it does not claim the commands or app exist yet.

Note: the suite design §5 places this doc at `docs/ops/SMOKE-TESTS.md`; the final suite lands it here as `docs/product/07-smoke-tests.md` per the dispatch instruction (divergence reported to the human).

## Checkpoint rule

At the end of each block:

1. Run the app behavior introduced by that block against real persisted data.
2. For each external service used in that block, perform a real operation after preflight, persist its output into an app-owned artifact or DB record, and read it back.
3. Run the named fallback with the live dependency unavailable.
4. Stop the next block if both the required behavior and its fallback are red.
5. Mark unused services N/A. Do not invent a remote write operation.

"Write" = writing the real result into FounderGraph's replay, graph, slides, database, memo, or audio artifact. The product defines no GitHub remote write; PDF parsing is local. Source: suite design §1/§5; plan §0.5 d3/d9 + Wave 0 + build order. Interpretation confirmation: TBD (owner: human) — see 06-external-services.md.

The demo-lite login gate (FR-AUTH) must not block automated smoke runs — the runner authenticates with the single demo credential or a seeded session.

## Build-block checkpoint matrix

| Block | App smoke | LLM | ElevenLabs | GitHub | PDF parser | Pass condition |
|---|---|---|---|---|---|---|
| M0 | Start the single app; load empty Pipeline, Diligence, Graph, optional Apply; load thesis config + SQLite | N/A | N/A | N/A | N/A | App starts without keys; config/DB initialize; routes show explicit empty states |
| Wave 0 | Render the hero graph from the real spike output | Real structured request; persist raw response + provenance; read + schema-validate replay | Real TTS request; persist MP3; read it through the app | Real hero repo read + real sourcing scan; persist commit/scan provenance; read replay | Parse real hero deck; persist output or recorded failure; read slides-JSON fallback | All four dependencies have real proof or an explicit failed gate, and every required fallback runs |
| M1 | Seed exactly three opportunities; read Pipeline from SQLite; test dedup, history, R3 evidence, R4 if retained | N/A | N/A | N/A | N/A | Restart preserves records; off-thesis + returning-founder fixtures behave as specified |
| M2 | Produce/read hero graph + deck claims; open node sourceRef; R5/R7 only if retained | Live extraction if retained: real request then graph write/read; else read captured replay | N/A | Live Analyze if retained: real small-repo read then graph write/read; R7 reads captured scan | Parse hero deck then read claim/slide records, or use validated slides JSON | Base graph + node drawer pass from precomputed data with network disabled |
| M3 | Derive Trust states, contradiction targets, separate axes, thesis fit, Founder Score, valid trend | N/A — deterministic | N/A | N/A | N/A | Repeated fixture run identical; all evidence IDs resolve; red contradiction opens both sources |
| M4 | Generate/read memo; record/reload decision; stream cited chat; refuse unsupported chat; show R2; R1/R6 if retained | Real axes/memo + chat calls; persist/read outputs; real R1 if retained; then prove replay/refusal fallbacks | N/A | N/A | N/A | Memo, gaps, decision, chat, timer pass; no uncited completed answer |
| M5b | Play/pause the saved hero brief; show script fallback | N/A | No live call required; read Wave-0 MP3; live TTS smoke only if intentionally retained | N/A | N/A | Audio works offline; missing file shows exact script + "voice unavailable" |

## Detailed checkpoint cases

### M0

| ID | Action | Pass |
|---|---|---|
| SMK-M0-01 | Start the app with all external keys absent | Pipeline loads an explicit empty/seed-needed state; no crash |
| SMK-M0-02 | Load thesis config + initialize SQLite | Config fields readable; DB errors explicit |
| SMK-M0-03 | Open the four planned routes | Each resolves to its planned empty/not-found state |
| SMK-M0-04 | Review UA license decision + platform live-URL question | Both recorded as decided or TBD (owner: human); dependent work does not silently proceed |

### Wave-0 gate

| ID | Action | Pass |
|---|---|---|
| SMK-W0-LLM | Run the real hero extractor call | Structured result validates; provenance replay persisted and read back |
| SMK-W0-LLM-FB | Force invalid structured output twice | One repair, then the captured replay loads |
| SMK-W0-VOICE | Run one real TTS request | MP3 non-empty, persisted, readable through the brief path |
| SMK-W0-VOICE-FB | Remove key/network after capture | Saved MP3 still plays; removing MP3 shows the exact script fallback |
| SMK-W0-GH | Read the real hero/small repo + run the sourcing scan | Source identifier/commit (when available) + scan threshold provenance persisted |
| SMK-W0-GH-FB | Disable network | Pre-cloned repo + captured scan replay produce the planned result |
| SMK-W0-PDF | Parse the real hero deck | Usable text linked to slide locators, or failure recorded |
| SMK-W0-PDF-FB | Force parser failure | Validated pre-extracted slides JSON feeds the same downstream schema |

### M1

| ID | Action | Pass |
|---|---|---|
| SMK-M1-01 | Seed demo data twice | Exactly three planned opportunities remain; seed is repeatable |
| SMK-M1-02 | Add the returning opportunity | Normalized GitHub URL/email resolves to the existing Person |
| SMK-M1-03 | Restart after writing founder history | Founder Score + dated history remain |
| SMK-M1-04 | Inspect each outbound sourcing reason | R3 reason resolves to Evidence; if R3 depth formally cut, badge remains |
| SMK-M1-05 | Change the R4 check-size control | Off-thesis card greys immediately; if R4 cut, read-only thesis loads |

### M2

| ID | Action | Pass |
|---|---|---|
| SMK-M2-01 | Load every precomputed demo graph | Each validates and renders; hero node sourceRef opens |
| SMK-M2-02 | Run live hero Analyze if retained | Same downstream schema as replay/precomputed path |
| SMK-M2-03 | Force live Analyze failure | Completed stages remain; captured replay finishes the path |
| SMK-M2-04 | Open R5 if retained | Timeline uses provenance metadata; no raw model JSON |
| SMK-M2-05 | Run R7 if retained with network disabled | Captured threshold-crossing card appears deterministically |

### M3

| ID | Action | Pass |
|---|---|---|
| SMK-M3-01 | Evaluate supported / unsupported / contradicted / unavailable fixtures | Status rules match FR-TRUST-01 |
| SMK-M3-02 | Click the hero contradiction | Exact deck slide + graph node open; both evidence IDs match |
| SMK-M3-03 | Score the same input twice | Three separate axis values, thesis fit, Founder Score identical |
| SMK-M3-04 | Score one-observation and two-observation fixtures | First stays baseline; returning-founder trend follows the deterministic rule |
| SMK-M3-05 | Run the evidence-integrity check | No dangling Evidence ID in claims, axes, memo inputs, or sourcing reasons |

### M4

| ID | Action | Pass |
|---|---|---|
| SMK-M4-01 | Generate the hero memo | Schema passes; material conclusions cite Evidence; missing values not invented |
| SMK-M4-02 | Remove financials, cap table, DD log, exit inputs | Each absent R6 category appears as "not disclosed" |
| SMK-M4-03 | Save each allowed decision in isolation and reload | `invest`, `pass`, `more_info` persist; distinct from memo recommendation |
| SMK-M4-04 | Ask the rehearsed graph question | Answer streams and finishes with citations + quotes |
| SMK-M4-05 | Ask an unanswerable question | Chat refuses without an uncited factual answer |
| SMK-M4-06 | Ask from a node and from highlighted text | Request carries node/selection context through the same endpoint |
| SMK-M4-07 | Run the compound R1 query if retained | Ranked results; every result cites stored Evidence |
| SMK-M4-08 | Inspect R2 after a decision | Chip uses persisted timestamps per the human-approved formula (currently TBD, owner: human) |

### M5b

| ID | Action | Pass |
|---|---|---|
| SMK-M5B-01 | Play, Pause, Play on the hero brief | Saved MP3 obeys controls without network |
| SMK-M5B-02 | Remove or corrupt the audio file | Exact script + "voice unavailable"; Diligence remains usable |
| SMK-M5B-03 | Compare script values with Memory/Memo | Score, axes, recommendation, Trust watch-outs match stored values |

## One-command golden-path smoke

Required future command (invoked by `pnpm check:done` — see 08-definition-of-done.md):

```sh
pnpm smoke:golden
```

### Preconditions

- The app starts locally; the runner holds a valid demo investor session.
- SQLite contains exactly the three planned opportunities.
- Hero graph, claims, Evidence, memo/axes replay, one cited chat replay, captured scan, and MP3 exist.
- Outbound network disabled for the default run.
- Retained/cut status of R1, R3 depth, R4, R5, R7, live Analyze, Apply, trends, filters/domains, showcase card, outreach draft, sparkline, chat is recorded. Storage format: TBD (owner: human).

### Required sequence

1. Start the app and seed/reset demo data through the non-destructive test setup.
2. Open Pipeline; assert exactly three planned opportunities.
3. Assert the hero cold-start story, returning history, and off-thesis check-size state.
4. Open the hero Diligence page.
5. Load the precomputed graph; open a node sourceRef.
6. Ask the rehearsed chat question; assert streaming + citations. If the absolute-last-resort chat cut was invoked, the runner reports that submission-scope deviation rather than silently passing.
7. Return to Diligence; assert three separate axes, valid trend state, resolved evidence.
8. Click the red contradicted claim; assert both exact evidence targets.
9. Assert memo schema + "not disclosed" gaps.
10. Save a human decision, reload, assert persistence + the R2 chip.
11. Play/pause the local brief; then test the text fallback.
12. Assert no uncaught client/server error and no outbound network request.
13. Exit zero only if every retained required step passes.

### Optional/cuttable extensions

| Feature | Smoke when retained | Fallback assertion after cut |
|---|---|---|
| Apply | Valid founder/deck input creates an Inbound card | Seeded inbound hero starts the golden path |
| R1 | Compound query returns ranked cited results | Base card selection remains |
| R3 depth | "Why surfaced" opens Evidence | Channel badge remains |
| R4 | Check-size change greys card | Read-only thesis config loads |
| R5 | Timeline renders metadata | Direct citations remain |
| R7 | Scan replay pops card | Seeded outbound cards remain |
| Live Analyze | Real/cached staged path completes | Precomputed/replay path completes |
| Trends/sparkline | Returning fixture shows valid trend/history | Static separate scores + persisted history remain |
| Filters/domains | Filtered graph remains navigable | Base graph remains |
| Chat trio | Streaming, node, and selection cases pass | Last-resort cut must be disclosed — plan §17 still lists cited chat |

## Golden-smoke output

The command shall print: each step ID + pass/fail; live / replay / precomputed / cut mode; failed Evidence IDs or source locators; external requests observed; total elapsed time (no claimed budget until NFR targets exist); final exit code. It shall not print secrets, raw founder uploads, or raw model responses.

## Out of scope

- Browser/device matrices, load testing, remote monitoring, and capabilities not in the locked plan.
- GitHub remote-write smoke tests.
- A mandatory Apply smoke in the never-cut path.
- Realtime voice and live stage-time sourcing.
