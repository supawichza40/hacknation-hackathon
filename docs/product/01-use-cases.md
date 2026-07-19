# FounderGraph use cases

> Track sentence (RUBRIC.md §2, verbatim): **"The VC Brain: Deploying $100K Checks in 24 Hours."** Every use case below maps to it.

Scope source: `VC-BRAIN-PLAN.md` v3 (single source of truth). Rubric tags refer to `docs/ops/RUBRIC.md` §1. Module tags refer to the build blocks in plan §0.5 and §7. Investor use cases assume the demo-lite investor session (one investor login, session cookie — suite design §1 locked decision; see 03-functional-requirements.md FR-AUTH).

## Inventory

| ID | Actor | Goal | Module | Rubric | Scope status |
|---|---|---|---|---|---|
| UC1 | Investor | Configure the investment thesis | M0, M1 | Data Architecture; Investment Utility; UX | Core config; R4 live toggle cuttable |
| UC2 | Investor | Review the ranked inbound and outbound pipeline (incl. R1 NL query) | M1, M4 | All four | Core; R1/R7 cuttable |
| UC3 | Investor | Run diligence analysis on an inbound opportunity | Wave 0, M2 | Data Architecture; Analysis & Trust | Core with replay fallback; live analysis cuttable |
| UC4 | Investor | Explore the founder's technical knowledge graph | M2 | Data Architecture; Analysis & Trust; UX | Core graph; filters/domains cuttable |
| UC5 | Investor | Audit claims and Trust Scores | M3 | Analysis & Trust; Investment Utility | Never-cut hero path (wow moment) |
| UC6 | Investor | Ask a cited diligence question (chat trio) | M4 | Analysis & Trust; UX | Committed; absolute last-resort cut only |
| UC7 | Investor | Generate and review an investment memo | M4 | Analysis & Trust; Investment Utility | Never-cut hero path |
| UC8 | Investor | Record an Invest / Pass / More-info decision | M4 | Investment Utility | Never-cut hero path |
| UC9 | Investor | Activate a surfaced outbound founder | M1, M2 | Data Architecture; Investment Utility | Seeded cards core; scan replay / outreach draft cuttable |
| UC10 | Investor | Play the investment voice brief | Wave 0, M5b | Investment Utility; UX | Committed, never cut |
| UC11 | Investor | Re-evaluate a returning founder without resetting history | M1, M3, M4 | Data Architecture; Investment Utility | Persistence core; trend UI cuttable |
| UC12 | Founder | Apply with company, deck, and repository information | M0, M2 | Data Architecture; UX | On the cut ladder; seeded inbound fallback |
| UC13 | — | *(reserved — voice founder intake, ElevenLabs P1, backlogged)* | — | — | BACKLOG.md; not part of this suite (design §3) |
| UC14 | System | Replay a captured Tavily sourcing scan | Wave 0, M2 | Data Architecture | R7, cuttable |

## UC1: configure the investment thesis

- Actor: Investor.
- Goal: Apply the fund's thesis to screening and recommendations.
- Preconditions: A thesis configuration exists (sectors, stages, geos, check-size bounds, ownership target, risk appetite, technical bar).
- Main flow:
  1. The investor opens the thesis settings drawer from Pipeline.
  2. FounderGraph displays the configured thesis fields.
  3. If R4 is retained, the investor changes the check-size setting.
  4. FounderGraph recomputes thesis fit from evidence-backed `ScreeningFacts` and greys any failing card in place.
- Success outcome: Every recommendation and pipeline card reflects the active thesis; missing screening facts remain explicit unknowns — fit is computed, never invented.
- Fallback: If R4 is cut, read-only `thesis.default.json` loads. Full thesis editing is also on the cut ladder.
- Trace: plan §0.5 decisions 4, 12 (R4); §2 Thesis Engine; §5 Thesis; §7 M1; §10. Rubric §1: Data Architecture; Investment Utility; UX.

