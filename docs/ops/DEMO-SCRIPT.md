# DEMO-SCRIPT.md — The 3-Minute Demo Walk

**Recorded at feature freeze (T-12h), not the final hour.** Re-record later only if it improves. This is the rehearsed camera path for the golden path: Pipeline → Diligence → the contradiction jump (wow) → Graph + cited chat → decision + memo → voice-brief closer. Source: `docs/product/05-screen-map.md` §6 wireflow, `docs/ops/PITCH.md` script, `VC-BRAIN-PLAN.md` §15.

**Before you hit record:**
- `npm run seed` then `npm run dev`; log in with the demo-lite investor credentials shown on the login screen.
- Start on the Pipeline (`/`) with the seeded inbound hero card visible.
- One speaker, one browser tab, no live network call — the Tavily and scan runs are captured replays by design, so venue Wi-Fi can't kill the demo.
- **Fallback rule:** if the live app stalls, switch to the recorded video and keep talking. Do not apologize — a past winner did exactly this.

---

## The walk

| Clock | Beat | On screen | Say (one line) | Do |
|---|---|---|---|---|
| **0:00–0:20** | **Hook — the problem** | Pipeline board, hero card in view | "A great technical founder with no warm intro is invisible to a VC, and the diligence that would surface them takes weeks. `[ONE sourced stat — drop in from docs/research before recording; do not invent a number]`." | Let the board sit. Do not click yet. |
| **0:20–0:45** | **The face — real anchor** | Same board; cursor rests on the hero card | "I'm that founder. This is my actual repo. Here's what an investor sees in minutes instead of weeks." | Point at the hero card's Founder Score, source, and thesis-fit chips. |
| **0:45–1:05** | **Pipeline → Diligence** | Click hero card → `/opportunities/[id]` | "One click into diligence: three axes, a Founder Score that persists across sightings, and a claim-by-claim trust read." | Click the hero card. Land on the Diligence surface. |
| **1:05–1:30** | **Read the evidence** | Diligence header + claims list | "Point at the header chip — first signal to decision, computed from real timestamps, not a slogan. Every claim carries a Trust Score and a source." | Point at the timer chip. Scroll to the claims list. |
| **1:30–1:50** | **THE WOW — contradiction jump** | Red **CONTRADICTED** claim → jumps to exact deck slide + graph node | "This claim is contradicted by the founder's own evidence — one click and it takes me to the exact slide and the exact node that disagree." | Click the red CONTRADICTED claim. Let the jump land and hold for a beat. *(Wow lands by 1:45.)* |
| **1:50–2:15** | **Graph + cited chat** | `/opportunities/[id]/graph` | "The whole repo as a living technical graph. I click a node, I ask a question, and the answer streams back with its citations — grounded, not guessed." | Open the graph. Click a node. Type one question in the chat; let the cited answer stream. |
| **2:15–2:30** | **Decision + memo** | Back to Diligence; decision + memo visible | "The three axes and every cited claim roll up into a 24-hour investment memo and a decision I can defend." | Return to Diligence. Show the decision and the memo sections. |
| **2:30–2:40** | **Voice-brief closer** | Click **▶ Play investment brief** | "And the investor brief, read out — voiced by ElevenLabs, with an honest text fallback when the audio isn't wired." | Click Play investment brief. If audio isn't live, the script panel is the honest fallback — read one line from it. |
| **2:40–3:00** | **Close — track sentence** | Diligence memo on screen | "That's the VC Brain that deploys $100K checks in 24 hours: sources founders, builds the graph, scores on three axes, writes the memo. Then stop talking." | Stop clicking. Hold the memo. Stop talking. |

---

## The one breath (if a judge asks "how does it work") — 2:15 slot or Q&A

Say it in one breath: two schema-validated LLM calls run the scored diligence — a claim extractor and an axes/memo writer — through the local `claude` CLI. The scores come from a deterministic TypeScript rubric, so no model invents a number, and every claim is provenance-linked to its exact deck slide or graph node. The sponsor tools are visible: **Tavily** sources founders (one real scan, captured and replayed), and **ElevenLabs** voices the investor brief.

## The research sentence (close or Q&A, one sentence)

"Our bet is public-footprint prediction — a founder's repos, launches, and papers predict quality before any track record exists, which is exactly how we handle the cold-start case."

## Rehearsal checklist

- Rehearse out loud, timed, twice — once at feature freeze, once before pitching.
- Confirm every number spoken matches the pushed repo.
- Confirm the contradiction jump lands in under 10 seconds on the recording.
- Keep the recorded video and the deck on local storage, not the cloud.
