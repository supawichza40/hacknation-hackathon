# Plan dialogue — lovable-frontend · 2026-07-19

Lead: Claude (Fable 5 → Opus 4.8 mid-run). Critic: gpt-5.6-sol via Codex plugin (read-only, read the 3 source docs). Ground-truth pass: yes (Sol read brief + screen-map + journeys). Rounds: 1 (single adversarial pass on the DoD).

```
📋 Plan dialogue — lovable-frontend · 2026-07-19
   Sol (gpt-5.6-sol), independent, read repo read-only · 1 round
   45 objections → DoD hardened · 2 blockers resolved · 2 items need human approval

✅ WHAT THE DEBATE CHANGED (the payoff)
   1. DoD #10 rewritten — build verified against the FROZEN brief; write-back may NOT
      loosen frozen scope; contract-weakening deltas need prior human approval.
      → Sol blocker: "deltas" was a loophole to weaken the locked design after the fact.
   2. Added a full Sol-hardened per-screen QA script — every vague DoD item ("login gate
      works", "6 beats clickable", "anti-slop holds") replaced with concrete observable
      pass/fail tests. → Sol showed each could pass while failing the brief's intent.
   3. Golden path must run from `/` with the state switcher COLLAPSED, real controls only.
      → Sol: "clickable end-to-end" could be faked via direct URLs / the dev switcher.
   4. "Instant transitions" scoped to route changes only; Scan/analysis/chat MUST show
      timed progress. → Sol: a build could make every simulation instant and still pass.

⚠️ STILL DISAGREED (execution risk — watch these)
   • none unresolved — all 45 objections accepted (they sharpen verification, don't
     conflict with the brief). Revisit only if a hardened test proves untestable in Lovable.

❓ UNVERIFIED ASSUMPTIONS (nobody opened these)
   • Upload MIME/size limits — marked TBD in source docs; QA uses a placeholder, flagged
     needs-human-approve. What breaks if wrong: Apply upload-rejected state is unverifiable.
   • Timer-chip exact computation + rounding — TBD in source docs; same treatment.
   • React Flow / audio MP3 availability in Lovable sandbox — unproven until those build
     turns; brief fallbacks apply (any pan/zoom canvas; local MP3 + printed-script fallback).
```

## Execution

- 2026-07-19 00:18 BST — Wave 0 preflight PASS: Lovable MCP auth live, workspace `Supavich's Lovable` (pro). Project `a7405de7-87c8-48fc-803a-8a8f89f404ed` created.
- 00:26 BST — Stage 1 (foundation) done: 6 `src/data/*.json` files (contradiction exact: deck slide 7 "sub-100ms" vs bench/README.md:22-24 "median 340ms"), 5 routes, login page on-spec. DELTA: stack is TanStack Start, not Vite — written back to brief §8 (strengthens portability).
- 00:30 BST — Stage 2 (Pipeline + dev state switcher) dispatched to Lovable.

<details><summary>Raw objection log (Sol, 45 items)</summary>

Stored in the dispatch run; headline above captures the 4 plan-changing items + 2 blockers. Full log: 2 blockers (DoD #10 contract-loophole; chat trust-contract not enforced), ~30 high (vague/gameable per-screen criteria), ~10 medium (type-scale, 1280px meaning, portability audit), 3 cannot-verify (upload limits, timer computation — TBD in docs). All folded into the Sol-hardened QA script in `docs/product/10-lovable-dod.md`.
</details>