## UC2: review the pipeline

- Actor: Investor.
- Goal: Decide which opportunity to inspect first.
- Preconditions: Memory contains the three planned demo opportunities (plan §11).
- Main flow:
  1. The investor views Outbound and Inbound columns.
  2. Each card shows Founder Score, thesis-fit chip, source-channel badge, and (R3) an evidence-backed "why surfaced" line.
  3. The investor may enter one compound natural-language query (R1) over all founders' ScreeningFacts and get a ranked, cited list; or trigger the Scan replay (R7); or open a card directly.
  4. FounderGraph opens the selected opportunity's Diligence page.
- Success outcome: The investor distinguishes on-thesis, off-thesis, inbound, outbound, cold-start, and returning-founder cases without opening every record.
- Fallback: R1/R7 cut → seeded cards remain selectable. R3 evidence depth cut → badges remain.
- Trace: plan §0.5 decisions 5, 11, 12 (R1/R3/R7); §7 M1/M2/M4; §10; §11. Rubric §1: all four.

## UC3: run analysis on an inbound opportunity

- Actor: Investor.
- Goal: Turn a repository and deck into structured diligence material.
- Preconditions: An inbound opportunity exists (UC12 or seeded inbound fallback).
- Main flow:
  1. The investor starts analysis; one UI action orchestrates staged, cacheable Analyze → Score → Memo calls with progressive status.
  2. FounderGraph ingests repo + deck, builds the knowledge graph, extracts claims + evidence (LLM call 1), computes deterministic scores, and prepares the memo (LLM call 2).
  3. Each LLM result is zod-validated, repaired once if invalid, then replaced by the captured real provenance replay.
- Success outcome: The opportunity has a graph, claims, evidence, separate axis scores, and a memo without invented facts.
- Fallback: Live Analyze is on the T-8h cut ladder; precomputed graph + deck-claims JSON + provenance replay preserve the path (narrated as precomputed).
- Trace: plan §0.5 decisions 2, 3, 9; Wave 0/M2 build order; §4; §8; §9. Rubric §1: Data Architecture; Analysis & Trust.

## UC4: explore the technical knowledge graph

- Actor: Investor.
- Goal: Understand the founder's code without reading the repository — technical conviction without a CTO friend.
- Preconditions: A precomputed or live knowledge graph exists.
- Main flow:
  1. The investor opens Graph from Diligence.
  2. FounderGraph renders nodes and edges in React Flow with pan/zoom.
  3. The investor selects a node (file / function / class / claim / doc_section / domain).
  4. The node drawer shows summary + `sourceRef` locator.
  5. If R5 is retained, "Show reasoning" opens a provenance step timeline — never raw model JSON.
- Success outcome: The investor moves from a technical summary to its source location.
- Fallback: Domain grouping, filters, and R5 are cuttable; base graph, node drawer, and sourceRefs remain.
- Trace: plan §0.5 decisions 6, 10, 11, 12 (R5); §1; §5 KnowledgeGraph; §7 M2; §10. Rubric §1: Data Architecture; Analysis & Trust; UX.
- Conflict (reported, not resolved): the suite design (§0, §2 step 3) describes a guided "start here" repo tour; plan v3 defines no tour behavior. Not a committed step under the scope law — human ruling needed.

## UC5: audit claims and Trust Scores

- Actor: Investor.
- Goal: Check what is supported, unknown, or contradicted before relying on a claim.
- Preconditions: Claim and Evidence records exist for the opportunity.
- Main flow:
  1. The investor scans each claim's text, category, Trust Score, confidence, status, and evidence links.
  2. Statuses follow the locked epistemic rules: absence of support = `unsupported`; `contradicted` only when two cited facts are incompatible; missing source material = `unavailable`.
  3. **Wow moment (never cut):** the investor clicks the hero's red `CONTRADICTED` claim.
  4. FounderGraph jumps to the exact deck slide + graph node showing the incompatible cited evidence.
