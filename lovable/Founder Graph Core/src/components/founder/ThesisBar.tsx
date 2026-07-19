import thesis from "@/data/thesis.json";
import { Chip } from "./Chip";

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

export function ThesisBar({
  checkSizeCap,
  onOpen,
}: {
  checkSizeCap: number;
  onOpen: () => void;
}) {
  return (
    <button
      onClick={onOpen}
      className="mb-4 flex w-full items-center gap-6 rounded-md border border-border bg-surface px-4 py-2.5 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center gap-2">
        <span className="label-xs">Thesis</span>
      </div>
      <Field label="Stage">
        <span className="mono text-[13px]">{thesis.stages.join(" · ")}</span>
      </Field>
      <Field label="Check">
        <span className="mono text-[13px]">
          up to <span className="text-foreground">{fmtUSD(checkSizeCap)}</span>
        </span>
      </Field>
      <Field label="Geo">
        <span className="mono text-[13px]">{thesis.geo.join(" · ")}</span>
      </Field>
      <Field label="Focus">
        <span className="text-[13px]">{thesis.focus}</span>
      </Field>
      <Field label="Bar">
        <Chip variant="accent" mono>
          {thesis.technicalBar}
        </Chip>
      </Field>
      <div className="ml-auto text-[11px] text-muted-foreground">edit →</div>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="label-xs">{label}</span>
      <span>{children}</span>
    </div>
  );
}
