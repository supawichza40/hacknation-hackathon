import reasoning from "@/data/reasoning-ecc.json";

const STAGE_META: Record<string, { label: string; color: string }> = {
  ingest: { label: "Ingest", color: "var(--muted)" },
  extract: { label: "Extract", color: "var(--accent)" },
  verify: { label: "Verify", color: "var(--negative)" },
  score: { label: "Score", color: "var(--positive)" },
  memo: { label: "Memo", color: "var(--warning)" },
};

export function ReasoningTimeline({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-foreground/20" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-[460px] flex-col border-l border-border bg-surface shadow-xl animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <div className="label-xs">Reasoning</div>
            <div className="text-[13px] font-medium">Staged pipeline · {reasoning.steps.length} steps</div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
          >
            close ✕
          </button>
        </div>
        <div className="border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="label-xs mr-2">Captured</span>
          <span className="mono">{reasoning.capturedAt}</span>
        </div>

        <ol className="flex-1 overflow-auto px-4 py-3">
          {reasoning.steps.map((s, i) => {
            const meta = STAGE_META[s.stage] ?? STAGE_META.ingest;
            return (
              <li key={i} className="relative flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <span
                    className="mt-1 h-2 w-2 rounded-full border border-border"
                    style={{ background: meta.color }}
                  />
                  {i < reasoning.steps.length - 1 ? (
                    <span className="mt-1 w-px flex-1 bg-border" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="mono rounded-sm px-1 py-0.5 text-[10px] uppercase leading-none"
                      style={{ background: "color-mix(in oklab, " + meta.color + " 12%, transparent)", color: meta.color }}
                    >
                      {meta.label}
                    </span>
                    <span className="mono text-[11px] text-muted-foreground">{s.ts}</span>
                    <span className="mono text-[11px] text-muted-foreground">· {s.durationMs}ms</span>
                    {s.cached ? (
                      <span className="mono rounded-sm bg-[color:var(--color-muted)] px-1 py-0.5 text-[10px] uppercase text-muted-foreground">
                        cached
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[13px] leading-snug text-foreground">{s.label}</div>
                </div>
              </li>
            );
          })}
        </ol>
      </aside>
    </div>
  );
}
