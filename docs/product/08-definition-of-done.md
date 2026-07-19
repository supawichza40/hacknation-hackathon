# FounderGraph definition of done

FounderGraph is done only when every committed and never-cut check below passes, every retained cuttable feature passes its requirement, every formally cut feature passes its named fallback, and the Challenge 02 submission artifacts are present. Stretch realtime voice never blocks done.

Per the suite design §6, Layer 1 **extends** `VC-BRAIN-PLAN.md` §12 (evaluation checklist) and §17 (submit DoD) — it links back rather than replacing them; read those sections alongside this doc. Rubric wording: `docs/ops/RUBRIC.md` §1–2.

## Layer 1: judge checklist (rubric rows expanded)

### Data Architecture and Intelligence — 30% (plan §12 first block)

- [ ] A real repository + hero deck were ingested during Wave 0, with precomputed/replay fallbacks preserved.
- [ ] Memory stores structured Person, Opportunity, ScreeningFacts, Evidence, Claim, AxisScore, Memo data.
- [ ] Normalized GitHub URL or email deduplicates the returning founder across opportunities.
- [ ] Founder Score history persists across applications — never resets.
- [ ] Every known screening fact is evidence-backed; unknowns stay explicit.
- [ ] **Cold-start caveat (rubric §1 note — a tiebreaker, never silently dropped):** the hero demonstrates the pre-track-record case through inspectable public artifacts.
- [ ] Outbound cards keep source-channel context; R3 evidence depth shown if retained.
- [ ] R1 cross-founder query returns ranked cited results if retained.
- [ ] R7 captured scan pops the recorded threshold-crossing candidate if retained — labeled replay, never live.
- [ ] Replays identify their real provenance; nothing is a mocked fixture.

Source: plan §0.5 d3–d5, d12; §2; §5; §7 M1/M2/M4; §11; §12.

### Intelligent Analysis and Trust — 25% (plan §12 second block)

- [ ] Every claim shows Trust Score, confidence, status, evidence.
- [ ] Supported / unsupported / contradicted / unavailable follow the locked epistemic rules.
- [ ] **Wow moment:** the hero's red contradicted claim opens the exact deck slide + graph node with incompatible cited facts.
- [ ] Every axis rationale and material memo conclusion resolves to Evidence.
- [ ] Chat streams a cited answer or refuses; node-click and highlight context use the same grounded path.
- [ ] Missing memo information is "unavailable" / "not disclosed" — never fabricated.
- [ ] R5 (if retained) shows provenance as a step timeline, never raw model JSON.
- [ ] Invalid structured output gets one repair, then captured replay.

Source: plan §0.5 d2–d7, d12; §2; §5; §7 M2–M4; §9; §12.

### Investment Utility and Execution — 30% (plan §12 third block)

- [ ] Thesis configuration filters every recommendation; R4 live check-size works if retained.
- [ ] Founder / Market / Idea-vs-Market scores are separate, evidence-backed, never averaged.
- [ ] Trends use two dated observations or stay baseline.
- [ ] Memo contains the planned sections, recommendation, thesis fit, explicit gaps (R6 auto-"not disclosed").
- [ ] The human records Invest / Pass / More info; the decision survives reload.
- [ ] The human decision is visibly distinct from the memo's generated recommendation.
- [ ] R2 shows first-signal→decision elapsed time from a human-approved timestamp formula.
- [ ] The pre-rendered investment brief plays with no live TTS dependency and has a text fallback.
- [ ] The never-cut hero path works with outbound network disabled.

Source: plan §0.5 d4/d5/d8/d12 + never-cut list; §1b; §2; §5; §7 M3–M5b; §8; §12; §17.

### UX and Design — 15% (plan §12 fourth block)

