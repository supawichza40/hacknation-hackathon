# Team discussion — 2026-07-18 (evening, venue)

Distilled from a recorded team conversation. Raw transcript was noisy (cross-talk, credit-redemption chatter); this keeps only the product substance. **Note the scope tension at the bottom before acting on anything here.**

## Product concept discussed: "Understand any repo"

A tool for people who build with AI ("vibe coders" on Lovable-style tools) and cannot explain what their own codebase does — what language, which APIs, which services. The tool ingests any repo and makes it explainable.

### Core features agreed in discussion

1. **Guided overview** — high-level summary of each section of the codebase; a pathway that walks you to the application's entry point. Click a section, it tells you what it's about.
2. **Grounded Q&A chat** — on-demand questions against the whole repo ("what is this Python project about, in simple terms?", "why do we have these dependencies?"). The chat holds a reference to every file.
3. **Per-file contextual chat** — click a file (example used: `calibration.py`), chat about it directly instead of context-switching. Explains what the file does, where it leads, what dependencies it pulls in.
4. **Structure walkthrough, step by step** — entry surface first ("what does this server do, where do I start"), then contracts/interfaces per tool ("where does the data come from"), then the specifics (detector, algorithm, the math).
5. **Alternate views** — by file type and by class type (classes view shows every function).
6. **Voice mode (ElevenLabs)** — a button spawns a voice agent for real-time interaction, so you don't have to read and parse the guide yourself. Sequenced **after** the chatbot: once chat context exists, voice integration is easy.

### User journey (settled after debate)

- **Landing:** a page that asks you to import a repo — upload or paste a link. Nothing else greets the user first.
- **Scope decision:** works with **any** codebase, not just your own. This was called out as a key distinction to state clearly.
- **Optional discovery:** an agent that suggests/searches repos based on your idea ("Google, but for repos").
- **Parked:** Chrome extension — on a GitHub repo page, press the extension, split-screen explanation. Liked, but deferred; the web page is the entry point for the demo.

### Guardrails raised

- The agent must answer from repo context only — it needs to know "this is what the file is doing, this is where it leads" rather than free-suggesting.
- Follow-up question suggestions need constraints too. Refinement is a step-2 concern, but noted now.

### Privacy / LLM strategy

- Demo runs on a hosted LLM (whatever provider we hold credits for).
- Pitch line: private repos can run against a **local LLM** so code never leaves the machine; users who accept hosted services just pass through to our LLM. Local mode is roadmap, not demo.

### Next steps / ambition layer (for the pitch, not the day-1 build)

- **Personal workspace:** each user uploads multiple repos; per-repo agent context; a proper work area.
- **Idea-to-scaffold:** describe an idea → agent surveys existing repos/world ("these people are doing something similar") → scaffolds a new repo using other repos as parts.
- Explainability and scaffolding are **two distinct features** and must be visually distinct in the product.
- Works for any file type eventually, not only GitHub repos.
- **Headline metric for the pitch:** understanding a repo drops from ~2 weeks to ~5 hours.

### Feasibility call

Team judged the day-1 scope buildable: (1) chatbot with full-file reference integrated into the existing overview/tour UI, (2) per-file chat, then (3) ElevenLabs voice on top.

## Sponsor credits (logistics from same session)

- **ElevenLabs:** redeemed via the Hack-Nation dashboard questionnaire — no real verification, credit granted on submission. Promo code worked for some accounts, "invalid promo code" for others (possibly one-redemption-per-code or already-used accounts). Action: whoever succeeded shares the questionnaire answers so the rest can request the same.
- **Lovable:** extra credits redeemed (~£17–25 seen).
- **OpenAI:** mixed — one member still has credit from last time; new redemption attempts mostly failed ("invalid").
- Reminder raised in the room: cancel any subscription attached to a card after the event.

## ⚠️ Scope tension — resolve before building

The locked board (`TODO.md`) says **Challenge 02 — The VC Brain**, with Understand-Anything as *reference only* and ElevenLabs as a voice-brief layer. This discussion instead scopes a full **repo-understanding product** (the Understand-Anything direction) with ElevenLabs voice on top, and the track debate in the room was unresolved ("AI recommends VC Brain" vs. "I prefer the AI-gen one"). Per the Three Laws, scope is frozen at spec lock — if the team now wants the repo-understanding product as the submission, that is an explicit human override to record in `TODO.md`; otherwise this doc's build items go to `docs/ops/BACKLOG.md`.
