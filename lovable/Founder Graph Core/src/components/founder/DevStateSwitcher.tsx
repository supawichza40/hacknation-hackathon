import { useState } from "react";
import { useDevStateContext } from "@/lib/dev-state";

export function DevStateSwitcher() {
  const { states, active, setActive, screen } = useDevStateContext();
  const [open, setOpen] = useState(false);

  if (!states.length) return null;

  return (
    <div className="fixed bottom-3 right-3 z-40 select-none">
      {open ? (
        <div className="w-64 rounded-md border border-border bg-surface/95 p-2 shadow-sm backdrop-blur">
          <div className="mb-2 flex items-center justify-between px-1">
            <div className="label-xs">Dev · {screen}</div>
            <button
              onClick={() => setOpen(false)}
              className="rounded px-1 text-[11px] text-muted-foreground hover:text-foreground"
              aria-label="Collapse dev state switcher"
            >
              ×
            </button>
          </div>
          <div className="flex flex-col gap-0.5">
            {states.map((s) => {
              const isActive = s.id === active;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  className={
                    "flex items-center justify-between rounded px-2 py-1 text-left text-[12px] transition-colors " +
                    (isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground")
                  }
                >
                  <span>{s.label}</span>
                  {isActive ? (
                    <span className="mono text-[10px] text-[color:var(--accent)]">active</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mono rounded-md border border-border bg-surface/90 px-2 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur hover:text-foreground"
        >
          dev · {states.length}
        </button>
      )}
    </div>
  );
}
