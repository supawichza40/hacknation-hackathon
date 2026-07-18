import { readFileSync } from "node:fs";
import { join } from "node:path";
import GraphClient, { type KnowledgeGraph } from "./GraphClient";

function loadGraph(): KnowledgeGraph {
  const p = join(process.cwd(), "data/demo/graphs/ecc/knowledge-graph.json");
  return JSON.parse(readFileSync(p, "utf8")) as KnowledgeGraph;
}

export default async function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const graph = loadGraph();
  return (
    <section>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
        Graph explorer — <span className="mono">{id}</span>
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>
        ECC knowledge graph — {graph.nodes.length} nodes, {graph.edges.length} edges
        (Wave-0 spike, real LLM extraction).
      </p>
      <GraphClient graph={graph} />
    </section>
  );
}
