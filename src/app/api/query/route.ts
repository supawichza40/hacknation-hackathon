// R1 natural-language query API (VC-BRAIN-PLAN.md §7 M4). Deterministic intent parse over
// the seeded founders' structured facts runs first; a free-form question with no known
// intent optionally falls through to a best-effort Anthropic API pass. Every match carries a
// citation. Empty -> "No cited matches". The base pipeline is never mutated.
import { NextResponse } from "next/server";
import { getDb, getThesis, getOpportunityCards } from "@/lib/db";
import { runDeterministicQuery, runLlmQuery } from "@/lib/query";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { query?: string; allowLlm?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }
  const query = (body.query ?? "").trim();
  if (!query) {
    return NextResponse.json({ error: "query is required" }, { status: 400 });
  }

  const db = getDb();
  try {
    const thesis = getThesis(db);
    const cards = getOpportunityCards(db, thesis);
    let result = runDeterministicQuery(query, cards);
    if (!result && body.allowLlm) {
      result = await runLlmQuery(query, cards);
    }
    if (!result) {
      result = { query, intent: null, usedLlm: false, matches: [] };
    }
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  } finally {
    db.close();
  }
}
