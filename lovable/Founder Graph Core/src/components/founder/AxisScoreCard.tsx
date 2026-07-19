import { Chip } from "./Chip";

type Axis = { id: string; label: string; score: number; rationale: string; evidenceCount: number };

export function AxisScoreCard({ axis }: { axis: Axis }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="label-xs">{axis.label}</span>
        <Chip mono>{String(axis.evidenceCount).padStart(2, "0")} evidence</Chip>
      </div>
      <div className="mono text-[32px] font-semibold leading-none tracking-tight text-foreground">
        {axis.score}
        <span className="ml-1 text-[13px] font-normal text-muted-foreground">/100</span>
      </div>
      <div className="mt-3 border-t border-border pt-3 text-[12px] leading-snug text-muted-foreground">
        <span className="label-xs mr-1.5">Because</span>
        {axis.rationale}
      </div>
    </div>
  );
}

export function AxisScoresRow({ axes }: { axes: Axis[] }) {
  return (
    <section className="mb-8">
      <div className="mb-2 flex items-baseline justify-between">
        <h2>Axis scores</h2>
        <span className="label-xs">scored independently · never blended</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {axes.map((a) => (
          <AxisScoreCard key={a.id} axis={a} />
        ))}
      </div>
    </section>
  );
}
