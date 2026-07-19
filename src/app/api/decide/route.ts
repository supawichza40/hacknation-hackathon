// Decision API (VC-BRAIN-PLAN.md §7 M3, §12). POST writes an investor decision
// and returns the row read back from the DB — the success state is derived from
// that read-back, never defaulted (project law). No live external calls.
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { recordDecision, VERDICTS, type Verdict } from "@/lib/decision";
import { resolveOpportunityId } from "@/lib/diligence";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { slug?: string; opportunityId?: string; verdict?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const verdict = body.verdict as Verdict;
  if (!verdict || !VERDICTS.includes(verdict)) {
    return NextResponse.json(
      { error: "verdict must be one of invest | pass | more_info" },
      { status: 400 },
    );
  }
  const opportunityId =
    body.opportunityId ?? (body.slug ? resolveOpportunityId(body.slug) : undefined);
  if (!opportunityId) {
    return NextResponse.json({ error: "slug or opportunityId required" }, { status: 400 });
  }

  const db = getDb();
  try {
    const exists = db.prepare("SELECT 1 FROM opportunity WHERE id = ?").get(opportunityId);
    if (!exists) {
      return NextResponse.json({ error: `unknown opportunity ${opportunityId}` }, { status: 404 });
    }
    const decision = recordDecision(db, { opportunityId, verdict, note: body.note });
    return NextResponse.json({ ok: true, decision });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  } finally {
    db.close();
  }
}
