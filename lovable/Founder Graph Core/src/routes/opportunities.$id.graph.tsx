import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { InvestorShell } from "@/components/founder/InvestorShell";
import { PageHeader } from "@/components/founder/PageHeader";
import { GraphCanvas, type GraphNode, type GraphEdge } from "@/components/founder/GraphCanvas";
import { NodeDrawer } from "@/components/founder/NodeDrawer";
import { ChatPanel } from "@/components/founder/ChatPanel";
import { TourOverlay } from "@/components/founder/TourOverlay";
import { useDevStates } from "@/lib/dev-state";
import graphData from "@/data/graph-ecc.json";
import tourData from "@/data/tour-ecc.json";

const STATES = [
  { id: "loading", label: "loading" },
  { id: "ready", label: "ready · no selection" },
  { id: "node-selected", label: "node selected" },
  { id: "empty", label: "empty graph" },
  { id: "parse-error", label: "parse error" },
  { id: "chat-streaming", label: "chat streaming" },
  { id: "chat-cited", label: "chat cited" },
  { id: "chat-refuses", label: "chat refuses" },
  { id: "chat-unavailable", label: "chat unavailable (replay)" },
  { id: "source-missing", label: "source target missing" },
  { id: "tour-active", label: "tour active" },
];

export const Route = createFileRoute("/opportunities/$id/graph")({
  head: () => ({ meta: [{ title: "Graph — FounderGraph" }] }),
  component: GraphPage,
});

function GraphPage() {
  const { id } = Route.useParams();
  const state = useDevStates("graph", STATES, "ready");

  const allNodes = graphData.nodes as GraphNode[];
  const allEdges = graphData.edges as GraphEdge[];
  const tour = tourData as { order: number; nodeId: string; caption: string }[];

  const nodes = state === "empty" ? [] : allNodes;
  const edges = state === "empty" ? [] : allEdges;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const [prefill, setPrefill] = useState("");
  const [tourIdx, setTourIdx] = useState<number | null>(null);

  // Reset on state change to keep demo predictable.
  useEffect(() => {
    if (state === "node-selected") setSelectedId("claim-routing-latency");
    else if (state !== "tour-active") setSelectedId(state === "ready" ? null : selectedId);
    if (state === "tour-active") setTourIdx(0);
    else setTourIdx(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const dimmedExcept = useMemo(() => {
    if (tourIdx === null) return null;
    const nodeId = tour[tourIdx].nodeId;
    return new Set([nodeId]);
  }, [tourIdx, tour]);

  const activeFocusId = tourIdx !== null ? tour[tourIdx].nodeId : focusId;

  function handleSelect(nid: string) {
    if (state === "source-missing" && nid === "file-bench-readme") return; // handled below
    setSelectedId(nid);
    setFocusId(nid);
  }

  function handleCite(nid: string) {
    if (!nodes.find((n) => n.id === nid)) return;
    setSelectedId(nid);
    setFocusId(nid);
  }

  const showChatUnavailable = state === "chat-unavailable";
  const forceStreaming = state === "chat-streaming";
  const forceCited = state === "chat-cited";
  const forceRefuse = state === "chat-refuses";

  return (
    <InvestorShell>
      <PageHeader
        eyebrow="Knowledge graph"
        title={`ECC · ${id} graph`}
        right={
          <div className="flex items-center gap-2">
            <Link
              to="/opportunities/$id"
              params={{ id }}
              className="rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              ← back to diligence
            </Link>
            <button
              onClick={() => setTourIdx((t) => (t === null ? 0 : null))}
              className="rounded-md bg-[color:var(--accent)] px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90"
            >
              {tourIdx === null ? "▶ Start here tour" : "exit tour"}
            </button>
          </div>
        }
      />

      {/* Source status bar */}
      <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-1.5 text-[12px]">
        <span className="label-xs">Graph source</span>
        {state === "loading" ? (
          <span className="text-muted-foreground">
            <span className="mono">extracting</span> · replaying captured index from 2026-07-18…
          </span>
        ) : state === "parse-error" ? (
          <span className="text-[color:var(--negative)]">
            parse error — malformed edge referenced missing node <span className="mono">claim-xyz</span>
          </span>
        ) : state === "empty" ? (
          <span className="text-muted-foreground">
            no graph extracted yet — nothing to show
          </span>
        ) : (
          <span className="text-muted-foreground">
            <span className="mono text-foreground">40 nodes</span> · <span className="mono text-foreground">61 edges</span> · replay of 2026-07-18 index
          </span>
        )}
      </div>

      <div className="flex h-[640px] rounded-md border border-border bg-surface">
        <div className="relative flex-1">
          {state === "loading" ? (
            <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground">
              <span className="mono">extracting knowledge graph…</span>
            </div>
          ) : state === "parse-error" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <div className="mono text-[12px] text-[color:var(--negative)]">
                ParseError: edge e57 references unknown node "claim-xyz"
              </div>
              <div className="text-[12px] text-muted-foreground">
                Graph render halted — no partial state shown.
              </div>
            </div>
          ) : state === "empty" ? (
            <div className="flex h-full flex-col items-center justify-center gap-2">
              <div className="text-[13px] text-foreground">No graph extracted yet.</div>
              <div className="text-[12px] text-muted-foreground">
                Run extraction once artifacts arrive from the founder.
              </div>
            </div>
          ) : (
            <>
              <GraphCanvas
                nodes={nodes}
                edges={edges}
                selectedId={selectedId}
                focusId={activeFocusId}
                dimmedExcept={dimmedExcept}
                onSelect={handleSelect}
              />
              {tourIdx !== null ? (
                <TourOverlay
                  steps={tour}
                  index={tourIdx}
                  nodes={nodes}
                  onPrev={() => setTourIdx((t) => (t !== null && t > 0 ? t - 1 : t))}
                  onNext={() =>
                    setTourIdx((t) =>
                      t !== null && t < tour.length - 1 ? t + 1 : t,
                    )
                  }
                  onExit={() => setTourIdx(null)}
                />
              ) : null}
              {state === "source-missing" && selectedId === "file-bench-readme" ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-14 flex justify-center">
                  <div className="pointer-events-auto rounded-md border border-[color:var(--negative)]/40 bg-surface px-3 py-2 text-[12px] text-foreground shadow-sm">
                    <span className="text-[color:var(--negative)]">source target missing</span>
                    <span className="mx-2 text-border">·</span>
                    <span className="mono">bench/README.md:22-24</span> not resolvable in current snapshot
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>

        {selectedNode ? (
          <NodeDrawer
            node={selectedNode}
            onClose={() => setSelectedId(null)}
            onAsk={(prefillText) => setPrefill(prefillText)}
          />
        ) : null}

        <ChatPanel
          nodes={allNodes}
          unavailable={showChatUnavailable}
          forceStreaming={forceStreaming}
          forceCited={forceCited}
          forceRefuse={forceRefuse}
          prefill={prefill}
          onPrefillConsumed={() => setPrefill("")}
          onCite={handleCite}
        />
      </div>
    </InvestorShell>
  );
}
