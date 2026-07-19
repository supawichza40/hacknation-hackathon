import thesis from "@/data/thesis.json";

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function ThesisDrawer({
  open,
  onClose,
  checkSizeCap,
  onCheckSizeChange,
}: {
  open: boolean;
  onClose: () => void;
  checkSizeCap: number;
  onCheckSizeChange: (n: number) => void;
}) {
  return (
    <>
      <div
        onClick={onClose}
        className={
          "fixed inset-0 z-20 bg-black/10 transition-opacity " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <aside
        className={
          "fixed right-0 top-0 z-30 h-full w-[380px] transform border-l border-border bg-surface transition-transform " +
          (open ? "translate-x-0" : "translate-x-full")
        }
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div>
            <div className="label-xs">Thesis</div>
            <div className="text-[15px] font-semibold">Investment criteria</div>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
          >
            close
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          <Row label="Stages">
            <span className="mono text-[13px]">{thesis.stages.join(" · ")}</span>
          </Row>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="label-xs">Check size cap</span>
              <span className="mono text-[13px] text-foreground">{fmtUSD(checkSizeCap)}</span>
            </div>
            <input
              type="range"
              min={50_000}
              max={2_000_000}
              step={50_000}
              value={checkSizeCap}
              onChange={(e) => onCheckSizeChange(Number(e.target.value))}
              className="w-full accent-[color:var(--accent)]"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground mono">
              <span>$50K</span>
              <span>$2M</span>
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              Raising cap re-evaluates check-size thesis fit in real time.
            </p>
          </div>

          <Row label="Geo">
            <span className="mono text-[13px]">{thesis.geo.join(" · ")}</span>
          </Row>
          <Row label="Focus">
            <span className="text-[13px]">{thesis.focus}</span>
          </Row>
          <Row label="Technical bar">
            <span className="mono text-[13px]">{thesis.technicalBar}</span>
          </Row>
        </div>
      </aside>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 pb-3">
      <span className="label-xs">{label}</span>
      {children}
    </div>
  );
}
