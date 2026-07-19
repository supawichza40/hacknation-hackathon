# FounderGraph functional requirements

> Track sentence (RUBRIC.md §2, verbatim): **"The VC Brain: Deploying $100K Checks in 24 Hours."**

## Requirement rules

- `VC-BRAIN-PLAN.md` v3 is the scope authority. Demo-lite auth additionally cites the suite design §1 locked decision (see FR-AUTH note below).
- "Cuttable" requirements stay specified so the team can implement in ladder order; the named fallback is the acceptance path after a cut.
- Rubric mappings use the four official criteria in `docs/ops/RUBRIC.md` §1.
- Every unknown value is written `TBD (owner: human)`.

## Thesis and pipeline

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-THESIS-01 | Load a configurable thesis (sectors, stages, geos, check-size bounds, ownership target, risk appetite, technical bar) and apply it to every recommendation. Acceptance: changing the stored thesis fixture changes computed fit for the same evidence-backed ScreeningFacts; missing facts remain explicit unknowns, never inferred. | §0.5 d4, d11; §2 Thesis Engine; §5 Thesis; §7 M0/M1; §10 | M0/M1, core | Data Architecture; Investment Utility |
| FR-THESIS-02 | If R4 retained: the thesis drawer exposes one live check-size control and recomputes card fit without reload. Acceptance: the off-thesis card greys with "fails thesis: check size"; fallback is read-only thesis.json. | §0.5 d12 R4 + cut ladder; §7 M1; §10 | M1, cuttable T-8h | Investment Utility; UX |
| FR-PIPE-01 | Pipeline shows Outbound and Inbound columns; each card shows company, source, Founder Score, thesis-fit state. Acceptance: the three demo opportunities appear in their planned columns; the off-thesis card is visibly distinct. | §0.5 d5, d11; §7 M1; §10; §11 | M1, core | Data Architecture; Investment Utility; UX |
| FR-PIPE-02 | Outbound cards show a source-channel badge and, while R3 depth is retained, a "why surfaced" line backed by an Evidence record (URL + excerpt). Acceptance: opening the reason resolves to stored locator + excerpt; fallback keeps the badge, drops drill-down. | §0.5 d12 R3 + cut ladder; §5 Evidence; §7 M1; §11 | M1, depth cuttable T-8h | Data Architecture; Analysis & Trust |
| FR-PIPE-03 | If R1 retained: Pipeline accepts one compound NL query over all founders' ScreeningFacts (one LLM call) and returns a ranked list with rationale + citations. Acceptance: the demo compound query returns ranked opportunity IDs, each with ≥1 stored citation. | §0.5 d12 R1; §2 Multi-Attribute Reasoning; §7 M4; §8 `/api/query`; §12; §17 | M4, cuttable T-4h | Data Architecture; Investment Utility |
| FR-PIPE-04 | If R7 retained: Scan replays the captured Wave-0 **Tavily** sourcing run (`/search` + `/research`) and pops the recorded threshold-crossing candidate into Outbound with no live stage-time network call. Acceptance: same captured input ⇒ same candidate + provenance; fallback keeps seeded cards. | §0.5 d12 R7 + Wave 0 + cut ladder; §7; §8 `/api/scan`; §12; §17; 06-external-services Tavily | Wave 0/M2, cuttable T-4h | Data Architecture |
| FR-PIPE-05 | The demo makes the cold-start case explicit: the hero founder surfaces and is evaluated through strong public artifacts + sparse-network story, without a prior institutional track record; the evidence used is inspectable. | §0.5 d5; §2 Explicit cold-start; §11; §12; §15 | M1/M3, core | Data Architecture (incl. its cold-start caveat — rubric §1 note) |
| FR-APPLY-01 | If Apply retained: `/apply` accepts `companyName`, `repoUrls[]`, optional `deckFile`, founder name, links; creates an inbound Opportunity and returns its ID. Acceptance: valid submission appears in Inbound; invalid submission shows an error and creates no partial record. Seeded inbound is the fallback. | §0.5 d9, d11 + cut ladder; §2 Inbound; §7 M0/M2; §8 `/api/apply`; §10 | M0/M2, cuttable T-8h | Data Architecture; UX |

