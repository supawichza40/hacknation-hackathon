// The real /apply analysis job (VC-BRAIN-PLAN.md §7; PREFLIGHT decision 3, async).
// Clones a validated public GitHub repo and runs the SAME production pipeline the
// precompute scripts use — flatten → graph (analyzeRepo) → deterministic axes
// (computeAxisScores) → memo (generateMemo) — then persists graph/axes/memo to the
// data dirs + DB and flips the opportunity's analysis_status to "ready".
//
// HONESTY (project law "Real before mocked", "never fabricate"): with no
// ANTHROPIC_API_KEY, or on any clone/LLM failure, the status becomes
// "analysis_unavailable" with a real reason — never a stuck "analyzing" and never a
// fabricated score. analyzeRepo/generateMemo are called WITHOUT a fallback slug/path
// so a real submission can never be served another company's captured graph or memo.
//
// This module imports the heavy pipeline (which pulls graph/io-write.ts). It is run
// out-of-process by scripts/analyze-apply.ts and never imported by an app route, so
// that CLI-only write path stays out of every route bundle (io-write.ts contract).
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { getDb, setAnalysisStatus } from "./db.ts";
import { hasLiveLlm } from "./llm.ts";
import { analyzeRepo } from "./ingest/analyze.ts";
import { computeAxisScores } from "./scoring.ts";
import { generateMemo, saveMemo, type MemoInput } from "./memo.ts";

const NO_KEY_REASON =
  "Live analysis requires ANTHROPIC_API_KEY; this environment runs in replay/demo mode.";
const CLONE_TIMEOUT_MS = 120_000;

export type AnalysisOutcome = { status: "ready" | "analysis_unavailable"; reason: string | null };

export type RunApplyAnalysisOptions = {
  opportunityId: string;
  slug: string;
  cloneUrl: string; // MUST be a validated github clone URL (validateGithubRepoUrl)
  dbPath?: string; // defaults to the app DB; tests pass a temp file
  cloneTimeoutMs?: number;
};

type OppRow = {
  company_name: string;
  sector: string;
  stage: string;
  geo: string;
  repo_url: string | null;
  ask_amount_cents: number;
  founder_score: number;
};

// Shallow clone via an arg ARRAY (never a shell string) so a repo URL can't inject a
// command; --depth 1 --single-branch keeps it bounded; the spawn timeout kills a hang.
function cloneRepo(cloneUrl: string, dir: string, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("git", ["clone", "--depth", "1", "--single-branch", cloneUrl, dir], {
      stdio: "ignore",
      timeout: timeoutMs,
    });
    child.on("error", (err) => reject(new Error(`git clone could not start: ${err.message}`)));
    child.on("close", (code, signal) => {
      if (signal) reject(new Error(`git clone timed out or was killed (${signal})`));
      else if (code !== 0) reject(new Error(`git clone exited with code ${code}`));
      else resolve();
    });
  });
}

