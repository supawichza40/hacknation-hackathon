// Public /apply intake (VC-BRAIN-PLAN.md §0.5 d9, §8 /api/apply, screen map §5.4).
// Turns a minimal founder application into an inbound Opportunity in the same
// model used for sourced founders, dedup'd by normalized repo URL (plan §5).
//
// SECURITY (project law, red-first): the deck is a URL STRING, never an uploaded
// file — so there is no filesystem write and zero path-traversal surface. repo
// and deck are validated as http(s) URLs and stored as bound parameters only.
import { createHash } from "node:crypto";
import type { DB } from "./db.ts";
import { upsertPerson, upsertOpportunityByRepo } from "./db.ts";
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

  if (!repoUrl) fields.repoUrl = "A public repo URL is required.";
  else if (repoUrl.length > MAX_FIELD_LEN) fields.repoUrl = "Repo URL is too long.";
  else if (!isHttpUrl(repoUrl)) fields.repoUrl = "Enter a valid http(s) URL.";

  if (deckUrl && (deckUrl.length > MAX_FIELD_LEN || !isHttpUrl(deckUrl))) {
    fields.deckUrl = "Enter a valid http(s) deck URL, or leave it blank.";
  }

  if (Object.keys(fields).length > 0) return { ok: false, fields };
  return {
    ok: true,
    value: {
      companyName,
      repoUrl,
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

  return { opportunityId, deduped: existing !== undefined };
}
