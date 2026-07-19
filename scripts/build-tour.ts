// R8 deterministic guided-tour builder (VC-BRAIN-PLAN.md §7 M2).
// Picks the highest-degree nodes spread across the three node types and writes a
// 7-step "Start here" tour. Deterministic: degree desc, id asc tiebreak, fixed
// round-robin across types — reruns on the same graph reproduce an identical tour.
// Usage: node scripts/build-tour.ts [slug]   (default slug: ecc)
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadGraph } from "../src/lib/graph/io.ts";
import { tourSchema, type KGNode, type Tour } from "../src/lib/graph/schema.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const STEP_COUNT = 7;
const TYPE_ORDER = ["file", "concept", "claim"] as const;

// One-sentence caption from a node summary: first sentence, whitespace-normalized.
function caption(n: KGNode): string {
  const s = n.summary.replace(/\s+/g, " ").trim();
  const end = s.search(/[.!?](\s|$)/);
  const sentence = end === -1 ? s : s.slice(0, end + 1);
  return sentence || n.name;
}

export function buildTour(slug: string): Tour {
  const graph = loadGraph(slug);
  if (!graph) throw new Error(`no graph for slug '${slug}'`);

  const degree = new Map<string, number>();
  for (const n of graph.nodes) degree.set(n.id, 0);
  for (const e of graph.edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }

  const byType = new Map<string, KGNode[]>();
  for (const t of TYPE_ORDER) {
    byType.set(
      t,
      graph.nodes
        .filter((n) => n.type === t)
        .sort((a, b) => (degree.get(b.id)! - degree.get(a.id)!) || (a.id < b.id ? -1 : 1)),
    );
  }

  // Round-robin across types (file, concept, claim) taking the next-highest each pass.
  const picked: KGNode[] = [];
  const cursors = new Map<string, number>(TYPE_ORDER.map((t) => [t, 0]));
  while (picked.length < STEP_COUNT) {
    let advanced = false;
    for (const t of TYPE_ORDER) {
      if (picked.length >= STEP_COUNT) break;
      const list = byType.get(t)!;
      const i = cursors.get(t)!;
      if (i < list.length) {
        picked.push(list[i]);
        cursors.set(t, i + 1);
        advanced = true;
      }
    }
    if (!advanced) break; // fewer than STEP_COUNT nodes total
  }

  const tour: Tour = {
    graphId: slug,
    steps: picked.map((n) => ({ nodeId: n.id, name: n.name, type: n.type, caption: caption(n) })),
  };
  return tourSchema.parse(tour);
}

function isMain(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const slug = process.argv[2] ?? "ecc";
  const tour = buildTour(slug);
  const out = join(ROOT, "data", "demo", "tours", `tour-${slug}.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(tour, null, 2) + "\n", "utf8");
  console.log(`Wrote ${tour.steps.length}-step tour for '${slug}' -> ${out}`);
  for (const s of tour.steps) console.log(`  [${s.type}] ${s.nodeId}: ${s.caption}`);
}
