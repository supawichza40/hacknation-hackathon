import type { ReactNode } from "react";

type Variant = "neutral" | "positive" | "negative" | "warning" | "accent";

const CLASSES: Record<Variant, string> = {
  neutral: "border-border bg-muted text-foreground",
  positive: "border-[color:var(--positive)]/30 bg-[color:var(--positive)]/10 text-[color:var(--positive)]",
  negative: "border-[color:var(--negative)]/30 bg-[color:var(--negative)]/10 text-[color:var(--negative)]",
  warning: "border-[color:var(--warning)]/30 bg-[color:var(--warning)]/10 text-[color:var(--warning)]",
  accent: "border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]",
};

export function Chip({
  children,
  variant = "neutral",
  mono = false,
}: {
  children: ReactNode;
  variant?: Variant;
  mono?: boolean;
}) {
  return (
    <span
      className={
        "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] leading-none " +
        CLASSES[variant] +
        (mono ? " mono" : "")
      }
    >
      {children}
    </span>
  );
}