- Success outcome: The investor inspects the basis and uncertainty of each material claim in minutes.
- Failure behavior: Missing data renders as `unavailable` / "not disclosed" — never fabricated.
- Trace: plan §0.5 decisions 4, 6; §2 Trust Score + Agentic Traceability; §5 Claim; §7 M3; §12; §15. Rubric §1: Analysis & Trust; Investment Utility.

## UC6: ask a cited diligence question

- Actor: Investor.
- Goal: Ask a repo-level, node-level, or selected-text question and get an evidence-grounded answer.
- Preconditions: A graph exists; the investor is on Graph.
- Main flow:
  1. The investor types a question, clicks "Ask about this" on a node, or highlights text and asks about the selection.
  2. FounderGraph sends opportunityId, message, and optional node/selection context to the single `/api/chat` path.
  3. The answer streams over SSE; the completed answer carries graph-node citations with quotes.
- Success outcome: A cited answer scoped to the requested evidence ("replaces an analyst").
- Failure behavior: No citable evidence ⇒ the assistant refuses. A captured cited replay preserves the rehearsed offline answer.
- Trace: plan §0.5 decisions 3, 7; §7 M4; §8 `/api/chat`; §9; §12; §17. Rubric §1: Analysis & Trust; UX.

## UC7: generate and review the investment memo

- Actor: Investor.
- Goal: Obtain a decision-ready memo grounded in the opportunity snapshot.
- Preconditions: ScreeningFacts, claims, evidence, thesis fit, and axis scores exist.
- Main flow:
  1. FounderGraph sends the structured snapshot into the axes+memo writer (LLM call 2).
  2. The response is schema-validated, repaired once, replay fallback if needed.
  3. The investor reviews snapshot, hypotheses, SWOT, problem/product, traction, optional sections, recommendation, thesis fit, and gaps.
  4. R6: absent financials / cap table / DD log / exit appear in `gaps[]` as "not disclosed".
- Success outcome: An IC-ready memo in minutes, with gaps flagged honestly.
- Trace: plan §0.5 decisions 2, 3, 4, 12 (R6); §5 Memo; §7 M4; §8; §9; §12; §17. Rubric §1: Analysis & Trust; Investment Utility.

## UC8: record an investment decision

- Actor: Investor.
- Goal: Save an Invest / Pass / More-info decision.
- Preconditions: The investor has reviewed the diligence result.
- Main flow:
  1. The investor selects Invest, Pass, or More info, optionally adding a note.
  2. FounderGraph writes the decision and advances opportunity status to `decision`.
  3. The saved state survives reload and is visually distinct from `Memo.recommendation`.
  4. The R2 chip shows "First signal → decision: N min".
- Success outcome: The decision persists; Founder Score persists → memory compounds.
- Trace: plan §0.5 decisions 9, 12 (R2); §5; §7 M4; §8 `/api/decide`; §12; §17. Rubric §1: Investment Utility.
- TBD (owner: human): the plan defines no Decision entity fields or R2 timestamp formula.

## UC9: activate a surfaced outbound founder

- Actor: Investor.
- Goal: Move a sourced founder into diligence.
- Preconditions: A seeded outbound card or R7 threshold-crossing candidate exists.
- Main flow:
  1. The investor reviews the source-channel badge and evidence-backed "why surfaced" reason (R3 — Evidence record with URL + excerpt, not a cosmetic sticker).
  2. The investor opens the card; status moves from `sourced` toward `screening`/`diligence`.
  3. If the optional outreach draft is retained, the investor may view it (no message is actually sent).
- Success outcome: A signal becomes an inspectable opportunity; no external outreach is implied.
- Trace: plan §0.5 decisions 5, 12 (R3); §2 Outbound; §7 M1/M2; §10; §11. Rubric §1: Data Architecture; Investment Utility.

## UC10: play the investment voice brief

