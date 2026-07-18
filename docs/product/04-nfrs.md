# FounderGraph non-functional requirements

Constraints cover demo reliability, performance, epistemic honesty, security, auth, and cost per the suite design §5, grounded in `VC-BRAIN-PLAN.md` v3. Numeric targets the sources do not supply remain `TBD (owner: human)` — no fabricated latency, throughput, or capacity numbers.

## Demo reliability

| ID | Requirement | Verification | Source |
|---|---|---|---|
| NFR-REL-01 | The never-cut hero diligence path runs with outbound network disabled, using precomputed graphs, deck-claims JSON, captured provenance replay, seeded SQLite, and the pre-rendered MP3. "Live paths are garnish on a demo that works with the network cable pulled." | Disable outbound network; run the golden smoke Pipeline → graph → contradiction → scores → memo → decision → voice brief. | Plan §0.5 verdict, d3/d5/d8, never-cut list, freeze; §7; §11; §14; §17 |
| NFR-REL-02 | A replay identifies its real source run: repo commit SHA (when available), prompt version, raw model JSON, timestamp. Replay is never labeled as fresh live analysis. | Validate replay schema; compare UI status copy in replay mode with stored provenance fields. | Plan §0.5 d3; §7 Wave 0; §9 |
| NFR-REL-03 | Every staged analysis state and external dependency has visible loading, success, unavailable, and failure states; a failure names the failed stage and preserves completed cached stages. | Inject one failure at a time into Analyze, Memo, Chat, PDF parse, audio load; confirm named state + fallback. | Plan §0.5 d9; §4; §8; §14; suite design §5 |
| NFR-REL-04 | Live structured LLM calls use exactly one schema-repair attempt before replay; no unbounded retry loops. | Force invalid structured output; count one repair; confirm transition to captured replay. | Plan §0.5 d2, d3; §9 |
| NFR-REL-05 | The saved investor decision and Person-level Founder Score history survive process restart. | Save a decision, append the returning-founder history row, restart, read both back. | Plan §0.5 d4/d5; §5; §7 M1/M4 |

## Performance budgets

The sources define a 24-hour investment workflow and ≤60-second demo videos but no UI/API latency thresholds. Owner must fill numeric targets before a numeric perf gate can pass.

| ID | Measure | Target | Test point | Source |
|---|---|---|---|---|
| NFR-PERF-01 | Pipeline first meaningful render from seeded SQLite | TBD (owner: human) | Cold page load | Plan §7 M1; rubric §1 UX |
| NFR-PERF-02 | Precomputed hero graph interactive | TBD (owner: human) | Diligence → Graph navigation | Plan §7 M2; rubric §1 UX |
| NFR-PERF-03 | Progressive status appears after starting staged analysis | TBD (owner: human) | Analyze action → first status update | Plan §0.5 d9; rubric §1 UX |
| NFR-PERF-04 | Chat emits its first SSE chunk | TBD (owner: human) | Message submit → first chunk | Plan §0.5 d7; §8; rubric §1 UX |
| NFR-PERF-05 | Decision write confirmed and readable after reload | TBD (owner: human) | Decision click → reload | Plan §7 M4; §8; rubric §1 Investment Utility |
| NFR-PERF-06 | Pre-rendered brief starts playback | TBD (owner: human) | Play click → audible playback | Plan §0.5 d8; §1b; rubric §1 UX |
| NFR-PERF-07 | The full golden path is narratable inside the ≤60-second demo video and the 60-second live-demo segment of the 3-minute pitch — no step may stall long enough to break that narration. | Time the rehearsed offline run 3× at feature freeze; total narrated path fits the pitch §15 timing. | Plan §0.5 build order (videos ≤60s, rehearse 3×); §15 |

## Epistemic honesty

