# SUBMISSION-COPY.md — paste-ready fields for projects.hack-nation.ai

Deadline: **Sun Jul 19, 09:00 ET (14:00 BST)** — draft NOW, edit until the buzzer.
Memorable metric token (use verbatim everywhere): **118 hours**.

## Tagline (one line)

FounderGraph — the VC Brain that turns 118 hours of diligence into a 24-hour, evidence-backed check.

## Project summary (150–300 words — paste as-is, ~205 words)

FounderGraph is a VC Brain that turns three weeks of founder diligence into a 24-hour, evidence-backed decision. VCs spend 118 hours of due diligence per deal and take 83 days to close (HBR, "How Venture Capitalists Make Decisions"), and a technical founder with no warm intro is usually invisible. FounderGraph sources founders with a Tavily web scan (one real run, captured and replayed so the demo can't die on venue Wi-Fi), ingests the founder's repo and deck, and builds a living technical knowledge graph. Two schema-validated LLM calls extract per-claim evidence and write the investment memo; every score comes from a deterministic TypeScript rubric, so no model invents a number. Each deck claim carries a Trust Score — verified, unsupported, or contradicted — and the wow moment is one click: a contradicted claim jumps to the exact deck slide and the exact repo evidence that disagree. Three separate axes (Founder, Market, Idea-vs-Market), a persistent Memory so a returning founder is never a cold start, graph-grounded chat that cites or refuses, and a human Invest / Pass / More-info decision recorded on top: human-in-the-loop as a feature, not an apology. The anchor is real — the hero founder being diligenced is the builder, and the repo is his actual code. Built with Next.js 16, SQLite, Tavily, and an ElevenLabs voice-brief layer; 62 automated tests and a fully offline replay path keep it stage-safe.

## 30-second elevator blurb (spoken)

A VC spends 118 hours of diligence per deal, and founders without warm intros never even get looked at. FounderGraph reads a founder's repo and deck, builds a knowledge graph, and scores every deck claim against real evidence — verified, unsupported, or contradicted. Click the contradicted claim and it shows you the exact slide and the exact line of code that disagree. Three evidence-backed scores, a 24-hour memo, and the human makes the final call. I'm the demo founder — it diligenced my own repo.

## 1-page report (PDF sections — HN-4 template order)

**Problem.** Venture diligence is slow and network-gated: 118 hours of due diligence and 83 days to close per deal on average, and roughly one funded company per 101 reviewed (HBR). Technical founders without warm introductions are invisible, because the evidence that would surface them — their code — is the hardest artifact for a VC to read.

**Audience.** Pre-seed/seed VCs writing $25K–$100K checks (the Challenge 02 brief's "$100K checks in 24 hours"), and the cold-start technical founders they currently miss.

**Solution.** FounderGraph ingests a founder's repo and deck, builds a technical knowledge graph, extracts the deck's claims, and tests each claim against repo evidence. Every claim gets a Trust Score (verified / unsupported / contradicted); three separate axes (Founder, Market, Idea-vs-Market) plus a persistent Founder Score roll into a cited 24-hour investment memo with explicit "not disclosed" gaps. The investor records Invest / Pass / More info — the decision stays human and is stored distinct from the generated recommendation.

**USP.** Evidence you can walk back to. The signature moment: a red CONTRADICTED claim opens the exact deck slide next to the exact repo lines that disagree. No blended scores, no invented numbers (deterministic rubric, not model output), honest gaps instead of hallucinated facts, and Memory that makes a returning founder's score history persistent.

**Implementation.** Single Next.js 16 app (App Router, React 19, TypeScript), better-sqlite3 Memory, @xyflow/react graph, zod-validated pipeline. Two schema-validated LLM calls (claim extractor; axes/memo writer) run through the local claude CLI. Tavily powers founder sourcing (real captured scan, deterministic replay); ElevenLabs voices the investor brief (text fallback shipped). Demo-lite auth gates investor surfaces; the founder /apply route is public. 62 automated tests, offline golden-path smoke (13 beats), typecheck and build green.

**Results.** End-to-end golden path verified in the browser: pipeline → diligence → contradiction jump → graph + cited chat → memo → recorded decision, fully offline. 12 real claims extracted from the hero deck with exactly one genuine contradiction, grounded in the builder's actual repository (42-node graph). Demo data is synthetic but shaped from the real anchor case; all replays carry provenance labels.

## Platform checklist (fill in this order)

- [ ] **Make repo PUBLIC first**: `gh repo edit supawichza40/hacknation-hackathon --visibility public` — then open the link logged-out to confirm
- [ ] Create draft submission under **Challenge 02 — The VC Brain** with title + tagline + repo link, SAVE (draft early!)
- [ ] Project summary: paste from above (150–300 words ✓)
- [ ] Demo video ≤60s: upload MP4 H.264
- [ ] Tech video ≤60s: upload
- [ ] Team video: upload
- [ ] GitHub repository: https://github.com/supawichza40/hacknation-hackathon (public, README renders)
- [ ] Zipped code: `~/Desktop/foundergraph-submission.zip` (tracked files only, no heavy data)
- [ ] 1-page PDF report: from sections above
- [ ] Dataset: **"N/A"**
- [ ] All team members added on the submission (only listed members get prizes)
- [ ] Confirm the SUBMITTED state on screen; save a receipt/screenshot

## Video hook stats (pick ONE, say the source)

1. "VCs spend **118 hours** of due diligence per deal and take 83 days to close." — HBR, How Venture Capitalists Make Decisions (Gompers, Gornall, Kaplan, Strebulaev)
2. "For every **101 startups** a VC reviews, roughly one gets funded." — same HBR study
3. "Only ~10% of VC deal flow comes from founders' cold emails; the network sees the rest first." — same HBR study
