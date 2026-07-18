# FounderGraph screen map

Four surfaces per `VC-BRAIN-PLAN.md` §0.5 decision 11 and §10. Apply sits on the cut ladder. Drawers belong to their parent surface and add no routes. Investor surfaces load inside the demo-lite investor session; `/apply` is public (suite design §1; FR-AUTH-01/02).

## Wireflow

```text
(login gate — demo-lite)          Public founder /apply (cut-ladder)
        |                                   |
        v                                   v
Pipeline /  --->  Diligence /opportunities/[id]  --->  Graph /opportunities/[id]/graph
   ^                         |                                  |
   |                         +---- decision + voice brief       +---- streaming cited chat
   |                         +---- contradiction jump ----------+     (node-click / highlight)
   +------------------------- return to pipeline
```

The never-cut golden path starts at Pipeline with the seeded inbound hero. Source: plan §0.5 cut ladder/never-cut list; §7; §8; §10.

## Screen 1: Pipeline

| Field | Specification |
|---|---|
| URL | `/` (investor session) |
| Primary actor | Investor |
| Sees | Active thesis summary; Outbound and Inbound columns; the three demo cards; company, source, Founder Score, thesis-fit chips; R3 channel badges + evidence-backed "why surfaced" line if retained |
| Clicks/types | Open thesis drawer; R4 check-size toggle if retained; R1 compound NL query if retained; R7 Scan if retained; open an opportunity card |
| Gains | Thesis-filtered triage — cold-start evidence, source, fit, and founder memory visible before deeper diligence |
| Navigation | Card → `/opportunities/[id]`; optional Apply link → `/apply` |
| Scope | Core surface. R1, R3 depth, R4, R7 keep their ladder status; seeded cards + read-only thesis.json are the fallbacks. |
| Source | Plan §0.5 d5/d11/d12 + cut ladder; §2; §7 M1/M2/M4; §8; §10; §11; rubric §1 all four |

### Pipeline states

| State | Investor sees | Available action |
|---|---|---|
| Loading | Pipeline frame + explicit loading state for thesis/cards | Wait; no stale rank shown as current |
| Ready | Two columns and the planned cards | Query, scan, toggle check size, or open card per retained scope |
| Query running | R1 progress attached to the query box | Current card list stays visible until ranked results arrive |
| Query empty | "No cited matches" + unchanged base pipeline | Clear or revise query |
| Scan replay running | Explicit replay status — never a live-scan claim | Wait for the recorded threshold result |
| No opportunities | Empty columns, no fabricated cards | Seed demo data; Apply only if retained |
| Data/replay error | Named failed source + seeded fallback status | Continue with seeded cards or retry the local read |
| Off-thesis | Grey card + "fails thesis: check size" chip | Open for inspection or restore the thesis setting |

## Screen 2: Diligence

| Field | Specification |
|---|---|
| URL | `/opportunities/[id]` (investor session) |
| Primary actor | Investor |
| Sees | ONE scrolling page: header (company, source, status, Founder Score, R2 timer chip, "Play investment brief") → Overview → separate Founder/Market/Idea-vs-Market scores → Claims + Trust states → Memo → decision CTA |
| Clicks | Start staged analysis if live Analyze retained; open Graph; open R5 reasoning if retained; click evidence; **click the red contradicted claim**; play/pause brief; select Invest / Pass / More info + note |
| Gains | A single evidence narrative from context to Trust to scores to memo to human decision |
| Navigation | Back to Pipeline; Graph route; contradiction click-jump targets the exact deck slide + graph node |
| Scope | Never-cut hero surface. R5 and trend presentation cuttable; contradiction, separate axes, memo, decision, gaps, and pre-rendered brief remain. |
| Source | Plan §0.5 d6/d8/d11/d12 + never-cut list; §5; §7 M3/M4/M5b; §8; §10; §12; §17; rubric §1 Analysis & Trust, Investment Utility, UX |

### Diligence states

| State | Investor sees | Available action |
|---|---|---|
| Loading | Opportunity identity + named stage status | Return to Pipeline; wait |
| Staged analysis | Current stage + completed cached stages | Retry the failed stage or use replay |
| Replay mode | Provenance label identifying captured analysis | Inspect evidence; no live-analysis claim |
| Ready | Overview, axes, claims, memo, decision, brief controls | Follow the golden path |
| No memo yet | Structured empty memo area, blocking stage named | Run/restore Memo stage |
| Missing optional info | "Not disclosed" gap rows incl. R6 categories | Request More info; never infer values |
| Contradicted claim | Red status + both evidence targets | Click to inspect exact slide + graph node |
| Unsupported claim | Unsupported status + available locator context | Treat as unverified; never shown as contradicted |
| Decision saving | Duplicate submit disabled + visible save state | Wait |
| Decision saved | Persisted decision, visually distinct from generated recommendation | Reload to confirm or return to Pipeline |
| Audio loading | Play control shows local audio load state | Pause/cancel or read script |
| Audio unavailable | Exact script + "voice unavailable" | Continue without audio |
| Not found | Explicit not-found state | Return to Pipeline |

