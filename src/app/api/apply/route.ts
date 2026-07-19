// Public inbound application (VC-BRAIN-PLAN.md §8 /api/apply, screen map §5.4).
// Validates a minimal founder form and creates (or dedups to) an inbound
// Opportunity. Unauthenticated by design — this is the public founder entry point.
// Errors return generic messages (never a raw DB error — red-team N-1 discipline).
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  validateApplyInput,
  applyOpportunity,
  validateGithubRepoUrl,
  spawnApplyAnalysis,
  applySlug,
} from "@/lib/apply";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
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
    const result = applyOpportunity(db, parsed.value);
    // Kick off the REAL analysis pipeline out-of-process and return immediately — the
    // clone + live LLM take minutes and must not block the request (PREFLIGHT decision
    // 3). The opportunity is already persisted with analysis_status = "analyzing"; the
    // job flips it to ready/analysis_unavailable and the UI polls /api/apply/status.
    const gh = validateGithubRepoUrl(parsed.value.repoUrl);
    if (gh.ok) spawnApplyAnalysis(result.opportunityId, gh.cloneUrl, applySlug(result.opportunityId));
    return NextResponse.json(
      {
        ok: true,
        opportunityId: result.opportunityId,
        deduped: result.deduped,
        analysisStatus: "analyzing",
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
