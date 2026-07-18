<!--
  README.proposed.md — proposed replacement/companion README.
  Every factual claim is followed by an HTML comment citing the repo file(s) it came from.
  Citations use repo-relative paths with line ranges, e.g. <!-- src: CLAUDE.md L9-13 -->.
  This file was written without opening any code because the repo contains none (see Status).
-->

# Hacknation Hackathon

A documentation-only operating kit for running a hackathon end to end from a Claude Code chat. It holds no application source code; it is a set of Markdown rules and prompt skeletons that Claude reads and enforces during an event.
<!-- src: repo file tree — 15 *.md + .gitignore + .claude/settings.json, no code files present -->
<!-- src: README.md L39-56 (the file index the kit describes itself by) -->

## Overview

This repo is an instance of a reusable "Hackathon Template", copied into a fresh event repo and currently set up for one specific event: the Hack-Nation 6th Global AI Hackathon (18–19 July 2026).
<!-- src: TODO.md L30 (created from hackathon-template → supawichza40/hacknation-hackathon) -->
<!-- src: RUBRIC.md L5-8 (event: Hack-Nation 6th Global AI Hackathon; kickoff Sat 18 Jul, deadline Sun 19 Jul) -->

The template was distilled from a retrospective of the Xero App & Agent Hackathon of 4–5 July 2026 (101 commits, 32 Claude sessions, and the recorded finalist pitches), an entry that finished around top 20 of 61.
<!-- src: README.md L3 -->
<!-- src: RETRO.md L25 (v1 changelog: Encode Hub Xero hackathon retro, 101 commits/32 sessions, ~top-20/61) -->
Each rule in the kit is tagged with the evidence from that event that earned it.
<!-- src: CLAUDE.md L3 -->

The kit is driven by three trigger words typed into a Claude Code chat: `start`, `dryrun`, and `retro`. They put Claude into an instructor mode that issues one micro-step at a time.
<!-- src: CLAUDE.md L5-7 -->
<!-- src: README.md L9-33 -->
<!-- src: PROMPTS.md L13-15 -->
The human writes exactly one prompt for the whole event (the P0 kickoff prompt); Claude compiles every later prompt from the live repo state and hands it over with paste instructions.
<!-- src: CLAUDE.md L45 -->
<!-- src: PROMPTS.md L3-9 -->
<!-- src: README.md L7 -->

## Architecture

There is no application to build or run. The structure is a set of Markdown documents Claude reads and enforces, plus one Claude Code hook.
<!-- src: repo file tree — no source files -->
<!-- src: README.md L39-56 -->

Document map, per the repo's own index:
<!-- src: README.md L39-56 -->
- `CLAUDE.md`: operating rules every session follows; defines the Three Laws.
<!-- src: CLAUDE.md L9-13 -->
- `PLAYBOOK.md`: the phase sequence from T+0 to T+48 with hard gates (Phase 0 through Phase 6).
<!-- src: PLAYBOOK.md L5-56 -->
- `PROMPTS.md`: per-phase prompt skeletons (P0 through P7) that Claude fills from repo state.
<!-- src: PROMPTS.md L48-196 -->
- `RUBRIC.md`: judging reverse-engineering, filled at hour 0 and re-read before each scope decision.
<!-- src: RUBRIC.md L1-3 -->
- `SPECS.md`: the 8-document spec architecture written in one burst at spec lock (docs/specs/01–08), in two waves (WHAT 01–04, then HOW+VERIFY 05–08).
<!-- src: SPECS.md L1-7 -->
- `DESIGN.md`: frontend rules Claude reads before any UI work; the design direction is locked once at spec lock.
<!-- src: DESIGN.md L1-3 -->
- `PREFLIGHT.md`: external tool/API viability spikes; each dependency gets a row proven by a real call before the idea is locked.
<!-- src: PREFLIGHT.md L1-5 -->
- `PITCH.md`: the 3-minute pitch skeleton plus the judge Q&A bank.
<!-- src: PITCH.md L1-3 -->
- `SUBMISSION.md`: submission checklist with time gates G1 through G5.
<!-- src: SUBMISSION.md L5-14 -->
- `SOLO-OPS.md`: running the event alone with parallel Claude sessions and four lanes (A backend, B frontend, C QA, D pitch).
<!-- src: SOLO-OPS.md L24-32 -->
- `WALKTHROUGH.md`: a simulated run and the three allowed parallelism modes.
<!-- src: WALKTHROUGH.md L1-3, L77-84 -->
- `RETRO.md`: the post-event loop that patches the template and version-tags it.
<!-- src: RETRO.md L1-11 -->
- `TODO.md`: the status board Claude updates at every phase boundary and the human reads.
<!-- src: TODO.md L1-3 -->
- `BACKLOG.md`: parked post-lock ideas, gated by a three-question displacement test.
<!-- src: BACKLOG.md L3-11 -->

The Three Laws override everything else: push equals done; real before mocked; scope freezes at spec lock.
<!-- src: CLAUDE.md L9-13 -->

