// SQLite schema + access layer (VC-BRAIN-PLAN.md §5 data model).
// Server-only: better-sqlite3 is a native module (next.config serverExternalPackages).
// Money is stored as INTEGER cents — never float (CLAUDE.md law).
import Database from "better-sqlite3";
import { join } from "node:path";
import { mkdirSync } from "node:fs";
import { evaluateThesisFit, normalizeRepoUrl, type ThesisView, type FitResult } from "./thesis.ts";

export type DB = Database.Database;

const DEFAULT_DB_PATH = join(process.cwd(), "data", "vc-brain.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS thesis (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sectors TEXT NOT NULL,            -- JSON string[]
  stages TEXT NOT NULL,             -- JSON string[]
  geos TEXT NOT NULL,               -- JSON string[]
  check_size_min_cents INTEGER NOT NULL,
  check_size_max_cents INTEGER NOT NULL,
  ownership_target REAL,
  risk_appetite TEXT NOT NULL,
  technical_bar INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS person (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  emails TEXT,                      -- JSON string[]
  links TEXT,                       -- JSON {github,linkedin,twitter}
  github_url_norm TEXT,             -- dedup identity key
  founder_score INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS opportunity (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES person(id),
  company_name TEXT NOT NULL,
  deck_path TEXT,
  graph_path TEXT,
  repo_url TEXT,
  repo_url_norm TEXT UNIQUE,        -- dedup key: same repo URL -> same Opportunity
  source TEXT NOT NULL,             -- 'inbound' | 'outbound'
  source_channel TEXT,              -- github | hn | hackathon | apply | ...
  status TEXT NOT NULL,             -- sourced | screening | diligence | decision
  sector TEXT NOT NULL,
  stage TEXT NOT NULL,
  geo TEXT NOT NULL,
  ask_amount_cents INTEGER NOT NULL,
  why_surfaced TEXT,
  visible INTEGER NOT NULL DEFAULT 1,
  -- Async analysis lifecycle for /apply submissions (NULL for seeded/never-analyzed
  -- opps): 'analyzing' | 'ready' | 'analysis_unavailable'. State lives here, not in
  -- memory, so it survives a request timeout / process restart (PREFLIGHT decision 3).
  analysis_status TEXT,
  analysis_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS screening_facts (
  opportunity_id TEXT PRIMARY KEY REFERENCES opportunity(id),
  facts TEXT NOT NULL,              -- JSON Record<string,{value,evidenceIds}>
  unknowns TEXT NOT NULL            -- JSON string[]
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  artifact_id TEXT,
  locator TEXT NOT NULL,            -- path+lines | slide | url
  excerpt TEXT NOT NULL,
  kind TEXT                         -- e.g. 'why_surfaced'
);

CREATE TABLE IF NOT EXISTS claim (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  text TEXT NOT NULL,
  category TEXT NOT NULL,
  trust_score REAL NOT NULL,
  confidence TEXT NOT NULL,
  evidence_ids TEXT NOT NULL,       -- JSON string[]
  contradiction_ids TEXT,           -- JSON string[]
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS axis_score (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  axis TEXT NOT NULL,               -- founder | market | idea_vs_market
  score INTEGER NOT NULL,
  trend TEXT NOT NULL,              -- improving | stable | declining | baseline
  rationale TEXT NOT NULL,
  evidence_ids TEXT NOT NULL        -- JSON string[]
);

CREATE TABLE IF NOT EXISTS memo (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  version INTEGER NOT NULL,
  sections TEXT NOT NULL,           -- JSON
  recommendation TEXT NOT NULL,
  thesis_fit INTEGER NOT NULL,
  generated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS application_history (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES person(id),
  opportunity_id TEXT NOT NULL REFERENCES opportunity(id),
  applied_at TEXT NOT NULL,
  founder_score INTEGER NOT NULL,
  note TEXT
);
`;

export function getDb(dbPath: string = DEFAULT_DB_PATH): DB {
  if (dbPath !== ":memory:") mkdirSync(join(dbPath, ".."), { recursive: true });
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  // Idempotent migration: CREATE TABLE IF NOT EXISTS never alters an existing
  // table, so a DB file created before these columns existed needs them added.
  // Duplicate-column ALTER throws on a fresh DB (already has them) — caught.
  for (const col of ["analysis_status", "analysis_reason"]) {
    try {
      db.exec(`ALTER TABLE opportunity ADD COLUMN ${col} TEXT`);
    } catch {
      // column already present — expected on a schema-current DB.
    }
  }
  return db;
}

// ---- write helpers ----

export type PersonSeed = {
  id: string;
  name: string;
  emails?: string[];
  links?: { github?: string; linkedin?: string; twitter?: string };
  founderScore: number;
};

export function upsertPerson(db: DB, p: PersonSeed): void {
  const githubNorm = p.links?.github ? normalizeRepoUrl(p.links.github) : null;
  db.prepare(
    `INSERT INTO person (id, name, emails, links, github_url_norm, founder_score)
     VALUES (@id, @name, @emails, @links, @github_url_norm, @founder_score)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, emails=excluded.emails, links=excluded.links,
       github_url_norm=excluded.github_url_norm, founder_score=excluded.founder_score`,
  ).run({
    id: p.id,
    name: p.name,
    emails: JSON.stringify(p.emails ?? []),
    links: JSON.stringify(p.links ?? {}),
    github_url_norm: githubNorm,
    founder_score: p.founderScore,
  });
}

export type OpportunitySeed = {
  id: string;
  personId: string;
  companyName: string;
  deckPath?: string;
  graphPath?: string;
  repoUrl?: string;
  source: "inbound" | "outbound";
  sourceChannel?: string;
  status: string;
  sector: string;
  stage: string;
  geo: string;
  askAmountCents: number;
  whySurfaced?: string;
  visible?: boolean;
  createdAt: string;
  updatedAt: string;
};

// Dedup rule (plan §5): same normalized repo URL -> same Opportunity.
// Returns the id of the row that now holds this repo (existing one on a match,
// otherwise the provided id). Idempotent: re-running the seed updates in place.
export function upsertOpportunityByRepo(db: DB, o: OpportunitySeed): string {
  const norm = o.repoUrl ? normalizeRepoUrl(o.repoUrl) : null;
  const existing = norm
    ? (db.prepare("SELECT id FROM opportunity WHERE repo_url_norm = ?").get(norm) as
        | { id: string }
        | undefined)
    : undefined;
  const id = existing?.id ?? o.id;
  db.prepare(
    `INSERT INTO opportunity (id, person_id, company_name, deck_path, graph_path, repo_url,
       repo_url_norm, source, source_channel, status, sector, stage, geo, ask_amount_cents,
       why_surfaced, visible, created_at, updated_at)
     VALUES (@id, @person_id, @company_name, @deck_path, @graph_path, @repo_url,
       @repo_url_norm, @source, @source_channel, @status, @sector, @stage, @geo, @ask_amount_cents,
       @why_surfaced, @visible, @created_at, @updated_at)
     ON CONFLICT(id) DO UPDATE SET
       person_id=excluded.person_id, company_name=excluded.company_name, deck_path=excluded.deck_path,
       graph_path=excluded.graph_path, repo_url=excluded.repo_url, repo_url_norm=excluded.repo_url_norm,
       source=excluded.source, source_channel=excluded.source_channel, status=excluded.status,
       sector=excluded.sector, stage=excluded.stage, geo=excluded.geo,
       ask_amount_cents=excluded.ask_amount_cents, why_surfaced=excluded.why_surfaced,
       visible=excluded.visible, updated_at=excluded.updated_at`,
  ).run({
    id,
    person_id: o.personId,
    company_name: o.companyName,
    deck_path: o.deckPath ?? null,
    graph_path: o.graphPath ?? null,
    repo_url: o.repoUrl ?? null,
    repo_url_norm: norm,
    source: o.source,
    source_channel: o.sourceChannel ?? null,
    status: o.status,
    sector: o.sector,
    stage: o.stage,
    geo: o.geo,
    ask_amount_cents: o.askAmountCents,
    why_surfaced: o.whySurfaced ?? null,
    visible: o.visible === false ? 0 : 1,
    created_at: o.createdAt,
    updated_at: o.updatedAt,
  });
  return id;
}

export function upsertScreeningFacts(
  db: DB,
  opportunityId: string,
  facts: Record<string, unknown>,
  unknowns: string[],
): void {
  db.prepare(
    `INSERT INTO screening_facts (opportunity_id, facts, unknowns)
     VALUES (?, ?, ?)
     ON CONFLICT(opportunity_id) DO UPDATE SET facts=excluded.facts, unknowns=excluded.unknowns`,
  ).run(opportunityId, JSON.stringify(facts), JSON.stringify(unknowns));
}

export type EvidenceSeed = {
  id: string;
  opportunityId: string;
  artifactId?: string;
  locator: string;
  excerpt: string;
  kind?: string;
};

export function upsertEvidence(db: DB, e: EvidenceSeed): void {
  db.prepare(
    `INSERT INTO evidence (id, opportunity_id, artifact_id, locator, excerpt, kind)
     VALUES (@id, @opportunity_id, @artifact_id, @locator, @excerpt, @kind)
     ON CONFLICT(id) DO UPDATE SET
       opportunity_id=excluded.opportunity_id, artifact_id=excluded.artifact_id,
       locator=excluded.locator, excerpt=excluded.excerpt, kind=excluded.kind`,
  ).run({
    id: e.id,
    opportunity_id: e.opportunityId,
    artifact_id: e.artifactId ?? null,
    locator: e.locator,
    excerpt: e.excerpt,
    kind: e.kind ?? null,
  });
}

export type ApplicationHistorySeed = {
  id: string;
  personId: string;
  opportunityId: string;
  appliedAt: string;
  founderScore: number;
  note?: string;
};

export function upsertApplicationHistory(db: DB, h: ApplicationHistorySeed): void {
  db.prepare(
    `INSERT INTO application_history (id, person_id, opportunity_id, applied_at, founder_score, note)
     VALUES (@id, @person_id, @opportunity_id, @applied_at, @founder_score, @note)
     ON CONFLICT(id) DO UPDATE SET
       person_id=excluded.person_id, opportunity_id=excluded.opportunity_id,
       applied_at=excluded.applied_at, founder_score=excluded.founder_score, note=excluded.note`,
  ).run({
    id: h.id,
    person_id: h.personId,
    opportunity_id: h.opportunityId,
    applied_at: h.appliedAt,
    founder_score: h.founderScore,
    note: h.note ?? null,
  });
}

// R7 scan replay: flip an opportunity's visibility (PipeWarden pops into Outbound).
export function setOpportunityVisible(db: DB, opportunityId: string, visible: boolean): void {
  db.prepare("UPDATE opportunity SET visible = ? WHERE id = ?").run(visible ? 1 : 0, opportunityId);
}

// Async /apply analysis lifecycle. 'analyzing' on submit, then the background job
// flips to 'ready' (real graph/axes/memo persisted) or 'analysis_unavailable' with an
// honest reason (no ANTHROPIC_API_KEY, clone failure, LLM failure). Never fabricates.
export type AnalysisStatus = "analyzing" | "ready" | "analysis_unavailable";

export function setAnalysisStatus(
  db: DB,
  opportunityId: string,
  status: AnalysisStatus,
  reason: string | null = null,
): void {
  db.prepare(
    "UPDATE opportunity SET analysis_status = ?, analysis_reason = ?, updated_at = ? WHERE id = ?",
  ).run(status, reason, new Date().toISOString(), opportunityId);
}

export function getAnalysisStatus(
  db: DB,
  opportunityId: string,
): { status: AnalysisStatus | null; reason: string | null } | null {
  const row = db
    .prepare("SELECT analysis_status, analysis_reason FROM opportunity WHERE id = ?")
    .get(opportunityId) as { analysis_status: string | null; analysis_reason: string | null } | undefined;
  if (!row) return null;
  return {
    status: (row.analysis_status as AnalysisStatus | null) ?? null,
    reason: row.analysis_reason ?? null,
  };
}

// ---- read helpers (pipeline page) ----

export function getThesis(db: DB, id = "thesis-default"): ThesisView & { id: string; name: string } {
  const row = db.prepare("SELECT * FROM thesis WHERE id = ?").get(id) as
    | Record<string, unknown>
    | undefined;
  if (!row) throw new Error(`thesis ${id} not found — run the seed first`);
  return {
    id: row.id as string,
    name: row.name as string,
    sectors: JSON.parse(row.sectors as string),
    stages: JSON.parse(row.stages as string),
    geos: JSON.parse(row.geos as string),
    checkSizeMinCents: row.check_size_min_cents as number,
    checkSizeMaxCents: row.check_size_max_cents as number,
    technicalBar: row.technical_bar as number,
  };
}

export type OpportunityCard = {
  id: string;
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
  whySurfacedEvidence: { locator: string; excerpt: string } | null;
  history: { appliedAt: string; founderScore: number; note: string | null }[];
  analysisStatus: string | null;
  analysisReason: string | null;
  fit: FitResult;
};

export function getOpportunityCards(db: DB, thesis: ThesisView): OpportunityCard[] {
  const rows = db
    .prepare(
      `SELECT o.*, p.name AS person_name, p.founder_score AS founder_score
       FROM opportunity o JOIN person p ON p.id = o.person_id
       WHERE o.visible = 1
       ORDER BY p.founder_score DESC, o.company_name ASC`,
    )
    .all() as Record<string, unknown>[];

  const evStmt = db.prepare(
    "SELECT locator, excerpt FROM evidence WHERE opportunity_id = ? AND kind = 'why_surfaced' LIMIT 1",
  );
  const histStmt = db.prepare(
    "SELECT applied_at, founder_score, note FROM application_history WHERE opportunity_id = ? ORDER BY applied_at ASC",
  );

  return rows.map((r) => {
    const opp = {
      sector: r.sector as string,
      stage: r.stage as string,
      geo: r.geo as string,
      askAmountCents: r.ask_amount_cents as number,
    };
    const ev = evStmt.get(r.id) as { locator: string; excerpt: string } | undefined;
    const hist = histStmt.all(r.id) as {
      applied_at: string;
      founder_score: number;
      note: string | null;
    }[];
    return {
      id: r.id as string,
      companyName: r.company_name as string,
      personName: r.person_name as string,
      founderScore: r.founder_score as number,
      source: r.source as "inbound" | "outbound",
      sourceChannel: (r.source_channel as string) ?? null,
      status: r.status as string,
      sector: opp.sector,
      stage: opp.stage,
      geo: opp.geo,
      askAmountCents: opp.askAmountCents,
      whySurfaced: (r.why_surfaced as string) ?? null,
      whySurfacedEvidence: ev ?? null,
      history: hist.map((h) => ({
        appliedAt: h.applied_at,
        founderScore: h.founder_score,
        note: h.note,
      })),
      analysisStatus: (r.analysis_status as string) ?? null,
      analysisReason: (r.analysis_reason as string) ?? null,
      fit: evaluateThesisFit(opp, thesis),
    };
  });
}
