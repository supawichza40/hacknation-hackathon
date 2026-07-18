# Plan dialogue — vc-brain-debate · 2026-07-18

Two independent councils (Claude Fable 5 agent; GPT-5.6 sol via Codex, read-only repo access), Delphi cross-rebuttal (neither saw the other's critique before writing its own), judged and synthesized by the session lead (Fable 5). Ground-truth pass: sol read the actual repo. 1 debate round + 1 rebuttal round; no tiebreak round needed (stop rule met — no unadjudicated material objection remained).

**Score:** 22 distinct material objections + 13 counter-objections raised → 19 changed the plan · 3 unresolved (overruled with revisit triggers) · 2 unverified assumptions flagged.

## ✅ WHAT THE DEBATE CHANGED (the payoff)

1. **§7 hour map replaced wholesale.** Both councils independently proved the 24h M0–M6 schedule dies mid-M3 against ~13 real build hours, forfeiting the memo/decision work that carries 30% of judging weight. New compressed build order (see VC-BRAIN-PLAN.md §0.5) with feature freeze 03:00 ET and video at 04:00, not the final hour. — *caught by both councils independently*
2. **Wave-0 real spike is now the gate.** First 90 min: builder's real repo → one real LLM call → knowledge-graph.json → rendered React Flow, provenance captured (commit SHA, prompt version, raw JSON). Nothing else starts until green. Old plan buried first live LLM contact inside M2 at nominal hour 5–10, violating repo law 2. — *sol council + Fable council, convergent*
3. **Eight LLM agent roles collapsed to two structured calls** (claim/evidence extractor; axes+memo writer) with thesis fit, founder-history updates, and score math computed deterministically in TypeScript. Removes the biggest latency/schema-drift surface. — *sol council O7, Fable accepted*
4. **Epistemic-integrity layer added (sol's biggest unique contribution, Fable's council never saw it):** (a) Opportunity gains ScreeningFacts so thesis fit is computable, not invented; (b) `contradicted` status reserved for two incompatible cited facts — mere absence of evidence is `unsupported`; (c) axis trends show "baseline" until two dated observations exist; (d) Evidence records carry artifact ID + locator + excerpt so citation jumps aren't fragile; (e) person dedup rule = normalized GitHub URL/email; (f) per-axis scoring rubric, LLM extracts facts, TS computes numbers; (g) every LLM response schema-validated with one repair attempt, then fallback to the captured real replay. — *sol rebuttal C1–C8*
5. **Real-anchor fix: the builder's own GitHub repo/persona becomes the hero founder** — supplies a genuine repo, genuine bio, and the pitch anchor in one move, fixing the binding pitch rule both the plan and sol's revision left unaddressed. — *Fable rebuttal C4*
6. **Named 10-second wow moment:** click the red CONTRADICTED claim → app jumps to the exact deck slide + graph node showing the incompatible evidence. Trust (25%) + traceability in one click; voice brief demoted to closing beat. — *Fable council O8, sol accepted*
7. **Process layer restored (both models' shared blind spot, caught in rebuttal):** commit+push is now the exit criterion of every build block; submission-platform draft + stub README land in hour 0; hero deck PDF gets authored and pushed through the parser during the spike because the demo assets do not exist yet. — *Fable rebuttal C1–C3*
8. **Scope cuts locked:** voice P1/P2 struck to backlog (P0 pre-rendered MP3 is the stage path, ~1h budget); NL Memory search cut; outbound becomes seeded cards with sourceChannel labels; five demo founders cut to three (hero analyzed live, rich-GitHub card precomputed, off-thesis as a greyed chip); five UI surfaces cut to four; monorepo dropped for a single Next.js app; better-sqlite3 locked, no ORM, no Postgres branch. — *convergent across all four documents*
9. **Chat survived, constrained.** Sol wanted it deleted; Fable showed "NL queries beyond keywords" is a named MVP pillar in the challenge brief spanning two weighted axes. Kept as a 2–3-rehearsed-question box in the graph drawer that refuses to answer without citations; first item on the T-8h cut ladder. — *Fable rebuttal of sol O10/O11; sol's own rebuttal conceded the refusal-behavior version*

## ⚠️ STILL DISAGREED (execution risk — watch these)

- **Understand-Anything Mode B vs Mode A.** Sol wanted reference-only reimplementation until the license is verified; lead overruled (Fable's rebuttal: the license check is a 5-minute read, reimplementation costs hours) → **revisit if** the hour-0 license check fails or adaptation exceeds 45 min.
- **Voice budget.** Sol wanted a 30-min post-freeze cap; lead set ~1h with the Play-brief button inside the rehearsed path (winners file: sponsor-tool visibility scored) → **revisit if** M3/M4 slip past 01:00 ET — then sol's cap applies.
- **API shape.** Fable wanted /score+/memo merged into /analyze; sol showed separate contracts don't force separate judge clicks and one long request is brittle. Lead took sol's version (separate routes, one UI action orchestrating staged cacheable calls) → **revisit if** orchestration wiring exceeds 30 min.

## ❓ UNVERIFIED ASSUMPTIONS (nobody opened these)

- **Does the projects.hack-nation.ai submission form require a live hosted URL?** Neither model checked. If yes, the local-demo-only decision breaks and a read-only snapshot deploy must be scheduled. → verify while creating the hour-0 platform draft; that is the trigger for the deploy decision.
- **ElevenLabs API key + quota actually works from this machine.** The plan asserts one real TTS call pre-renders the MP3 tonight; no call has ever been made. → proven or killed inside the Wave-0 spike.

<details>
<summary>Round-by-round transcript (condensed)</summary>

- [round 1 · Fable council → plan] Verdict: winnable only with ~40% surface cut; 14 objections (O1 schedule fiction, O2 graph timebox, O3 video/submission timing, O4 real-spike gate, O5 monorepo, O6 voice, O7 outbound seeding, O8 wow moment, O9 API merge, O10 real-anchor dataset, O11 chat risk, O12 schema trim, O13 PDF flakiness, O14 UI surface count). Cut ladders + revised build order with push cadence.
- [round 1 · sol council → plan] Verdict: not shippable as written; 14 objections (O1 schedule, O2 real-spike M0, O3 slim graph, O4 mocked-fixtures conflict → captured-real replay, O5 SQLite/Vercel split, O6 Mode A, O7 two-call architecture, O8 demo arc, O9 voice cap, O10 route consolidation, O11 single diligence page, O12 one analyzed opportunity, O13 pitch anchor, O14 DoD restructure). Aggressive freeze-by-00:15 schedule.
- [round 2 · Fable → sol] 5 ACCEPT, 8 PARTIAL, 1 REJECT (Mode A). Counter-objections C1–C5: push cadence, hour-0 platform draft, nonexistent demo assets, builder-as-hero real anchor, named wow moment.
- [round 2 · sol → Fable] 6 ACCEPT, 6 PARTIAL, 2 REJECT (monorepo framing; API merge). Counter-objections C1–C8: the epistemic-integrity set (ScreeningFacts, contradiction semantics, trend history, evidence records, person dedup, scoring rubric, Vercel persistence, LLM output validation).
- [round 3 · lead judgment] Every objection tagged; three overrules recorded with revisit triggers; no unadjudicated material objection left → stop rule met, tiebreak call skipped.

Full arm outputs preserved in session scratchpad (council-fable.md, council-sol.md, rebuttal-fable.md, rebuttal-sol.md); synthesis lives in VC-BRAIN-PLAN.md §0.5.
</details>

## Execution

- 2026-07-18 ~15:10 ET — sol rebuttal call initially hung (codex exec blocked reading stdin in background shell); killed and relaunched with stdin closed; ~8 min lost, still under wall-clock budget.
