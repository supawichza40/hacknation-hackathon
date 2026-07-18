# BACKLOG.md — Post-Lock Idea Parking Lot

After spec lock, every new idea lands here — never directly into a build session. Rule from CLAUDE.md Law 3: an idea only leaves the backlog by passing the **displacement test**.

## Displacement test (answer all three before promoting)

1. What committed golden-path item does this displace?
2. Does it fit before the locked feature-freeze time (03:00 ET, VC-BRAIN-PLAN §0.5), including its tests and its demo appearance?
3. Does it score on a `docs/ops/RUBRIC.md` axis the current build doesn't already max?

If any answer is "no" or "unclear" → it stays here until after the event.

## Parked ideas

| # | Idea | Arrived | Rubric axis it would serve | Displacement answer | Verdict |
|---|---|---|---|---|---|
| 1 | ElevenLabs P1 voice intake (founder records pitch by voice at apply) | 2026-07-18 | UX (15%) | Displaces nothing committed; would eat M4 chat / MP3-brief time (human ruling 2026-07-18 evening: P1 → backlog) | parked |
| 2 | ElevenLabs P3 outbound voice (agent calls/voices outreach to founders) | 2026-07-18 | Investment Utility (30%) | Displaces nothing committed; off the golden path entirely (human ruling: P3 → backlog) | parked |
| 3 | Personal workspace (multi-user accounts/workspaces) | 2026-07-18 | None the build doesn't already serve | Would displace demo-lite single-investor flow; zero demo visibility (requirements-design §0) | parked |
| 4 | Idea-to-scaffold generation | 2026-07-18 | None — outside Challenge 02 scope | No committed item it could replace (requirements-design §0) | parked |
| 5 | Chrome extension | 2026-07-18 | UX (15%) marginally | Whole new surface; displaces nothing, adds a build+review lane we don't have (requirements-design §0) | parked |
| 6 | Local-LLM mode | 2026-07-18 | Data Architecture (30%) marginally | Displaces the locked 2-structured-LLM-call architecture — fails the test by definition (requirements-design §0) | parked |
| 7 | NL search over Memory | 2026-07-18 | Investment Utility (30%) | **PROMOTED → committed R1** (pipeline NL query box, M4) by debate v3 verdict 2026-07-18 22:35 BST (VC-BRAIN-PLAN §0.5 decision 12) — no longer backlog | promoted |
| 8 | Thesis editing UI | 2026-07-18 | UX (15%) | Debate cut: read-only `thesis.json` + thesis drawer covers the demo; editing is invisible work | parked |
| 9 | Demo founders 4–5 (beyond the locked 3) | 2026-07-18 | None — more data, same features | Debate cut: 3-founder set (hero, rich-GitHub card, off-thesis grey card) covers every beat | parked |
| 10 | `/intake/voice` route | 2026-07-18 | UX (15%) | Debate cut with P1 voice intake (row 1) — same displacement answer | parked |
| 11 | Research-areas write-up | 2026-07-18 | Data Architecture (30%) marginally | Reduced by debate v3 verdict (2026-07-18 22:35 BST) to one pitch sentence (see PITCH.md); no build | parked |

*(Realtime ElevenLabs conversational voice (P2) is deliberately NOT here — it is recorded in VC-BRAIN-PLAN §0.5 as an optional stretch if time remains after committed scope, not a parked idea.)*

*(Last event, three features — a 3D toggle, a voice agent, and a persona system — entered the build directly the same evening the specs locked, before the golden path ran end-to-end. This file is where they should have gone.)*
