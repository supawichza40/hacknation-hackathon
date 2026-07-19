// Generalized repo -> knowledge-graph ingest pipeline (VC-BRAIN-PLAN.md §7 M2).
// Pipeline: flatten bounded repo files -> `claude -p --output-format json`
// (prompt version ecc-kg-v2, derived from data/replay/spike/prompt.txt) -> zod
// validate -> ONE repair attempt -> fallback to a captured replay graph.
// Records honest provenance (real timestamps, model, cost) for the R5 reasoning drawer.
//
// NOTE: not called live for ECC (its graph is the Wave-0 spike). Used to precompute
// the Lattice-DB showcase graph once, offline.
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { callClaudeJson, MODEL } from "../llm.ts";
import { parseGraph, provenanceSchema, type KnowledgeGraph, type Provenance } from "../graph/schema.ts";
import { loadGraph } from "../graph/io.ts";
import { saveGraph } from "../graph/io-write.ts";

export const PROMPT_VERSION = "ecc-kg-v2";

const INCLUDE_EXT = new Set([
  ".md", ".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".c", ".h", ".cpp",
  ".java", ".rb", ".toml", ".json", ".yaml", ".yml", ".txt", ".sh",
]);
const SKIP_DIR = new Set([
  "node_modules", ".git", "dist", "build", "target", "vendor", ".next",
  "__pycache__", "test", "tests", "testdata", "fixtures", ".github",
]);
const PER_FILE_BYTES = 6_000;
const TOTAL_BYTES = 80_000;
const MAX_FILES = 32;

type FileEntry = { path: string; size: number; priority: number; text: string };

function walk(dir: string, root: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") && name !== ".env.example") continue;
    const full = join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      if (SKIP_DIR.has(name)) continue;
      walk(full, root, out);
    } else if (st.isFile() && INCLUDE_EXT.has(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
}

// Deterministic bounded flatten: README + manifest first, then shortest source
// files (denser signal per byte), capped per-file and in total.
export function flattenRepo(repoDir: string): { flattened: string; files: string[] } {
  const paths: string[] = [];
  walk(repoDir, repoDir, paths);
  const entries: FileEntry[] = paths.map((p) => {
    const rel = relative(repoDir, p);
    const base = rel.toLowerCase();
    let priority = 3;
    if (/^readme/i.test(base)) priority = 0;
    else if (/(package\.json|cargo\.toml|pyproject\.toml|go\.mod)$/.test(base)) priority = 1;
    else if (base.includes("src/") || base.includes("lib/")) priority = 2;
    const raw = readFileSync(p, "utf8");
    return { path: rel, size: raw.length, priority, text: raw.slice(0, PER_FILE_BYTES) };
  });
  entries.sort((a, b) => a.priority - b.priority || a.size - b.size || (a.path < b.path ? -1 : 1));

  const chosen: FileEntry[] = [];
  let total = 0;
  for (const e of entries) {
    if (chosen.length >= MAX_FILES || total + e.text.length > TOTAL_BYTES) continue;
    chosen.push(e);
    total += e.text.length;
  }
  const flattened = chosen
    .map((e) => `=== FILE: ${e.path} ===\n${e.text}`)
    .join("\n\n");
  return { flattened, files: chosen.map((e) => e.path) };
}

function buildPrompt(flattened: string, repoLabel: string, repairError?: string): string {
  const base = `You are a code-analysis engine. Read the flattened repository files below (delimited by === FILE: <path> === markers) and produce a KNOWLEDGE GRAPH of this codebase as STRICT JSON only (no prose, no markdown fences).

Target ~40 nodes. Schema EXACTLY:
{"nodes":[{"id":string,"type":"file"|"concept"|"claim","name":string,"summary":string,"sourceRef":{"file":string,"lines":string}}],"edges":[{"source":string,"target":string,"relation":string}]}

Rules: every node id is unique; every edge source/target must reference an existing node id; type is one of file|concept|claim; sourceRef.file is a real path from the markers below (for concept/claim nodes use the most relevant file); sourceRef.lines is a string like "1-40" or "n/a". Include a mix: ~15 file nodes for the most important files, ~15 concept nodes (architecture ideas, subsystems), ~10 claim nodes (verifiable assertions about what the code does). Edges express relations like defines, imports, implements, depends_on, supports, part_of. Output ONLY the JSON object.`;
  const repair = repairError
    ? `\n\nYOUR PREVIOUS OUTPUT FAILED VALIDATION with: ${repairError}\nReturn corrected STRICT JSON only, same schema, fixing that issue.`
    : "";
  return `${base}${repair}\n\n=== BEGIN REPOSITORY (repo: ${repoLabel}) ===\n\n${flattened}`;
}

function extractJson(result: string): unknown {
  let s = result.trim();
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) s = fence[1].trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
  return JSON.parse(s);
}

