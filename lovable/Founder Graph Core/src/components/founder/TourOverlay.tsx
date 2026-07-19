import type { GraphNode } from "./GraphCanvas";

type Step = { order: number; nodeId: string; caption: string };

type Props = {
  steps: Step[];
  index: number;
  nodes: GraphNode[];
  onPrev: () => void;
  onNext: () => void;
  onExit: () => void;
};

export function TourOverlay({ steps, index, nodes, onPrev, onNext, onExit }: Props) {
  const step = steps[index];
  const node = nodes.find((n) => n.id === step.nodeId);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center px-4 pt-3">
      <div className="pointer-events-auto flex w-full max-w-[720px] items-center gap-3 rounded-md border border-border bg-surface px-3 py-2 shadow-sm">
        <span className="mono rounded-md bg-[color:var(--accent)]/10 px-1.5 py-0.5 text-[11px] text-[color:var(--accent)]">
          {String(step.order).padStart(2, "0")}/{String(steps.length).padStart(2, "0")}
        </span>
        <div className="flex-1 text-[13px] text-foreground">
          <span className="font-medium">{node?.name ?? step.nodeId}</span>
          <span className="mx-2 text-border">·</span>
          <span className="text-muted-foreground">{step.caption}</span>
        </div>
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="rounded-md border border-border px-2 py-1 text-[12px] text-foreground hover:border-[color:var(--accent)] disabled:opacity-30"
        >
          prev
        </button>
        <button
          onClick={onNext}
          disabled={index === steps.length - 1}
          className="rounded-md border border-border px-2 py-1 text-[12px] text-foreground hover:border-[color:var(--accent)] disabled:opacity-30"
        >
          next
        </button>
        <button
          onClick={onExit}
          className="rounded-md bg-foreground px-2 py-1 text-[12px] text-white hover:opacity-90"
        >
          exit tour
        </button>
      </div>
    </div>
  );
}
