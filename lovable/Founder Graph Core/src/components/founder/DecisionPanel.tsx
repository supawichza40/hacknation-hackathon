import { useState } from "react";

type Decision = "invest" | "pass" | "more-info";
type SaveState = "idle" | "saving" | "saved";

export function DecisionPanel({
  recommendation,
  saveState,
  onSubmit,
}: {
  recommendation: { decision: Decision; reason: string };
  saveState: SaveState;
  onSubmit: (decision: Decision, note: string) => void;
}) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [note, setNote] = useState("");
  const disabled = saveState === "saving" || saveState === "saved";

  const opts: Array<{ id: Decision; label: string; hint: string; variant: "positive" | "negative" | "accent" }> = [
    { id: "invest", label: "Invest", hint: "issue term sheet", variant: "positive" },
    { id: "pass", label: "Pass", hint: "send polite decline", variant: "negative" },
    { id: "more-info", label: "More info", hint: "founder Q&A required", variant: "accent" },
  ];

  const variantStyle: Record<string, string> = {
    positive:
      "border-[color:var(--positive)]/40 text-[color:var(--positive)] hover:bg-[color:var(--positive)]/10",
    negative:
      "border-[color:var(--negative)]/40 text-[color:var(--negative)] hover:bg-[color:var(--negative)]/10",
    accent:
      "border-[color:var(--accent)]/40 text-[color:var(--accent)] hover:bg-[color:var(--accent)]/10",
  };

  return (
    <section className="mb-10">
      <h2 className="mb-2">Decision</h2>

      {/* AI recommendation (visually distinct from your decision) */}
      <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-[color:var(--color-muted)] px-3 py-2 text-[12px]">
        <span className="label-xs">AI recommendation</span>
        <span className="mono rounded-sm bg-surface px-1.5 py-0.5 text-[11px] uppercase text-foreground">
          {recommendation.decision}
        </span>
        <span className="text-muted-foreground">— {recommendation.reason}</span>
        <span className="ml-auto label-xs">not binding · you decide</span>
      </div>

      {/* Your decision — different chrome (thick border, surface bg) */}
      <div className="rounded-md border-2 border-foreground/10 bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="label-xs">Your decision</span>
          {saveState === "saved" ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-[color:var(--positive)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--positive)]" />
              Saved
            </span>
          ) : saveState === "saving" ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--accent)]" />
              Saving…
            </span>
          ) : null}
        </div>

        <div className="mb-3 grid grid-cols-3 gap-2">
          {opts.map((o) => {
            const selected = decision === o.id;
            return (
              <button
                key={o.id}
                type="button"
                disabled={disabled}
                onClick={() => setDecision(o.id)}
                className={
                  "flex flex-col items-start rounded-md border px-3 py-2 text-left transition-colors " +
                  variantStyle[o.variant] +
                  (selected ? " ring-2 ring-current bg-current/10" : "") +
                  (disabled ? " cursor-not-allowed opacity-50" : "")
                }
              >
                <span className="text-[13px] font-semibold">{o.label}</span>
                <span className="text-[11px] text-muted-foreground">{o.hint}</span>
              </button>
            );
          })}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={disabled}
          placeholder="Rationale, next steps, questions for founder…"
          className="mb-3 h-20 w-full resize-none rounded-md border border-border bg-background p-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[color:var(--accent)]/30"
        />

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {saveState === "saved" ? "Recorded locally · not sent" : "Decision is saved locally in this session."}
          </span>
          <button
            type="button"
            disabled={disabled || !decision}
            onClick={() => decision && onSubmit(decision, note)}
            className={
              "rounded-md px-3 py-1.5 text-[13px] font-medium " +
              (disabled || !decision
                ? "cursor-not-allowed bg-[color:var(--color-muted)] text-muted-foreground"
                : "bg-[color:var(--accent)] text-white hover:opacity-90")
            }
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save decision"}
          </button>
        </div>
      </div>
    </section>
  );
}
