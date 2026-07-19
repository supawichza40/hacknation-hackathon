// R7 Scan API — deterministic replay of the captured GitHub sourcing scan.
// POST replays data/replay/scan/ranking.json, flips PipeWarden visible in the DB
// so it pops into Outbound, and returns the replay view for the progress UI.
// No live GitHub call (VC-BRAIN-PLAN.md §0.5 R7).
import { NextResponse } from "next/server";
import { getDb, setOpportunityVisible } from "@/lib/db";
import { loadRanking, computeScanReplay } from "@/lib/scan";

export const dynamic = "force-dynamic";

export async function POST() {
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
    surfaced: {
      id: "opp-pipewarden",
      companyName: pw.company_name,
      founderScore: pw.founder_score,
      sourceChannel: pw.source_channel,
      score: replay.topScore,
    },
  });
}
