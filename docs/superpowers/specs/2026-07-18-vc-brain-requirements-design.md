# VC Brain — Requirements Suite Design

**Date:** 2026-07-18
**Status:** Approved in session (pending user review of this file)
**Parent spec:** [VC-BRAIN-PLAN.md](../../../VC-BRAIN-PLAN.md) (product/architecture — locked)
**Purpose:** Define the use-case / journey / requirements document suite that answers "how does the customer use this app to gain the most, and how do we prove it fits Challenge 02" — then feed a dispatch fan-out that writes those documents.

---

## 0. Scope resolution (2026-07-18 evening)

[TEAM-DISCUSSION-2026-07-18.md](../../product/TEAM-DISCUSSION-2026-07-18.md) scoped a standalone repo-understanding product and left the track debate unresolved. Human decision this session: **Challenge 02 VC Brain stays the submission; the Understand-Anything repo-understanding capability is the selling point integrated inside it.** Concretely, the team's agreed features map into the diligence surface:

| Team-discussion feature | Lands in VC Brain as |
|---|---|
| Guided overview / entry-point pathway | Graph tab: guided tour of the founder's repo ("start here, this is the entry point") |
| Grounded Q&A chat (whole repo) | Chat tab: diligence questions with node/slide citations |
| Per-file contextual chat | Graph tab: click node → chat about that file in place |
| Structure walkthrough, alternate views | Graph tab: layer/domain filters |
| Voice mode (ElevenLabs) | Voice brief (P0) + optional voice graph Q&A (P2) |
| "Google, but for repos" discovery | Outbound sourcing board (already in plan) |

Remaining team-discussion items (personal workspace, idea-to-scaffold, Chrome extension, local-LLM mode) → `docs/ops/BACKLOG.md`. Pitch keeps the team's headline framing as the investor version: understanding a founder's repo drops from weeks to minutes.

## 1. Locked decisions (from Q&A)

| Decision | Choice |
|---|---|
| Framing | Job-to-be-done: "deploy a $100K check in 24h with evidence instead of vibes" |
| Personas | Investor primary, founder secondary (short apply journey only) |
| Golden path | Inbound: apply → graph → scores → memo → decide → voice brief |
| Auth | Demo-lite: one investor login, public founder `/apply`, session cookie separates roles (~1h build) |
| Smoke tests | CLAUDE.md checkpoint cadence: one real read + one real write per external service at every module M0–M6, plus one-command golden-path smoke |
| Definition of Done | Dedicated checklist doc, 3 layers (judge / FR traceability / automated gate) |
| Wow moment (named) | Trust contradiction catch: "deck says $120K ARR — nothing supports it" |
| Selling point | Repo-understanding (UA-derived) inside diligence: investor *understands the founder's code* without being technical |

## 2. Customer value model

Customer = Maschmeyer-type VC partner. Today: 3–6 week diligence, network-gated, vibes-based. Value per golden-path step:

