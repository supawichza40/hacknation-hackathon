import { Link } from "@tanstack/react-router";
import { Chip } from "./Chip";

export function ApplySuccess({
  opportunityId,
  companyName,
  onReset,
}: {
  opportunityId: string;
  companyName: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-6">
      <div className="mb-3 flex items-center gap-2">
        <Chip variant="positive" mono>received</Chip>
        <span className="text-[12.5px] text-muted-foreground">Application submitted</span>
      </div>
      <h2 className="mb-1 text-[18px] font-semibold text-foreground">
        Thanks{companyName ? `, ${companyName}` : ""} — we've got it.
      </h2>
      <p className="mb-5 text-[13px] text-muted-foreground">
        Your submission is queued in the investor's inbound pipeline. You can reference this
        opportunity ID in any follow-up.
      </p>

      <div className="mb-5 rounded-md border border-border bg-background px-3 py-3">
        <div className="label-xs mb-1">Opportunity ID</div>
        <div className="mono text-[14px] tabular-nums text-foreground">{opportunityId}</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onReset}
          className="rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] hover:border-foreground/40"
        >
          Submit another
        </button>
        <Link
          to="/opportunities/$id"
          params={{ id: opportunityId }}
          className="text-[12.5px] text-[color:var(--accent)] hover:underline"
        >
          View opportunity →
        </Link>
      </div>
    </div>
  );
}