- [ ] Pipeline, Diligence, and Graph tell one investor narrative; optional Apply never blocks it.
- [ ] Pipeline distinguishes inbound, outbound, off-thesis, cold-start, returning-founder states.
- [ ] Diligence is one scrolling page: overview → claims → memo → decision.
- [ ] Graph gives a non-technical investor pan/zoom, node summary, sourceRef, grounded chat.
- [ ] Loading, empty, error, replay, unavailable, and fallback states are explicit.
- [ ] Evidence links and the contradiction jump are understandable without documentation.
- [ ] No vanity dashboard; evidence and decisions stay visually dominant; "investor OS" brand, not a generic AI-SaaS clone.
- [ ] A human verifies the final presentation against the rubric wording "intuitive, clear, and beautifully designed."

Source: plan §0.5 d6/d7/d11; §10; §12; §15.

> Event-wide layer (rubric §1 note): the two ≤60-sec videos and the docs are themselves a scored axis (Communication). Video quality checks live in the manual table below — treat them as rubric points, not packaging.

## Layer 2: functional-requirement traceability

Every FR from 03-functional-requirements.md appears exactly once. No FR without a check; no product check without an FR.

| FR | Verify method | Done when |
|---|---|---|
| FR-THESIS-01 | Automated thesis fixture test + Pipeline inspection | Stored thesis fields load and deterministically change fit without inventing missing facts |
| FR-THESIS-02 | SMK-M1-05 + screenshot if retained | R4 greys the check-size card, or read-only fallback formally recorded |
| FR-PIPE-01 | `npm run smoke:golden` Pipeline step | Exactly three planned cards in correct columns with required fields |
| FR-PIPE-02 | SMK-M1-04 + evidence-integrity test | R3 reason resolves to Evidence, or badge-only fallback recorded |
| FR-PIPE-03 | SMK-M4-07 | Retained R1 returns ranked cited results; else cut status recorded |
| FR-PIPE-04 | SMK-M2-05 with network disabled | Retained R7 deterministically pops the captured candidate; else seeded fallback passes |
| FR-PIPE-05 | Golden-smoke hero assertion + manual screenshot | Cold-start hero surfaced through public-artifact evidence |
| FR-APPLY-01 | Optional Apply smoke + traversal/validation tests | Valid retained Apply creates one Inbound record; invalid input creates none; or seeded fallback recorded |
| FR-AUTH-01 | Manual check: fresh browser hits `/` and `/apply` | `/apply` public; investor surfaces gated behind the single demo login |
| FR-AUTH-02 | Cookie present/absent check on investor surfaces | Session cookie separates roles; no signup flow exists |
| FR-MEM-01 | DB restart integration test | Required records survive restart |
| FR-MEM-02 | SMK-M1-02 | Returning fixture resolves to one Person |
| FR-MEM-03 | SMK-M1-03 | Prior Founder Score/history remains; new dated row appended |
| FR-MEM-04 | SMK-M3-05 | No material record has a dangling Evidence ID |
| FR-ANALYZE-01 | SMK-M2-02 + SMK-M2-03 | Stages report progress, cache completed work, recover via replay |
| FR-ANALYZE-02 | SMK-W0-LLM, SMK-W0-GH, SMK-W0-PDF, SMK-M2-01 | Repo/deck inputs produce graph, claims, locators via live or planned fallback |
| FR-ANALYZE-03 | SMK-W0-LLM-FB | One repair, then the real captured replay with provenance |
| FR-GRAPH-01 | SMK-M2-01 + screenshot | Graph interactive; selected node sourceRef resolves |
| FR-GRAPH-02 | SMK-M2-04 if retained | Timeline from provenance metadata, no raw JSON; or R5 cut recorded |
| FR-TRUST-01 | SMK-M3-01 | All four Trust states match the locked rules |
| FR-TRUST-02 | Claims UI test + SMK-M3-05 | Every claim shows all required fields with valid evidence links |
| FR-TRUST-03 | SMK-M3-02 + screenshot/video timestamp | Red contradiction opens both exact evidence targets |
| FR-SCORE-01 | SMK-M3-03 | Exactly three separate evidence-backed axes, no average |
| FR-SCORE-02 | Determinism test in SMK-M3-03 | Repeated stored inputs give identical thesis/axis/Founder/Trust outputs |
| FR-SCORE-03 | SMK-M3-04 | One observation stays baseline; two dated observations follow the approved rule |
| FR-CHAT-01 | SMK-M4-04 + SMK-M4-05 | Cited response streams; unanswerable query refuses; any last-resort cut disclosed |
| FR-CHAT-02 | SMK-M4-06 node case | Node ID reaches the shared chat path; answer cites or refuses |
| FR-CHAT-03 | SMK-M4-06 selection case | Selected text + node ID reach the shared chat path; answer cites or refuses |
| FR-MEMO-01 | SMK-M4-01 | Hero memo passes schema; material conclusions cite or show unavailable |
| FR-MEMO-02 | SMK-M4-02 | Each absent R6 category appears as "not disclosed" |
| FR-DECIDE-01 | SMK-M4-03 | Each decision persists after reload; distinct from generated recommendation |
| FR-DECIDE-02 | SMK-M4-08 | R2 renders from persisted timestamps per the human-approved formula |
| FR-VOICE-01 | SMK-M5B-01 through SMK-M5B-03 | Local MP3 plays/pauses; script matches Memory; missing audio shows text fallback |
| FR-DEMO-01 | Full `npm run smoke:golden` with network disabled | Exactly three demo opportunities complete the retained golden path offline |
| FR-ATTR-01 | Manual LICENSE/NOTICE/README audit + adapted-file inventory | License decision recorded; all adapted code attributed, or self-written path used |

