// Deterministic three-axis diligence scoring (VC-BRAIN-PLAN.md §7 M3, §9).
// NO LLM: every score is a pure function of the screening facts, extracted
// claims, graph stats, and founder history. Same inputs -> identical scores
// (tested in tests/scoring.test.ts). The three axes are NEVER blended into a
// single number — they surface as separate signals (plan §9).
import type { Claims } from "./claims.ts";

export type AxisKey = "founder" | "market" | "idea_vs_market";
export type Trend = "improving" | "declining" | "baseline";

export type AxisScore = {
  axis: AxisKey;
  label: string;
  score: number; // 0-100 integer
  because: string; // one-line rationale
  evidenceCount: number;
  trend: Trend;
};

// One dated founder-score observation (a prior application), excluding the current one.
export type FounderObservation = { appliedAt: string; founderScore: number };

export type ScoringInput = {
  founderScore: number;
  history: FounderObservation[];
  claims: Claims; // may be empty for a not-yet-analyzed opportunity
  graph: { nodes: number; edges: number };
  unknowns: string[]; // screening gaps (e.g. ARR, cap table)
};

const clamp = (n: number): number => Math.max(0, Math.min(100, Math.round(n)));

function tally(claims: Claims) {
  let verified = 0;
  let unsupported = 0;
  let contradicted = 0;
  let evidence = 0;
  for (const c of claims) {
    evidence += c.evidence.length;
    if (c.status === "verified") verified++;
    else if (c.status === "unsupported") unsupported++;
    else if (c.status === "contradicted") contradicted++;
  }
  return { verified, unsupported, contradicted, evidence, total: claims.length };
}

// Founder axis: the person signal. Trend is "baseline" until two dated
// observations exist; ECC's 61 -> 82 history flips it to "improving".
function founderAxis(input: ScoringInput): AxisScore {
  const { founderScore, history } = input;
  const dated = [...history].sort((a, b) => a.appliedAt.localeCompare(b.appliedAt));
  const prior = dated.length > 0 ? dated[0] : null;
  let trend: Trend = "baseline";
  if (prior && prior.founderScore !== founderScore) {
    trend = founderScore > prior.founderScore ? "improving" : "declining";
  }
  const because =
    trend === "improving"
      ? `Returning founder — score ${prior!.founderScore}→${founderScore} since ${prior!.appliedAt}.`
      : trend === "declining"
        ? `Score slipped ${prior!.founderScore}→${founderScore} since ${prior!.appliedAt}.`
        : `Founder score ${founderScore} from repo + profile signal (no prior application).`;
  return {
    axis: "founder",
    label: "Founder",
    score: clamp(founderScore),
    because,
    evidenceCount: 1 + history.length,
    trend,
  };
}

// Market axis: attractiveness read from the market + traction claims (slides 5-6).
// Verified traction lifts it; unsupported/contradicted claims pull it down.
function marketAxis(input: ScoringInput): AxisScore {
  const claims = input.claims.filter((c) => c.slideNo === 5 || c.slideNo === 6);
  const t = tally(claims);
  const score = clamp(50 + t.verified * 12 - t.unsupported * 3 - t.contradicted * 15);
  const because =
    t.total === 0
      ? "No market or traction claims extracted yet."
      : `${t.total} market/traction claims — ${t.verified} verified, ${t.unsupported} unsupported.`;
  return { axis: "market", label: "Market", score, because, evidenceCount: t.evidence, trend: "baseline" };
}

// Idea-vs-Market axis: does the product claim hold against the real repo?
// This is where a contradicted core claim (ECC slide 4 sub-100ms) bites hardest.
function ideaVsMarketAxis(input: ScoringInput): AxisScore {
  const claims = input.claims.filter((c) => c.slideNo === 1 || c.slideNo === 3 || c.slideNo === 4);
  const t = tally(claims);
  const graphBonus = input.graph.nodes >= 40 ? 5 : 0; // real shipped substance
  const score = clamp(50 + t.verified * 12 - t.unsupported * 2 - t.contradicted * 20 + graphBonus);
  const because =
    t.contradicted > 0
      ? `${t.contradicted} core product claim contradicted by repo evidence.`
      : t.total === 0
        ? "No product claims extracted yet."
        : `${t.verified} of ${t.total} product claims verified against the repo.`;
  return {
    axis: "idea_vs_market",
    label: "Idea vs Market",
    score,
    because,
    evidenceCount: t.evidence,
    trend: "baseline",
  };
}

export function computeAxisScores(input: ScoringInput): AxisScore[] {
  return [founderAxis(input), marketAxis(input), ideaVsMarketAxis(input)];
}
