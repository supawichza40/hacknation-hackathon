// R1 natural-language query over the seeded founders' structured facts
// (VC-BRAIN-PLAN.md §7 M4). Deterministic intent parse over KNOWN fields runs FIRST —
// fast and offline-safe — so "founders with improving scores" or "off-thesis companies"
// resolve with no model call. Every result row carries a citation chip (an evidence
// locator + excerpt) so a match is never unexplained. An optional `claude -p` fallback
// covers free-form questions the deterministic layer can't map; when it is unavailable
// the result is simply "No cited matches" (the base pipeline stays unchanged).
import { spawnSync } from "node:child_process";
import type { OpportunityCard } from "./db.ts";
import type { ThesisView } from "./thesis.ts";

export type QueryMatch = {
  opportunityId: string;
  companyName: string;
  personName: string;
  founderScore: number;
  reason: string;
  citation: { locator: string; excerpt: string };
};

export type QueryResult = {
  query: string;
  intent: string | null;
  usedLlm: boolean;
  matches: QueryMatch[];
};

type Intent = {
  key: string;
  match: (q: string) => boolean;
  run: (cards: OpportunityCard[]) => QueryMatch[];
};

// Earliest prior founder-score observation, or null. Trend "improving" iff the current
// score is above it — the same rule the founder axis uses (src/lib/scoring.ts).
function priorScore(card: OpportunityCard): { appliedAt: string; founderScore: number } | null {
  if (card.history.length === 0) return null;
  return [...card.history].sort((a, b) => a.appliedAt.localeCompare(b.appliedAt))[0];
}

// OpportunityCard already carries `id`; alias kept for readable call sites below.
type Card = OpportunityCard;

const INTENTS: Intent[] = [
  {
    key: "improving-score",
    match: (q) => /improv|rising|trending up|went up|returning founder/.test(q),
    run: (cards) =>
      (cards as Card[])
        .map((c) => ({ c, prior: priorScore(c) }))
        .filter(({ c, prior }) => prior !== null && c.founderScore > prior.founderScore)
        .map(({ c, prior }) => ({
          opportunityId: c.id,
          companyName: c.companyName,
          personName: c.personName,
          founderScore: c.founderScore,
          reason: `Founder score ${prior!.founderScore} → ${c.founderScore} since ${prior!.appliedAt}`,
          citation: {
            locator: `score-history://${c.id}/${prior!.appliedAt}`,
            excerpt: `${prior!.founderScore} → ${c.founderScore} (returning founder)`,
          },
        })),
  },
  {
    key: "declining-score",
    match: (q) => /declin|slipp|dropp|trending down|went down/.test(q),
    run: (cards) =>
      (cards as Card[])
        .map((c) => ({ c, prior: priorScore(c) }))
        .filter(({ c, prior }) => prior !== null && c.founderScore < prior.founderScore)
        .map(({ c, prior }) => ({
          opportunityId: c.id,
          companyName: c.companyName,
          personName: c.personName,
          founderScore: c.founderScore,
          reason: `Founder score ${prior!.founderScore} → ${c.founderScore} since ${prior!.appliedAt}`,
          citation: {
            locator: `score-history://${c.id}/${prior!.appliedAt}`,
            excerpt: `${prior!.founderScore} → ${c.founderScore}`,
          },
        })),
  },
  {
    key: "off-thesis",
    match: (q) => /off.?thesis|out of thesis|doesn.?t fit|does not fit|not a fit/.test(q),
    run: (cards) =>
      (cards as Card[])
        .filter((c) => !c.fit.onThesis)
        .map((c) => ({
          opportunityId: c.id,
          companyName: c.companyName,
          personName: c.personName,
          founderScore: c.founderScore,
          reason: c.fit.failReasons[0] ?? "off thesis",
          citation: whyCitationFor(c),
        })),
  },
  {
    key: "on-thesis",
    match: (q) => /on.?thesis|fits the thesis|in thesis|on-thesis/.test(q),
    run: (cards) =>
      (cards as Card[])
        .filter((c) => c.fit.onThesis)
        .map((c) => ({
          opportunityId: c.id,
          companyName: c.companyName,
          personName: c.personName,
          founderScore: c.founderScore,
          reason: "Passes every thesis check",
          citation: whyCitationFor(c),
        })),
  },
  {
    key: "inbound",
    match: (q) => /inbound|applied|application/.test(q),
    run: (cards) =>
      (cards as Card[])
        .filter((c) => c.source === "inbound")
        .map((c) => cardRow(c, "Inbound — founder applied")),
  },
  {
    key: "outbound",
    match: (q) => /outbound|sourced|we found|scan/.test(q),
    run: (cards) =>
      (cards as Card[])
        .filter((c) => c.source === "outbound")
        .map((c) => cardRow(c, "Outbound — sourced by the fund")),
  },
];

