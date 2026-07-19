// R7 sourcing-scan replay (VC-BRAIN-PLAN.md §7 M2). Deterministic: derives the
// replay view purely from the captured ranking (data/replay/scan/ranking.json,
// produced by scripts/scan-score.mjs against a fixed referenceTime). No live calls,
// no Date.now() — reruns reproduce an identical result.
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const SCAN_THRESHOLD = 0.5; // composite-score activation threshold
export const SCAN_TOP_N = 8;
export const SCAN_CAPTURED_AT = "2026-07-18";
export const SCAN_REPLAY_SOURCE = "data/replay/scan/ranking.json";

export type ScanStep = { rank: number; fullName: string; score: number; crossed: boolean };
export type ScanReplay = {
  capturedAt: string;
  replaySource: string;
  totalScanned: number;
  threshold: number;
  steps: ScanStep[];
  topScore: number;
};

type Ranking = {
  totalUnique?: number;
  ranking: { rank: number; fullName: string; score: number }[];
};

export function loadRanking(root: string = process.cwd()): Ranking {
  return JSON.parse(readFileSync(join(root, SCAN_REPLAY_SOURCE), "utf8")) as Ranking;
}

export function computeScanReplay(ranking: Ranking): ScanReplay {
  const rows = [...ranking.ranking].sort((a, b) => a.rank - b.rank);
  const steps: ScanStep[] = rows.slice(0, SCAN_TOP_N).map((r) => ({
    rank: r.rank,
    fullName: r.fullName,
    score: r.score,
    crossed: r.score >= SCAN_THRESHOLD,
  }));
  return {
    capturedAt: SCAN_CAPTURED_AT,
    replaySource: SCAN_REPLAY_SOURCE,
    totalScanned: ranking.totalUnique ?? rows.length,
    threshold: SCAN_THRESHOLD,
    steps,
    topScore: rows[0]?.score ?? 0,
  };
}
