"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type KGNode = {
  id: string;
  type: "file" | "concept" | "claim";
  name: string;
  summary: string;
  sourceRef: { file: string; lines: string };
};
type KGEdge = { source: string; target: string; relation: string };
export type KnowledgeGraph = { nodes: KGNode[]; edges: KGEdge[] };

const COLORS: Record<KGNode["type"], string> = {
  file: "#2563eb",
  concept: "#7c3aed",
  claim: "#059669",
};
const COLUMN: Record<KGNode["type"], number> = { file: 0, concept: 1, claim: 2 };

export default function GraphClient({ graph }: { graph: KnowledgeGraph }) {
  const { nodes, edges } = useMemo(() => {
    const counters: Record<string, number> = { file: 0, concept: 0, claim: 0 };
    const rfNodes: Node[] = graph.nodes.map((n) => {
      const row = counters[n.type]++;
      return {
        id: n.id,
        position: { x: COLUMN[n.type] * 360, y: row * 90 },
        data: { label: n.name },
        style: {
          background: COLORS[n.type],
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: 8,
          fontSize: 12,
          width: 260,
        },
        title: n.summary,
      } as Node;
    });
    const ids = new Set(graph.nodes.map((n) => n.id));
    const rfEdges: Edge[] = graph.edges
      .filter((e) => ids.has(e.source) && ids.has(e.target))
      .map((e, i) => ({
        id: `e${i}`,
        source: e.source,
        target: e.target,
        label: e.relation,
        style: { stroke: "#94a3b8" },
        labelStyle: { fontSize: 10, fill: "var(--muted)" },
      }));
    return { nodes: rfNodes, edges: rfEdges };
  }, [graph]);

  return (
    <div style={{ height: "70vh", border: "1px solid var(--border, #333)", borderRadius: 8 }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}
