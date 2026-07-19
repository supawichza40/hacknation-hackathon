// Investment-memo writer (VC-BRAIN-PLAN.md §7 M4/M5b — LLM call #2 of the locked
// two-call architecture). Call #1 is the M2 graph/claims ingest; this is the memo.
// Pipeline mirrors src/lib/ingest/analyze.ts: build prompt over the screening facts +
// claims + axis scores + graph summary -> `claude -p --output-format json` -> zod
// validate + citation-grounding check -> ONE repair attempt -> fallback to captured
// replay. The narrative sections are LLM-written; the R6 gap rows are computed here in
// TS (never inferred by the model) so an undisclosed category can never gain a value.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { z } from "zod";
import { callClaudeJson, MODEL } from "./llm.ts";
import { provenanceSchema, type Provenance } from "./graph/schema.ts";

export const MEMO_PROMPT_VERSION = "vc-memo-v1";
export const GAP_NOTE = "Not disclosed — founder did not provide";

// Canonical diligence categories a memo is expected to cover. A category with no
// backing screening fact becomes an R6 gap row — honest, never back-filled.
const CANONICAL_CATEGORIES = [
  "Team",
  "Market size",
  "Traction",
  "Business model",
  "Financials (ARR)",
  "Cap table",
  "Competition",
] as const;

// ---- schema ----

export const memoCitationSchema = z.object({
  ref: z.string().min(1), // claim id (e.g. "c5") or an evidence locator (deck://…/slide/6, path:lines, url)
  quote: z.string().optional(),
});
export type MemoCitation = z.infer<typeof memoCitationSchema>;

export const memoSectionSchema = z.object({
  text: z.string().min(1),
  citations: z.array(memoCitationSchema),
});
export type MemoSection = z.infer<typeof memoSectionSchema>;

export const MEMO_SECTION_KEYS = ["thesisFit", "team", "market", "product", "risks"] as const;
export type MemoSectionKey = (typeof MEMO_SECTION_KEYS)[number];

export const memoSectionsSchema = z.object({
  thesisFit: memoSectionSchema,
  team: memoSectionSchema,
  market: memoSectionSchema,
  product: memoSectionSchema,
  risks: memoSectionSchema,
});

export const gapRowSchema = z.object({
  category: z.string().min(1),
  note: z.string().min(1),
});
export type GapRow = z.infer<typeof gapRowSchema>;

export const memoSchema = z.object({
  sections: memoSectionsSchema,
  gaps: z.array(gapRowSchema),
  recommendation: z.string().optional(),
});
export type Memo = z.infer<typeof memoSchema>;

export function parseMemo(data: unknown): Memo {
  return memoSchema.parse(data);
}
export function safeParseMemo(data: unknown) {
  return memoSchema.safeParse(data);
}

// ---- R6 gap generation (deterministic, NOT from the model) ----

export type FactEntry = { value: string; evidenceIds: string[] };

// A canonical category is "disclosed" when a screening fact key names it (root-word
// match) and carries evidence. Everything else — plus every explicit unknown — is a
// gap row with the fixed disclosure note. Deterministic: same facts -> same gaps.
export function computeGaps(
  facts: Record<string, FactEntry>,
  unknowns: string[],
): GapRow[] {
  const disclosed = Object.entries(facts)
    .filter(([, v]) => (v.evidenceIds?.length ?? 0) > 0)
    .map(([k]) => k.toLowerCase());

  const rows: GapRow[] = [];
  const seen = new Set<string>();
  const add = (category: string) => {
    const key = category.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ category, note: GAP_NOTE });
  };

  for (const cat of CANONICAL_CATEGORIES) {
    const root = cat.toLowerCase().split(" ")[0];
    const covered = disclosed.some((d) => d.includes(root) || root.includes(d));
    if (!covered) add(cat);
  }
  // Explicit screening unknowns always surface as gaps, mapped onto a canonical
  // label when one matches so we don't double-list (e.g. "ARR" -> Financials).
  for (const u of unknowns) {
    const uroot = u.toLowerCase().split(" ")[0];
    const canon = CANONICAL_CATEGORIES.find((c) => {
      const croot = c.toLowerCase();
      return croot.includes(uroot) || uroot.includes(croot.split(" ")[0]) || croot.includes(u.toLowerCase());
    });
    add(canon ?? u);
  }
  return rows;
}

// ---- prompt + model call ----

