// Public /apply intake (VC-BRAIN-PLAN.md §0.5 d9, §8 /api/apply, screen map §5.4).
// Turns a minimal founder application into an inbound Opportunity in the same
// model used for sourced founders, dedup'd by normalized repo URL (plan §5).
//
// SECURITY (project law, red-first): the deck is a URL STRING, never an uploaded
// file — so there is no filesystem write and zero path-traversal surface. repo
// and deck are validated as http(s) URLs and stored as bound parameters only.
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { join } from "node:path";
import type { DB } from "./db.ts";
import { upsertPerson, upsertOpportunityByRepo, setAnalysisStatus } from "./db.ts";
import { normalizeRepoUrl } from "./thesis.ts";

export const MAX_FIELD_LEN = 500;

export type ApplyInput = {
  companyName?: unknown;
  repoUrl?: unknown;
  deckUrl?: unknown;
  founderName?: unknown;
  links?: unknown;
};

export type ApplyFieldErrors = {
  companyName?: string;
  repoUrl?: string;
  deckUrl?: string;
};

export type ApplyValue = {
  companyName: string;
  repoUrl: string;
  deckUrl?: string;
  founderName?: string;
  links?: string;
};

export type ApplyValidation =
  | { ok: true; value: ApplyValue }
  | { ok: false; fields: ApplyFieldErrors };

