// Poll endpoint for the async /apply analysis job (PREFLIGHT decision 3). The client
// polls this after submitting until analysisStatus leaves "analyzing". State is read
// straight from the DB (the single source of truth for the job), so it survives a
// request timeout or process restart. Unauthenticated by design, like /api/apply.
import { NextResponse } from "next/server";
import { getDb, getAnalysisStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const db = getDb();
  try {
    const found = getAnalysisStatus(db, id);
    if (!found) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({
      id,
      analysisStatus: found.status,
      analysisReason: found.reason,
    });
  } catch {
    return NextResponse.json({ error: "could not read status" }, { status: 500 });
  } finally {
    db.close();
  }
}