export type ClaimLite = { id: string; slideNo: number; status: string; text: string };
export type AxisLite = { axis: string; label: string; score: number; because: string; trend: string };

export type MemoInput = {
  companyName: string;
  sector: string;
  stage: string;
  geo: string;
  askLabel: string;
  facts: Record<string, FactEntry>;
  unknowns: string[];
  claims: ClaimLite[];
  axes: AxisLite[];
  graph: { nodes: number; edges: number; concepts: string[] };
  slideTitles: string[];
};

function buildPrompt(input: MemoInput, repairError?: string): string {
  const validRefs = input.claims.map((c) => c.id).join(", ");
  const base = `You are a venture-capital analyst writing a STRUCTURED INVESTMENT MEMO. Output STRICT JSON only (no prose, no markdown fences).

Schema EXACTLY:
{"sections":{"thesisFit":{"text":string,"citations":[{"ref":string,"quote":string}]},"team":{...},"market":{...},"product":{...},"risks":{...}},"recommendation":string}

Write ONE tight paragraph per section (thesisFit, team, market, product, risks). GROUND every material assertion in a citation: "ref" MUST be one of these claim ids [${validRefs}] or an evidence locator that appears in the inputs below. Do NOT invent numbers, traction, or partners — if a fact is absent, say it is undisclosed rather than estimating it. Note the one contradicted claim explicitly in "product" or "risks". "recommendation" is a one-line read (never a fabricated verdict). Do NOT include a "gaps" field — gaps are computed separately.

=== OPPORTUNITY ===
${input.companyName} · ${input.sector} · ${input.stage} · ${input.geo} · ask ${input.askLabel}

=== SCREENING FACTS (disclosed) ===
${Object.entries(input.facts).map(([k, v]) => `${k}: ${v.value} [${v.evidenceIds.join(",")}]`).join("\n") || "(none disclosed)"}

=== EXPLICIT UNKNOWNS ===
${input.unknowns.join(", ") || "(none listed)"}

=== DECK CLAIMS (id · slide · status · text) ===
${input.claims.map((c) => `${c.id} · s${c.slideNo} · ${c.status} · ${c.text}`).join("\n")}

=== DETERMINISTIC AXIS SCORES ===
${input.axes.map((a) => `${a.label}: ${a.score} (${a.trend}) — ${a.because}`).join("\n")}

=== KNOWLEDGE GRAPH ===
${input.graph.nodes} nodes / ${input.graph.edges} edges. Key concepts: ${input.graph.concepts.join(", ")}

=== DECK SLIDES ===
${input.slideTitles.join(" | ")}`;
  const repair = repairError
    ? `\n\nYOUR PREVIOUS OUTPUT FAILED VALIDATION with: ${repairError}\nReturn corrected STRICT JSON only, same schema, fixing that issue (especially: every citation ref must be a known claim id or a locator from the inputs).`
    : "";
  return `${base}${repair}`;
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

type ClaudeRun = { data: unknown; raw: string; model: string | null; costUsd: number; durationMs: number };

// One live memo call via the Anthropic API. The model returns the memo JSON as text; we
// extract + return it in the same shape the pipeline expected from `claude -p`. costUsd is
// not tracked on the API path (the SDK usage would have to be summed) — 0, honestly, rather
// than a fabricated figure; durationMs is measured locally.
async function runClaude(prompt: string): Promise<ClaudeRun> {
  const startedAt = Date.now();
  const raw = await callClaudeJson({ prompt });
  return {
    data: extractJson(raw),
    raw,
    model: MODEL,
    costUsd: 0,
    durationMs: Date.now() - startedAt,
  };
}

// Grounding check: every citation ref must be a known claim id or look like a locator
// (contains "://" or a "path:lines" colon). A memo that cites nothing real fails and
// triggers the one repair attempt.
function validateGrounding(memo: Memo, claimIds: Set<string>): void {
  for (const key of MEMO_SECTION_KEYS) {
    for (const c of memo.sections[key].citations) {
      const looksLocator = c.ref.includes("://") || /^[\w./-]+:\d/.test(c.ref);
      if (!claimIds.has(c.ref) && !looksLocator) {
        throw new Error(`section ${key} cites unknown ref "${c.ref}"`);
      }
    }
  }
}

export type GenerateResult = { memo: Memo; provenance: Provenance; raw: string; prompt: string };

export type GenerateOptions = {
  input: MemoInput;
  artifact: string; // e.g. "memo:ecc"
  source: string; // honest label of the real source
  fallbackMemoPath?: string; // committed memo.json to fall back to
};

// Generates the memo: LLM sections + TS-computed gaps. One repair, then fallback to a
// captured replay memo. Never fabricates — a hard failure with no fallback throws.
export async function generateMemo(opts: GenerateOptions): Promise<GenerateResult> {
  const { input } = opts;
  const claimIds = new Set(input.claims.map((c) => c.id));
  const gaps = computeGaps(input.facts, input.unknowns);
  const steps: Provenance["steps"] = [];
  const stamp = () => new Date().toISOString();

  let sections: Memo["sections"] | null = null;
  let recommendation: string | undefined;
  let model: string | null = null;
  let costUsd = 0;
  let durationMs = 0;
  let raw = "";
  const prompt = buildPrompt(input);

  steps.push({ stage: "assemble", startedAt: stamp(), note: `${input.claims.length} claims, ${input.axes.length} axes, ${gaps.length} gap rows` });
  steps.push({ stage: "llm-memo", startedAt: stamp(), promptVersion: MEMO_PROMPT_VERSION, note: "claude -p investment-memo writer" });

  try {
    const run = await runClaude(prompt);
    raw = run.raw;
    model = run.model;
    costUsd += run.costUsd;
    durationMs += run.durationMs;
    const parsed = parseMemo({ ...(run.data as object), gaps });
    validateGrounding(parsed, claimIds);
    sections = parsed.sections;
    recommendation = parsed.recommendation;
    steps.push({ stage: "validate", startedAt: stamp(), note: "zod + citation grounding passed" });
  } catch (firstErr) {
    const msg = (firstErr as Error).message.slice(0, 200);
    steps.push({ stage: "validate-failed", startedAt: stamp(), note: msg });
    try {
      steps.push({ stage: "repair", startedAt: stamp(), promptVersion: MEMO_PROMPT_VERSION, note: "re-prompt with validation error" });
      const run = await runClaude(buildPrompt(input, msg));
      raw = run.raw;
      model = run.model;
      costUsd += run.costUsd;
      durationMs += run.durationMs;
      const parsed = parseMemo({ ...(run.data as object), gaps });
      validateGrounding(parsed, claimIds);
      sections = parsed.sections;
      recommendation = parsed.recommendation;
      steps.push({ stage: "validate", startedAt: stamp(), note: "zod + grounding passed after repair" });
    } catch (repairErr) {
      const fb = opts.fallbackMemoPath && existsSync(opts.fallbackMemoPath)
        ? parseMemo(JSON.parse(readFileSync(opts.fallbackMemoPath, "utf8")))
        : null;
      if (!fb) {
        throw new Error(`memo generation failed and no fallback: ${(repairErr as Error).message.slice(0, 200)}`);
      }
      sections = fb.sections;
      recommendation = fb.recommendation;
      steps.push({ stage: "fallback", startedAt: stamp(), note: `used captured replay memo ${opts.fallbackMemoPath}` });
    }
  }

  const memo: Memo = { sections, gaps, recommendation };
  const provenance = provenanceSchema.parse({
    artifact: opts.artifact,
    source: opts.source,
    promptVersion: MEMO_PROMPT_VERSION,
    model: model ? [model] : [],
    generator: "@anthropic-ai/sdk client.messages.create (ANTHROPIC_API_KEY)",
    isoTimestamp: new Date().toISOString(),
    durationMs,
    totalCostUsd: costUsd,
    steps,
  });
  return { memo, provenance, raw, prompt };
}

// ---- committed-artifact load (runtime read path, replay-safe like claims) ----

const MEMO_REGISTRY: Record<string, string> = {
  ecc: "data/demo/memos/ecc/memo.json",
};

export function loadMemo(slug: string, root: string = process.cwd()): Memo | null {
  const rel = MEMO_REGISTRY[slug];
  if (!rel) return null;
  const p = join(root, rel);
  if (!existsSync(p)) return null;
  return parseMemo(JSON.parse(readFileSync(p, "utf8")));
}

export function saveMemo(slug: string, memo: Memo, root: string = process.cwd()): string {
  const rel = MEMO_REGISTRY[slug] ?? `data/demo/memos/${slug}/memo.json`;
  const p = join(root, rel);
  parseMemo(memo);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(memo, null, 2) + "\n", "utf8");
  return p;
}
