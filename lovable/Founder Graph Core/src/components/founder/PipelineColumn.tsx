import type { ReactNode } from "react";

export function PipelineColumn({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col">
      <header className="mb-2 flex items-baseline justify-between px-1">
        <div className="flex items-baseline gap-2">
          <h2 className="text-[13px] font-semibold">{title}</h2>
          <span className="mono text-[11px] text-muted-foreground tabular-nums">{count}</span>
        </div>
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
