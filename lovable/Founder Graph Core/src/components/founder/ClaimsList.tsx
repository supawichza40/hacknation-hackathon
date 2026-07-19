import { Chip } from "./Chip";

export type Claim = {
  id: string;
  text: string;
  trust: "verified" | "unsupported" | "contradicted";
  sourceRef: any;
};

const TRUST_META: Record<Claim["trust"], { label: string; variant: "positive" | "warning" | "negative"; dot: string }> = {
  verified: { label: "verified", variant: "positive", dot: "var(--positive)" },
  unsupported: { label: "unsupported", variant: "warning", dot: "var(--warning)" },
  contradicted: { label: "contradicted", variant: "negative", dot: "var(--negative)" },
};

function refSummary(claim: Claim): string {
  const r = claim.sourceRef;
  if (!r) return "";
  if (r.type === "repo") return `${r.file}${r.lines ? `:${r.lines}` : ""}`;
  if (r.type === "deck") return `deck slide ${r.slide}`;
  if (r.type === "linkedin") return `linkedin/${r.file?.split("/").pop() ?? "profile"}`;
  if (r.type === "conflict") return `deck slide ${r.deckSlide?.slide} ↔ ${r.repo?.file}:${r.repo?.lines}`;
  return "";
}

export function ClaimsList({
  claims,
  onOpenConflict,
  highlightTrust,
}: {
  claims: Claim[];
  onOpenConflict: (claim: Claim) => void;
  highlightTrust?: Claim["trust"] | null;
}) {
  const counts = claims.reduce(
    (acc, c) => ({ ...acc, [c.trust]: (acc[c.trust] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <section className="mb-8">
      <div className="mb-2 flex items-baseline justify-between">
        <h2>Claims</h2>
        <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <Legend color="var(--positive)" label={`${counts.verified ?? 0} verified`} />
          <Legend color="var(--warning)" label={`${counts.unsupported ?? 0} unsupported`} />
          <Legend color="var(--negative)" label={`${counts.contradicted ?? 0} contradicted`} />
        </div>
      </div>

      <ol className="overflow-hidden rounded-md border border-border bg-surface">
        {claims.map((claim, i) => {
          const meta = TRUST_META[claim.trust];
          const isConflict = claim.trust === "contradicted";
          const highlighted = highlightTrust && highlightTrust === claim.trust;
          return (
            <li
              key={claim.id}
              className={
                "group flex items-start gap-3 border-b border-border px-3 py-2.5 last:border-b-0 " +
                (isConflict ? "cursor-pointer hover:bg-[color:var(--negative)]/5 " : "") +
                (highlighted ? "bg-[color:var(--color-muted)] " : "")
              }
              onClick={() => (isConflict ? onOpenConflict(claim) : undefined)}
            >
              <span className="mono w-6 flex-none pt-0.5 text-right text-[11px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full"
                style={{ background: meta.dot }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[13px] leading-snug text-foreground">{claim.text}</div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="mono">{refSummary(claim)}</span>
                </div>
              </div>
              <div className="flex flex-none items-center gap-2">
                <Chip variant={meta.variant}>{meta.label}</Chip>
                {isConflict ? (
                  <span className="mono text-[11px] text-[color:var(--negative)]">
                    open ↗
                  </span>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      <span className="mono">{label}</span>
    </span>
  );
}