## Layer 3: automated gate

Required future command (a specification, not evidence it exists):

```sh
npm run check:done
```

`npm run check:done` shall:

1. Run the project's test, typecheck, lint, and build commands. Exact script names TBD (owner: human).
2. Invoke `npm run smoke:golden` with outbound network disabled.
3. Validate all graph, claim, Evidence, score, memo, replay, scan, slides, and brief artifacts used by the retained demo.
4. Fail on any dangling Evidence ID, invalid schema, missing required fallback, uncited completed chat answer, or a demo set other than the planned three opportunities.
5. Confirm each retained cuttable feature passes and each formally cut feature has a passing fallback. Machine-readable cut-status format TBD (owner: human).
6. Verify required submission files via the manifest below.
7. Verify no configured secret appears in client assets, logs, replay/demo data, or submitted files.
8. Verify the repository state is pushed to the intended remote/branch (Law 1: push == done). Remote/branch + non-interactive check method TBD (owner: human).
9. Print a concise pass/fail report; exit non-zero on any failed committed gate.

### Required-file manifest

| Artifact | Requirement | Path/status |
|---|---|---|
| Product README | Pitch, setup, track framing, conditional UA attribution | `README.md` |
| Locked plan | Scope source included in submission | `VC-BRAIN-PLAN.md` |
| Requirements suite | These eight docs | `docs/product/01…08` |
| Demo script | Rehearsed flow (plan §17 DEMO_SCRIPT) | `docs/ops/DEMO-SCRIPT.md` — created at feature freeze from PITCH.md + SUBMISSION.md shot list |
| License | Repo license present | `LICENSE` (plan §6) |
| NOTICE | Present when UA code adapted | `NOTICE`, conditional |
| Hero graph + claims | Validated precomputed artifacts | `data/demo/`, `data/graphs/` — exact paths TBD (owner: human) |
| Provenance replay | Real captured LLM run | `data/replay/` — exact path TBD (owner: human) |
| Scan replay | Real captured Tavily sourcing scan | `data/replay/scan/` |
| Voice brief | Pre-rendered hero MP3 + text script | Path TBD (owner: human) |
| Demo video | ≤60 sec, MP4 H.264 | Path TBD (owner: human) |
| Tech video | ≤60 sec (stack, highlights, limitations) | Path TBD (owner: human) |