> TBD (owner: human): plan §2 says "Deck + company name" but §8 makes the deck optional — the minimum Apply payload beyond `companyName` needs a ruling.

## Demo-lite auth (suite design §1 locked decision)

| ID | Requirement and acceptance | Source | Block / status | Rubric |
|---|---|---|---|---|
| FR-AUTH-01 | One investor login (single credential, no user management). Investor surfaces (Pipeline, Diligence, Graph) load inside the investor session; `/apply` stays public. Acceptance: fresh browser can reach `/apply` but sees a login gate on `/`. | Suite design §1 (locked Q&A decision, ~1h build); plan §10 surface 4 "Apply (public-lite)" | M0/M1, core-lite | UX (role clarity); protects demo narrative |
| FR-AUTH-02 | A session cookie separates investor and founder roles; no passwords stored beyond the single demo credential; no signup flow. Acceptance: cookie present ⇒ investor surfaces render; absent ⇒ redirect/gate. | Suite design §1 | M0/M1, core-lite | UX |

> CONFLICT (reported, not resolved): plan v3 contains no auth contract — no login route, credential source, protected-route list, or session fields. The suite design §1 locked demo-lite auth and design §5 requires these FRs, so they are included here at demo-lite scope only; the plan needs a one-line backfill or the human must strike auth. Owner: human.

## Memory and evidence

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-MEM-01 | Persist trimmed Person, Opportunity (+ScreeningFacts), Evidence, Claim, AxisScore, Memo records in SQLite (better-sqlite3, no ORM). Acceptance: process restart retains seeded opportunities, analysis outputs, scores, memos. | §0.5 d1, d4; §4; §5; §7 M0/M1; §13 | M0/M1, core | Data Architecture |
| FR-MEM-02 | Deduplicate a Person across opportunities by normalized GitHub URL or email. Acceptance: the returning-founder fixture yields one Person with multiple opportunity/history references, never a second Person. | §0.5 d4; §2 Founder Score; §5 Person; §7 M1; §12 | M1, core | Data Architecture |
| FR-MEM-03 | Founder Score + dated history live on Person and never reset for a new opportunity. Acceptance: adding the returning opportunity preserves the prior score row and appends the new one. | §0.5 d4, d5; §2; §5 Person; §7 M1/M3/M4; §17 | M1/M3/M4, core | Data Architecture; Investment Utility |
| FR-MEM-04 | Every screening fact, claim, score rationale, memo conclusion, sourcing reason, and completed chat answer resolves to Evidence {artifactId, locator, excerpt} — or is marked unknown/refused. Acceptance: traceability check finds no dangling evidence ID on the hero path. | §0.5 d4; §2 Agentic Traceability; §5 Evidence; §7 M1–M4; §9 | M1–M4, core | Data Architecture; Analysis & Trust |

## Analysis and graph

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-ANALYZE-01 | One investor action orchestrates staged, cacheable Analyze / Score / Memo calls with progressive status. Acceptance: a stage can retry or use replay without repeating completed stages; the UI names the current stage. | §0.5 d9; §4; §7 M2–M4; §8 | M2–M4, core orchestration; live Analyze cuttable | Investment Utility; UX |
| FR-ANALYZE-02 | Ingest repo material + deck text into a knowledge graph, Claim records, and Evidence records. Acceptance: hero graph records analyzed source + commit SHA when available; deck claims point to slide locators. Precomputed graph + pre-extracted slides JSON are valid fallbacks. | §0.5 d3, d4 + Wave 0 + cut ladder; §2 Smart Data Collection; §4; §5; §11 | Wave 0/M2; live cuttable | Data Architecture; Analysis & Trust |
| FR-ANALYZE-03 | Both structured LLM calls (claim/evidence extractor; axes+memo writer) are zod-validated, one repair attempt, then the captured real provenance replay. Acceptance: invalid-response tests prove single repair then replay; replay includes commit SHA, prompt version, raw model JSON, timestamp. | §0.5 d2, d3; §4; §7 Wave 0/M2/M4; §9 | Wave 0/M2/M4, core | Data Architecture; Analysis & Trust; Investment Utility |
| FR-GRAPH-01 | Graph renders nodes + edges with pan/zoom (React Flow); selecting a node opens a drawer with summary + sourceRef. Acceptance: the hero file node opens a path/line or slide locator matching stored Evidence. | §0.5 d6, d10, d11; §1; §5; §7 M2; §10; §17 | M2, base core; domains/filters cuttable | Data Architecture; Analysis & Trust; UX |
| FR-GRAPH-02 | If R5 retained: "Show reasoning" renders a step timeline from provenance metadata — never raw model JSON. Acceptance: timeline steps map to stored provenance fields; cutting R5 does not remove evidence citations. | §0.5 d12 R5 + cut ladder; §7 M2; §10; §12; §17 | M2/M3, cuttable T-8h | Analysis & Trust; UX |

