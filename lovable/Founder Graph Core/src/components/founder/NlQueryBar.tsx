import { useState } from "react";
import { Chip } from "./Chip";
import type { Opportunity } from "./OpportunityCard";

export type NlResult = {
  oppId: string;
  reason: string;
  citations: { label: string; ref: string }[];
};

/**
 * Simulated NL ranker. Matches a small set of hardcoded intents against
 * mock opportunities. Empty match returns []. Never claims to call an LLM.
 */
function rankQuery(q: string, opps: Opportunity[]): NlResult[] {
  const s = q.trim().toLowerCase();
  if (!s) return [];
  if (
    s.includes("commit velocity") ||
    s.includes("rising commit") ||
    s.includes("commits") ||
    s.includes("github")
  ) {
    return [
      {
        oppId: "ecc",
        reason: "commit cadence +38% over trailing 30d",
        citations: [
          { label: "repo/commits", ref: "github.com/supawich/ecc" },
          { label: "README.md", ref: "L1–8" },
        ],
      },
      {
        oppId: "lattice-db",
        reason: "commit cadence +21% over trailing 30d",
        citations: [
          { label: "repo/commits", ref: "github.com/rina/lattice-db" },
          { label: "CHANGELOG", ref: "v0.4→v0.6" },
        ],
      },
    ].filter((r) => opps.some((o) => o.id === r.oppId));
  }
  if (s.includes("solo")) {
    return [
      {
        oppId: "ecc",
        reason: "solo builder, 6y Stripe infra",
        citations: [{ label: "linkedin", ref: "/supawich" }],
      },
    ];
  }
  return [];
}

export function NlQueryBar({
  opps,
  forcedState,
  onStateChange,
  onResults,
}: {
  opps: Opportunity[];
  forcedState: "idle" | "running" | "empty";
  onStateChange: (s: "idle" | "running" | "empty" | "results") => void;
  onResults: (rs: NlResult[] | null) => void;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"idle" | "running" | "empty" | "results">(
    forcedState === "idle" ? "idle" : forcedState,
  );

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("running");
    onStateChange("running");
    window.setTimeout(() => {
      const results = rankQuery(q, opps);
      if (!results.length) {
        setStatus("empty");
        onStateChange("empty");
        onResults([]);
      } else {
        setStatus("results");
        onStateChange("results");
        onResults(results);
      }
    }, 700);
  }

  function clear() {
    setQ("");
    setStatus("idle");
    onStateChange("idle");
    onResults(null);
  }

  return (
    <div className="flex-1">
      <form
        onSubmit={submit}
        className="flex items-center gap-2 rounded-md border border-border bg-surface px-2.5 py-1.5"
      >
        <span className="label-xs">ask</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder='e.g. show founders with rising commit velocity'
          className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
        {status === "running" ? (
          <Chip variant="accent" mono>
            running
          </Chip>
        ) : null}
        {status === "empty" ? (
          <Chip variant="warning" mono>
            no matches
          </Chip>
        ) : null}
        {q ? (
          <button
            type="button"
            onClick={clear}
            className="rounded px-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            clear
          </button>
        ) : null}
        <button
          type="submit"
          className="rounded-md bg-[color:var(--accent)] px-2.5 py-1 text-[12px] font-medium text-white hover:opacity-90"
        >
          Rank
        </button>
      </form>
    </div>
  );
}