export async function runApplyAnalysis(opts: RunApplyAnalysisOptions): Promise<AnalysisOutcome> {
  const { opportunityId, slug, cloneUrl } = opts;
  const db = opts.dbPath ? getDb(opts.dbPath) : getDb();
  let tmpDir: string | null = null;
  try {
    const row = db
      .prepare(
        `SELECT o.company_name, o.sector, o.stage, o.geo, o.repo_url, o.ask_amount_cents,
                p.founder_score
         FROM opportunity o JOIN person p ON p.id = o.person_id
         WHERE o.id = ?`,
      )
      .get(opportunityId) as OppRow | undefined;
    if (!row) {
      // Nothing to update — the opportunity row is gone. Report, don't throw.
      return { status: "analysis_unavailable", reason: "opportunity not found" };
    }

    // No key → nothing real to run. Fail honestly and fast (no pointless clone).
    if (!hasLiveLlm()) {
      setAnalysisStatus(db, opportunityId, "analysis_unavailable", NO_KEY_REASON);
      return { status: "analysis_unavailable", reason: NO_KEY_REASON };
    }

    const source = row.repo_url ?? cloneUrl;

    // 1) Clone into a temp dir.
    tmpDir = mkdtempSync(join(tmpdir(), `apply-${slug}-`));
    const repoDir = join(tmpDir, "repo");
    await cloneRepo(cloneUrl, repoDir, opts.cloneTimeoutMs ?? CLONE_TIMEOUT_MS);

    // 2) Graph — bounded flatten (~80k chars, cost guard) → live LLM → validated graph.
    //    No fallbackSlug: a real submission must never be served a captured demo graph.
    const { graph } = await analyzeRepo({
      repoDir,
      slug,
      source,
      provenanceOut: `data/replay/apply/${slug}/provenance.json`,
    });
    const graphStats = { nodes: graph.nodes.length, edges: graph.edges.length };
    db.prepare("UPDATE opportunity SET graph_path = ? WHERE id = ?").run(
      `data/demo/graphs/${slug}/knowledge-graph.json`,
      opportunityId,
    );

    // 3) Axes — deterministic (no LLM). Claims are empty for a repo-only submission.
    const history = (
      db
        .prepare(
          "SELECT applied_at, founder_score FROM application_history WHERE opportunity_id = ? ORDER BY applied_at ASC",
        )
        .all(opportunityId) as { applied_at: string; founder_score: number }[]
    ).map((h) => ({ appliedAt: h.applied_at, founderScore: h.founder_score }));

    const axes = computeAxisScores({
      founderScore: row.founder_score,
      history,
      claims: [],
      graph: graphStats,
      unknowns: [],
    });
    const insAxis = db.prepare(
      `INSERT INTO axis_score (id, opportunity_id, axis, score, trend, rationale, evidence_ids)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET score=excluded.score, trend=excluded.trend,
         rationale=excluded.rationale, evidence_ids=excluded.evidence_ids`,
    );
    for (const a of axes) {
      insAxis.run(`axis-${opportunityId}-${a.axis}`, opportunityId, a.axis, a.score, a.trend, a.because, "[]");
    }

    // 4) Memo — one real LLM call, grounded in the axes + in-memory graph concepts.
    //    No fallbackMemoPath: honest failure over another company's memo.
    const input: MemoInput = {
      companyName: row.company_name,
      sector: row.sector,
      stage: row.stage,
      geo: row.geo,
      askLabel: `$${(row.ask_amount_cents / 100).toLocaleString("en-US")}`,
      facts: {},
      unknowns: [],
      claims: [],
      axes: axes.map((a) => ({ axis: a.axis, label: a.label, score: a.score, because: a.because, trend: a.trend })),
      graph: {
        nodes: graphStats.nodes,
        edges: graphStats.edges,
        concepts: graph.nodes.filter((n) => n.type === "concept").slice(0, 8).map((n) => n.name),
      },
      slideTitles: [],
    };
    const { memo, provenance } = await generateMemo({
      input,
      artifact: `memo:${slug}`,
      source,
    });
    saveMemo(slug, memo);
    db.prepare(
      `INSERT INTO memo (id, opportunity_id, version, sections, recommendation, thesis_fit, generated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET sections=excluded.sections, recommendation=excluded.recommendation,
         thesis_fit=excluded.thesis_fit, generated_at=excluded.generated_at`,
    ).run(
      `memo-${opportunityId}-v1`,
      opportunityId,
      1,
      JSON.stringify(memo.sections),
      memo.recommendation ?? "",
      axes.some((a) => a.axis === "founder") ? 1 : 0,
      provenance.isoTimestamp ?? new Date().toISOString(),
    );

    setAnalysisStatus(db, opportunityId, "ready", null);
    return { status: "ready", reason: null };
  } catch (err) {
    const reason = `Analysis could not complete: ${(err as Error).message.slice(0, 300)}`;
    try {
      setAnalysisStatus(db, opportunityId, "analysis_unavailable", reason);
    } catch {
      // The opportunity row may be gone; the outcome is still reported to the caller.
    }
    return { status: "analysis_unavailable", reason };
  } finally {
    if (tmpDir) {
      try {
        rmSync(tmpDir, { recursive: true, force: true });
      } catch {
        // best-effort temp cleanup
      }
    }
    db.close();
  }
}
