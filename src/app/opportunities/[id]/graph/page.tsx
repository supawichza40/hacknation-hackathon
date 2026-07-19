import { loadGraph, loadProvenance, loadTour } from "@/lib/graph/io";
import GraphClient from "./GraphClient";

export default async function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const graph = loadGraph(id);

  if (!graph) {
    return (
      <section>
        <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
          Graph explorer — <span className="mono">{id}</span>
        </h1>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "var(--text-section)" }}>No graph available</p>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            No knowledge graph has been generated for this opportunity yet.
          </p>
        </div>
      </section>
    );
  }

  const provenance = loadProvenance(id);
  const tour = loadTour(id);

  return (
    <section>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
        Graph explorer — <span className="mono">{id}</span>
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 16px" }}>
        {graph.nodes.length} nodes, {graph.edges.length} edges.
      </p>
      <GraphClient graph={graph} provenance={provenance} tour={tour} slug={id} />
    </section>
  );
}
