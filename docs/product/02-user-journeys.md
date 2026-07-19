# FounderGraph user journeys

One-liner (reused across docs and pitch): **"Turns 3 weeks of vibes into 24 hours of evidence."**

These journeys optimize the investor's job-to-be-done: deploy a $100K check in 24 hours with evidence instead of vibes. Source flow: `VC-BRAIN-PLAN.md` §0.5, §2, §3, §7, §10. Rubric value: `docs/ops/RUBRIC.md` §1. Investor journeys run inside the demo-lite investor session (suite design §1); J4 is the public founder side of that boundary.

## J1: golden inbound diligence journey (THE demo)

J1 is the rehearsed demo — every doc and screen optimizes for it. The public founder upload is an optional prelude because plan §0.5 puts live Apply on the cut ladder; the never-cut path starts at Pipeline with the seeded inbound hero.

| Step | Screen | Investor action | FounderGraph behavior | Value gained | Failure / fallback |
|---|---|---|---|---|---|
| J1.0 (optional) | Apply `/apply` | Founder submits company + repo + deck | Creates inbound Opportunity, returns ID | New inbound enters the same screening path | Apply cut ⇒ seeded inbound hero |
| J1.1 | Pipeline `/` | Review thesis + pipeline | Loads thesis config; R4 check-size toggle greys the off-thesis card live | Zero off-thesis noise before diligence | R4/editing cut ⇒ read-only thesis.json |
| J1.2 | Pipeline `/` | Select the inbound hero card | Card shows Founder Score, thesis-fit chips, channel badge, "why surfaced" evidence | Triage — what to look at first | Seeded card works offline |
| J1.3 | Diligence `/opportunities/[id]` | Start analysis | One action orchestrates staged Analyze → Score → Memo with progressive status | Repo + deck become an inspectable result | Precomputed graph + captured replay if live fails or is cut |
| J1.4 | Graph `/opportunities/[id]/graph` | Inspect the code graph, open a file node | Renders React Flow graph; node drawer shows summary + sourceRef | Technical conviction without a CTO friend (UA selling point) | Base graph + drawer survive filters/domains/R5 cuts |
| J1.5 | Graph | Ask "What's proprietary vs commodity?" or ask about a node/selection | Streams a cited answer over SSE, or refuses without evidence | Replaces an analyst with a checkable answer | Captured cited replay for the rehearsed offline answer |
| J1.6 | Diligence | Review Founder / Market / Idea-vs-Market scores | Shows each axis separately with rationale, evidence, valid trend — never averaged | Investment trade-offs stay visible | Trend = `baseline` without two dated observations |
| J1.7 | Diligence | **Click the red CONTRADICTED claim** | **Jumps to the exact deck slide + graph node with incompatible cited facts — the wow moment** | Catches in minutes what reference calls take weeks for | Never cut; absence of support renders `unsupported`, not contradicted |
| J1.8 | Diligence | Read the memo | Cited sections, recommendation, thesis fit, "not disclosed" gaps (R6) | IC-ready doc in minutes, honest about gaps | One repair then replay; absent values stay unavailable |
| J1.9 | Diligence | Choose Invest / Pass / More info | Persists the decision; R2 chip shows "First signal → decision: N min" | Recorded outcome + speed instrumented | R2 formula TBD (owner: human); decision must still persist |
| J1.10 | Diligence | Click "Play investment brief" | Plays the pre-rendered ElevenLabs MP3 with pause | Hands-free brief; demo closing beat | Audio unavailable ⇒ exact script + "voice unavailable" |

Trace: plan §0.5 decisions 3–9, 12 + build order/cut ladder; §1b; §2; §3; §7; §8; §10; §12; §17. Rubric §1: all four criteria.

## J2: outbound source → diligence (Tavily-powered)

| Step | Screen | Investor action | FounderGraph behavior | Value gained | Failure / fallback |
|---|---|---|---|---|---|
| J2.1 | Pipeline `/` | Click Scan | Replays the captured Wave-0 Tavily sourcing run (R7) | Thesis-led web discovery with zero stage-time network risk | R7 cut ⇒ seeded outbound cards |
| J2.2 | Pipeline `/` | Inspect the threshold-crossing card | Channel badge + evidence-backed "why surfaced" line (R3) | Sourcing rationale inspectable — incl. cold-start public artifacts | R3 drill-down cuttable; badge remains |
| J2.3 | Pipeline `/` | Open the candidate | Sourced card → its Diligence record | Signal becomes a screening task; no outreach implied | — |
| J2.4 | Diligence + Graph | Same graph → trust → scores → memo → decision path as J1 | Precomputed evidence + replay as needed | Same evidence standard for inbound and outbound | Live analysis cuttable |

Trace: plan §0.5 decisions 5, 12 (R3/R7) + Wave 0/cut ladder; §2; §7 M1/M2; §10; §11; §12. Rubric §1: Data Architecture; Investment Utility.

## J3: returning founder

| Step | Screen | Investor action | FounderGraph behavior | Value gained | Failure / fallback |
|---|---|---|---|---|---|
| J3.1 | Pipeline `/` | Open the returning-founder hero | Dedups to the existing Person via normalized GitHub URL / email | Founder record never resets between applications | Dedup failure surfaces as an error, never silent confidence |
| J3.2 | Diligence | Compare Founder Score + history | Prior score history preserved; new dated observation appended | Memory compounds across attempts | Sparkline cuttable; persisted history is not |
| J3.3 | Diligence | Inspect score trends | Trend only with two dated observations; else `baseline` | No fabricated trajectory | Trend UI cuttable; static scores remain |
| J3.4 | Diligence | Record the new decision | Persists opportunity decision without touching founder history | Person-level memory separate from opportunity-level judgment | Decision must survive reload |

Trace: plan §0.5 decisions 4, 5 + cut ladder; §2; §5 Person/AxisScore; §7 M1/M3/M4; §12; §17. Rubric §1: Data Architecture; Investment Utility.

## J4: founder apply (public side of the demo-lite auth boundary)

| Step | Screen | Founder action | FounderGraph behavior | Value gained | Failure / fallback |
|---|---|---|---|---|---|
| J4.1 | Apply `/apply` | Enter company name + optional founder/repo/link fields | Validates the public-lite form (no investor session required) | Minimal inbound lead captured | Validation copy TBD (owner: human) |
| J4.2 | Apply `/apply` | Upload a deck | Accepts file only if sanitization + allowlist checks pass, binds to Opportunity | Founder-supplied claims for later evidence checks | File limits + MIME allowlist TBD (owner: human) |
| J4.3 | Apply `/apply` | Submit | Creates the inbound opportunity, returns ID | Inbound routed into the investor pipeline | Explicit error; entered text preserved; no partial record |
| J4.4 | Pipeline `/` | Investor opens the new card | J1 starts at analysis | One diligence path for public inbound and seeded demo data | Apply cut ⇒ J4 omitted; J1 uses the seeded hero |

Trace: plan §0.5 decisions 9, 11 + cut ladder; §2 Inbound; §7 M0/M2; §8 `/api/apply`; §10; suite design §1 (auth boundary). Rubric §1: Data Architecture; UX.

## Out of scope

- A mandatory founder upload step in the golden path — Apply is on the cut ladder.
- Guided repository tour (not defined in plan v3 — reported for human ruling).
- Auth beyond demo-lite (one investor login + session cookie per suite design §1; plan v3 lacks the contract — flagged for plan backfill).
- Actual outbound messaging, voice intake, realtime voice chat, portfolio monitoring, fund ops.
