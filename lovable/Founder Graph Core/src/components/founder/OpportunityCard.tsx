import { Link } from "@tanstack/react-router";
import { Chip } from "./Chip";

export type Opportunity = {
  id: string;
  name: string;
  founder: string;
  founderType?: string;
  founderScore: number;
  thesisFit: "pass" | "fail";
  sourceChannels: string[];
  whySurfaced?: string;
  timer?: string;
  history?: string;
  hero?: boolean;
  offThesisReason?: string;
  greyed?: boolean;
  allVerified?: boolean;
  inbound?: boolean;
  arrivesViaScan?: boolean;
  summary?: string;
};

const CHANNEL_LABEL: Record<string, string> = {
  apply: "apply",
  github: "GitHub",
  hackathon: "hackathon",
  outbound: "outbound",
};

export function OpportunityCard({
  opp,
  greyed,
  highlightNew,
}: {
  opp: Opportunity;
  greyed?: boolean;
  highlightNew?: boolean;
}) {
  const isGrey = greyed ?? opp.greyed;

  return (
    <Link
      to="/opportunities/$id"
      params={{ id: opp.id }}
      className={
        "group block rounded-md border bg-surface transition-colors " +
        (isGrey
          ? "border-border/70 opacity-60 hover:opacity-90"
          : "border-border hover:border-foreground/30") +
        (highlightNew
          ? " ring-2 ring-[color:var(--accent)]/50 border-[color:var(--accent)]/40"
          : "") +
        (opp.hero ? " border-[color:var(--accent)]/40" : "")
      }
    >
      <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {opp.hero ? <Chip variant="accent">hero</Chip> : null}
            {highlightNew ? <Chip variant="accent">crossed conviction threshold</Chip> : null}
            <div className="truncate text-[13.5px] font-semibold">{opp.name}</div>
          </div>
          <div className="mt-0.5 truncate text-[12px] text-muted-foreground">
            {opp.founder}
            {opp.founderType ? <span className="text-muted-foreground/70"> · {opp.founderType}</span> : null}
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="label-xs">Score</span>
          <span className="mono text-[16px] font-semibold tabular-nums leading-none">
            {opp.founderScore}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        {opp.sourceChannels.map((c) => (
          <Chip key={c}>{CHANNEL_LABEL[c] ?? c}</Chip>
        ))}
        {opp.thesisFit === "pass" ? (
          <Chip variant="positive">thesis: pass</Chip>
        ) : (
          <Chip variant="negative">{opp.offThesisReason ?? "thesis: fail"}</Chip>
        )}
        {opp.allVerified ? <Chip variant="positive">all claims verified</Chip> : null}
      </div>

      {opp.whySurfaced ? (
        <div className="px-3 pb-2 text-[12px] text-muted-foreground">
          <span className="label-xs mr-1.5">why</span>
          {opp.whySurfaced}
        </div>
      ) : opp.summary ? (
        <div className="px-3 pb-2 text-[12px] text-muted-foreground">{opp.summary}</div>
      ) : null}

      {opp.history ? (
        <div className="border-t border-border/70 bg-muted/40 px-3 py-1.5 text-[11.5px] text-muted-foreground">
          <span className="label-xs mr-1.5">history</span>
          {opp.history}
        </div>
      ) : null}

      <div className="flex items-center justify-between border-t border-border px-3 py-1.5">
        <span className="label-xs">Signal → decision</span>
        <span className="mono text-[12px] tabular-nums text-foreground">
          {opp.timer ?? "—"}
        </span>
      </div>
    </Link>
  );
}
