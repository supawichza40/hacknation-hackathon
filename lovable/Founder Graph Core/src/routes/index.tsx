import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { InvestorShell } from "@/components/founder/InvestorShell";
import { PageHeader } from "@/components/founder/PageHeader";
import { ThesisBar } from "@/components/founder/ThesisBar";
import { ThesisDrawer } from "@/components/founder/ThesisDrawer";
import { PipelineColumn } from "@/components/founder/PipelineColumn";
import { OpportunityCard, type Opportunity } from "@/components/founder/OpportunityCard";
import { NlQueryBar, type NlResult } from "@/components/founder/NlQueryBar";
import { ScanControl } from "@/components/founder/ScanControl";
import { Chip } from "@/components/founder/Chip";
import { useDevStates } from "@/lib/dev-state";
import opportunitiesData from "@/data/opportunities.json";
import thesis from "@/data/thesis.json";
import { useSubmissions } from "@/lib/submissions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline — FounderGraph" },
      { name: "description", content: "Evidence-first diligence pipeline for solo VCs." },
    ],
  }),
  component: PipelinePage,
});

const DEV_STATES = [
  { id: "ready", label: "ready" },
  { id: "loading", label: "loading" },
  { id: "query-running", label: "query running" },
  { id: "query-empty", label: "query empty (no cited matches)" },
  { id: "scan-running", label: "scan replay running" },
  { id: "empty", label: "no opportunities" },
  { id: "error", label: "data error + seeded fallback" },
  { id: "off-thesis", label: "off-thesis grey (BrightCart)" },
];

