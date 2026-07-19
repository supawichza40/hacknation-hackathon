import { useEffect, useRef, useState } from "react";
import { Chip } from "./Chip";

const STEPS = [
  "connecting to captured scan · 2026-07-18",
  "replaying GitHub signals",
  "replaying apply intake",
  "scoring against thesis",
  "surfacing crossings",
];

export function ScanControl({
  running,
  onStart,
  onDone,
}: {
  running: boolean;
  onStart: () => void;
  onDone: () => void;
}) {
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    if (!running) {
      setStep(0);
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
      return;
    }
    setStep(0);
    const gap = 500;
    STEPS.forEach((_, i) => {
      const t = window.setTimeout(() => setStep(i + 1), (i + 1) * gap);
      timers.current.push(t);
    });
    const done = window.setTimeout(() => onDone(), (STEPS.length + 1) * gap);
    timers.current.push(done);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [running, onDone]);

  const pct = Math.min(100, Math.round((step / STEPS.length) * 100));

  if (!running) {
    return (
      <button
        onClick={onStart}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium hover:bg-muted/60"
      >
        Scan
      </button>
    );
  }

  return (
    <div className="flex min-w-[320px] flex-col gap-1 rounded-md border border-[color:var(--accent)]/40 bg-[color:var(--accent)]/5 px-2.5 py-1.5">
      <div className="flex items-center gap-2">
        <Chip variant="accent" mono>
          replay
        </Chip>
        <span className="text-[12px] text-foreground">
          replaying captured scan from <span className="mono">2026-07-18</span>
        </span>
        <span className="mono ml-auto text-[11px] text-muted-foreground tabular-nums">{pct}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded bg-border">
        <div
          className="h-full bg-[color:var(--accent)] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-[11px] text-muted-foreground">
        {STEPS[Math.min(step, STEPS.length - 1)]}
      </div>
    </div>
  );
}
