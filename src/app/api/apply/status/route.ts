// Poll endpoint for the async /apply analysis job (PREFLIGHT decision 3). The client
// polls this after submitting until analysisStatus leaves "analyzing". State is read
// straight from the DB (the single source of truth for the job), so it survives a
// request timeout or process restart. Unauthenticated by design, like /api/apply.
import { NextResponse } from "next/server";
import { getDb, getAnalysisStatus } from "@/lib/db";
import { rateLimitAllow } from "@/lib/apply";

export const dynamic = "force-dynamic";

// Failure reasons persisted by the job can embed raw internal error text
// (clone/tmp-path/LLM detail). The full string stays in the DB for operators;
// the API returns the generic sentence (red-team 2026-07-19: LOW).
const INTERNAL_REASON_PREFIX = "Analysis could not complete:";

export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimitAllow(`apply-status:${ip}`, 60, 60_000)) {
    return NextResponse.json({ error: "too many requests" }, { status: 429 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const db = getDb();
  try {
    const found = getAnalysisStatus(db, id);
    if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      id,
      analysisStatus: found.status,
      analysisReason: found.reason?.startsWith(INTERNAL_REASON_PREFIX)
        ? "Analysis could not complete due to an internal error."
        : found.reason,
    });
  } catch {
    return NextResponse.json({ error: "could not read status" }, { status: 500 });
  } finally {
    db.close();
  }
}
