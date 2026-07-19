import { useEffect, useRef, useState } from "react";
import type { GraphNode } from "./GraphCanvas";

type Props = {
  node: GraphNode | null;
  onClose: () => void;
  onAsk: (prefill: string) => void;
};

export function NodeDrawer({ node, onClose, onAsk }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [selection, setSelection] = useState<string>("");
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSelection("");
    setPillPos(null);
  }, [node?.id]);

  useEffect(() => {
    function onSelChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !contentRef.current) {
        setSelection("");
        setPillPos(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!contentRef.current.contains(range.commonAncestorContainer)) {
        setSelection("");
        setPillPos(null);
        return;
      }
      const text = sel.toString().trim();
      if (!text) {
        setSelection("");
        setPillPos(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      const wrap = contentRef.current.getBoundingClientRect();
      setSelection(text);
      setPillPos({ x: rect.left - wrap.left, y: rect.bottom - wrap.top + 4 });
    }
    document.addEventListener("selectionchange", onSelChange);
    return () => document.removeEventListener("selectionchange", onSelChange);
  }, []);

  if (!node) return null;

  const src = node.sourceRef;
  const srcLabel = [src.file, src.lines ? `:${src.lines}` : "", src.slide ? ` · slide ${src.slide}` : ""]
    .join("")
    .trim();

  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="label-xs">Node · {node.type}</span>
        <button
          onClick={onClose}
          className="text-[12px] text-muted-foreground hover:text-foreground"
        >
          close
        </button>
      </div>
      <div ref={contentRef} className="relative flex-1 overflow-y-auto px-4 py-3">
        <h3 className="text-[15px] font-semibold tracking-tight text-foreground">{node.name}</h3>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">{node.summary}</p>
        <div className="mt-4 rounded-md border border-border bg-[color:var(--bg)] px-3 py-2">
          <div className="label-xs mb-1">Source</div>
          <div className="mono text-[12px] text-foreground">{srcLabel}</div>
        </div>
        <div className="mt-3 text-[11px] text-muted-foreground">
          id <span className="mono">{node.id}</span>
        </div>

        {selection && pillPos ? (
          <button
            onClick={() => onAsk(`About "${selection}" — `)}
            className="absolute z-10 rounded-md border border-[color:var(--accent)] bg-surface px-2 py-1 text-[11px] text-[color:var(--accent)] shadow-sm hover:bg-[color:var(--accent)] hover:text-white"
            style={{ left: pillPos.x, top: pillPos.y }}
          >
            ask about selection
          </button>
        ) : null}
      </div>
      <div className="border-t border-border p-3">
        <button
          onClick={() => onAsk(`Tell me about ${node.name}. `)}
          className="w-full rounded-md bg-[color:var(--accent)] px-3 py-2 text-[13px] font-medium text-white hover:opacity-90"
        >
          Ask about this
        </button>
      </div>
    </aside>
  );
}
