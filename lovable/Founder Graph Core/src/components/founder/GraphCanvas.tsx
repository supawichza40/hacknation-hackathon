import { useEffect, useMemo, useRef, useState } from "react";

export type GraphNode = {
  id: string;
  type: "file" | "claim" | "concept";
  name: string;
  summary: string;
  sourceRef: { file: string; lines?: string; slide?: number };
};
export type GraphEdge = { id: string; source: string; target: string; kind?: string };

type Props = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  focusId: string | null;
  dimmedExcept: Set<string> | null;
  onSelect: (id: string) => void;
};

const TYPE_STYLE: Record<GraphNode["type"], { fill: string; stroke: string; label: string }> = {
  file: { fill: "#EEF2FF", stroke: "#4F46E5", label: "FILE" },
  claim: { fill: "#FEF3C7", stroke: "#B7791F", label: "CLAIM" },
  concept: { fill: "#ECFDF5", stroke: "#0F7B4D", label: "CONCEPT" },
};

const WORLD_W = 1100;
const WORLD_H = 860;

function layout(nodes: GraphNode[]) {
  const cols: Record<GraphNode["type"], { x: number; count: number }> = {
    file: { x: 160, count: 0 },
    claim: { x: 550, count: 0 },
    concept: { x: 940, count: 0 },
  };
  const groups: Record<string, GraphNode[]> = { file: [], claim: [], concept: [] };
  for (const n of nodes) groups[n.type].push(n);
  const positions: Record<string, { x: number; y: number }> = {};
  (Object.keys(groups) as GraphNode["type"][]).forEach((t) => {
    const list = groups[t];
    const gap = (WORLD_H - 80) / Math.max(list.length - 1, 1);
    list.forEach((n, i) => {
      positions[n.id] = { x: cols[t].x, y: 40 + i * gap };
    });
  });
  return positions;
}

export function GraphCanvas({ nodes, edges, selectedId, focusId, dimmedExcept, onSelect }: Props) {
  const positions = useMemo(() => layout(nodes), [nodes]);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ tx: 0, ty: 0, scale: 0.72 });
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Focus animation: pan so focus node is centered.
  useEffect(() => {
    if (!focusId || !positions[focusId] || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const p = positions[focusId];
    const scale = 0.95;
    setView({
      tx: rect.width / 2 - p.x * scale,
      ty: rect.height / 2 - p.y * scale,
      scale,
    });
  }, [focusId, positions]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setView((v) => {
      const scale = Math.min(1.6, Math.max(0.4, v.scale + delta));
      return { ...v, scale };
    });
  }
  function onMouseDown(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("[data-node]")) return;
    dragRef.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const d = dragRef.current;
    setView((v) => ({ ...v, tx: d.tx + (e.clientX - d.x), ty: d.ty + (e.clientY - d.y) }));
  }
  function onMouseUp() {
    dragRef.current = null;
  }

  return (
    <div
      ref={wrapRef}
      className="relative h-full w-full overflow-hidden bg-[color:var(--bg)]"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{
        backgroundImage:
          "radial-gradient(circle, #E4E4E9 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        cursor: dragRef.current ? "grabbing" : "grab",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ display: "block" }}
      >
        <g transform={`translate(${view.tx},${view.ty}) scale(${view.scale})`}>
          {edges.map((e) => {
            const a = positions[e.source];
            const b = positions[e.target];
            if (!a || !b) return null;
            const dim =
              dimmedExcept && !(dimmedExcept.has(e.source) && dimmedExcept.has(e.target));
            return (
              <line
                key={e.id}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#C7C7CE"
                strokeWidth={1}
                opacity={dim ? 0.15 : 0.55}
              />
            );
          })}
          {nodes.map((n) => {
            const p = positions[n.id];
            if (!p) return null;
            const style = TYPE_STYLE[n.type];
            const selected = selectedId === n.id;
            const focused = focusId === n.id;
            const dim = dimmedExcept && !dimmedExcept.has(n.id);
            const isContradiction = n.id === "claim-routing-latency" || n.id === "file-bench-readme";
            return (
              <g
                key={n.id}
                data-node
                transform={`translate(${p.x},${p.y})`}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onSelect(n.id);
                }}
                style={{ cursor: "pointer", opacity: dim ? 0.18 : 1 }}
              >
                <rect
                  x={-88}
                  y={-18}
                  width={176}
                  height={36}
                  rx={6}
                  fill={style.fill}
                  stroke={
                    focused
                      ? "#17171C"
                      : selected
                      ? "#4F46E5"
                      : isContradiction
                      ? "#C92A2A"
                      : style.stroke
                  }
                  strokeWidth={focused || selected ? 2 : 1}
                />
                <text
                  x={0}
                  y={-2}
                  textAnchor="middle"
                  fontFamily="Inter, system-ui, sans-serif"
                  fontSize={11}
                  fontWeight={500}
                  fill="#17171C"
                >
                  {n.name.length > 24 ? n.name.slice(0, 22) + "…" : n.name}
                </text>
                <text
                  x={0}
                  y={11}
                  textAnchor="middle"
                  fontFamily="JetBrains Mono, ui-monospace, monospace"
                  fontSize={8}
                  letterSpacing={1}
                  fill="#6E6E7A"
                >
                  {style.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md border border-border bg-surface p-1 shadow-sm">
        <button
          className="mono px-2 py-0.5 text-[12px] text-muted-foreground hover:text-foreground"
          onClick={() => setView((v) => ({ ...v, scale: Math.min(1.6, v.scale + 0.1) }))}
        >
          +
        </button>
        <span className="mono px-1 text-[11px] text-muted-foreground">
          {(view.scale * 100).toFixed(0)}%
        </span>
        <button
          className="mono px-2 py-0.5 text-[12px] text-muted-foreground hover:text-foreground"
          onClick={() => setView((v) => ({ ...v, scale: Math.max(0.4, v.scale - 0.1) }))}
        >
          −
        </button>
        <span className="mx-1 h-4 w-px bg-border" />
        <button
          className="px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground"
          onClick={() => setView({ tx: 0, ty: 0, scale: 0.72 })}
        >
          reset
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-3 left-3 flex items-center gap-3 rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px]">
        {(["file", "claim", "concept"] as const).map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: TYPE_STYLE[t].fill, border: `1px solid ${TYPE_STYLE[t].stroke}` }}
            />
            <span className="label-xs">{TYPE_STYLE[t].label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
