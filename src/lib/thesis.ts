// Pure, dependency-free thesis logic (VC-BRAIN-PLAN.md §5).
// No better-sqlite3 import here on purpose: both the server DB layer and the
// client Pipeline board import this, so it must run in the browser too.
// Money is always INTEGER cents — never float (CLAUDE.md law).

export type ThesisView = {
  sectors: string[];
  stages: string[];
  geos: string[];
  checkSizeMinCents: number;
  checkSizeMaxCents: number;
  technicalBar: number;
};

export type OppView = {
  sector: string;
  stage: string;
  geo: string;
  askAmountCents: number;
};

export type FitChecks = {
  sector: boolean;
  stage: boolean;
  geo: boolean;
  checkSize: boolean;
};

export type FitResult = {
  onThesis: boolean;
  checks: FitChecks;
  failReasons: string[];
};

// Thesis fit is COMPUTED, never invented (plan §5). A card is off-thesis when
// any axis fails; BrightCart fails only on check size ($2M raise vs a $100K cap).
export function evaluateThesisFit(opp: OppView, thesis: ThesisView): FitResult {
  const checks: FitChecks = {
    sector: thesis.sectors.includes(opp.sector),
    stage: thesis.stages.includes(opp.stage),
    geo: thesis.geos.includes(opp.geo),
    checkSize:
      opp.askAmountCents >= thesis.checkSizeMinCents &&
      opp.askAmountCents <= thesis.checkSizeMaxCents,
  };
  const failReasons: string[] = [];
  if (!checks.sector) failReasons.push("fails thesis: sector");
  if (!checks.stage) failReasons.push("fails thesis: stage");
  if (!checks.geo) failReasons.push("fails thesis: geo");
  if (!checks.checkSize) failReasons.push("fails thesis: check size");
  return {
    onThesis: checks.sector && checks.stage && checks.geo && checks.checkSize,
    checks,
    failReasons,
  };
}

// Dedup identity key (plan §5): normalized GitHub/repo URL. Same repo across
// applications → same Opportunity. Strips protocol, www., trailing .git and slash.
export function normalizeRepoUrl(url: string): string {
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/+$/, "")
    .replace(/\.git$/, "")
    .replace(/\/+$/, "");
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}M`;
  if (dollars >= 1_000) return `$${(dollars / 1_000).toFixed(dollars % 1_000 === 0 ? 0 : 1)}K`;
  return `$${dollars.toFixed(0)}`;
}