function asText(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// SSRF / arbitrary-clone defense (PREFLIGHT risk, red-team gate): the submitted repo
// URL is attacker-controlled and feeds `git clone`. Accept ONLY the exact shape
// https://github.com/<owner>/<repo> — https scheme, exact github.com host, two clean
// path segments — and reject every other host/scheme, embedded credentials, ports,
// extra path, `..`, or shell metacharacters. The clone also uses an arg array (never a
// shell string), so a metacharacter could not inject anyway — this is defense in depth.
const GH_OWNER_RE = /^[A-Za-z0-9][A-Za-z0-9-]{0,38}$/;
const GH_REPO_RE = /^[A-Za-z0-9._-]{1,100}$/;
const SHELL_META_RE = /[\s`$;&|<>()\\'"*?!{}[\]~^]/;
const GH_HINT = "Enter a public GitHub repo URL (https://github.com/owner/repo).";

export type GithubRepoValidation =
  | { ok: true; cloneUrl: string; owner: string; repo: string }
  | { ok: false; error: string };

export function validateGithubRepoUrl(raw: unknown): GithubRepoValidation {
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return { ok: false, error: "A public GitHub repo URL is required." };
  if (s.length > MAX_FIELD_LEN) return { ok: false, error: "Repo URL is too long." };
  if (s.includes("..") || SHELL_META_RE.test(s)) return { ok: false, error: GH_HINT };

  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return { ok: false, error: GH_HINT };
  }
  // Exact host + scheme; no credentials, no port. Rejects http, git@, IPs,
  // 169.254.169.254, localhost, github.com.evil.com, and github.com:22.
  if (u.protocol !== "https:" || u.hostname !== "github.com" || u.port || u.username || u.password) {
    return { ok: false, error: "Only public GitHub repos are supported (https://github.com/owner/repo)." };
  }
  const parts = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
  if (parts.length !== 2) return { ok: false, error: GH_HINT };
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, "");
  if (!GH_OWNER_RE.test(owner) || !GH_REPO_RE.test(repo) || repo === "." || repo === "..") {
    return { ok: false, error: GH_HINT };
  }
  return { ok: true, cloneUrl: `https://github.com/${owner}/${repo}.git`, owner, repo };
}

// Field-level validation with entered values preserved by the caller. Company
// name and repo URL are required; deck URL is optional but must be a URL if given.
export function validateApplyInput(input: ApplyInput): ApplyValidation {
  const fields: ApplyFieldErrors = {};
  const companyName = asText(input.companyName);
  const repoUrl = asText(input.repoUrl);
  const deckUrl = asText(input.deckUrl);
  const founderName = asText(input.founderName);
  const links = asText(input.links);

  if (!companyName) fields.companyName = "Company name is required.";
  else if (companyName.length > MAX_FIELD_LEN) fields.companyName = "Company name is too long.";

  // Repo must be a public GitHub repo (the only shape the analysis job can clone).
  let repoCanonical = repoUrl;
  const gh = validateGithubRepoUrl(repoUrl);
  if (!gh.ok) fields.repoUrl = gh.error;
  else repoCanonical = `https://github.com/${gh.owner}/${gh.repo}`;

  if (deckUrl && (deckUrl.length > MAX_FIELD_LEN || !isHttpUrl(deckUrl))) {
    fields.deckUrl = "Enter a valid http(s) deck URL, or leave it blank.";
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: {
      companyName,
      repoUrl: repoCanonical,
      deckUrl: deckUrl || undefined,
      founderName: founderName || undefined,
      links: links || undefined,
    },
  };
}

export type ApplyResult = { opportunityId: string; deduped: boolean };

// Creates (or dedups to) an inbound Opportunity from a public application.
// Ids are derived deterministically from the normalized repo URL so a re-submit
// of the same repo updates one Person + Opportunity in place (no duplicate rows).
// Screening facts are unknown at intake — sector/stage/geo are "unknown", the ask
// is 0, and the founder score is a provisional pre-screen baseline (not a real,
// evidence-derived score). The card surfaces in the Inbound column, then follows
// the same diligence path as a sourced founder.
export function applyOpportunity(db: DB, value: ApplyValue): ApplyResult {
  const norm = normalizeRepoUrl(value.repoUrl);
  const hash = createHash("sha256").update(norm).digest("hex").slice(0, 8);
  const personId = `person-apply-${hash}`;
  const oppId = `opp-apply-${hash}`;

  const existing = db
    .prepare("SELECT id FROM opportunity WHERE repo_url_norm = ?")
    .get(norm) as { id: string } | undefined;

  upsertPerson(db, {
    id: personId,
    name: value.founderName || value.companyName,
    links: { github: value.repoUrl },
    founderScore: 50, // provisional — inbound applicant not yet screened
  });

  const now = new Date().toISOString();
  const opportunityId = upsertOpportunityByRepo(db, {
    id: oppId,
    personId,
    companyName: value.companyName,
    // Stored as a URL string (validated http(s)) — never used as a filesystem path.
    deckPath: value.deckUrl,
    repoUrl: value.repoUrl,
    source: "inbound",
    sourceChannel: "apply",
    status: "sourced",
    sector: "unknown",
    stage: "unknown",
    geo: "unknown",
    askAmountCents: 0,
    whySurfaced: "Inbound application via /apply",
    visible: true,
    createdAt: now,
    updatedAt: now,
  });

  // The submission is now queued for the async pipeline. The card/diligence page
  // show "analyzing…" until the background job flips this to ready/unavailable.
  setAnalysisStatus(db, opportunityId, "analyzing");

  return { opportunityId, deduped: existing !== undefined };
}

// Graph-slug for an apply opportunity — inverse of the diligence resolver's
// `opp-<slug>` fallback, so the persisted graph/claims/memo key lines up with the
// slug the diligence page loads from. (opp-apply-ab12 -> apply-ab12.)
export function applySlug(opportunityId: string): string {
  return opportunityId.replace(/^opp-/, "");
}

// Fire-and-forget the heavy analysis in a SEPARATE Node process. The pipeline touches
// graph/io-write.ts, which must never enter a route's module graph (its dynamic fs makes
// the bundler trace the whole project) — spawning a script by PATH (not import) keeps it
// out entirely. Job state lives in the DB (analysis_status), so the child updating it
// out-of-band is the whole point. Never awaited: /apply returns immediately (decision 3).
export function spawnApplyAnalysis(opportunityId: string, cloneUrl: string, slug: string): void {
  const script = join(process.cwd(), "scripts", "analyze-apply.ts");
  const child = spawn(
    process.execPath,
    [script, "--opp", opportunityId, "--repo", cloneUrl, "--slug", slug],
    { stdio: "ignore", env: process.env },
  );
  child.on("error", (err) => {
    console.error(`[apply] could not spawn analysis job for ${opportunityId}: ${err.message}`);
  });
  child.unref();
}