| # | Step | Investor action | Value gained |
|---|---|---|---|
| 1 | Thesis (once) | Encode sectors/stage/check/geo | All later screens pre-filtered; zero off-thesis noise |
| 2 | Pipeline | Scan ranked cards (Founder Score + thesis fit) | Triage — what to look at first |
| 3 | Graph | Guided tour of founder's actual code; click any node, chat about that file | Technical conviction without a CTO friend — the Understand-Anything selling point |
| 4 | Claims/Trust | Read supported/unsupported/**contradicted** flags | **Wow moment** — catches in minutes what reference calls take weeks for |
| 5 | Chat | Ask own diligence question, cited answer | Replaces analyst |
| 6 | Memo | Read auto-draft, gaps flagged honestly | IC-ready doc in minutes |
| 7 | Decide | Invest / Pass / More info | Recorded; Founder Score persists → memory compounds |
| 8 | Voice brief | Play 60s ElevenLabs brief | Hands-free diligence; demo closer |

One-liner reused across docs and pitch: **"Turns 3 weeks of vibes into 24 hours of evidence."**

## 3. Use-case inventory (~14, actor-goal)

- **Investor UC1–UC11:** configure thesis; review pipeline; run analysis on inbound; explore knowledge graph (guided overview + per-file chat); audit claims/Trust Scores; ask diligence question (cited chat); generate memo; record decision; activate outbound founder; play voice brief; re-evaluate returning founder (Founder Score persistence).
- **Founder UC12–UC13:** apply with deck + repo URL; optional voice intake (ElevenLabs P1).
- **System UC14:** outbound scan of seeded GitHub-like signals.

## 4. Journeys

- **J1 (golden, demo):** inbound apply → analyze → graph → trust → memo → decide → voice brief. Every doc and screen optimizes for J1.
- **J2:** outbound source → activate → diligence.
- **J3:** returning founder → Founder Score trend visible.
- **J4:** founder apply (public page, demo-lite auth boundary).

## 5. Document suite (dispatch deliverables)

| File | Content | Depends on |
|---|---|---|
| `docs/product/USE-CASES.md` | UC1–UC14 actor-goal use cases, each tagged with rubric row + module | this design |
| `docs/product/USER-JOURNEYS.md` | J1–J4 per-screen journeys with value-gained column (J1 = §2 table expanded) | USE-CASES |
| `docs/product/REQUIREMENTS-FUNCTIONAL.md` | Numbered FRs mapped to rubric % rows + modules M0–M6; includes demo-lite auth FRs | USE-CASES |
| `docs/product/REQUIREMENTS-NFR.md` | Demo reliability (precomputed graphs, prerendered audio, text fallbacks), perf budgets, honesty rules (no invented numbers, `unavailable` states), security (upload sanitization + traversal test red-first per CLAUDE.md), auth, cost | FR doc |
| `docs/product/SCREEN-MAP.md` | Page-by-page wireflow: URL, sees/clicks/gains, loading/empty/error states | JOURNEYS |
| `docs/product/EXTERNAL-SERVICES.md` | LLM, ElevenLabs, GitHub, PDF parse — each with preflight spike requirement (real call proof → docs/ops/PREFLIGHT.md) + fallback | — |
| `docs/ops/SMOKE-TESTS.md` | Checkpoint cadence M0–M6: real read + real write per service; one-command golden-path smoke spec | EXTERNAL-SERVICES |
| `docs/product/DEFINITION-OF-DONE.md` | See §6 | all above |

Key availability is UNVERIFIED (secrets registry read blocked in session). External-services doc must mark every key "assumed — prove at preflight"; no module may depend on a service before its PREFLIGHT.md entry shows a real call. Team-discussion note: ElevenLabs credits redeemed via dashboard questionnaire (worked for some accounts) — preflight must confirm which account's key is live.

## 6. Definition of Done (3 layers)

1. **Judge layer** — every Challenge 02 rubric row (Data Architecture 30% / Analysis & Trust 25% / Investment Utility 30% / UX 15%) expanded into checkable criteria; extends VC-BRAIN-PLAN §12 and §17, does not duplicate them — links back.
2. **FR traceability** — every FR ID appears once in DoD with a verify method: command, manual step, or screenshot. No FR without a check; no check without an FR.
3. **Automated gate** — `pnpm check:done` (script spec'd in the doc, built later): runs golden-path smoke, verifies required files exist, verifies git pushed (Law 1). Manual-only items live in a checkbox table with owner + verify step.

## 7. Execution plan after this design

1. User reviews this file.
2. Dispatch plan gate: spawn-hierarchy tree + 13-column plan table + token budget + acceptance criteria (per global dispatch rules), covering all 8 docs, with humanizer scrub pass and consistency reviewer. Agents expected: writer/engineer agents per doc cluster, designer input on SCREEN-MAP, demo-engineer input on DoD + smoke tests.
3. Fan-out on approval; docs land under `docs/product/` + `docs/ops/`; TODO.md updated; push (Law 1).

## 8. Out of scope for this suite

- Any application code (scaffold comes after docs per TODO board — docs must not block it long; suite is a half-day of agent work max).
- Portfolio monitoring / fund ops (challenge scope excludes).
- ElevenLabs P2/P3 features beyond documenting their cut-line.
- Team-discussion ambition layer (workspace, idea-to-scaffold, extension, local LLM) — BACKLOG.
