# Scope debate v3 — brief-coverage audit → R1–R7 adds (judged 2026-07-18 17:35 ET / 22:35 BST)

**Status:** SUPERSEDES nothing — this debate *extends* VC-BRAIN-PLAN §0.5 (locked execution plan v2) with **decision 12**. The 20:50 BST human ruling (chat trio committed, MP3 never-cut, realtime voice stretch) is untouched.

## Protocol & participants

Council protocol: independent positions → cross-rebuttal → judged synthesis → human approval (in chat).

- **Debater A:** Claude Fable 5 (solo, hackathon-playbook scoring lens)
- **Debater B:** GPT-5.6 Sol
- **Judge:** synthesis pass over both rebuttals; human-approved 2026-07-18 17:35 ET / 22:35 BST
- **Inputs:** 34-item brief-coverage audit (31/34 covered; gaps: items 6, 23, 33), proposals R1–R7, hard cap +5h added work, freeze 03:00 ET 2026-07-19

## Round 1 — position summaries

**Fable 5 (4.75h gross):** accept all seven in spirit; convert R7 from live GitHub scan to a provenance-replay scan (real scan captured once, replayed deterministically — same pattern as §0.5 decision 3); fund R1/R2/R4/R5/R6 in full; trim R3 to 0.5h via a shared badge component; treat the 5h cap as a ceiling, not a target (clock already ~2h behind the written §0.5 block times); proposed demoting highlight-to-ask one ladder rung as contingency.

**Sol (3.0h gross):** fund R1/R2/R3/R4/R6 only; REJECT R7 in any form (seeded outbound is brief-valid; live network work 9h before freeze is reckless); REJECT R5 (raw model JSON is not a reasoning trace); fund the adds by pre-emptively trimming live Analyze, graph chat SSE/pre-scoping, sparkline, and outreach editing.

## Round 2 — concessions

**Fable conceded:** R5's form — raw JSON is not chain-of-thought; reframed as a *structured step timeline* from provenance metadata (prompt version, schema-validation pass/repair, extraction counts, timestamps), never raw JSON. R3 back to 0.75h with real Evidence records ("badges without evidence do not count"). A26 research build item dropped to 0h (one pitch sentence). Item 10 outreach-editor and item 16 sparkline trims accepted.

**Sol conceded:** R7 need not be live — changed CUT → UPGRADE at +1.0h as the captured/replayed scan with one threshold-crossing card pop. **Withdrew the graph-chat trim** after the 20:50 BST ruling was raised (trio committed, absolute-last-resort cut only). Accepted the shared R3 component framing.

## Judge rulings

**Approved additions (+4.5h total, cap 5h):**

| ID | Feature | Hours | Slot |
|---|---|---|---|
| R1 | Pipeline NL query box — one compound sentence → one LLM call over ALL founders' ScreeningFacts → ranked, cited list (`POST /api/query`). Closes brief item 6 / MVP pillar #3 (FAQ12). | +1.00 | M4 |
| R2 | "First signal → decision: N min" timer chip from existing timestamps. Closes item 33 (Utility 30%). | +0.50 | M4 |
| R3 | Evidence-backed sourcing stories: multi-channel badges (github/hn/arxiv/hackathon) + "why surfaced" line, each backed by an Evidence record (URL+excerpt) — not cosmetic stickers. | +0.75 | M1 |
| R4 | One live thesis toggle (check-size minimum) → off-thesis card greys in real time. Answers FAQ15 "hardcoded misses the point". Falls back read-only if cut. | +0.50 | M1 |
| R5 | "Show reasoning" step-timeline drawer from provenance metadata — NEVER raw model JSON (Sol's objection, conceded by Fable). Closes item 23 (stretch-goal hint, FAQ13). | +0.50 | M2/M3 |
| R6 | Memo gaps[] auto-lists financials / cap table / DD log / exit as "not disclosed" when absent. Hardens item 29. | +0.25 | M4 |
| R7 | GitHub sourcing scan, provenance-replay form: ONE real scan run at the Wave-0 spike (thesis→topic query; signals: star velocity, commit recency, no-org = pre-fundraise) captured to `data/replay/scan/`; demo "Scan" button replays it deterministically, one candidate crosses the conviction threshold → card pops into Outbound. NO live network call on stage. | +1.00 | Wave-0 capture + M2 replay UI |

**Hour math:** 1.00 + 0.50 + 0.75 + 0.50 + 0.50 + 0.25 + 1.00 = **4.50h ≤ 5.00h cap**.

**Explicit rejections:**
1. **A26 research-note build item: DROPPED to 0h** → one spoken pitch sentence (public-footprint prediction ties to cold-start, FAQ11). Lives in PITCH.md, not code.
2. **Sol's pre-emptive cuts** of live Analyze / live Apply / graph filters / outreach editing: **REJECTED** — the existing cut ladder handles lateness automatically; do not pre-cut.
3. **Fable's demotion of highlight-to-ask** on the ladder: **REJECTED** — the 20:50 BST human ruling stands untouched (chat trio committed, absolute-last-resort cut only).
4. Sol's round-1 graph-chat trim: **WITHDRAWN by Sol itself** in round 2.

**Cut-ladder placement for the adds (they shed before committed scope):**
- T-8h (01:00 ET), inserted after "live TTS": R5 step-timeline drawer → R3 evidence depth (badges stay, drill-down goes) → R4 live toggle (falls back read-only).
- T-4h (05:00 ET), inserted before "axis trends": R7 scan-replay beat (seeded cards remain) → R1 query box. R2 chip is too small to ladder.
- Never-cut list unchanged. Chat trio position unchanged (bottom, last resort). Realtime voice unchanged (stretch, off-ladder).

## Resulting coverage

**34/34 brief items** (was 31/34): closed items 6 (one-pass NL reasoning), 23 (reasoning-log visualization), 33 (speed instrumentation); hardened items 3, 4, 5, 8, 17, 29.

## Artifacts

Scratchpad (session-local, not committed): `debate-brief.md`, `fable-position.md`, `sol-position.md`, `fable-rebuttal.md`, `sol-rebuttal.md`. Verdict of record: this file + VC-BRAIN-PLAN §0.5 decision 12.