## Trust and scoring

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-TRUST-01 | Derive each claim status by the locked epistemic rules: `supported` (cited evidence supports), `unsupported` (evidence absent), `contradicted` (only two incompatible cited facts), `unavailable` (source material missing). Acceptance: fixtures cover all four states; no unsupported claim ever renders contradicted. | §0.5 d4; §2 Trust Score; §5 Claim; §7 M3; §9; §16 | M3, core | Analysis & Trust |
| FR-TRUST-02 | Each claim displays text, category, Trust Score, confidence, status, evidence links. Acceptance: hero claims table exposes all fields; every evidence link resolves. | §0.5 d4; §5 Claim; §7 M3; §10; §12; §17 | M3, core | Analysis & Trust; UX |
| FR-TRUST-03 | **Wow moment:** clicking the hero's red `CONTRADICTED` claim jumps to the exact deck slide AND graph node containing the two incompatible cited facts. Acceptance: both targets open from the claim and match its contradiction/evidence IDs. | §0.5 d6 + never-cut list; §2 Agentic Traceability; §7 M3; §12; §15 | M3, **never cut** | Analysis & Trust; Investment Utility; UX |
| FR-SCORE-01 | Founder, Market, and Idea-vs-Market scores computed and displayed separately — never averaged. Each axis carries rationale + evidence IDs. Acceptance: hero has exactly one record per axis; all rationales resolve to Evidence. | §0.5 d2, d4; §2 3-axis screening; §5 AxisScore; §7 M3; §12; §17 | M3, never-cut hero path | Analysis & Trust; Investment Utility |
| FR-SCORE-02 | Thesis fit, axis score math, Founder Score updates, and trust-status derivation are deterministic TypeScript over stored inputs — no LLM. Acceptance: repeated runs on the same fixture return identical values. Formulas/thresholds TBD (owner: human). | §0.5 d2, d4; §9 | M3, core | Data Architecture; Analysis & Trust; Investment Utility |
| FR-SCORE-03 | Axis trend = `baseline` unless two dated observations exist; then `improving`/`stable`/`declining` by a deterministic rule. Acceptance: single-observation fixture stays baseline; returning-founder fixture uses both dates. Thresholds TBD (owner: human). | §0.5 d4, d5 + cut ladder; §5 AxisScore; §7 M3; §17 | M3, trend UI cuttable T-4h | Data Architecture; Investment Utility |