## Manual-only release and submission checks

| Check | Owner | Verify step | Source |
|---|---|---|---|
| UX/design quality | TBD (owner: human) | Review all four surfaces at demo viewport; capture Pipeline, contradiction, Graph/chat, memo/decision, voice states | Rubric §1 UX |
| Contradiction truth | TBD (owner: human) | Read both cited source facts; confirm genuine incompatibility | Plan §0.5 d6 |
| External preflight | TBD (owner: human) | Inspect real-call proof + fallback for LLM, ElevenLabs, GitHub, PDF parser | Design §5; plan §0.5 Wave 0 |
| Offline rehearsal | TBD (owner: human) | Run the retained golden path 3× with network disabled; log pass/fail | Plan §0.5 freeze |
| Voice brief content | TBD (owner: human) | Listen once; compare every spoken value with Memory/Memo | Plan §1b P0 |
| License decision | TBD (owner: human) | Read the actual UA LICENSE/NOTICE requirements; approve adapted or self-written path | Plan §0.5 d10; §1 |
| Platform URL requirement | TBD (owner: human) | Check the submission form at M0 draft; record whether a live URL is required | Plan §0.5 open items/M0 |
| Demo + tech videos | TBD (owner: human) | Play both final ≤60s H.264 MP4s end-to-end; wow moment + voice closer visible/audible; recorded at feature freeze, not the final hour | Plan §0.5 packaging; §15; rubric §1 event-wide Communication axis; §4 |
| Team video | TBD (owner: human) | Present per kickoff deck p38 | Rubric §4 |
| 1-page PDF report + zip + summary + dataset field | TBD (owner: human) | Per docs/ops/SUBMISSION.md checklist (150–300-word summary; dataset link or "N/A") | Plan §0.5 packaging; §17; rubric §4 |
| Remote state | TBD (owner: human) | Open the submitted remote repo; confirm commits/files visible (push == done) | Plan §0.5 block-boundary rule; §17; CLAUDE.md Law 1 |
| Challenge submission | TBD (owner: human) | Confirm submitted under Challenge 02 before Sun Jul 19 09:00 ET; save receipt | Plan §0; §17; §18; rubric §2/§4 |

## Open questions that block a literal done verdict

- Auth: demo-lite contract locked in the suite design §1 but absent from plan v3 — plan backfill or strike needed (owner: human).
- R2: start/end timestamps, rounding, pre-decision display — TBD (owner: human).
- Score math: Founder Score, axis, Trust Score, thesis-fit formulas, trend thresholds — TBD (owner: human).
- Apply: minimum payload (plan §2 vs §8) and upload type/size limits — TBD (owner: human).
- Performance + spend budgets have no numeric targets.
- Cut-status storage format and exact test/build/lint/typecheck script names — TBD (owner: human).
- Paths for demo script, videos, replay artifacts, MP3 are incomplete.
- Automated pushed-state verification lacks a remote/branch contract.
- LLM + ElevenLabs provider/key/quota choices unproven until preflight (incl. which ElevenLabs account's questionnaire credits are live).
- Demo-set counting: exactly three opportunities (plan §0.5 d5/§11) vs the §3 narrative's three outbound + one inbound — TBD (owner: human).

## Traceability-rule note

The suite design says "no check without an FR." Plan §17 additionally requires README, demo script, attribution, videos, remote push, and submission — packaging gates, not product FRs. This doc keeps them in the judge/automated/manual layers without inventing product FRs for packaging. Whether the design phrase applies only to the Layer-2 table: TBD (owner: human).

## Out of scope for done

- Realtime conversational voice, voice intake, outbound voice notes, live stage-time sourcing, actual outreach sending, validator agent, sourcing-channel graph.
- Portfolio monitoring, fund ops, personal workspace, idea-to-scaffold, browser extension, local-LLM mode.
- A mandatory live Apply path — seeded inbound remains the never-cut fallback.
- Guided graph tour (pending human ruling).
