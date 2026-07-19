# SUBMISSION.md — Checklist with Time Gates

The submission is a deliverable with its own schedule, not a last-hour chore. Last event this was left to the final hour: the video was rushed, the strongest narrative and all screenshots never reached the pushed repo, and organizers on record struggled to even FIND some teams' submissions. Free points were dropped. Never again.

## Time gates

> **THIS EVENT (2026-07-18/19, ~21h — the T+ times below are the generic 48h template, NOT live gates):**
> G1 → M0, ≈16:00 ET Jul 18 (portal draft exists) · G2 (README + screenshots) → 05:30 ET Jul 19 · G3 (demo video) → 05:30 ET Jul 19 (recorded in the 04:00–05:30 ET block) · G4 (code freeze) → 03:00 ET Jul 19 · G5 (SUBMIT) → 06:30 ET Jul 19. Hard deadline 09:00 ET Jul 19. Source: VC-BRAIN-PLAN §0.5 build order.

| Gate | Deadline | Action |
|---|---|---|
| G1 | **Day 1 (T+6)** | Submission draft exists in the real portal (placeholder text is fine) + this file filled with the requirements list from `docs/ops/RUBRIC.md` §4 |
| G2 | **T+30** | README tells the current true story; screenshots of the working golden path committed and pushed |
| G3 | **T+36** | BOTH ≤60-sec videos (demo + tech) + team video recorded, uploaded, linked from README and the portal draft; 1-page PDF report drafted |
| G4 | **T+42** | Code freeze. Submission copy finalized. Push after EVERY edit from here on |
| G5 | **T+46 (= 2h early)** | Final submission SUBMITTED. Never race the cutoff |

## The package (REAL list, this edition — kickoff deck p38 + discord-info.md submission checklist; details in RUBRIC.md §4)

All items upload to **projects.hack-nation.ai**; the submission is **editable any time until the deadline** (Sun Jul 19 09:00 ET, no late submissions — deck p37) — so draft early, refine continuously.

- [ ] **Project summary** — 150–300 words: problem + relevance, what was built during the hackathon, who benefits, what works today. Name the sponsor tools explicitly — **Tavily** (live founder sourcing) and **ElevenLabs** (voiced investment brief). First thing the jury sees — clarity over depth (discord-info.md)
- [ ] **Best Use of Tavily** (stackable sponsor prize, 10k/5k/3k credits): summary + demo must show Tavily as load-bearing sourcing — real `/search` + `/research` scan, captured + replayed. Redeem code `HackNationJuly`. (RUBRIC §2 sponsor prizes)
- [ ] **Demo video — ≤60 sec** (~5–10s problem, ~45–50s real screen recording, optional impact close) — test link in incognito
- [ ] **Tech video — ≤60 sec** (stack 10–15s, implementation highlights 15–20s, challenges/limitations 15–20s; "CTO giving a 1-minute investor update")
- [ ] **Team video** — "explain who you are" (kickoff deck p38; not in the discord list — include it)
- [ ] **1-page PDF report** — sections per HN-4 template: Problem, Target Audience, Solution & Core Features, USP, Implementation & Technology, Results & Impact (screenshot/diagram doesn't count toward the page limit)
- [ ] **GitHub repo link (public)** — pushed HEAD must match every claim made in the portal
- [ ] **Zipped code (.zip)** — full codebase backup incl. README + setup; NO large data files or model weights
- [ ] **Dataset field** — link (Drive/HF, organized raw/ + processed/) or "N/A"
- [ ] Live/deployed URL if the portal has a field (exercise end-to-end from a fresh browser first)
- [ ] **Finals prep (after submitting):** 1–3 slides + live demo for the Jul 25 pitch (deck p9 says 1–2 slides — prep ≤2)

> Every link set to "publicly accessible by everyone." **"No access? No prize."** (HN-4 Rules template.)

## Final verification ritual (do ALL, in order, before G5)

1. `git status` → clean. `git log origin/main..HEAD` → empty (nothing unpushed).
2. Open the pushed repo in an incognito browser — is the README the story you want a judge to read? Do the screenshots render?
3. Click every link in the portal draft from incognito: video plays, deck opens, live URL loads, repo is accessible.
4. Read the portal text once out loud. Numbers in it must match the pushed repo (test counts, features — no aspirational claims).
5. Submit. Screenshot the confirmation.

## The demo shot list (how the video gets made — lane D produces it at G2/T+30)

The video is produced from a **shot list**: one card per shot, each carrying the real screenshot of the target state, the on-screen ACTION, and the exact SAY line. Record per shot (any flub redoes one shot, never the take), dub voice separately, assemble with straight cuts. Claude generates the document with embedded verified screenshots; the human performs it.

**Length rule (THIS EVENT — hard cap):** the demo video is **max 60 seconds** and the tech video is **max 60 seconds** (kickoff deck p38; discord-info.md checklist). Suggested demo split: 5–10s problem intro → 45–50s real screen recording → optional impact close. 60 seconds cannot cover every feature — cover the golden path + the wow moment; everything else lives in the repo/report. (The 3-minute limit applies to the STAGE pitch, a separate artifact — see docs/ops/PITCH.md.)

**The three-act structure:**
1. **ACT 1 — The problem (slide shots):** 2–4 deck slides as full-frame shots — the real-world pain, the impact numbers (sourced stats), the REAL anchor (your business/person/event). No app on screen yet; make them feel the wound.
2. **ACT 2 — The turn (bridge shot):** one beat introducing the app as the answer — hero screen or one slide: "this is how we fix it."
3. **ACT 3 — The features, in journey order:** walk EVERY built feature as chapters of the user's story — the order the persona would actually encounter them (per spec 01 §4), not a feature-list order. Each chapter: app shots + its external-proof shot where a write lands. Close on the outcome state (the restored numbers), not on a feature.

**Continuity rule — write the narration FIRST, slice second.** The transcript is written as ONE continuous script (a story with a beginning: the pain → middle: the golden path → end: the outcome), read aloud once to check it flows, THEN sliced into shot windows sized at ~150 wpm. Never write per-shot lines independently — that produces six disconnected captions instead of a narration.

**Shot types (mix them — this is what separates a demo from a screen recording):**
- **App shots** — the golden path in your product (the core).
- **External-proof shots** — the sponsor platform's REAL UI showing your writes landed: the created invoice with its ID, the transaction list, the account balance. *(The recorded judges' most-asked question was "how does the [platform] part actually work?" — a cutaway to the real Xero screen answers it before it's asked. This is the highest-value 3 seconds in the video.)*
- **Insert shots** — one slide/diagram frame if a concept needs it (architecture, the invariant math). Max one or two.
- **Anchor shot** — the real persona/business context if you have it (a photo, the actual marketplace statement).

**Per-shot card format:** `SHOT n · timecode · duration` + SCREEN (state that must be visible before rolling) + ACTION (what the hand does) + SAY (validated line) + the reference screenshot.

**Validation before recording:** every SAY line is timed at ~150 wpm against its window (TTS proxy or stopwatch); every SCREEN state is captured as a reference screenshot first. A shot list with untimed lines or imagined screens is a draft, not a shot list.

## Anti-patterns (all observed)

- "I'll polish the docs after the code freeze and push once at the end" → the push never happened.
- Recording the demo video in the last hour → rushed, unfinished frontend on camera.
- Numbers in the submission that the pushed repo can't back up (claimed test count ≠ committed test count).
- A zip/artifact of the repo uploaded instead of the repo link staying current.