type ClaudeRun = { graphData: unknown; model: string | null; costUsd: number; durationMs: number };

// One live ingest call via the Anthropic API — returns the graph JSON as text, extracted
// into the same shape the pipeline expected from `claude -p`. costUsd is not tracked on the
// API path (0, not a fabricated figure); durationMs is measured locally.
async function runClaude(prompt: string): Promise<ClaudeRun> {
  const startedAt = Date.now();
  const raw = await callClaudeJson({ prompt });
  return {
    graphData: extractJson(raw),
    model: MODEL,
    costUsd: 0,
    durationMs: Date.now() - startedAt,
  };
}

export type AnalyzeOptions = {
  repoDir: string;
  slug: string; // graph slug (registry key), e.g. "lattice-db"
  source: string; // honest label of the real source repo
  provenanceOut: string; // path to write provenance.json (relative to cwd)
  fallbackSlug?: string; // captured replay graph to fall back to
};

export async function analyzeRepo(opts: AnalyzeOptions): Promise<{ graph: KnowledgeGraph; provenance: Provenance }> {
  const steps: Provenance["steps"] = [];
  const stamp = () => new Date().toISOString();

  steps.push({ stage: "flatten", startedAt: stamp(), note: `bounded flatten of ${opts.source}` });
  const { flattened, files } = flattenRepo(opts.repoDir);

  let graph: KnowledgeGraph | null = null;
  let model: string | null = null;
  let costUsd = 0;
  let durationMs = 0;

  steps.push({ stage: "llm-extract", startedAt: stamp(), promptVersion: PROMPT_VERSION, note: `${files.length} files -> claude -p` });
  let run: ClaudeRun;
  try {
    run = await runClaude(buildPrompt(flattened, opts.source));
    model = run.model;
    costUsd += run.costUsd;
    durationMs += run.durationMs;
    graph = parseGraph(run.graphData);
    steps.push({ stage: "validate", startedAt: stamp(), note: "zod schema passed" });
  } catch (firstErr) {
    const msg = (firstErr as Error).message.slice(0, 200);
    steps.push({ stage: "validate-failed", startedAt: stamp(), note: msg });
    // ONE repair attempt.
    try {
      steps.push({ stage: "repair", startedAt: stamp(), promptVersion: PROMPT_VERSION, note: "re-prompt with validation error" });
      const repair = await runClaude(buildPrompt(flattened, opts.source, msg));
      model = repair.model;
      costUsd += repair.costUsd;
      durationMs += repair.durationMs;
      graph = parseGraph(repair.graphData);
      steps.push({ stage: "validate", startedAt: stamp(), note: "zod schema passed after repair" });
    } catch (repairErr) {
      // Fallback to captured replay — never fabricate.
      const fb = opts.fallbackSlug ? loadGraph(opts.fallbackSlug) : null;
      if (!fb) {
        throw new Error(
          `analyze failed and no fallback available: ${(repairErr as Error).message.slice(0, 200)}`,
        );
      }
      graph = fb;
      steps.push({ stage: "fallback", startedAt: stamp(), note: `used captured replay graph '${opts.fallbackSlug}'` });
    }
  }

  const savedPath = saveGraph(opts.slug, graph);
  steps.push({ stage: "write", startedAt: stamp(), note: savedPath });

  const provenance: Provenance = provenanceSchema.parse({
    artifact: `graph:${opts.slug}`,
    source: opts.source,
    promptVersion: PROMPT_VERSION,
    model: model ? [model] : [],
    generator: "@anthropic-ai/sdk client.messages.create (ANTHROPIC_API_KEY)",
    isoTimestamp: new Date().toISOString(),
    durationMs,
    totalCostUsd: costUsd,
    steps,
  });
  mkdirSync(join(process.cwd(), opts.provenanceOut, ".."), { recursive: true });
  writeFileSync(
    join(process.cwd(), opts.provenanceOut),
    JSON.stringify(provenance, null, 2) + "\n",
    "utf8",
  );
  return { graph, provenance };
}
