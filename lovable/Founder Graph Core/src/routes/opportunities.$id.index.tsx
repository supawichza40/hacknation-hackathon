import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { InvestorShell } from "@/components/founder/InvestorShell";
import { DiligenceHeader } from "@/components/founder/DiligenceHeader";
import { AxisScoresRow } from "@/components/founder/AxisScoreCard";
import { ClaimsList, type Claim } from "@/components/founder/ClaimsList";
import { EvidenceSplitView } from "@/components/founder/EvidenceSplitView";
import { ReasoningTimeline } from "@/components/founder/ReasoningTimeline";
import { MemoSection } from "@/components/founder/MemoSection";
import { DecisionPanel } from "@/components/founder/DecisionPanel";
import { useDevStates } from "@/lib/dev-state";
import opportunities from "@/data/opportunities.json";
import claimsEcc from "@/data/claims-ecc.json";
import axesEcc from "@/data/axes-ecc.json";
import memoEcc from "@/data/memo-ecc.json";
import reasoning from "@/data/reasoning-ecc.json";
import { useSubmissions } from "@/lib/submissions";

export const Route = createFileRoute("/opportunities/$id/")({
  head: () => ({ meta: [{ title: "Diligence — FounderGraph" }] }),
  component: DiligencePage,
});

const STATES = [
  { id: "ready", label: "ready" },
  { id: "loading", label: "loading" },
  { id: "staged", label: "staged analysis" },
  { id: "replay", label: "replay mode" },
  { id: "no-memo", label: "no memo yet" },
  { id: "missing", label: "missing info" },
  { id: "contradicted", label: "contradicted claim" },
  { id: "unsupported", label: "unsupported claim" },
  { id: "saving", label: "decision saving" },
  { id: "saved", label: "decision saved" },
  { id: "audio-loading", label: "audio loading" },
  { id: "audio-unavailable", label: "audio unavailable" },
  { id: "not-found", label: "not found" },
];

function DiligencePage() {
  const { id } = Route.useParams();
  const submissions = useSubmissions();
  const opp =
    (opportunities as any[]).find((o) => o.id === id) ??
    submissions.find((s) => s.id === id);
  const state = useDevStates("diligence", STATES, "ready");

  const [splitClaim, setSplitClaim] = useState<Claim | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [stageIdx, setStageIdx] = useState(0);

  // Auto-open contradicted split view when dev state forces it
  useEffect(() => {
    if (state === "contradicted") {
      const c = (claimsEcc as Claim[]).find((x) => x.trust === "contradicted");
      if (c) setSplitClaim(c);
    } else if (state !== "contradicted") {
      // don't force-close; user may still be looking
    }
  }, [state]);

  // Staged analysis progression
  useEffect(() => {
    if (state !== "staged") {
      setStageIdx(reasoning.steps.length);
      return;
    }
    setStageIdx(0);
    const t = window.setInterval(() => {
      setStageIdx((i) => {
        if (i >= reasoning.steps.length) {
          window.clearInterval(t);
          return i;
        }
        return i + 1;
      });
    }, 700);
    return () => window.clearInterval(t);
  }, [state]);

  // Saving state simulation
  const handleSubmit = () => {
    setSaveState("saving");
    window.setTimeout(() => setSaveState("saved"), 900);
  };
  useEffect(() => {
    if (state === "saving") setSaveState("saving");
    else if (state === "saved") setSaveState("saved");
    else if (state === "ready") setSaveState("idle");
  }, [state]);

  const audioState: "ready" | "loading" | "unavailable" =
    state === "audio-loading" ? "loading" : state === "audio-unavailable" ? "unavailable" : "ready";

  const claims = claimsEcc as Claim[];
  const memo = state === "no-memo" ? null : (memoEcc as any);

  const recommendation = useMemo(
    () => ({
      decision: "more-info" as const,
      reason: "one contradiction unresolved; two disclosures missing.",
    }),
    [],
  );

  const highlightTrust =
    state === "contradicted" ? ("contradicted" as const) : state === "unsupported" ? ("unsupported" as const) : null;

  if (!opp || state === "not-found") return <NotFound id={id} />;
  if (state === "loading") return <LoadingSkeleton opp={opp} />;

  return (
    <InvestorShell>
      {state === "replay" ? (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-[color:var(--accent)]/30 bg-[color:var(--accent)]/5 px-3 py-1.5 text-[12px]">
          <span className="label-xs text-[color:var(--accent)]">Replay</span>
          <span className="text-foreground">
            Viewing captured analysis from <span className="mono">{reasoning.capturedAt}</span> — not live.
          </span>
        </div>
      ) : null}

      {state === "staged" ? (
        <StagedBanner idx={stageIdx} total={reasoning.steps.length} />
      ) : null}

      <DiligenceHeader
        opp={opp}
        audioState={audioState}
        onShowReasoning={() => setShowReasoning(true)}
      />

      <section className="mb-8">
        <div className="mb-2 flex items-baseline justify-between">
          <h2>Overview</h2>
          <Link
            to="/opportunities/$id/graph"
            params={{ id }}
            className="text-[12px] text-[color:var(--accent)] hover:underline"
          >
            open graph →
          </Link>
        </div>
        <p className="rounded-md border border-border bg-surface px-4 py-3 text-[13px] leading-relaxed text-foreground">
          Solo builder from Stripe infra shipping an open-source agent harness with deterministic
          replay. Strong technical signals in the repo; one material contradiction between the deck
          and the benchmark file needs to be resolved before decision.
        </p>
      </section>

      <AxisScoresRow axes={axesEcc as any} />

      <ClaimsList
        claims={claims}
        onOpenConflict={(c) => setSplitClaim(c)}
        highlightTrust={highlightTrust}
      />

      {memo ? (
        <MemoSection memo={memo} highlightMissing={state === "missing"} />
      ) : (
        <MemoSection memo={{ sections: {} }} hideBody />
      )}

      <DecisionPanel recommendation={recommendation} saveState={saveState} onSubmit={handleSubmit} />

      <EvidenceSplitView claim={splitClaim} onClose={() => setSplitClaim(null)} />
      <ReasoningTimeline open={showReasoning} onClose={() => setShowReasoning(false)} />
    </InvestorShell>
  );
}