function whyCitationFor(c: Card): { locator: string; excerpt: string } {
  if (c.whySurfacedEvidence) return c.whySurfacedEvidence;
  return { locator: `opportunity://${c.id}`, excerpt: c.whySurfaced ?? "no evidence excerpt" };
}

function cardRow(c: Card, reason: string): QueryMatch {
  return {
    opportunityId: c.id,
    companyName: c.companyName,
    personName: c.personName,
    founderScore: c.founderScore,
    reason,
    citation: whyCitationFor(c),
  };
}

export function parseIntent(query: string): Intent | null {
  const q = query.toLowerCase();
  return INTENTS.find((i) => i.match(q)) ?? null;
}

// Deterministic pass only. Returns null when no known intent matches (the caller may then
// try the LLM fallback). Never throws; base pipeline is untouched.
export function runDeterministicQuery(
  query: string,
  cards: OpportunityCard[],
): QueryResult | null {
  const intent = parseIntent(query);
  if (!intent) return null;
  return { query, intent: intent.key, usedLlm: false, matches: intent.run(cards) };
}

// Optional LLM fallback for free-form questions. Best-effort and offline-safe: any
// failure (claude missing, timeout, unparseable) yields an empty cited result rather than
// an error. The model may only pick from the provided opportunity ids — it invents nothing.
export function runLlmQuery(query: string, cards: OpportunityCard[]): QueryResult {
  const empty: QueryResult = { query, intent: null, usedLlm: true, matches: [] };
  try {
    const roster = (cards as Card[])
      .map(
        (c) =>
          `${c.id} | ${c.companyName} | founder ${c.personName} score ${c.founderScore} | ${c.sector}/${c.stage}/${c.geo} | ${c.source} | onThesis=${c.fit.onThesis}`,
      )
      .join("\n");
    const prompt = `Given these opportunities (one per line: id | company | founder | sector/stage/geo | source | onThesis), return STRICT JSON {"ids":[string]} listing ONLY the ids that satisfy this question. Use only the fields shown; invent nothing. If none apply return {"ids":[]}.

=== OPPORTUNITIES ===
${roster}

=== QUESTION ===
${query}`;
    const res = spawnSync("claude", ["-p", "--output-format", "json"], {
      input: prompt,
      encoding: "utf8",
      maxBuffer: 16 * 1024 * 1024,
      timeout: 60_000,
    });
    if (res.status !== 0 || !res.stdout) return empty;
    const env = JSON.parse(res.stdout);
    if (env.is_error) return empty;
    let s = String(env.result).trim();
    const start = s.indexOf("{");
    const end = s.lastIndexOf("}");
    if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
    const ids: string[] = JSON.parse(s).ids ?? [];
    const byId = new Map((cards as Card[]).map((c) => [c.id, c]));
    const matches = ids
      .map((id) => byId.get(id))
      .filter((c): c is Card => Boolean(c))
      .map((c) => cardRow(c, "Matched by natural-language query"));
    return { query, intent: "llm", usedLlm: true, matches };
  } catch {
    return empty;
  }
}