function fmtUSD(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function PipelinePage() {
  const forced = useDevStates("Pipeline", DEV_STATES, "ready");

  const submissions = useSubmissions();
  const allOpps = useMemo(
    () => [...submissions, ...(opportunitiesData as Opportunity[])],
    [submissions],
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkSizeCap, setCheckSizeCap] = useState<number>(thesis.checkSize);
  const [pipewardenArrived, setPipewardenArrived] = useState(false);
  const [scanRunning, setScanRunning] = useState(false);
  const [queryState, setQueryState] = useState<"idle" | "running" | "empty" | "results">("idle");
  const [queryResults, setQueryResults] = useState<NlResult[] | null>(null);

  // Force-state effects (dev switcher wiring).
  const effectiveScanRunning = scanRunning || forced === "scan-running";
  const effectiveQueryState: "idle" | "running" | "empty" | "results" =
    forced === "query-running"
      ? "running"
      : forced === "query-empty"
        ? "empty"
        : queryState;
  const isLoading = forced === "loading";
  const isEmpty = forced === "empty";
  const isError = forced === "error";
  // "off-thesis" state just re-emphasises BrightCart; nothing to force since it's always greyed.

  // Recompute thesis fit on the fly for check size (BrightCart raises $2M).
  const opps = useMemo<Opportunity[]>(() => {
    return allOpps.map((o) => {
      if (o.id === "brightcart") {
        const passes = checkSizeCap >= 2_000_000;
        return {
          ...o,
          thesisFit: passes ? "pass" : "fail",
          greyed: !passes,
          offThesisReason: passes
            ? undefined
            : `fails thesis: check size (needs ${fmtUSD(2_000_000)}, cap ${fmtUSD(checkSizeCap)})`,
        };
      }
      return o;
    });
  }, [allOpps, checkSizeCap]);

  const visibleOpps = useMemo(() => {
    let list = opps;
    if (!pipewardenArrived) list = list.filter((o) => o.id !== "pipewarden");
    if (isEmpty) list = [];
    return list;
  }, [opps, pipewardenArrived, isEmpty]);

  // PipeWarden arrives as an outbound scan discovery even though its record is flagged inbound.
  const inbound = visibleOpps.filter((o) => o.inbound && o.id !== "pipewarden");
  const outbound = visibleOpps.filter((o) => !o.inbound || o.id === "pipewarden");

  // Ranked-results view: keep base pipeline underneath, show ranked list up top.
  const rankedView = effectiveQueryState === "results" && queryResults?.length ? queryResults : null;

  return (
    <InvestorShell>
      <PageHeader
        eyebrow="Today"
        title="Pipeline"
        right={
          <div className="flex items-center gap-2">
            <span className="label-xs">as of</span>
            <span className="mono text-[12px] tabular-nums text-muted-foreground">
              2026-07-18 · 09:14 PT
            </span>
          </div>
        }
      />

      <ThesisBar checkSizeCap={checkSizeCap} onOpen={() => setDrawerOpen(true)} />

      {/* Controls row */}
      <div className="mb-4 flex items-center gap-2">
        <NlQueryBar
          opps={opps}
          forcedState={
            forced === "query-running" ? "running" : forced === "query-empty" ? "empty" : "idle"
          }
          onStateChange={setQueryState}
          onResults={setQueryResults}
        />
        <ScanControl
          running={effectiveScanRunning}
          onStart={() => {
            setPipewardenArrived(false);
            setScanRunning(true);
          }}
          onDone={() => {
            setScanRunning(false);
            setPipewardenArrived(true);
          }}
        />
      </div>

      {isError ? (
        <div className="mb-4 rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 px-3 py-2 text-[12px] text-foreground">
          <Chip variant="warning" mono>data error</Chip>{" "}
          <span className="ml-1">
            Failed to reach <span className="mono">github.signals</span>. Showing seeded pipeline
            from last successful sync at{" "}
            <span className="mono">2026-07-18 08:52</span>.
          </span>
        </div>
      ) : null}

      {rankedView ? (
        <div className="mb-4 rounded-md border border-border bg-surface">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <Chip variant="accent" mono>ranked</Chip>
            <span className="text-[12px] text-muted-foreground">
              {rankedView.length} cited match{rankedView.length === 1 ? "" : "es"}
            </span>
          </div>
          <ul>
            {rankedView.map((r, i) => {
              const opp = opps.find((o) => o.id === r.oppId);
              if (!opp) return null;
              return (
                <li
                  key={r.oppId}
                  className="flex items-center gap-3 border-b border-border/60 px-3 py-2 last:border-b-0"
                >
                  <span className="mono w-6 text-[12px] tabular-nums text-muted-foreground">
                    #{i + 1}
                  </span>
                  <span className="w-[220px] truncate text-[13px] font-medium">{opp.name}</span>
                  <span className="flex-1 truncate text-[12px] text-muted-foreground">
                    {r.reason}
                  </span>
                  <div className="flex flex-wrap items-center gap-1">
                    {r.citations.map((c) => (
                      <Chip key={c.label} mono>
                        {c.label}: <span className="ml-1 text-muted-foreground">{c.ref}</span>
                      </Chip>
                    ))}
                  </div>
                  <span className="mono w-10 text-right text-[13px] tabular-nums">
                    {opp.founderScore}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : effectiveQueryState === "empty" ? (
        <div className="mb-4 rounded-md border border-border bg-surface px-3 py-2 text-[12px] text-muted-foreground">
          <Chip variant="warning" mono>no cited matches</Chip>{" "}
          <span className="ml-1">
            No opportunities in the pipeline have evidence supporting that query. Base pipeline
            preserved below.
          </span>
        </div>
      ) : null}

      {isLoading ? (
        <LoadingSkeleton />
      ) : visibleOpps.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          <PipelineColumn title="Outbound" count={outbound.length}>
            {outbound.map((o) => (
              <OpportunityCard
                key={o.id}
                opp={o}
                highlightNew={o.id === "pipewarden" && pipewardenArrived}
              />
            ))}
            {outbound.length === 0 ? (
              <EmptyColumn label="No outbound signals in view." />
            ) : null}
          </PipelineColumn>
          <PipelineColumn title="Inbound" count={inbound.length}>
            {inbound.map((o) => (
              <OpportunityCard key={o.id} opp={o} />
            ))}
            {inbound.length === 0 ? (
              <EmptyColumn label="No inbound applications in view." />
            ) : null}
          </PipelineColumn>
        </div>
      )}

      <ThesisDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        checkSizeCap={checkSizeCap}
        onCheckSizeChange={setCheckSizeCap}
      />
    </InvestorShell>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-2">
          <div className="h-4 w-24 rounded bg-muted" />
          {[0, 1].map((i) => (
            <div key={i} className="h-32 rounded-md border border-border bg-surface">
              <div className="h-full w-full animate-pulse bg-muted/40" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="label-xs mb-2">Pipeline empty</div>
      <div className="text-[14px] font-medium text-foreground">No opportunities to show</div>
      <p className="mt-1 text-[12.5px] text-muted-foreground">
        Nothing crossed the thesis threshold today. Run a scan or wait for the next inbound.
      </p>
    </div>
  );
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-surface px-3 py-6 text-center text-[12px] text-muted-foreground">
      {label}
    </div>
  );
}
