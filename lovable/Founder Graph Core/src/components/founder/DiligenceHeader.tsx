import type { ReactNode } from "react";
import { Chip } from "./Chip";
import { AudioBrief } from "./AudioBrief";

type Opp = {
  id: string;
  name: string;
  founder: string;
  founderType?: string;
  founderScore: number;
  thesisFit: "pass" | "fail";
  sourceChannels: string[];
  timer?: string;
  history?: string;
};

export function DiligenceHeader({
  opp,
  onShowReasoning,
  audioState,
}: {
  opp: Opp;
  onShowReasoning: () => void;
  audioState: "ready" | "loading" | "unavailable";
}) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <div className="mb-2 flex items-center gap-2">
        <span className="label-xs">Opportunity · <span className="mono normal-case tracking-normal">{opp.id}</span></span>
        {opp.thesisFit === "pass" ? (
          <Chip variant="positive">thesis: pass</Chip>
        ) : (
          <Chip variant="negative">thesis: fail</Chip>
        )}
        {opp.sourceChannels.map((c) => (
          <Chip key={c} variant="neutral">{c}</Chip>
        ))}
      </div>

      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate">{opp.name}</h1>
          <div className="mt-1 text-[13px] text-muted-foreground">
            {opp.founder}
            {opp.founderType ? <> · {opp.founderType}</> : null}
          </div>
        </div>

        <div className="flex items-stretch gap-4">
          <MetricCell label="Founder score" value={opp.founderScore} accent />
          {opp.timer ? (
            <MetricCell label="Signal → decision" value={opp.timer} mono />
          ) : null}
          <div className="flex flex-col items-end justify-between gap-2">
            <AudioBrief state={audioState} />
            <button
              onClick={onShowReasoning}
              className="rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              Show reasoning
            </button>
          </div>
        </div>
      </div>

      {opp.history ? (
        <div className="mt-3 flex items-center gap-2 rounded-md border border-border bg-[color:var(--color-muted)] px-2.5 py-1.5 text-[12px] text-muted-foreground">
          <span className="label-xs">History</span>
          <span>{opp.history}</span>
        </div>
      ) : null}
    </div>
  );
}

function MetricCell({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-[92px] flex-col items-end rounded-md border border-border bg-surface px-3 py-1.5">
      <span className="label-xs">{label}</span>
      <span
        className={
          "leading-tight " +
          (mono || accent ? "mono " : "") +
          (accent ? "text-[22px] text-[color:var(--accent)] font-semibold" : "text-[13px] text-foreground")
        }
      >
        {value}
      </span>
    </div>
  );
}