Automation and hygiene:
- `.claude/settings.json` defines a SessionStart hook that prints the top of `TODO.md` (the status board) at the start of every session.
<!-- src: .claude/settings.json -->
<!-- src: WALKTHROUGH.md L16-23 -->
- `.gitignore` excludes secrets (`.env`, `*.pem`, `*.key`) and anticipates Python and Node build artifacts (`.venv/`, `__pycache__/`, `node_modules/`, `dist/`) for code produced during an event.
<!-- src: .gitignore -->

Parallelism model: subagent fan-out for the five exploration spikes, API fan-out of one critique prompt to several models, and multi-session lanes (four terminal tabs, A through D) during the build phase only. Spec burst, walking skeleton, final integration, and submission runway are single-session by rule.
<!-- src: WALKTHROUGH.md L77-84 -->

## Install

No build step, package manager, or dependencies; the repo is Markdown plus one hook config.
<!-- src: repo file tree — no code, no package manifest -->
<!-- src: .gitignore (build-artifact dirs are anticipated for event code, not present in the template) -->

"Installing" means starting a hackathon from it, per the repo's own instructions:
<!-- src: README.md L11-25 -->
1. Create a fresh private repo for the event and copy the template files into it, including `.claude/` and `.gitignore`.
<!-- src: README.md L12-13 -->
2. Clone and work OUTSIDE any iCloud, Dropbox, or OneDrive sync folder. The source event saw iCloud create 0-byte conflict-duplicate files of state files mid-event.
<!-- src: README.md L14, L61 -->
<!-- src: CLAUDE.md L17 -->
<!-- src: PREFLIGHT.md L33 -->
3. `cd` into the repo, run `claude`, and type `start`.
<!-- src: README.md L15 -->

The hour-0 ritual (30-minute cap) then runs: confirm a clean, pushed git tree with a reachable remote, fill `RUBRIC.md` from the judging slides, and open the submission-portal draft if the portal is live.
<!-- src: README.md L58-71 -->
<!-- src: PLAYBOOK.md L5-9 -->

## Usage

Three entry points, all typed into the Claude Code chat:
<!-- src: CLAUDE.md L5-7 -->
<!-- src: README.md L9-33 -->
- `start`: runs the event from setup to submission (prompt sequence P0 to P7), one micro-step per message until submission.
<!-- src: PROMPTS.md L15 -->
<!-- src: CLAUDE.md L5 -->
- `dryrun`: one pre-event hour that runs P0 to P2 against a fictional event and fires a test prompt through every model arm, so expired keys and changed model IDs surface at home rather than at the venue.
<!-- src: README.md L27-29 -->
<!-- src: PROMPTS.md L24-25 -->
<!-- src: RETRO.md L13-17 -->
- `retro`: within 48 hours after the event, mines the git history and Claude session transcripts, presents an actual-vs-playbook diff, proposes template patches one file at a time, and commits a version tag.
<!-- src: README.md L31-33 -->
<!-- src: CLAUDE.md L7 -->
<!-- src: RETRO.md L5-11 -->

Each instructor step arrives in a fixed format: STEP n, YOU, PASTE, WHERE, THEN, FILES. The human decides, approves, and pastes; Claude compiles the prompts and names every destination and output file.
<!-- src: README.md L16-24 -->
<!-- src: PROMPTS.md L27-46 -->

New to the kit: `WALKTHROUGH.md` is a simulated event showing what the screen looks like at each phase.
<!-- src: README.md L35 -->
<!-- src: WALKTHROUGH.md L1-3 -->

## Status

Stage: pre-event setup. The template is at version v1, dated 2026-07-06.
<!-- src: RETRO.md L25 -->
For the current target event (Hack-Nation 6th, kickoff 18 July 2026), the status board records Phase 0, Hour-0 Setup; the event has not yet run.
<!-- src: TODO.md L9-11 -->
<!-- src: RUBRIC.md L5-8 -->

Contents: 15 Markdown documents, one `.gitignore`, and one `.claude/settings.json` hook. No application source code exists in the repo.
<!-- src: repo file tree — 15 *.md, .gitignore, .claude/settings.json; code-file scan matched only the JSON hook config -->

The status board's Done log records three completed setup items: the template import and first clean push (commit 1454ce5), hour-0 environment checks, and deep research on past editions written into `RUBRIC.md` §0.5.
<!-- src: TODO.md L28-30 -->

Filled vs. pending:
- Filled: event facts and past-edition research in `RUBRIC.md` §0 and §0.5.
<!-- src: RUBRIC.md L5-37 -->
- Pending until the challenge reveal (12:50 ET, 18 July 2026): `RUBRIC.md` §1–4 (mark scheme, tracks, judges, submission requirements) are still empty templates, to be filled verbatim at reveal.
<!-- src: RUBRIC.md L41-68 -->
- Open human action on the board: confirm the hackathon application was submitted before the Batch 6 deadline (10 July), and confirm which hub.
<!-- src: TODO.md L20 -->

No golden path, demo video, deployed URL, or submission exists yet. The board tracks these as "not started"; they are produced during an event run, not stored in the template.
<!-- src: TODO.md L12-15 -->
