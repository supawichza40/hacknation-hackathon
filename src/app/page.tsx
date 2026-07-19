import { getDb, getThesis, getOpportunityCards } from "@/lib/db";
import PipelineBoard, { type CardData, type ThesisData } from "./PipelineBoard";

// Reads the SQLite file at request time, so a fresh seed shows without a rebuild.
export const dynamic = "force-dynamic";

export default function PipelinePage() {
  const db = getDb();
  const thesisRow = getThesis(db);
  const cards = getOpportunityCards(db, thesisRow);
  db.close();

  const thesis: ThesisData = {
    id: thesisRow.id,
    name: thesisRow.name,
    sectors: thesisRow.sectors,
    stages: thesisRow.stages,
    geos: thesisRow.geos,
    checkSizeMinCents: thesisRow.checkSizeMinCents,
    checkSizeMaxCents: thesisRow.checkSizeMaxCents,
    technicalBar: thesisRow.technicalBar,
  };

  const cardData: CardData[] = cards.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    personName: c.personName,
    founderScore: c.founderScore,
    source: c.source,
    sourceChannel: c.sourceChannel,
    status: c.status,
    sector: c.sector,
    stage: c.stage,
    geo: c.geo,
    askAmountCents: c.askAmountCents,
    whySurfaced: c.whySurfaced,
    whySurfacedEvidence: c.whySurfacedEvidence,
    history: c.history,
    analysisStatus: c.analysisStatus,
    analysisReason: c.analysisReason,
  }));

  return (
    <>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 4px" }}>Pipeline</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 20px" }}>
        Every card is memory-backed. Founder Scores persist across applications; the thesis lives in
        a drawer and re-scores the board live.
      </p>
      <PipelineBoard thesis={thesis} cards={cardData} />
    </>
  );
}