> TBD (owner: human): R2 start/end timestamps, rounding, and pre-decision display.

## Screen 3: Graph

| Field | Specification |
|---|---|
| URL | `/opportunities/[id]/graph` (investor session) |
| Primary actor | Investor |
| Sees | React Flow canvas; nodes + edges; selected-node drawer (summary + sourceRef); streaming cited chat; R5 reasoning entry if retained; filters/domains if time remained |
| Clicks/types | Pan/zoom; select node; open source location; "Ask about this"; highlight text and ask; whole-opportunity question; open R5 timeline if retained |
| Gains | Technical understanding with a path from any summary or answer back to code/deck evidence |
| Navigation | Back to Diligence; evidence jumps stay inside the opportunity context |
| Scope | Base graph + node drawer core. Chat trio committed — absolute last-resort cut only. Filters/domains + R5 cuttable. |
| Source | Plan §0.5 d6/d7/d10/d11/d12 + cut ladder; §1; §5; §7 M2/M4; §8; §9; §10; §12; §17; rubric §1 Analysis & Trust, UX |

### Graph states

| State | Investor sees | Available action |
|---|---|---|
| Loading graph | Graph frame + explicit graph source/replay status | Return to Diligence; wait |
| Ready, no selection | Full graph + prompt to select a node | Pan, zoom, select, or ask a whole-opportunity question |
| Node selected | Drawer with name, summary, type, sourceRef | Open source; Ask about this; select text |
| Empty graph | "No graph available" + failed/missing artifact named | Use precomputed graph or return to Diligence |
| Graph parse error | Explicit invalid-artifact state | Load validated replay/precomputed graph |
| Chat streaming | Incremental answer; final citation status pending | (Cancel not specified in the plan; not required) |
| Chat cited | Completed answer + node citations with quotes | Open citation target |
| Chat refuses | Clear no-citable-evidence response | Ask narrower; no guessed answer |
| Chat unavailable | Captured cited replay offered for the rehearsed question | Use replay or continue graph inspection |
| Source target missing | Broken-locator error with evidence ID | Return to claim/node; no silent redirect |
| Reasoning unavailable | R5 entry absent or marked cut | Continue through direct Evidence links |

> Conflict (reported): the suite design's guided "start here" repo tour has no plan-v3 contract, so it is not mapped here — human ruling needed.

## Screen 4: Apply

| Field | Specification |
|---|---|
| URL | `/apply` (public — no investor session) |
| Primary actor | Founder |
| Sees | Minimal public-lite form: company name, repo URLs, optional deck, optional founder name, optional links |
| Clicks/types | Enter fields; choose deck file; submit |
| Gains | A short inbound path into the same Opportunity + diligence model used for sourced founders |
| Navigation | Success returns an opportunity ID; the investor later sees the card in Pipeline |
| Scope | On the T-8h cut ladder; never a dependency of the never-cut golden path. |
| Source | Plan §0.5 d9/d11 + cut ladder; §2 Inbound; §7 M0/M2; §8 `/api/apply`; §10; rubric §1 Data Architecture, UX |

### Apply states

| State | Founder sees | Available action |
|---|---|---|
| Initial | Empty minimal form | Enter values; leave optional fields blank |
| File selected | Sanitized display name + validation status | Remove or submit |
| Validation error | Field-level message; valid entries preserved | Correct and resubmit |
| Upload rejected | Explicit type/size/path rejection (limits TBD, owner: human) | Choose another file |
| Submitting | Duplicate submission disabled | Wait |
| Success | Created opportunity ID | No investor navigation implied for the public actor |
| Server failure | Error; entered text preserved; no partial record | Retry |
| Cut | Route absent; seeded inbound hero remains | Golden path starts at Pipeline |

## Drawers and in-page controls

| Component | Parent | Required content | Scope |
|---|---|---|---|
| Thesis drawer | Pipeline | All thesis fields; R4 check-size control if retained | Drawer core; live control cuttable |
| Node drawer | Graph | Node identity, summary, type, sourceRef, "Ask about this", text-selection context | Core |
| Reasoning timeline | Diligence and/or Graph | Steps from provenance metadata, never raw model JSON | R5, cuttable |
| Claims evidence target | Diligence → Graph/deck context | Exact slide + graph node for the hero contradiction | Never cut |
| Audio control | Diligence | Play/pause local MP3; script fallback | Never cut |
| Login gate | Investor surfaces | Single demo credential; session cookie | Demo-lite (design §1); plan backfill flagged |

## Design direction

Clear hierarchy, evidence click-through, no vanity dashboards; brand for "investor OS", not a generic purple AI-SaaS clone (plan §10 design notes). Rubric §1 UX (15%): "intuitive, clear, and beautifully designed … effortless and trustworthy for a non-technical investor."

## Out of scope

- Additional dashboard, workspace, onboarding, portfolio, fund-ops, outreach, voice-intake, and realtime-voice screens.
- A mandatory Apply screen.
- Guided graph-tour UI until the plan defines it.
- Auth screens beyond the demo-lite login gate.