## Chat, memo, decision, voice

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-CHAT-01 | Graph chat streams over SSE; a completed answer includes graph-node citations with quotes, or the assistant refuses. Acceptance: one cited hero answer streams in chunks; an unanswerable fixture yields a refusal with no unsupported assertion. | §0.5 d7; §7 M4; §8 `/api/chat`; §9; §12; §17 | M4, committed; absolute last-resort cut | Analysis & Trust; UX |
| FR-CHAT-02 | Node-click "Ask about this" sends the node ID as context through the same chat endpoint. Acceptance: request carries the node ID; citations stay within grounded evidence. | §0.5 d7; §8; §9; §17 | M4, committed with FR-CHAT-01 | Analysis & Trust; UX |
| FR-CHAT-03 | Text-highlight-to-ask sends selected text + node ID as context through the same endpoint. Acceptance: request carries both fields; response still cites or refuses. | §0.5 d7; §8; §9; §17 | M4, committed with FR-CHAT-01 | Analysis & Trust; UX |
| FR-MEMO-01 | Generate a memo with snapshot, hypotheses, SWOT, problem/product, traction, optional team/tech/market/competition, gaps[], recommendation, thesisFit, generatedAt. Acceptance: hero memo passes schema; every material conclusion cites Evidence or is marked unavailable. | §0.5 d2, d4; §5 Memo; §7 M4; §8; §9; §12; §17 | M4, never-cut hero path | Analysis & Trust; Investment Utility |
| FR-MEMO-02 | R6: absent financials, cap table, DD log, and exit info auto-appear in `gaps[]` as "not disclosed". Acceptance: removing each input adds the matching gap; no value is invented. | §0.5 d12 R6; §7 M4; §12; §17 | M4, committed | Analysis & Trust; Investment Utility |
| FR-DECIDE-01 | Diligence records `invest` / `pass` / `more_info` with optional note. Acceptance: the saved human decision survives reload and is visually distinct from `Memo.recommendation`. Decision storage fields TBD (owner: human). | §0.5 d9; §3; §7 M4; §8 `/api/decide`; §12; §17 | M4, never-cut hero path | Investment Utility; UX |
| FR-DECIDE-02 | R2: Diligence header shows "First signal → decision: N min". Acceptance: chip renders from persisted timestamps after a saved decision. Start/end timestamps, rounding, pre-decision state TBD (owner: human). | §0.5 d12 R2; §7 M4; §10; §12; §17 | M4, committed (too small to ladder) | Investment Utility |
| FR-VOICE-01 | Diligence plays/pauses the hero's pre-rendered ElevenLabs MP3. Script uses memo/Memory values (Founder Score, separate axes, recommendation, top Trust watch-outs) and cites uncertainty; audio unavailable ⇒ exact script + "voice unavailable". Acceptance: golden path plays the local MP3 with no live TTS call; text fallback renders when the file is absent. | §0, §0.5 d8 + never-cut list; §1b P0; §7 M5b; §8 `/api/brief`; §14; §17 | Wave 0/M5b, **committed, never cut** | Investment Utility; UX |

## Demo and attribution

| ID | Requirement and acceptance | Plan source | Block / status | Rubric |
|---|---|---|---|---|
| FR-DEMO-01 | The offline demo set contains exactly three opportunities: hero (real repo + persona, one cited contradiction, prior history row, cold-start story), rich-GitHub showcase (precomputed graph only), off-thesis greyed card ("fails thesis: check size"). Precomputed graphs, deck-claims JSON, provenance replay, captured scan, and hero MP3 preserve the rehearsed path with no network. Acceptance: the one-command golden smoke passes with outbound network disabled. | §0.5 d3, d5 + never-cut list + freeze; §7; §11; §17 | Wave 0 → freeze, core | All four |
| FR-ATTR-01 | If Understand-Anything code is copied/adapted: LICENSE/NOTICE attribution retained, derivation described in README. If license blocks or the port exceeds 45 min ⇒ slim self-written pipeline. Acceptance: recorded license decision; no unattributed adapted file. | §0.5 d10 + M0; §1 Attribution policy; §6; §16; §17 | M0 + packaging, conditional core | No direct rubric row; protects submission integrity |

> TBD (owner: human): plan §0.5 d5 / §11 fix exactly three demo opportunities, but plan §3's narrative implies three outbound founders plus one inbound applicant. Which records overlap (M1 "seed 3 opportunities + outbound cards") needs a ruling.

## Out of scope

- Guided graph tour (suite-design item absent from plan v3 — human ruling needed).
- Auth beyond demo-lite (no user management, signup, password reset, roles beyond investor/founder cookie split).
- Live stage-time sourcing scan (Tavily or GitHub), actual outreach sending, realtime graph voice, voice intake, outbound voice notes, phone negotiation.
- Validator agent and sourcing-channel graph (plan §2 stretch only).
- Portfolio monitoring, fund ops, personal workspace, idea-to-scaffold, browser extension, local-LLM mode.
