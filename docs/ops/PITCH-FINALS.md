# PITCH-FINALS.md — the 2:30 finals pitch (7-min slot: pitch + 4–5 min Q&A)

**Format:** finals slot ≤7 min → speak **2:30** (cap 3:00 — write to 30s under; judges reward the unhurried close), leave **4–5 min Q&A**. Stage rule (kickoff deck p9): **1–2 slides + demo** — the deck is 2 pitch slides + 4 hidden Q&A backups, never shown unless asked.

**Deck:** `docs/ops/finals-deck.pptx` (speaker notes embedded — present from Presenter View) · `finals-deck.pdf` backup · `finals-deck.md` source. Solo — no hand-offs.

**Screen plan:** Slide 1 → app (demo) → Slide 2 → hold through Q&A; flip to a backup slide only when a question calls for it.

---

## The script (timed · delivery marks inline)

### SLIDE 1 · 0:00–0:40 · Hook + face — *breathe, slow start*

> A VC spends **one hundred and eighteen hours** of due diligence on a single deal — and takes 83 days to close it. That's Harvard Business Review. **[pause]**
> And a technical founder with no warm intro? Never even gets looked at.
> I'm that founder. The repo you're about to see is my actual code.
> FounderGraph is what an investor sees in minutes instead of weeks. Let me show you.

**→ CUE: switch to the app.** Pipeline board, hero card visible, cursor still.

### APP · 0:40–1:50 · Live demo — *fast through setup, slow on the payoff*

| Clock | Do | Say |
|---|---|---|
| 0:40–0:55 | Click hero card → Diligence | "This is the deal pipeline — and this card is me. One click into diligence: three axes, a Founder Score that persists across sightings, and a claim-by-claim trust read." |
| 0:55–1:10 | Point at timer chip, scroll claims | "The header chip is first-signal-to-decision, computed from real timestamps. Every claim from my deck carries a Trust Score — verified, unsupported, or contradicted." |
| 1:10–1:30 | **THE WOW** — click the red CONTRADICTED claim | "This claim is red — contradicted. One click… **[pause — let the jump land]** …and it takes me to the exact deck slide and the exact repo evidence that disagree. **[pause]** That's the whole product in ten seconds." |
| 1:30–1:50 | Graph → one chat question → back to memo + decision | "The repo is a living knowledge graph. I ask a question — the answer streams back with citations: it cites or it refuses. Everything rolls into a 24-hour memo, and the human records the call: Invest, Pass, or More info." |

**Fallback rule:** if the app stalls, switch to the recorded video and keep talking. Do not apologize.

**→ CUE: switch to Slide 2.**

### SLIDE 2 · 1:50–2:30 · How it works + close

> Under the hood: one Next.js app. Two schema-validated LLM calls — a claim extractor and a memo writer.
> Every score comes from a deterministic TypeScript rubric, so **no model invents a number**.
> Tavily sources the founders — one real scan, captured and replayed. ElevenLabs voices the brief.
> **[slow]** That's the VC Brain that deploys $100K checks in 24 hours: sourcing, graph, three scores, memo — human decision on top.
> **[emphasis]** 118 hours of diligence, down to one evidence-backed day. Thank you.

…and **stop talking**. Hold Slide 2.

---

## Q&A bank (4–5 min — answer in one breath, then redirect to a strength)

Flip to the matching backup slide only if it helps: **Q&A** = contradiction screenshot · **B1** = rubric code · **B2** = provenance/gates · **B3** = honest limits.

1. **"How are these scores derived / how is your AI trained?"** *(→ B1)*
   Scores come from a deterministic TypeScript rubric — no model invents a number. Exactly two schema-validated LLM calls exist: a claim extractor and an axes/memo writer, and every claim they touch is provenance-linked to its slide or graph node — any score walks back to evidence on screen.
2. **"Is the demo real, or seeded?"** *(→ B2)*
   Both, honestly. We ran one REAL Tavily scan, captured it, and the stage demo replays that capture deterministically — no live network call on stage by design, so venue Wi-Fi can't kill it. Every replay is labeled a replay; everything else runs live.
3. **"How does the integration actually work under the hood?"**
   Tavily `/search` + `/research` for sourcing; two Anthropic API calls, zod-validated; better-sqlite3 for the persistent Memory; ElevenLabs for the voiced brief with a shipped text fallback. Named calls, all in the repo.
4. **"How is this different from PitchBook / Affinity / a GPT wrapper?"**
   Those index metadata and take notes. We read the founder's **code** and test the deck's claims against it — the contradiction jump is the difference: no blended score, a walkable evidence trail.
5. **"How did you validate the problem?"**
   I'm the real anchor — a technical founder without warm intros, and the numbers are HBR's: 118 hours, 83 days, ~1 funded per 101 reviewed.
6. **"What about [adjacent scope — e.g. financial diligence, references]?"**
   Real gap — it's on the roadmap; today we own the technical-evidence axis, which is the part VCs can't read themselves.
7. **"What was actually hard / built vs glued?"**
   Epistemic honesty was the build: chat that cites or refuses, per-claim trust states, deterministic scoring, provenance on every artifact. The glue (Tavily, ElevenLabs) is deliberately visible.
8. **"Does it scale? What breaks at 100×?"**
   The pipeline is per-founder and embarrassingly parallel; SQLite becomes Postgres, replay captures become a queue. The rubric stays O(1) per deal — the expensive part is two LLM calls per founder, and they're capped and schema-validated.
9. **"Business model?"**
   Per-seat for the fund plus per-diligence credits — diligence is already a paid workflow at ~$100K-check scale; we price against the 118 hours we remove.
10. **"One more week?"**
    Live ElevenLabs rendering, a second real Tavily scan wave, and reference-call ingestion into the same trust model.
11. **"Cold start — a founder with no track record?"**
    Our research bet is public-footprint prediction: repos, launches, and papers predict quality before any track record exists — that's exactly the founder we surface.

**Q&A conduct:** honest gap + roadmap beats a bluff (this was scored, on record). Never leave a number unexplained. One breath per answer, stop.

---

## One-card cheat sheet (hold this)

- **Hook:** 118 hours per deal · 83 days to close — HBR. Cold-intro founders invisible.
- **Wow:** click the red claim → exact slide + exact repo lines that disagree.
- **Metric:** 118 hours → one evidence-backed day. Say it twice.
- **Close:** "The VC Brain that deploys $100K checks in 24 hours." Then stop talking.
- **Top 3 answers:** scores = deterministic rubric, no model invents a number · demo = real capture, honest replay, labeled · different = we read the code, not the metadata.
- **If demo dies:** play the video. Do not apologize.

## Rehearsal gate

- [ ] Twice out loud, timed, FROM PRESENTER VIEW — must land ≤2:30.
- [ ] Contradiction jump lands in <10s; rehearsed cursor path.
- [ ] Deck + recorded video on local storage, not cloud.
- [ ] Every spoken number matches the pushed repo.
