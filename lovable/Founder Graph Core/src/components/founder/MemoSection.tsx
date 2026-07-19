type Section = { title: string; content: string; notDisclosed?: string[] };

export function MemoSection({
  memo,
  hideBody,
  highlightMissing,
}: {
  memo: { sections: Record<string, Section> };
  hideBody?: boolean;
  highlightMissing?: boolean;
}) {
  const order = ["thesisFit", "team", "market", "product", "risks"];

  if (hideBody) {
    return (
      <section className="mb-8">
        <h2 className="mb-2">Memo</h2>
        <div className="rounded-md border border-dashed border-border bg-surface px-4 py-6 text-center text-[13px] text-muted-foreground">
          <div className="label-xs mb-1">Empty</div>
          Memo has not been drafted for this opportunity yet.
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8">
      <div className="mb-2 flex items-baseline justify-between">
        <h2>Memo</h2>
        <span className="label-xs">missing rows shown, not hidden</span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-border rounded-md border border-border bg-surface">
        {order.map((k) => {
          const s = memo.sections[k];
          if (!s) return null;
          return (
            <div key={k} className="grid grid-cols-[140px_1fr] gap-6 px-4 py-3">
              <div className="label-xs pt-0.5">{s.title}</div>
              <div>
                <p className="text-[13px] leading-relaxed text-foreground">{s.content}</p>
                {s.notDisclosed?.length ? (
                  <ul className="mt-2 space-y-1">
                    {s.notDisclosed.map((n) => (
                      <li
                        key={n}
                        className={
                          "flex items-center gap-2 rounded-md border border-dashed border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 px-2 py-1 text-[12px] " +
                          (highlightMissing ? "ring-2 ring-[color:var(--warning)]/40" : "")
                        }
                      >
                        <span className="label-xs text-[color:var(--warning)]">Not disclosed</span>
                        <span className="text-foreground">— {n}</span>
                        <span className="ml-auto text-[11px] text-muted-foreground">founder did not provide</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