function StagedBanner({ idx, total }: { idx: number; total: number }) {
  const current = reasoning.steps[Math.min(idx, total - 1)];
  const pct = Math.min(100, (idx / total) * 100);
  return (
    <div className="mb-4 rounded-md border border-border bg-surface p-3">
      <div className="mb-1.5 flex items-center justify-between text-[12px]">
        <span className="label-xs">Staged analysis</span>
        <span className="mono text-muted-foreground">
          {Math.min(idx, total)}/{total} · {current?.stage}
        </span>
      </div>
      <div className="mb-2 h-1 overflow-hidden rounded-sm bg-[color:var(--color-muted)]">
        <div
          className="h-full bg-[color:var(--accent)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center gap-2 text-[12px] text-foreground">
        <span className="mono text-[11px] text-muted-foreground">{current?.ts}</span>
        <span>{current?.label}</span>
        {current?.cached ? (
          <span className="mono rounded-sm bg-[color:var(--color-muted)] px-1 py-0.5 text-[10px] uppercase text-muted-foreground">
            cached
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LoadingSkeleton({ opp }: { opp: any }) {
  return (
    <InvestorShell>
      <div className="mb-6 border-b border-border pb-5">
        <div className="label-xs">Opportunity · <span className="mono normal-case tracking-normal">{opp.id}</span></div>
        <div className="mt-2 h-6 w-96 animate-pulse rounded-md bg-[color:var(--color-muted)]" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-md bg-[color:var(--color-muted)]" />
        ))}
      </div>
      <div className="mt-6 h-56 animate-pulse rounded-md bg-[color:var(--color-muted)]" />
    </InvestorShell>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <InvestorShell>
      <div className="rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center">
        <div className="label-xs mb-1">404</div>
        <h1 className="mb-2">Opportunity not found</h1>
        <p className="text-[13px] text-muted-foreground">
          No opportunity with id <span className="mono">{id}</span> in the pipeline.
        </p>
        <Link
          to="/"
          className="mt-4 inline-block rounded-md border border-border px-3 py-1.5 text-[13px] hover:bg-[color:var(--color-muted)]"
        >
          Back to pipeline
        </Link>
      </div>
    </InvestorShell>
  );
}
