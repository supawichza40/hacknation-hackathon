# Tavily replay wiring

How `/api/scan`'s replay pattern (`src/lib/scan.ts`, `src/app/api/scan/route.ts`) extends to Tavily:

1. **Same replay contract as `data/replay/scan/`.** Load `metadata.json` + `raw/*.json` at build/request time; never call Tavily live on stage. Reference time is the fixed `referenceTime` in `metadata.json`, not `Date.now()` — reruns reproduce an identical ranking.
2. **Source discriminator.** Emit each surfaced item with `source: "tavily"` (GitHub scan emits `source: "github"`), so the UI can badge provenance and the two sources merge into one ranked list.
3. **Deterministic scoring, same shape.** Reuse the weighted-signal + `score desc, then <stableKey> asc` tiebreak from `scan-score.mjs`. Tavily signals come from each result: `score` (Tavily relevance), recency of the query window, and query-thesis match. Output mirrors `data/replay/scan/ranking.json`.
4. **Extraction note.** Tavily results are article/directory hits, so the scoring layer parses founder/company names from `results[].content` before ranking — the raw capture stays verbatim for honest provenance.
