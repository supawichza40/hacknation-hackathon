// Public inbound application (VC-BRAIN-PLAN.md §8 /api/apply, screen map §5.4).
// Validates a minimal founder form and creates (or dedups to) an inbound
// Opportunity. Unauthenticated by design — this is the public founder entry point.
// Errors return generic messages (never a raw DB error — red-team N-1 discipline).
import { NextResponse } from "next/server";
import { getDb, getAnalysisStatus, setAnalysisStatus, type AnalysisStatus } from "@/lib/db";
import {
  validateApplyInput,
  applyOpportunity,
  validateGithubRepoUrl,
  spawnApplyAnalysis,
  applySlug,
  rateLimitAllow,
} from "@/lib/apply";

export const dynamic = "force-dynamic";

// Each new submission spawns a git clone + a live LLM call; both caps bound the burn
// from an unauthenticated endpoint (red-team 2026-07-19: HIGH).
const RATE_LIMIT = 5; // submissions per IP per window
const RATE_WINDOW_MS = 10 * 60 * 1000;
const MAX_CONCURRENT_ANALYSES = 2;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimitAllow(`apply:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json(
      { error: "too many applications from this address; try again in a few minutes" },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = validateApplyInput((body ?? {}) as Record<string, unknown>);
  if (!parsed.ok) {
    return NextResponse.json({ error: "validation", fields: parsed.fields }, { status: 400 });
  }

  const db = getDb();
  try {
    // Snapshot BEFORE the insert so the new row's own "analyzing" doesn't count
    // against itself.
    const inFlight = (
      db
        .prepare("SELECT COUNT(*) AS c FROM opportunity WHERE analysis_status = 'analyzing'")
        .get() as { c: number }
    ).c;

    const result = applyOpportunity(db, parsed.value);
    const gh = validateGithubRepoUrl(parsed.value.repoUrl);

    // Kick off the REAL analysis pipeline out-of-process and return immediately — the
    // clone + live LLM take minutes and must not block the request (PREFLIGHT decision
    // 3). The job flips analysis_status to ready/analysis_unavailable and the UI polls
    // /api/apply/status. A deduped re-submit never re-queues (cost guard, and it must
    // not clobber a seeded demo opportunity's artifacts).
    let analysisStatus: AnalysisStatus | null = "analyzing";
    if (result.deduped) {
      analysisStatus = getAnalysisStatus(db, result.opportunityId)?.status ?? null;
    } else if (!gh.ok) {
      analysisStatus = "analysis_unavailable";
      setAnalysisStatus(
        db,
        result.opportunityId,
        analysisStatus,
        "Live analysis currently supports public github.com repositories only.",
      );
    } else if (inFlight >= MAX_CONCURRENT_ANALYSES) {
      analysisStatus = "analysis_unavailable";
      setAnalysisStatus(
        db,
        result.opportunityId,
        analysisStatus,
        "Analysis capacity is full right now; please resubmit in a few minutes.",
      );
    } else {
      spawnApplyAnalysis(result.opportunityId, gh.cloneUrl, applySlug(result.opportunityId));
    }

    return NextResponse.json(
      {
        ok: true,
        opportunityId: result.opportunityId,
        deduped: result.deduped,
        analysisStatus,
        slug: applySlug(result.opportunityId),
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ error: "could not save application" }, { status: 500 });
  } finally {
    db.close();
  }
}