| ID | Requirement | Verification | Source |
|---|---|---|---|
| NFR-HON-01 | Never invent company facts, scores, citations, metrics, or memo values. ScreeningFacts stores evidence-backed facts + explicit unknowns; thesis fit is computed, never invented. | Remove a source fact; confirm thesis fit, memo, and voice script show an unknown/gap, not a guess. | Plan §0.5 d4; §5 ScreeningFacts; §9; §16; rubric §1 Data Architecture + Analysis & Trust |
| NFR-HON-02 | `contradicted` requires two incompatible cited facts; absence of support = `unsupported`; missing source material = `unavailable`. | One fixture per state; inspect evidence IDs. | Plan §0.5 d4/d6; §5 Claim; §7 M3 |
| NFR-HON-03 | Every material claim, score rationale, memo conclusion, sourcing reason, and completed chat answer resolves to Evidence; chat refuses when it cannot cite. | Dangling-evidence check + unanswerable-chat test. | Plan §0.5 d4/d7; §2 Agentic Traceability; §5 Evidence; §9 |
| NFR-HON-04 | Axis trend stays `baseline` until two dated observations exist. | Compare single-observation vs returning-founder fixtures. | Plan §0.5 d4/d5; §5 AxisScore |
| NFR-HON-05 | R5 (if retained) shows a human-readable step timeline from provenance metadata; raw model JSON never renders. | Inspect rendered timeline and browser payload. | Plan §0.5 d12 R5; §7 M2; §10 |
| NFR-HON-06 | The R2 timer is labeled as an elapsed product metric, not proof an investment was deployed. Timestamp definition + rounding TBD (owner: human). | Review copy; compare N against persisted timestamps once defined. | Plan §0.5 d12 R2; §7 M4; §10 |

## Security

| ID | Requirement | Verification | Source |
|---|---|---|---|
| NFR-SEC-01 | If Apply is retained: the deck upload path sanitizes file names, prevents path traversal, rejects content outside an explicit MIME/extension allowlist, and enforces a size limit. Allowlist + limit TBD (owner: human). **The traversal/injection test is written red-first, before the upload handler** (CLAUDE.md security rule). | Traversal test before the happy-path test: submit names with path separators/traversal segments; confirm no file escapes the upload directory. | Suite design §5; plan §8 `/api/apply`; §10 Apply; CLAUDE.md "Security red-first" |
| NFR-SEC-02 | API keys/tokens come from env config only; never in client bundles, logs, replay fixtures, demo data, or the repo. | Scan built client assets, logs, demo/replay files, and tracked files for configured secret names. | Plan §13; §14 |
| NFR-SEC-03 | Replayed raw model responses and founder-supplied artifacts are treated as data, never as executable instructions. | Include an instruction-like string in a replay/deck fixture; confirm it renders as content and triggers no tool/shell action. | Plan §0.5 d3; §5; CLAUDE.md untrusted-content rule |
| NFR-SEC-04 | Demo-lite auth boundary: investor surfaces require the investor session cookie; `/apply` is public. This is a demo-role separator, not a security product — no claim beyond it. | Fresh browser: `/apply` loads; `/` gates. Cookie present: investor surfaces load. | Suite design §1 (locked decision); FR-AUTH-01/02; plan v3 gap flagged for backfill |

## Cost and dependency control

| ID | Requirement | Verification | Source |
|---|---|---|---|
| NFR-COST-01 | No module depends on an external service until its `docs/ops/PREFLIGHT.md` entry records a real successful call + fallback. All key availability is **assumed — prove at preflight** (secrets registry unverified in-session). | Review preflight evidence for LLM provider, ElevenLabs, GitHub access mode, PDF parser before enabling each dependent path. | Suite design §5; plan §0.5 Wave 0 + open items; §14 |
| NFR-COST-02 | Core analysis uses the two planned structured LLM jobs (extractor; axes+memo). Chat and R1 are separate interactive calls, not disguised inside the two-call count. | Instrument one golden run; classify each request as extractor / axes+memo / chat / R1. | Plan §0.5 d2/d7/d12; §9 |
| NFR-COST-03 | Live TTS is never required for the demo: hero brief uses the pre-rendered MP3; realtime conversational voice consumes zero budget before committed scope is green. | Run the golden path with the ElevenLabs key absent; confirm audio/text fallback. | Plan §0, §0.5 d8; §1b; §7 M5b; §14 |
| NFR-COST-04 | External-service spend limits and alert thresholds TBD (owner: human); no monetary estimate is asserted. | Human records limits before enabling repeated live calls. | Suite design §5; plan has no spend budget |

## Out of scope

- Generic scale, browser-matrix, uptime, accessibility, retention, privacy, and compliance claims not in the locked plan or suite design.
- Production authentication beyond the demo-lite boundary.
- Upload security requirements if the cut ladder removes Apply entirely.
- Live TTS, realtime graph voice, live stage-time scan, and any service capability not proven at preflight.
