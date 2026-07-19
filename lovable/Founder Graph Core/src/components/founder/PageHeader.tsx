import type { ReactNode } from "react";

export function PageHeader({
  title,
  eyebrow,
  right,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between border-b border-border pb-4">
      <div>
        {eyebrow ? <div className="label-xs mb-1">{eyebrow}</div> : null}
        <h1>{title}</h1>
      </div>
      {right}
    </div>
  );
}
