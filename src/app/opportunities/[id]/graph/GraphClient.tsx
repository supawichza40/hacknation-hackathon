"use client";

import { useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
  type NodeMouseHandler,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { KGNode, KnowledgeGraph, Provenance, Tour } from "@/lib/graph/schema";

const COLORS: Record<KGNode["type"], string> = {
  file: "#2563eb",
  concept: "#7c3aed",
  claim: "#059669",
};
const COLUMN: Record<KGNode["type"], number> = { file: 0, concept: 1, claim: 2 };

export default function GraphClient({
  graph,
  provenance,
  tour,
  slug,
}: {
  graph: KnowledgeGraph;
  provenance: Provenance | null;
  tour: Tour | null;
  slug: string;
}) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  // Graph-grounded chat (M4). scope carries an optional prescope: a nodeId ("Ask about
  // this" on a node drawer) or selected text ("Ask about selection").
  const [chatScope, setChatScope] = useState<{ nodeId?: string; nodeName?: string; selection?: string } | null>(null);
  const [selection, setSelection] = useState<string>("");

  const captureSelection = () => {
    const t = typeof window !== "undefined" ? window.getSelection()?.toString().trim() ?? "" : "";
    setSelection(t.length >= 3 ? t : "");
  };

  const nodesById = useMemo(() => {
    const map = new Map<string, KGNode>();
    for (const n of graph.nodes) map.set(n.id, n);
    return map;
  }, [graph]);

  const { baseNodes, edges } = useMemo(() => {
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
    return { baseNodes: rfNodes, edges: rfEdges };
  }, [graph]);

  const currentTourNodeId =
    tourActive && tour ? (tour.steps[tourIndex]?.nodeId ?? null) : null;

  const nodes = useMemo(() => {
    if (!currentTourNodeId) return baseNodes;
    return baseNodes.map((n) => {
      const isCurrent = n.id === currentTourNodeId;
      return {
        ...n,
        style: {
          ...n.style,
          opacity: isCurrent ? 1 : 0.25,
          boxShadow: isCurrent ? "0 0 0 3px var(--accent)" : "none",
        },
      };
    });
  }, [baseNodes, currentTourNodeId]);

  const selectedNode = selectedNodeId ? (nodesById.get(selectedNodeId) ?? null) : null;

  const handleNodeClick: NodeMouseHandler = (_event, node) => {
    setSelectedNodeId(node.id);
  };

  const handlePaneClick = () => {
    setSelectedNodeId(null);
  };

  const startTour = () => {
    if (!tour || tour.steps.length === 0) return;
    setTourActive(true);
    setTourIndex(0);
    setSelectedNodeId(null);
  };
  const exitTour = () => setTourActive(false);
  const nextStep = () => {
    if (!tour) return;
    setTourIndex((i) => Math.min(i + 1, tour.steps.length - 1));
  };
  const prevStep = () => setTourIndex((i) => Math.max(i - 1, 0));

  return (
    <div>
      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          type="button"
          onClick={() => setReasoningOpen(true)}
          disabled={!provenance}
          style={toolbarButtonStyle(!provenance)}
        >
          Show reasoning
        </button>
        {!tourActive ? (
          <button
            type="button"
            onClick={startTour}
            disabled={!tour || tour.steps.length === 0}
            style={toolbarButtonStyle(!tour || tour.steps.length === 0)}
          >
            Start here
          </button>
        ) : (
          <button type="button" onClick={exitTour} style={toolbarButtonStyle(false)}>
            Exit tour
          </button>
        )}
        <button
          type="button"
          onClick={() => setChatScope({})}
          style={toolbarButtonStyle(false)}
        >
          Ask about this opportunity
        </button>
        {selection && (
          <button
            type="button"
            onClick={() => setChatScope({ selection })}
            style={{ ...toolbarButtonStyle(false), color: "var(--accent)", borderColor: "var(--accent)" }}
            title={selection}
          >
            Ask about selection ↗
          </button>
        )}
      </div>

      <div style={{ position: "relative" }} onMouseUp={captureSelection}>
        <div
          style={{
            height: "70vh",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={handleNodeClick}
            onPaneClick={handlePaneClick}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap pannable zoomable />
          </ReactFlow>
        </div>

        {tourActive && tour && tour.steps[tourIndex] && (
          <TourOverlay
            step={tour.steps[tourIndex]}
            index={tourIndex}
            total={tour.steps.length}
            onPrev={prevStep}
            onNext={nextStep}
            onExit={exitTour}
          />
        )}
      </div>

      {selectedNode && (
        <NodeDrawer
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onAsk={() => setChatScope({ nodeId: selectedNode.id, nodeName: selectedNode.name })}
        />
      )}
      {reasoningOpen && provenance && (
        <ReasoningDrawer provenance={provenance} onClose={() => setReasoningOpen(false)} />
      )}
      {chatScope && (
        <ChatDock
          slug={slug}
          scope={chatScope}
          nodesById={nodesById}
          onClose={() => setChatScope(null)}
        />
      )}
    </div>
  );
}

type ChatCitation = { nodeId: string; quote: string };

// Streams a graph-grounded answer from /api/chat (SSE), then renders node citations —
// or a clean refusal when nothing in the graph grounds the question (cite-or-refuse).
function ChatDock({
  slug,
  scope,
  nodesById,
  onClose,
}: {
  slug: string;
  scope: { nodeId?: string; nodeName?: string; selection?: string };
  nodesById: Map<string, KGNode>;
  onClose: () => void;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [citations, setCitations] = useState<ChatCitation[]>([]);
  const [mode, setMode] = useState<string | null>(null);
  const [refused, setRefused] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [asked, setAsked] = useState(false);

  const ask = async () => {
    const q = question.trim();
    if (!q || streaming) return;
    setStreaming(true);
    setAsked(true);
    setAnswer("");
    setCitations([]);
    setRefused(false);
    setMode(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, question: q, nodeId: scope.nodeId, selection: scope.selection }),
      });
      if (!res.ok || !res.body) throw new Error(`chat failed (${res.status})`);
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n");
        buf = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const evt = JSON.parse(line.slice(5).trim());
          if (evt.type === "meta") setMode(evt.mode);
          else if (evt.type === "token") setAnswer((a) => a + evt.text);
          else if (evt.type === "citations") {
            setCitations(evt.citations ?? []);
            setRefused(Boolean(evt.refused));
          }
        }
      }
    } catch (err) {
      setAnswer(err instanceof Error ? err.message : "chat failed");
      setRefused(true);
    } finally {
      setStreaming(false);
    }
  };

  const scopeLabel = scope.nodeId
    ? `scoped to node “${scope.nodeName ?? scope.nodeId}”`
    : scope.selection
      ? `scoped to selection “${scope.selection.slice(0, 60)}${scope.selection.length > 60 ? "…" : ""}”`
      : "whole opportunity";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        width: "min(480px, 96vw)",
        maxHeight: "70vh",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius) var(--radius) 0 0",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.14)",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <strong style={{ fontSize: "var(--text-section)" }}>Ask the graph</strong>
        <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>{scopeLabel}</span>
        <button
          type="button"
          onClick={onClose}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
        >
          Close ✕
        </button>
      </div>

      <div style={{ padding: "12px 16px", overflowY: "auto", flex: 1 }}>
        {!asked && (
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "var(--text-body)" }}>
            Answers are grounded only in this opportunity&apos;s knowledge graph, with node
            citations. Ungrounded questions are refused.
          </p>
        )}
        {asked && (
          <div>
            {mode === "replay" && (
              <div style={{ color: "var(--muted)", fontSize: "var(--text-label)", marginBottom: "6px" }}>
                Chat unavailable — replaying a captured rehearsed answer.
              </div>
            )}
            <p style={{ margin: "0 0 10px", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {answer}
              {streaming && <span style={{ color: "var(--muted)" }}>▍</span>}
            </p>
            {!streaming && !refused && citations.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <div
                  style={{
                    color: "var(--muted)",
                    fontSize: "var(--text-label)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Citations
                </div>
                {citations.map((c, i) => {
                  const node = nodesById.get(c.nodeId);
                  return (
                    <div
                      key={`${c.nodeId}-${i}`}
                      style={{
                        padding: "6px 10px",
                        border: "1px solid var(--border)",
                        borderLeft: "3px solid var(--accent)",
                        borderRadius: "var(--radius)",
                      }}
                    >
                      <span className="mono" style={{ color: "var(--accent)", fontSize: "var(--text-label)" }}>
                        {node ? node.name : c.nodeId}
                      </span>
                      <div style={{ color: "var(--muted)", fontSize: "var(--text-body)" }}>“{c.quote}”</div>
                    </div>
                  );
                })}
              </div>
            )}
            {!streaming && refused && (
              <div style={{ color: "var(--warning)", fontSize: "var(--text-body)" }}>
                No citable evidence in the graph — refused.
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask();
          }}
          placeholder="What does the routing layer actually do?"
          autoFocus
          style={{
            flex: 1,
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "8px 12px",
            font: "inherit",
            background: "var(--bg)",
          }}
        />
        <button
          type="button"
          onClick={ask}
          disabled={streaming}
          style={{
            background: streaming ? "var(--bg)" : "var(--accent)",
            color: streaming ? "var(--muted)" : "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "8px 16px",
            cursor: streaming ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {streaming ? "…" : "Ask"}
        </button>
      </div>
    </div>
  );
}

function toolbarButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    background: disabled ? "var(--bg)" : "var(--surface)",
    color: disabled ? "var(--muted)" : "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius)",
    padding: "6px 12px",
    fontSize: "var(--text-body)",
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const TYPE_LABEL: Record<KGNode["type"], string> = {
  file: "File",
  concept: "Concept",
  claim: "Claim",
};

function NodeDrawer({ node, onClose, onAsk }: { node: KGNode; onClose: () => void; onAsk: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,23,28,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "380px",
          maxWidth: "90vw",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <span
            style={{
              background: COLORS[node.type],
              color: "#fff",
              borderRadius: "999px",
              padding: "2px 10px",
              fontSize: "var(--text-label)",
              textTransform: "uppercase",
            }}
          >
            {TYPE_LABEL[node.type]}
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            Close ✕
          </button>
        </div>

        <h2 style={{ fontSize: "var(--text-section)", margin: "0 0 12px" }}>{node.name}</h2>

        <p style={{ margin: "0 0 20px", color: "var(--text)" }}>{node.summary}</p>

        <div
          style={{
            color: "var(--muted)",
            fontSize: "var(--text-label)",
            textTransform: "uppercase",
            marginBottom: "4px",
          }}
        >
          Source
        </div>
        <div className="mono" style={{ marginBottom: "24px" }}>
          {node.sourceRef.file}:{node.sourceRef.lines}
        </div>

        <button
          type="button"
          onClick={onAsk}
          style={{
            width: "100%",
            background: "var(--accent)",
            color: "#fff",
            border: "1px solid var(--accent)",
            borderRadius: "var(--radius)",
            padding: "8px 12px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Ask about this
        </button>
      </aside>
    </div>
  );
}

function ReasoningDrawer({
  provenance,
  onClose,
}: {
  provenance: Provenance;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,23,28,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "420px",
          maxWidth: "90vw",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "var(--text-section)", margin: 0 }}>Show reasoning</h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            Close ✕
          </button>
        </div>

        <Field label="Source" value={provenance.source} />
        {provenance.model && provenance.model.length > 0 && (
          <Field label="Model" value={provenance.model.join(", ")} mono />
        )}
        {provenance.promptVersion && (
          <Field label="Prompt version" value={provenance.promptVersion} mono />
        )}

        <div
          style={{
            color: "var(--muted)",
            fontSize: "var(--text-label)",
            textTransform: "uppercase",
            margin: "20px 0 8px",
          }}
        >
          Step timeline
        </div>

        {provenance.steps.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No step-level detail recorded for this artifact.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {provenance.steps.map((step, i) => (
              <div
                key={`${step.stage}-${i}`}
                style={{
                  paddingLeft: "12px",
                  borderLeft: "2px solid var(--accent)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{step.stage}</div>
                <div className="mono" style={{ color: "var(--muted)" }}>
                  {step.startedAt}
                </div>
                {step.model && (
                  <div className="mono" style={{ color: "var(--muted)" }}>
                    model: {step.model}
                  </div>
                )}
                {step.promptVersion && (
                  <div className="mono" style={{ color: "var(--muted)" }}>
                    prompt: {step.promptVersion}
                  </div>
                )}
                {step.note && (
                  <div style={{ color: "var(--text)", marginTop: "2px" }}>{step.note}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{ color: "var(--muted)", fontSize: "var(--text-label)", textTransform: "uppercase" }}
      >
        {label}
      </div>
      <div className={mono ? "mono" : undefined}>{value}</div>
    </div>
  );
}

function TourOverlay({
  step,
  index,
  total,
  onPrev,
  onNext,
  onExit,
}: {
  step: Tour["steps"][number];
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "12px 16px",
        width: "min(560px, 90%)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
        <span style={{ fontWeight: 600 }}>{step.name}</span>
        <span
          className="mono"
          style={{ marginLeft: "auto", color: "var(--muted)", fontSize: "var(--text-label)" }}
        >
          {index + 1} / {total}
        </span>
      </div>
      <p style={{ margin: "0 0 12px", color: "var(--text)" }}>{step.caption}</p>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          type="button"
          onClick={onPrev}
          disabled={index === 0}
          style={toolbarButtonStyle(index === 0)}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={index === total - 1}
          style={toolbarButtonStyle(index === total - 1)}
        >
          Next
        </button>
        <button type="button" onClick={onExit} style={{ ...toolbarButtonStyle(false), marginLeft: "auto" }}>
          Exit tour
        </button>
      </div>
    </div>
  );
}
