# VIDEO-SHOTLIST.md — the ≤60s demo video, shot by shot

How to use (per SUBMISSION.md shot-list rules): **record one shot at a time** — a flub redoes
that shot, never the take. Screen-record at the browser, narrate afterward over the cut (or
speak live if one shot flows). Straight cuts, no transitions. App: http://localhost:3941,
logged in, freshly seeded (`npm run seed` if in doubt — PipeWarden must be hidden at start).

Total narration: ~140 words ≈ 58s at 150 wpm. Practice the whole script aloud ONCE before
recording — it is written as one continuous story.

## The continuous narration (read this aloud first)

> VCs spend **118 hours** of due diligence per deal — and founders without warm intros never
> get looked at. This is FounderGraph. Every card is a founder, scored from evidence, filtered
> by my investment thesis. This one is me — my actual repo. One click: three separate scores —
> founder, market, idea versus market — and every deck claim tested against the code. Verified.
> Unsupported. And this one: contradicted. One more click — the deck says sub-100ms routing;
> the repo says otherwise. Exact slide, exact line. The whole repo is a living knowledge graph.
> I ask a question; the answer streams back with citations. Sourcing runs on Tavily — a real
> captured scan — and when a candidate crosses the threshold, they appear on the board. Three
> axes, a cited 24-hour memo, my decision on top. FounderGraph: $100K checks in 24 hours.

## The shots

| # | Clock | On screen (target state) | ACTION | SAY |
|---|---|---|---|---|
| 1 | 0:00–0:08 | Pipeline board, all cards visible (`docs/screenshots/pipeline.png`) | None — let the board sit | "VCs spend **118 hours** of due diligence per deal — and founders without warm intros never get looked at." |
| 2 | 0:08–0:16 | Same board; cursor circles the ECC card | Hover the ECC card (Founder Score 82, thesis chips) | "This is FounderGraph. Every card is a founder, scored from evidence, filtered by my investment thesis. This one is me — my actual repo." |
| 3 | 0:16–0:26 | Diligence page top (`docs/screenshots/diligence.png`) | **Click the ECC card.** Scroll slowly from the three axes into the claims list | "One click: three separate scores — founder, market, idea versus market — and every deck claim tested against the code. Verified. Unsupported. And this one: contradicted." |
| 4 | 0:26–0:36 | Contradiction split view (`docs/screenshots/wow-contradiction.png`) | **Click the red CONTRADICTED claim.** Hold the modal still for 3 beats | "One more click — the deck says sub-100ms routing; the repo says otherwise. Exact slide, exact line." |
| 5 | 0:36–0:45 | Graph explorer with chat dock open (`docs/screenshots/graph.png`) | Close modal → click "Open graph explorer" → click "Ask about this opportunity" → submit the pre-typed question ("What does the routing layer actually do?") — let the cited answer stream | "The whole repo is a living knowledge graph. I ask a question; the answer streams back with citations." |
| 6 | 0:45–0:53 | Pipeline; scan ladder runs; PipeWarden card pops with "threshold crossed" | Back to Pipeline → click **Tavily** + **Scan** (ladder shows the sourcing beat) → click **GitHub** + **Scan** (PipeWarden pops) | "Sourcing runs on Tavily — a real captured scan — and when a candidate crosses the threshold, they appear on the board." |
| 7 | 0:53–0:60 | Diligence memo + decision section | Back to ECC diligence; scroll to memo + decision. Freeze frame | "Three axes, a cited 24-hour memo, my decision on top. FounderGraph: $100K checks in 24 hours." |

## Gotchas

- **Shot 6 order matters:** Tavily scan = sourcing ladder only; the GitHub scan is what pops
  PipeWarden. Click Tavily-Scan first while saying the Tavily line, then GitHub-Scan for the pop.
- Shot 5: type the chat question BEFORE recording the shot; on record, just hit Ask.
- If any shot state is dirty (PipeWarden already visible, decision saved), re-run `npm run seed`
  and reload — takes 5 seconds.
- Voice brief is NOT in the 60s cut (text fallback is honest but weaker on video) — it lives in
  the tech video and the stage pitch instead.

## Tech video (≤60s) — single talking-head or voiceover over the repo/README, three beats

1. 0:00–0:15 stack: "Single Next.js 16 app, TypeScript, SQLite Memory. Two schema-validated
   LLM calls through the local claude CLI — a claim extractor and a memo writer. Every score is
   a deterministic TypeScript rubric, so no model invents a number."
2. 0:15–0:35 highlights: "The hard part was epistemic honesty: cite-or-refuse chat, per-claim
   trust states, one genuinely contradicted claim grounded in my real repo, and a replay layer
   so one real Tavily scan and one real LLM run replay deterministically — the demo can't die
   on venue Wi-Fi. 62 automated tests, offline golden-path smoke."
3. 0:35–0:55 limitations: "Auth is a demo gate, not production auth. The voice brief ships as
   a text-script fallback — ElevenLabs rendering is the planned layer. Scans are labeled
   replays by design. Everything else you saw runs live on seeded data."
