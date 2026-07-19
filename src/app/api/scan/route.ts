// R7 Scan API — deterministic replay of a captured sourcing scan.
// Two sources, same replay contract: 'github' (default) replays data/replay/scan/ and
// flips PipeWarden visible so it pops into Outbound; 'tavily' replays data/replay/tavily/
// (prize track "Best Use of Tavily") and surfaces an extracted company with a source badge.
// No live GitHub/Tavily call (VC-BRAIN-PLAN.md §0.5 R7 + Tavily beat).
import { NextResponse } from "next/server";
import { getDb, setOpportunityVisible } from "@/lib/db";
import { loadRanking, computeScanReplay } from "@/lib/scan";
import { loadTavilyCaptures, computeTavilyReplay } from "@/lib/tavily";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let source: "github" | "tavily" = "github";
  try {
    const body = await req.json();
    if (body?.source === "tavily") source = "tavily";
  } catch {
    // no body -> default github source (back-compat with the existing Scan button)
  }

  if (source === "tavily") {
    const replay = computeTavilyReplay(loadTavilyCaptures());
    return NextResponse.json(replay);
  }

  const replay = computeScanReplay(loadRanking());

  const db = getDb();
  setOpportunityVisible(db, "opp-pipewarden", true);
  const pw = db
    .prepare(
      `SELECT o.company_name, o.source_channel, p.founder_score
       FROM opportunity o JOIN person p ON p.id = o.person_id
       WHERE o.id = 'opp-pipewarden'`,
    )
    .get() as { company_name: string; source_channel: string | null; founder_score: number } | undefined;
  db.close();

  if (!pw) {
    return NextResponse.json({ error: "PipeWarden not seeded — run npm run seed" }, { status: 409 });
  }

  return NextResponse.json({
    ...replay,
    source: "github",
    surfaced: {
      id: "opp-pipewarden",
      companyName: pw.company_name,
      founderScore: pw.founder_score,
      sourceChannel: pw.source_channel,
      score: replay.topScore,
    },
  });
}
