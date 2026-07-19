# Hosting FounderGraph

## The one thing that decides everything

FounderGraph is a **stateful, long-running Node server**, not a serverless app:

- **`better-sqlite3`** — a native C++ addon + a file-based SQLite database it reads and writes.
- **Runtime file reads** — demo graphs/claims/memo/replay JSON are read from the local filesystem at request time.
- **Writes** — `/api/scan`, `/api/decide`, `/api/apply` mutate the SQLite file.

So **do not deploy to Vercel / Netlify / Cloudflare serverless.** Their filesystems are ephemeral and read-only per invocation, which breaks the native binary, the file reads, and every write. Host it as a **container or a persistent Node process** instead.

**No key is needed for the demo (replay); set `ANTHROPIC_API_KEY` for real inference.** The demo runs entirely from precomputed data + captured replays: memo/graph/claims are prebuilt files, scan/query are deterministic/replay, and chat falls back to the captured Q&A in `data/replay/chat/`. Set `ANTHROPIC_API_KEY` on the host and the LLM paths (memo, graph ingest, the free-form query, and graph chat) run live inference through the Anthropic API instead; leave it unset and the deployed app serves those captured replays. See "Live LLM (production)" below.

## Recommended: Railway or Render (no Docker, ~10 min)

Both build straight from the GitHub repo and run a persistent process.

1. Push the branch (or merge to `main` first — judges browse `main`).
2. New project → deploy from the GitHub repo, branch `dispatch/lovable-frontend` (or `main`).
3. It auto-detects Node and honors `.nvmrc` (26.3.1). `.npmrc` makes `better-sqlite3` compile from source, so the ABI matches the build's Node — no prebuilt mismatch.
4. **Build command:** `npm ci && npm run build`
5. **Start command:** `npm run seed && npm start` — the DB is gitignored and generated, so it must be seeded on boot.
6. **Environment variables** (Settings → Variables):
   - `DEMO_INVESTOR_EMAIL` = `investor@foundergraph.demo`
   - `DEMO_INVESTOR_PASSWORD` = `demo`
   - `TAVILY_API_KEY` = *(optional — only if you want a live Tavily call; the demo uses the captured replay, so it can be omitted)*
   - `ANTHROPIC_API_KEY` = *(optional — set it to run real LLM inference; unset, the LLM paths serve the captured replays, see below)*
   - `PORT` is provided by the platform; `next start` already respects it.
7. Open the generated URL, log in with the demo credentials, walk the golden path.

That's it. No database add-on, no Docker; the Anthropic key is optional.

## Deploy to Render — step by step

The repo ships a `render.yaml` Blueprint at its root, so Render can stand up the whole web service in one flow. Point Render at **`main`** — that is the branch judges browse, and `dispatch/lovable-frontend` merges into it before submission.

**Option A — Blueprint (one click, recommended).**

1. Merge your work to `main` and push. Render deploys from the GitHub remote, not your laptop.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** → **Blueprint**.
3. Connect this GitHub repo and choose branch **`main`**. Render auto-detects `render.yaml` and shows the `foundergraph` web service.
4. Render prompts for the four `sync: false` variables — fill them in:
   - `DEMO_INVESTOR_EMAIL` = `investor@foundergraph.demo`
   - `DEMO_INVESTOR_PASSWORD` = `demo`
   - `ANTHROPIC_API_KEY` = *(optional — leave blank to serve replays)*
   - `TAVILY_API_KEY` = *(optional — leave blank to use the captured replay)*
5. **Apply**. Render runs `npm ci && npm run build`, then `npm run seed && npm start`, and waits for `/login` to return 200 before going live.
6. Open the generated `…onrender.com` URL, log in with the demo credentials, and walk the golden path.

**Option B — Web Service (manual, no Blueprint).** Same result without `render.yaml`: **New +** → **Web Service** → connect the repo, branch **`main`**, runtime **Node**. Set **Build Command** `npm ci && npm run build`, **Start Command** `npm run seed && npm start`, and **Health Check Path** `/login`. Add the same environment variables (Settings → Environment) and create the service.

**Notes.**

- The Blueprint pins `plan: starter` (a paid instance with no idle spin-down) so a live demo never cold-starts mid-pitch. To run at zero cost, change it to `plan: free`: the free instance spins down after 15 minutes idle and takes about a minute (~50s) to cold-start on the next request.
- `npm run seed` runs on **every** boot, so each deploy or restart resets the demo data to a clean, known-good state. That is intended — no volume needed.
- **No Anthropic key is required.** With `ANTHROPIC_API_KEY` unset, the LLM paths (memo, graph ingest, founder query, chat) serve the captured replays under `data/replay/`; set the key to run live inference instead.
- Render reads the Node version from `.nvmrc` (26.3.1); the Blueprint also sets `NODE_VERSION=26.3.1` explicitly, so `better-sqlite3` always compiles against Node 26.

## Live LLM (production)

The memo writer, graph ingest, the free-form founder query, and graph chat call the Anthropic API through one shared client (`src/lib/llm.ts`, model `claude-opus-4-8`). Set `ANTHROPIC_API_KEY` on the host to run real inference. Leave it unset and those paths throw an internal `NoLlmError` that each caller catches and answers from the captured replays under `data/replay/` — the same demo mode the app has always shipped, now with no `claude` CLI dependency. So the deployed app is safe either way: a key gives live answers, no key gives the rehearsed replay.

## Database strategy

The SQLite file (`data/vc-brain.db`) is generated by `npm run seed`.

- **Ephemeral (recommended for the demo):** seed on every boot. Each deploy/restart returns to a clean, known-good state; decisions/scan/apply persist for the life of the running instance — plenty for a live demo. No volume needed.
- **Persistent:** only if you want writes to survive restarts — attach a volume mounted where `data/vc-brain.db` lives and seed once. Not needed for judging.

## Portable option: Docker

Use this on Fly.io, a VPS, or any container host. A `Dockerfile` and `.dockerignore` are in the repo root.

```sh
docker build -t foundergraph .
docker run -p 3000:3000 \
  -e DEMO_INVESTOR_EMAIL=investor@foundergraph.demo \
  -e DEMO_INVESTOR_PASSWORD=demo \
  foundergraph
```

The image pins Node 26 and installs the build toolchain so `better-sqlite3` compiles from source (matching the container's Node), copies the tracked `data/demo` + `data/replay` artifacts, builds, and runs `npm run seed && npm start` on boot.

## Before you spend time on this

Check the submission form first: **many hackathons accept a repo + video and do not require a live URL.** If a live URL is optional, hosting is a nice-to-have, not a deadline task. If it is required, the Railway/Render path above is the fastest route.

## Known checks (not yet run on a real host)

- Docker isn't installed on the build machine, so the image build hasn't been exercised locally — the platform will build it on deploy.
- The key-absent replay fallback is confirmed in code (with `ANTHROPIC_API_KEY` unset, `src/lib/llm.ts` throws `NoLlmError` and each caller replays its capture) and was driven locally against the golden path, but not yet against a live host. Test it once deployed: with no key set, ask the rehearsed chat question and confirm it returns the cited replay rather than an error. The live path (with a key set) is not yet verified against a real host — see the smoke script `scripts/llm-smoke.mjs`.
- If the `node:26-bookworm` Docker tag isn't published yet, either use the Railway/Render path (no Docker) or install Node 26 via NodeSource in the Dockerfile.
