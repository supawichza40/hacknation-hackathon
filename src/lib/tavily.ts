// Tavily founder-sourcing replay (VC-BRAIN-PLAN.md; prize track "Best Use of Tavily";
// commit 4062322). Same replay contract as data/replay/scan/: load the captured
// tavily_search JSON (metadata.json + raw/*.json), rank deterministically, never call
// Tavily live on stage. Results are web-article/directory hits, so a small deterministic
// extractor pulls 1-2 company/tool names out of results[].content before ranking; the raw
// capture stays verbatim for honest provenance. Every surfaced item carries source:"tavily".
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const TAVILY_THRESHOLD = 0.5; // tavily relevance-score activation threshold
export const TAVILY_TOP_N = 8;
export const TAVILY_REPLAY_DIR = "data/replay/tavily";
export const TAVILY_LABEL = "replaying captured Tavily run";

export type TavilyStep = { rank: number; fullName: string; score: number; crossed: boolean };
export type TavilySurfaced = {
  name: string;
  source: "tavily";
  score: number;
  url: string;
  evidenceLocator: string;
  excerpt: string;
};
export type TavilyReplay = {
  source: "tavily";
  capturedAt: string;
  replaySource: string;
  totalScanned: number;
  threshold: number;
  steps: TavilyStep[];
  topScore: number;
  surfaced: TavilySurfaced | null;
  label: string;
};

type TavilyResult = { url: string; title: string; content: string; score: number };
type RawCapture = { query: string; results: TavilyResult[] };
type Metadata = { capturedAt?: string; queries: { file: string; capturedAt?: string }[] };

// Words that look capitalized in article prose but are not a company/tool name.
const STOP = new Set([
  "The", "This", "That", "These", "Those", "GitHub", "AI", "Open", "Source", "Best", "Top",
  "New", "LLM", "LLMs", "Show", "HN", "Product", "Hunt", "How", "Why", "What", "With", "For",
  "And", "But", "From", "Your", "Our", "Their", "Startup", "Startups", "Founder", "Founders",
  "Tools", "Tool", "Infrastructure", "Infra", "Agents", "Agent", "Projects", "Project",
  "Developer", "Developers", "April", "May", "June", "July", "March", "January", "February",
  "Month", "Trending", "Funding", "Seed", "Pre", "Read", "More", "Learn", "Guide",
]);

// Deterministic name extraction: GitHub-style slugs first (org/repo), then Capitalized /
// CamelCase product tokens not in the stoplist. Returns up to 2, in order of appearance.
export function extractNames(result: TavilyResult): string[] {
  const text = `${result.title}. ${result.content}`;
  const names: string[] = [];
  const seen = new Set<string>();
  const push = (n: string) => {
    const key = n.toLowerCase();
    if (n.length < 3 || seen.has(key)) return;
    seen.add(key);
    names.push(n);
  };
  for (const m of text.matchAll(/\b([a-z0-9][\w.-]+\/[\w.-]+)\b/g)) push(m[1]);
  for (const m of text.matchAll(/\b([A-Z][a-zA-Z0-9]{2,}(?:[A-Z][a-zA-Z0-9]+)?)\b/g)) {
    if (!STOP.has(m[1])) push(m[1]);
  }
  return names.slice(0, 2);
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function loadTavilyCaptures(root: string = process.cwd()): {
  capturedAt: string;
  results: TavilyResult[];
} {
  const dir = join(root, TAVILY_REPLAY_DIR);
  const meta = JSON.parse(readFileSync(join(dir, "metadata.json"), "utf8")) as Metadata;
  const results: TavilyResult[] = [];
  for (const q of meta.queries) {
    const raw = JSON.parse(readFileSync(join(dir, q.file), "utf8")) as RawCapture;
    for (const r of raw.results) {
      results.push({ url: r.url, title: r.title, content: r.content, score: r.score });
    }
  }
  const capturedAt = (meta.capturedAt ?? meta.queries[0]?.capturedAt ?? "2026-07-19").slice(0, 10);
  return { capturedAt, results };
}

// Deterministic replay view: rank captured results by tavily relevance (score desc, then
// url asc), take the top N as steps, and surface the highest-scoring crossed result with
// its extracted company/tool name. No live call, no Date.now() — reruns are identical.
export function computeTavilyReplay(input: {
  capturedAt: string;
  results: TavilyResult[];
}): TavilyReplay {
  const ranked = [...input.results].sort((a, b) => b.score - a.score || (a.url < b.url ? -1 : 1));
  const steps: TavilyStep[] = ranked.slice(0, TAVILY_TOP_N).map((r, i) => {
    const name = extractNames(r)[0] ?? hostname(r.url);
    return { rank: i + 1, fullName: name, score: Number(r.score.toFixed(4)), crossed: r.score >= TAVILY_THRESHOLD };
  });
  const topResult = ranked.find((r) => r.score >= TAVILY_THRESHOLD) ?? ranked[0];
  const surfaced: TavilySurfaced | null = topResult
    ? {
        name: extractNames(topResult)[0] ?? hostname(topResult.url),
        source: "tavily",
        score: Number(topResult.score.toFixed(4)),
        url: topResult.url,
        evidenceLocator: topResult.url,
        excerpt: topResult.content.slice(0, 160).replace(/\s+/g, " ").trim(),
      }
    : null;
  return {
    source: "tavily",
    capturedAt: input.capturedAt,
    replaySource: `${TAVILY_REPLAY_DIR}/raw`,
    totalScanned: input.results.length,
    threshold: TAVILY_THRESHOLD,
    steps,
    topScore: steps[0]?.score ?? 0,
    surfaced,
    label: TAVILY_LABEL,
  };
}
