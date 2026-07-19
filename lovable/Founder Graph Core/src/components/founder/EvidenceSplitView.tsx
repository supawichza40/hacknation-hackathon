import type { Claim } from "./ClaimsList";
import graph from "@/data/graph-ecc.json";

type GraphNode = { id: string; type: string; name: string; summary: string; sourceRef: any };

export function EvidenceSplitView({
  claim,
  onClose,
}: {
  claim: Claim | null;
  onClose: () => void;
}) {
  if (!claim) return null;
  const ref = claim.sourceRef;
  const deck = ref?.deckSlide;
  const repoRef = ref?.repo;
  const benchNode = (graph.nodes as GraphNode[]).find((n) => n.id === "file-bench-readme");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[92vh] w-[1120px] max-w-full flex-col overflow-hidden rounded-md border border-border bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border bg-[color:var(--color-muted)] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-[color:var(--negative)]/30 bg-[color:var(--negative)]/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--negative)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--negative)]" />
              Contradiction
            </span>
            <span className="text-[13px] text-foreground">{claim.text}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:bg-background hover:text-foreground"
          >
            close ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-2 divide-x divide-border overflow-hidden">
          {/* LEFT: Deck slide */}
          <div className="flex flex-col overflow-auto bg-[color:var(--bg)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-xs">Deck · slide <span className="mono normal-case tracking-normal">{deck?.slide ?? "?"}</span></span>
              <span className="mono text-[11px] text-muted-foreground">investor-deck.pdf</span>
            </div>
            <DeckSlideMock slideNumber={deck?.slide ?? 7} highlight={deck?.quote ?? ""} />
            <div className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-[12px]">
              <div className="label-xs mb-1">Founder said</div>
              <div className="text-foreground">
                “<span className="bg-[color:var(--warning)]/20 px-0.5">{deck?.quote}</span>”
              </div>
            </div>
          </div>

          {/* RIGHT: benchmark artifact */}
          <div className="flex flex-col overflow-auto bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="label-xs">Graph node · <span className="mono normal-case tracking-normal">{benchNode?.id}</span></span>
              <span className="mono text-[11px] text-muted-foreground">{repoRef?.file}:{repoRef?.lines}</span>
            </div>
            <BenchFileMock file={repoRef?.file ?? "bench/README.md"} highlightLine={repoRef?.quote ?? ""} />
            <div className="mt-3 rounded-md border border-border bg-[color:var(--negative)]/5 px-3 py-2 text-[12px]">
              <div className="label-xs mb-1 text-[color:var(--negative)]">Artifact says</div>
              <div className="text-foreground">
                “<span className="bg-[color:var(--negative)]/15 px-0.5">{repoRef?.quote}</span>”
              </div>
            </div>
            {benchNode ? (
              <div className="mt-3 text-[12px] text-muted-foreground">
                <span className="label-xs mr-1.5">Summary</span>
                {benchNode.summary}
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-[color:var(--color-muted)] px-4 py-2 text-[11px] text-muted-foreground">
          <div className="mono">
            deck slide {deck?.slide} · quote length {deck?.quote?.length ?? 0} chars
            <span className="mx-2">↔</span>
            {repoRef?.file}:{repoRef?.lines}
          </div>
          <div>Ask founder to reconcile before decision.</div>
        </div>
      </div>
    </div>
  );
}

function DeckSlideMock({ slideNumber, highlight }: { slideNumber: number; highlight: string }) {
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md border border-border bg-surface shadow-sm">
      {/* slide chrome */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>ECC · investor deck</span>
        <span className="mono normal-case tracking-normal">{slideNumber} / 12</span>
      </div>
      <div className="flex h-full flex-col justify-center px-8 pt-8">
        <div className="label-xs mb-3">Traction · performance</div>
        <div className="text-[22px] font-semibold leading-snug text-foreground">
          <span className="relative inline">
            <span className="relative z-10">{highlight}</span>
            <span className="absolute inset-x-0 bottom-0 -mb-0.5 h-[10px] bg-[color:var(--warning)]/25" />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3 text-[12px]">
          {[
            { k: "p50 routing", v: "< 100ms" },
            { k: "throughput", v: "12k req/s" },
            { k: "design partners", v: "3" },
          ].map((s) => (
            <div key={s.k} className="rounded-md border border-border bg-[color:var(--bg)] p-2">
              <div className="label-xs">{s.k}</div>
              <div className="mono text-[16px] font-semibold text-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BenchFileMock({ file, highlightLine }: { file: string; highlightLine: string }) {
  const lines = [
    { n: 18, t: "## Results" },
    { n: 19, t: "" },
    { n: 20, t: "Setup: 10k synthetic agent calls, 8 concurrent workers." },
    { n: 21, t: "" },
    { n: 22, t: "| p50   | p95   | p99   |" },
    { n: 23, t: "| ----- | ----- | ----- |" },
    { n: 24, t: `| 340ms | 812ms | 1.4s  |   # ${highlightLine}` },
    { n: 25, t: "" },
    { n: 26, t: "Numbers above are from `bench/run.ts` on M2 Pro." },
  ];
  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#0F0F14]">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/60">
        <span className="mono normal-case tracking-normal">{file}</span>
        <span>lines 18–26</span>
      </div>
      <pre className="mono overflow-x-auto p-3 text-[12px] leading-relaxed text-white/90">
        {lines.map((l) => {
          const hi = l.n >= 22 && l.n <= 24;
          return (
            <div
              key={l.n}
              className={hi ? "-mx-3 bg-[color:var(--negative)]/20 px-3" : ""}
            >
              <span className="inline-block w-8 select-none text-right text-white/40">{l.n}</span>
              <span className="ml-3">{l.t}</span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}
