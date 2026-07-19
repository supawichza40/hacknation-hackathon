// Server-side data loader for the diligence page (VC-BRAIN-PLAN.md §7 M3, §12).
// Assembles one opportunity's view: DB row + screening facts + founder history,
// the extracted deck claims, the deck slides, graph stats, the claims-extraction
// provenance (R5 reasoning drawer), the deterministic axis scores, and the
// latest saved decision. Node-only (node:fs, better-sqlite3) — never imported
// by a client component.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDb } from "./db.ts";
import { parseClaims, type Claims } from "./claims.ts";
import { loadGraph } from "./graph/io.ts";
import { computeAxisScores, type AxisScore, type ScoringInput } from "./scoring.ts";
import { getDecision, type DecisionRow } from "./decision.ts";
import { loadMemo, type Memo } from "./memo.ts";

const ROOT = process.cwd();

// Route param is the graph-slug (matches the /graph subroute registry), not the
// DB id. Map slug -> opportunity id; unknown slugs fall through to opp-<slug>.
const SLUG_TO_OPP: Record<string, string> = {
  ecc: "opp-ecc",
  "lattice-db": "opp-lattice",
};

export function resolveOpportunityId(slug: string): string {
  return SLUG_TO_OPP[slug] ?? `opp-${slug}`;
}

export type Slide = { slideNo: number; title: string; bullets: string[]; speakerNote?: string };
export type ReasoningStep = { stage: string; startedAt?: string; note?: string };
export type FactRow = { key: string; value: string; evidenceIds: string[] };

export type DiligenceView = {
  slug: string;
  opportunityId: string;
  companyName: string;
  personName: string;
  founderScore: number;
  source: "inbound" | "outbound";
  sourceChannel: string | null;
  status: string;
  sector: string;
  stage: string;
  geo: string;
  askAmountCents: number;
  whySurfaced: string | null;
  createdAt: string;
  facts: FactRow[];
  unknowns: string[];
  axes: AxisScore[];
  claims: Claims;
  slides: Slide[];
  graph: { nodes: number; edges: number };
  reasoning: ReasoningStep[];
  provenanceLabel: string | null;
  decision: DecisionRow | null;
  memo: Memo | null;
  memoProvenanceLabel: string | null;
};

// Memo provenance label (mirrors the claims replay label): present only when a
// precomputed memo exists for the slug, so the UI can show it was really generated.
function loadMemoProvenanceLabel(slug: string): string | null {
  const p = join(ROOT, "data/replay/memo/provenance.json");
  if (slug !== "ecc" || !existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8")) as { isoTimestamp?: string; promptVersion?: string };
  return raw.isoTimestamp
    ? `Replay mode — memo generated ${raw.isoTimestamp.slice(0, 10)} (${raw.promptVersion ?? "provenance"})`
    : null;
}

function loadClaimsForSlug(slug: string): Claims {
  const p = join(ROOT, `data/demo/claims/${slug}/claims.json`);
  if (!existsSync(p)) return [];
  return parseClaims(JSON.parse(readFileSync(p, "utf8")));
}

function loadSlides(deckPath: string | null): Slide[] {
  if (!deckPath) return [];
  const p = join(ROOT, deckPath);
  if (!existsSync(p)) return [];
  return JSON.parse(readFileSync(p, "utf8")) as Slide[];
}

// Claims-extraction provenance for the R5 reasoning drawer (human-readable steps,
// never raw JSON). Present only for slugs whose deck was run through the extractor.
function loadClaimsProvenance(
  slug: string,
): { steps: ReasoningStep[]; isoTimestamp?: string; promptVersion?: string } | null {
  if (slug !== "ecc") return null;
  const p = join(ROOT, "data/replay/claims/provenance.json");
  if (!existsSync(p)) return null;
  const raw = JSON.parse(readFileSync(p, "utf8")) as {
    steps?: ReasoningStep[];
    isoTimestamp?: string;
    promptVersion?: string;
  };
  return { steps: raw.steps ?? [], isoTimestamp: raw.isoTimestamp, promptVersion: raw.promptVersion };
}

// Returns the assembled view, or null when no opportunity matches the slug
// (drives the "not found" screen state, plan §5.2).
export function getDiligenceView(slug: string): DiligenceView | null {
  const opportunityId = resolveOpportunityId(slug);
  const db = getDb();
  try {
    const row = db
      .prepare(
        `SELECT o.*, p.name AS person_name, p.founder_score AS founder_score
         FROM opportunity o JOIN person p ON p.id = o.person_id
         WHERE o.id = ?`,
      )
      .get(opportunityId) as Record<string, unknown> | undefined;
    if (!row) return null;

    const factsRow = db
      .prepare("SELECT facts, unknowns FROM screening_facts WHERE opportunity_id = ?")
      .get(opportunityId) as { facts: string; unknowns: string } | undefined;
    const factsObj = factsRow
      ? (JSON.parse(factsRow.facts) as Record<string, { value: string; evidenceIds: string[] }>)
      : {};
    const unknowns = factsRow ? (JSON.parse(factsRow.unknowns) as string[]) : [];
    const facts: FactRow[] = Object.entries(factsObj).map(([key, v]) => ({
      key,
      value: String(v.value),
      evidenceIds: v.evidenceIds ?? [],
    }));

    const history = (
      db
        .prepare(
          "SELECT applied_at, founder_score FROM application_history WHERE opportunity_id = ? ORDER BY applied_at ASC",
        )
        .all(opportunityId) as { applied_at: string; founder_score: number }[]
    ).map((h) => ({ appliedAt: h.applied_at, founderScore: h.founder_score }));

    const claims = loadClaimsForSlug(slug);
    const graph = loadGraph(slug);
    const graphStats = { nodes: graph?.nodes.length ?? 0, edges: graph?.edges.length ?? 0 };
    const founderScore = row.founder_score as number;

    const scoringInput: ScoringInput = {
      founderScore,
      history,
      claims,
      graph: graphStats,
      unknowns,
    };
    const axes = computeAxisScores(scoringInput);

    const prov = loadClaimsProvenance(slug);
    const provenanceLabel = prov?.isoTimestamp
      ? `Replay mode — claims captured ${prov.isoTimestamp.slice(0, 10)} (${prov.promptVersion ?? "provenance"})`
      : null;

    const decision = getDecision(db, opportunityId);

    return {
      slug,
      opportunityId,
      companyName: row.company_name as string,
      personName: row.person_name as string,
      founderScore,
      source: row.source as "inbound" | "outbound",
      sourceChannel: (row.source_channel as string) ?? null,
      status: row.status as string,
      sector: row.sector as string,
      stage: row.stage as string,
      geo: row.geo as string,
      askAmountCents: row.ask_amount_cents as number,
      whySurfaced: (row.why_surfaced as string) ?? null,
      createdAt: row.created_at as string,
      facts,
      unknowns,
      axes,
      claims,
      slides: loadSlides((row.deck_path as string) ?? null),
      graph: graphStats,
      reasoning: prov?.steps ?? [],
      provenanceLabel,
      decision,
      memo: loadMemo(slug),
      memoProvenanceLabel: loadMemoProvenanceLabel(slug),
    };
  } finally {
    db.close();
  }
}
