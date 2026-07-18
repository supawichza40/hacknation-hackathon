# FounderGraph Lovable prototype — Concept + Definition of Done

Companion to `09-lovable-frontend-brief.md` (the CONTRACT). This file is the acceptance
checklist the dispatch build loop verifies against. The brief wins on any conflict; deltas
discovered during the build get written back into the brief (Law 1) and noted here.
Distinct from `08-definition-of-done.md` (product-wide DoD) — this is the prototype build gate only.

Status: locked 2026-07-19 00:18 BST. Build target: Lovable workspace `Supavich's Lovable` (pro).

## Concept (one paragraph)

"Linear's cousin for VC diligence." A calm, light-only, data-dense investor OS for one solo
VC. Four routes — Pipeline / Diligence / Graph / Apply — plus a demo-lite login gate and seven
drawers. ALL data is static mock JSON in `src/data/*.json`; ALL "analysis" is simulated timed
state transitions, honestly labeled as replay. The build exists to deliver one wow moment: a red
contradicted claim on the Diligence page that click-jumps to the exact deck slide + graph node.
Golden path §6 is the 3-minute demo walk and every screen must survive being clicked through it.

## Definition of Done (acceptance criteria)

| # | Criterion | Pass test | Source |
|---|---|---|---|
| 1 | All routes navigable; login gate works (any submit → Pipeline); `/apply` never gated; golden-path route transitions instant (no artificial spinner) | Click each route from nav + direct URL; `/apply` in a fresh session shows no login | brief §3 |
| 2 | Design tokens EXACT (§2 CSS vars), Inter + JetBrains Mono, **LIGHT only**, radius ≤6px; anti-slop bans all hold (no gradient hero, no emoji section markers, no stock art, no big rounded marketing cards, no AI-sparkle icons) | Inspect computed styles vs §2; visual scan for each ban | brief §2 |
| 3 | Mock data lives in `src/data/*.json` (never inlined): 4 opportunities incl. ECC hero w/ the one contradiction, `thesis.json`, one ~40-node/60-edge graph, `memo-ecc.json` w/ 2 "Not disclosed" rows, `tour-ecc.json` w/ 7 steps | `list_files` src/data/*; grep components for inlined arrays | brief §4 |
| 4 | Every mandatory state in §5.1–5.4 reachable via a bottom-right collapsible dev state switcher | Open switcher, cycle every listed state per screen | brief §5, §8 |
| 5 | Golden path §6 all 6 beats clickable end-to-end: (1) thesis bar + ECC history row → (2) Diligence axes/claims → wow → (3) Graph drawer + tour + cited chat → (4) play brief + memo gaps + Invest saved → (5) Scan replay → PipeWarden pop-in over threshold → (6) check-size toggle → BrightCart un-greys live | Walk all 6 in the browser without a dead end | brief §6 |
| 6 | Wow moment polished: clicking the red contradicted claim opens a split evidence view — exact deck slide (image placeholder, highlighted sentence) AND the graph node with the conflicting benchmark line; transition is the most polished in the app | Click red claim; both panels render with the 340ms-vs-sub-100ms conflict | brief §5.2, §2 |
| 7 | Replay/simulated things LABELED as replay ("replaying captured run…"); all scores/counts tabular mono, right-aligned, consistent decimals; decision-saved state distinct from AI recommendation | Scan/analysis/graph show replay labels; inspect number cells | brief §2, §5 |
| 8 | Nothing from §7 built (no dark mode, settings, multi-user, portfolio chat, extra dashboards, real auth, real network, voice recording, mobile-first); layout holds at 1280px | Grep for banned features; resize to 1280px | brief §7 |
| 9 | Components framework-portable: one component per screen section, screens don't import each other's internals, no Vite-specific magic in components (real app is Next.js App Router) | Inspect component tree + imports | brief §8 |
| 10 | Build is verified against the FROZEN brief revision — deltas are recorded, never used to loosen frozen design/scope. A delta that would weaken the contract (drop a state, relax a token, cut a §6 beat) needs prior human approval, logged separately from build acceptance. Approved factual deltas (e.g. build stack) written back into `09-lovable-frontend-brief.md`; DoD + TODO updated; committed AND pushed | `git log` shows write-back commit pushed; no frozen-scope item silently dropped | brief purpose, CLAUDE.md Law 1, Sol blocker |

## Wow-moment spec (the one thing that must be perfect)

ECC deck claims "sub-100ms agent routing in production." Repo evidence: benchmark README reports
**340ms median**. On Diligence, this claim renders RED (contradicted). Click → split view:
- **Left:** deck slide image placeholder, the "sub-100ms" sentence highlighted.
- **Right:** the graph node for the benchmark file, the "340ms median" line surfaced.
Both cite `sourceRef`. This is the 10-second moment the demo exists for.

## Loop / re-plan machinery (how issues get handled)

- **Loop A (per-stage diff gate):** after each Lovable build turn → `get_diff` + browser-check that
  screen vs DoD → pass, or re-prompt Lovable with the SPECIFIC defect (cap 3/stage, then re-plan).
- **Loop B (audit fix loop):** Sol audits full build vs this DoD → gap list → fix each in Lovable →
  re-verify (cap 2 rounds; unfixed after 2 → surface to human).
- **Loop C (re-plan on hard failure):** tool can't-do → brief-fallback + log to Unknowns Ledger;
  scope creep → strip; ≥80% budget w/ DoD unmet → forced descope, finish critical path only.

## Sol-hardened QA script (browser walk — closes the "vague/gameable" gaps)

Sol (gpt-5.6-sol) adversarially reviewed this DoD (45 objections, 2 blockers). Verdict: the
brief is sound; the checklist was too vague. These concrete pass-tests are the browser-QA script.
The golden path MUST run from `/` with the state switcher COLLAPSED, using only real user
controls (cards, buttons, drawers, back-nav, tour, chat, audio, decision) — not direct URLs or
the switcher.

**Login/routing:** unauth deep-links to `/`, `/opportunities/ecc`, `/opportunities/ecc/graph` all
require the fake session; `/apply` never redirects and shows NO investor chrome (no nav/thesis/
pipeline). Login hint shows `investor@foundergraph.demo / demo`; any submit → Pipeline. Return
paths work: Pipeline→Diligence→Graph, Graph→Diligence, Diligence→Pipeline.

**"Instant" scope:** instant = route changes only. Scan replay, staged analysis, and streaming
chat MUST show observable timed progress (a build that makes simulations instant FAILS).

**Pipeline §5.1:** Outbound/Inbound columns with ECC in Inbound; every card field present (badges,
mono score, thesis-fit chips, evidence "why surfaced", timer chip). NL query "show founders with
rising commit velocity" → ranked + citation chips; empty → "No cited matches" with base pipeline
intact. Scan → labeled captured-run date + visible progress → PipeWarden absent-then-inserted in
Outbound with threshold highlight. Every card opens its matching id (PipeWarden too, post-scan).

**Diligence §5.2:** ONE scrolling page in order Header→Overview→3 axes→Claims→Memo→Decision (no
tabs). Three axes (Founder/Market/Idea-vs-Market) each with one-line rationale + evidence count,
NEVER blended. ~8 claims with distinct green/amber/red; unsupported never labeled contradicted.
Wow: red claim → split view asserting BOTH exact facts ("sub-100ms" deck slide 7 highlighted +
"median 340ms" from bench/README.md:22-24) with working slide/node locators. "Show reasoning" →
staged timeline w/ provenance timestamps, no raw JSON. Invest: Invest/Pass/More-info + note,
double-submit disabled, saved state distinct from AI rec, persists on reload. Play brief → local
audio play/pause + printed-script fallback when unavailable (no recording/network).

**Graph §5.3:** pan/zoom, colored file/claim/concept nodes + edges, node select → drawer (name,
summary, type, sourceRef, "Ask about this"); text-select → "ask about selection". Chat streams and
ALWAYS ends in node-citation chips that focus the node, OR a clean "no citable evidence" refusal.
Tour: all 7 steps forward+back, highlight current + dim rest. Broken locator → honest error, no
redirect.

**Apply §5.4:** company + repo required (frozen brief wins over journey's "repo optional"), deck
labeled optional, field-level errors preserve values, sanitized filename, double-submit disabled,
success returns a unique id + inserts into Inbound (opens its Diligence). Upload type/size limits:
TBD in source docs — use a placeholder rule, flag as needs-human-approve.

**Static/visual:** network audit over full golden path shows NO real backend/API/LLM calls. Tokens
proven USED on real surfaces (not just declared). 1280px: no overflow/overlap/clipping on any
route/drawer/split/switcher. No `import.meta.env` or Vite globals in section components.

**Open (needs human approval before pass/fail):** upload MIME/size limits; timer-chip exact
computation + rounding. Both marked TBD in source docs.

## Out of budget / concerns

Filled at D6 close-out if anything ships as DONE_WITH_CONCERNS.