- Actor: Investor.
- Goal: Hear the recommendation, scores, and Trust watch-outs hands-free.
- Preconditions: Hero memo, axes, Founder Score, and the pre-rendered ElevenLabs MP3 (Wave 0) exist.
- Main flow:
  1. The investor clicks "Play investment brief" in the Diligence header.
  2. FounderGraph plays/pauses the pre-rendered MP3 (45–75s, investor tone, cites uncertainty).
  3. The script uses only memo/Memory values — never invented numbers.
- Success outcome: The committed demo closing beat plays with zero live TTS dependency.
- Failure behavior: Audio unavailable ⇒ show the exact script + "voice unavailable".
- Trace: plan §0, §0.5 decision 8, §1b P0, §7 M5b, §8 `/api/brief`, §14, §17. Rubric §1: Investment Utility; UX.

## UC11: re-evaluate a returning founder

- Actor: Investor.
- Goal: Compare the founder's current opportunity with prior observations without resetting Founder Score.
- Preconditions: The Person record has a seeded, dated prior-application history row (plan §11 hero).
- Main flow:
  1. FounderGraph dedups the new opportunity to the existing Person by normalized GitHub URL or email.
  2. Founder Score history is preserved; the new dated observation is appended.
  3. Axis trend shows only when two dated observations exist; otherwise `baseline`.
- Success outcome: History persists across applications; the UI never implies a trend from one observation.
- Fallback: Trend UI / sparkline are cuttable; persistence is not.
- Trace: plan §0.5 decisions 4, 5; §2 Founder Score; §5 Person; §7 M1/M3/M4; §12; §17. Rubric §1: Data Architecture; Investment Utility.

## UC12: submit a founder application

- Actor: Founder (public — outside the investor session).
- Goal: Create an inbound opportunity from the public-lite `/apply` form.
- Preconditions: The Apply surface is retained (it sits on the T-8h cut ladder — not core).
- Main flow:
  1. The founder enters company name; optionally founder name, repo URLs, links, deck file.
  2. FounderGraph validates and creates the Opportunity, returning its ID.
  3. The record appears in the investor pipeline for UC3.
- Cut behavior: If Apply is cut, the golden path starts from the seeded inbound hero.
- Trace: plan §0.5 decisions 9, 11 + cut ladder; §2 Inbound; §7 M0/M2; §8 `/api/apply`; §10. Rubric §1: Data Architecture; UX.
- TBD (owner: human): minimum payload — plan §2 says "Deck + company name" while §8 makes the deck optional.

## UC14: replay a captured sourcing scan

- Actor: System, triggered by the investor.
- Goal: Demonstrate outbound web sourcing (Tavily `/search` + `/research`) from a real captured scan with no stage-time network call.
- Preconditions: Wave 0 captured a real thesis→query Tavily scan (web presence, traction mentions, funding/round status = pre-fundraise signal) in `data/replay/scan/`.
- Main flow:
  1. The investor clicks Scan on Pipeline.
  2. FounderGraph replays the captured run deterministically.
  3. The recorded threshold-crossing card pops into Outbound with its evidence-backed reason.
- Success outcome: A deterministic, inspectable sourcing story — replay is labeled as replay, never as a live scan.
- Cut behavior: R7 is cuttable (T-4h); seeded outbound cards remain.
- Trace: plan §0.5 decision 12 (R7) + Wave 0; §7; §8 `/api/scan`; §11; §12; §17. Rubric §1: Data Architecture.

## Out of scope

- Guided repository tour (suite-design item absent from plan v3 — reported for human ruling).
- Actual outreach sending, email integration, outbound calling.
- Voice founder intake (UC13, P1 backlog), outbound voice notes (P3 backlog), phone negotiation (Challenge 01), realtime graph voice (stretch-only, never a committed use case).
- Portfolio monitoring, fund ops, personal workspace, idea-to-scaffold, browser extension, local-LLM mode (BACKLOG.md).
