"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { evaluateThesisFit, formatUsd, type ThesisView } from "@/lib/thesis";

type ScanStep = { rank: number; fullName: string; score: number; crossed: boolean };
type ScanSource = "github" | "tavily";
type ScanResult = {
  source?: ScanSource;
  capturedAt: string;
  replaySource: string;
  totalScanned: number;
  threshold: number;
  steps: ScanStep[];
  label?: string;
  surfaced:
    | { id: string; companyName: string; founderScore: number; sourceChannel: string; score: number }
    | { name: string; source: "tavily"; score: number; url: string; evidenceLocator: string; excerpt: string }
    | null;
};

type QueryMatch = {
  opportunityId: string;
  companyName: string;
  personName: string;
  founderScore: number;
  reason: string;
  citation: { locator: string; excerpt: string };
};
type QueryResult = { query: string; intent: string | null; usedLlm: boolean; matches: QueryMatch[] };

export type CardData = {
  id: string;
  companyName: string;
  personName: string;
  founderScore: number;
  source: "inbound" | "outbound";
  sourceChannel: string | null;
  status: string;
  sector: string;
  stage: string;
  geo: string;
  askAmountCents: number;
  whySurfaced: string | null;
  whySurfacedEvidence: { locator: string; excerpt: string } | null;
  history: { appliedAt: string; founderScore: number; note: string | null }[];
};

export type ThesisData = ThesisView & { id: string; name: string };

const CHIP_LABELS: Record<keyof ReturnType<typeof evaluateThesisFit>["checks"], string> = {
  sector: "sector",
  stage: "stage",
  geo: "geo",
  checkSize: "check size",
};

export default function PipelineBoard({
  thesis,
  cards,
}: {
  thesis: ThesisData;
  cards: CardData[];
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // R4 live toggle: flip the check-size ceiling between the real $100K cap and $2M.
  const [wideCheck, setWideCheck] = useState(false);
  const effectiveMax = wideCheck ? 200_000_000 : thesis.checkSizeMaxCents;
  const activeThesis: ThesisView = { ...thesis, checkSizeMaxCents: effectiveMax };

  // R7 Scan button: replays a captured scan against /api/scan. GitHub reveals
  // PipeWarden in the DB; Tavily surfaces an extracted company with a source badge.
  const router = useRouter();
  const [scanSource, setScanSource] = useState<ScanSource>("github");
  const [scanning, setScanning] = useState(false);
  const [scanSteps, setScanSteps] = useState<ScanStep[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [scanError, setScanError] = useState<string | null>(null);
  const [surfacedId, setSurfacedId] = useState<string | null>(null);
  const [tavilySurfaced, setTavilySurfaced] = useState<
    { name: string; score: number; url: string; excerpt: string } | null
  >(null);
  const [scanLabel, setScanLabel] = useState<string | null>(null);

  const runScan = async () => {
    setScanning(true);
    setScanError(null);
    setScanSteps([]);
    setRevealedCount(0);
    setTavilySurfaced(null);
    setSurfacedId(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: scanSource }),
      });
      if (!res.ok) throw new Error(`scan failed (${res.status})`);
      const data: ScanResult = await res.json();
      setScanLabel(data.label ?? `replaying captured ${scanSource} scan`);
      setScanSteps(data.steps);
      for (let i = 0; i < data.steps.length; i++) {
        setRevealedCount(i + 1);
        await new Promise((r) => setTimeout(r, 120));
      }
      const s = data.surfaced;
      if (s && "id" in s) {
        setSurfacedId(s.id);
        router.refresh();
      } else if (s && "name" in s) {
        setTavilySurfaced({ name: s.name, score: s.score, url: s.url, excerpt: s.excerpt });
      }
    } catch (err) {
      setScanError(err instanceof Error ? err.message : "scan failed");
    } finally {
      setScanning(false);
    }
  };

  // R1 natural-language query over the seeded founders' structured facts.
  const [query, setQuery] = useState("");
  const [querying, setQuerying] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  const runQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setQuerying(true);
    setQueryError(null);
    setQueryResult(null);
    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "query failed");
      setQueryResult(data as QueryResult);
    } catch (err) {
      setQueryError(err instanceof Error ? err.message : "query failed");
    } finally {
      setQuerying(false);
    }
  };

  const outbound = cards.filter((c) => c.source === "outbound");
  const inbound = cards.filter((c) => c.source === "inbound");

  return (
    <section>
      {/* Thesis summary bar */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        style={{
          width: "100%",
          textAlign: "left",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "12px 16px",
          marginBottom: "20px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 600 }}>Thesis · {thesis.name}</span>
        <ThesisPill>{thesis.sectors.join(", ")}</ThesisPill>
        <ThesisPill>{thesis.stages.join(" / ")}</ThesisPill>
        <ThesisPill>{thesis.geos.join(", ")}</ThesisPill>
        <ThesisPill>
          check {formatUsd(thesis.checkSizeMinCents)}–{formatUsd(effectiveMax)}
        </ThesisPill>
        <ThesisPill>tech bar {thesis.technicalBar}</ThesisPill>
        <span style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "var(--text-label)" }}>
          Edit thesis →
        </span>
      </button>

      {/* R1 natural-language query box */}
      <form
        onSubmit={runQuery}
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Ask the pipeline — e.g. "founders with improving scores", "off-thesis companies"'
          style={{
            flex: "1 1 340px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "10px 14px",
            font: "inherit",
            background: "var(--surface)",
          }}
        />
        <button
          type="submit"
          disabled={querying}
          style={{
            background: querying ? "var(--bg)" : "var(--accent)",
            color: querying ? "var(--muted)" : "#fff",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "10px 18px",
            cursor: querying ? "not-allowed" : "pointer",
            fontWeight: 600,
          }}
        >
          {querying ? "Querying…" : "Query"}
        </button>
        {queryResult && (
          <button
            type="button"
            onClick={() => {
              setQueryResult(null);
              setQuery("");
            }}
            style={{
              background: "var(--surface)",
              color: "var(--muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "10px 14px",
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        )}
      </form>

      {(queryResult || queryError) && (
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "12px 16px",
            marginBottom: "20px",
          }}
        >
          {queryError && (
            <span style={{ color: "var(--negative)", fontSize: "var(--text-body)" }}>{queryError}</span>
          )}
          {queryResult && queryResult.matches.length === 0 && (
            <span style={{ color: "var(--muted)" }}>No cited matches.</span>
          )}
          {queryResult && queryResult.matches.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
                {queryResult.matches.length} cited match{queryResult.matches.length === 1 ? "" : "es"}
                {queryResult.intent ? ` · ${queryResult.intent}` : ""}
                {queryResult.usedLlm ? " · via LLM" : ""}
              </span>
              {queryResult.matches.map((m) => (
                <div
                  key={m.opportunityId}
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "baseline",
                    gap: "8px",
                    padding: "8px 10px",
                    border: "1px solid var(--border)",
                    borderLeft: "3px solid var(--accent)",
                    borderRadius: "var(--radius)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{m.companyName}</span>
                  <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
                    {m.personName} · score {m.founderScore} · {m.reason}
                  </span>
                  <span
                    className="mono"
                    title={m.citation.excerpt}
                    style={{
                      marginLeft: "auto",
                      color: "var(--accent)",
                      fontSize: "var(--text-label)",
                    }}
                  >
                    ↳ {m.citation.locator}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* R7 Scan control — GitHub (reveals PipeWarden) or Tavily (prize track) */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "12px 16px",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={runScan}
            disabled={scanning}
            style={{
              background: scanning ? "var(--bg)" : "var(--accent)",
              color: scanning ? "var(--muted)" : "#fff",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              padding: "8px 16px",
              cursor: scanning ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Scan
          </button>
          <div style={{ display: "flex", gap: "4px" }}>
            {(["github", "tavily"] as ScanSource[]).map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setScanSource(src)}
                disabled={scanning}
                style={{
                  background: scanSource === src ? "var(--accent)" : "var(--surface)",
                  color: scanSource === src ? "#fff" : "var(--text)",
                  border: `1px solid ${scanSource === src ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: "var(--radius)",
                  padding: "6px 12px",
                  cursor: scanning ? "not-allowed" : "pointer",
                  fontSize: "var(--text-label)",
                }}
              >
                {src === "github" ? "GitHub" : "Tavily"}
              </button>
            ))}
          </div>
          {scanning && (
            <span style={{ color: "var(--muted)", fontSize: "var(--text-body)" }}>
              {scanLabel ?? `replaying captured ${scanSource} scan`}
            </span>
          )}
          {scanError && !scanning && (
            <span style={{ color: "var(--negative)", fontSize: "var(--text-body)" }}>{scanError}</span>
          )}
        </div>

        {scanSteps.length > 0 && (
          <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {scanSteps.slice(0, revealedCount).map((s) => (
              <div
                key={s.rank}
                className="mono"
                style={{
                  fontSize: "var(--text-label)",
                  color: s.crossed ? "var(--positive)" : "var(--muted)",
                }}
              >
                #{s.rank} {s.fullName} · score {s.score}
                {s.crossed ? " · threshold crossed" : ""}
              </div>
            ))}
          </div>
        )}

        {tavilySurfaced && !scanning && (
          <div
            style={{
              marginTop: "12px",
              padding: "10px 12px",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius)",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              gap: "8px",
            }}
          >
            <span
              style={{
                background: "rgba(79,70,229,0.10)",
                color: "var(--accent)",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "var(--text-label)",
                fontWeight: 600,
              }}
            >
              tavily
            </span>
            <span style={{ fontWeight: 600 }}>{tavilySurfaced.name}</span>
            <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
              relevance {tavilySurfaced.score} · replaying captured Tavily run
            </span>
            <a
              href={tavilySurfaced.url}
              target="_blank"
              rel="noreferrer"
              className="mono"
              style={{ marginLeft: "auto", color: "var(--accent)", fontSize: "var(--text-label)" }}
            >
              ↳ source
            </a>
          </div>
        )}
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        <Column title="Outbound" subtitle="sourced by the fund">
          {outbound.map((c) => (
            <OpportunityCard
              key={c.id}
              card={c}
              thesis={activeThesis}
              justSurfaced={c.id === surfacedId}
            />
          ))}
        </Column>
        <Column title="Inbound" subtitle="founder applied">
          {inbound.map((c) => (
            <OpportunityCard key={c.id} card={c} thesis={activeThesis} />
          ))}
        </Column>
      </div>

      {drawerOpen && (
        <ThesisDrawer
          thesis={thesis}
          wideCheck={wideCheck}
          effectiveMax={effectiveMax}
          onToggleCheck={() => setWideCheck((v) => !v)}
          onClose={() => setDrawerOpen(false)}
        />
      )}
    </section>
  );
}

function Column({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{ fontSize: "var(--text-section)", margin: 0 }}>{title}</h2>
        <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>{subtitle}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>{children}</div>
    </div>
  );
}

function OpportunityCard({
  card,
  thesis,
  justSurfaced = false,
}: {
  card: CardData;
  thesis: ThesisView;
  justSurfaced?: boolean;
}) {
  const fit = evaluateThesisFit(
    { sector: card.sector, stage: card.stage, geo: card.geo, askAmountCents: card.askAmountCents },
    thesis,
  );
  const offThesis = !fit.onThesis;

  return (
    <article
      style={{
        background: "var(--surface)",
        border: justSurfaced ? "1px solid var(--accent)" : "1px solid var(--border)",
        boxShadow: justSurfaced ? "0 0 0 3px rgba(79,70,229,0.18)" : "none",
        borderRadius: "var(--radius)",
        padding: "16px",
        opacity: offThesis ? 0.55 : 1,
        transition: "opacity 160ms ease",
      }}
    >
      {justSurfaced && (
        <div style={{ marginBottom: "8px" }}>
          <Badge>threshold crossed</Badge>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-section)" }}>{card.companyName}</div>
          <div style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
            {card.personName} · {card.sector} · {card.stage} · {card.geo} · asks{" "}
            {formatUsd(card.askAmountCents)}
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: "64px" }}>
          <div
            className="mono"
            style={{ fontSize: "22px", lineHeight: 1, fontWeight: 600, textAlign: "right" }}
          >
            {card.founderScore}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>Founder Score</div>
        </div>
      </div>

      {/* Channel badge */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
        {card.sourceChannel && <Badge>{card.sourceChannel}</Badge>}
        <Badge tone="muted">{card.source}</Badge>
        {offThesis && <Badge tone="negative">{fit.failReasons[0]}</Badge>}
      </div>

      {/* Thesis-fit chips */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px" }}>
        {(Object.keys(fit.checks) as (keyof typeof fit.checks)[]).map((k) => (
          <Chip key={k} ok={fit.checks[k]}>
            {CHIP_LABELS[k]}
          </Chip>
        ))}
      </div>

      {/* Why surfaced (R3) — backed by an Evidence record */}
      {card.whySurfaced && (
        <p
          title={card.whySurfacedEvidence?.excerpt ?? undefined}
          style={{
            margin: "12px 0 0",
            paddingLeft: "10px",
            borderLeft: "2px solid var(--border)",
            color: "var(--muted)",
            fontSize: "var(--text-body)",
          }}
        >
          {card.whySurfaced}
          {card.whySurfacedEvidence && (
            <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-label)" }} className="mono">
              ↳ {card.whySurfacedEvidence.locator}
            </span>
          )}
        </p>
      )}

      {/* Returning-founder beat */}
      {card.history.map((h) => (
        <div
          key={h.appliedAt}
          style={{
            marginTop: "10px",
            fontSize: "var(--text-label)",
            color: "var(--positive)",
          }}
        >
          {h.note ?? `Applied ${h.appliedAt} score ${h.founderScore}`}
        </div>
      ))}
    </article>
  );
}

function Badge({
  children,
  tone = "accent",
}: {
  children: React.ReactNode;
  tone?: "accent" | "muted" | "negative";
}) {
  const colors: Record<string, { bg: string; fg: string }> = {
    accent: { bg: "rgba(79,70,229,0.10)", fg: "var(--accent)" },
    muted: { bg: "var(--bg)", fg: "var(--muted)" },
    negative: { bg: "rgba(201,42,42,0.10)", fg: "var(--negative)" },
  };
  const c = colors[tone];
  return (
    <span
      style={{
        background: c.bg,
        color: c.fg,
        borderRadius: "999px",
        padding: "2px 8px",
        fontSize: "var(--text-label)",
        fontWeight: 500,
      }}
    >
      {children}
    </span>
  );
}

function Chip({ children, ok }: { children: React.ReactNode; ok: boolean }) {
  return (
    <span
      style={{
        border: `1px solid ${ok ? "var(--positive)" : "var(--negative)"}`,
        color: ok ? "var(--positive)" : "var(--negative)",
        borderRadius: "var(--radius)",
        padding: "1px 7px",
        fontSize: "var(--text-label)",
      }}
    >
      {ok ? "✓" : "✕"} {children}
    </span>
  );
}

function ThesisPill({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "999px",
        padding: "2px 10px",
        fontSize: "var(--text-label)",
        color: "var(--muted)",
      }}
    >
      {children}
    </span>
  );
}

function ThesisDrawer({
  thesis,
  wideCheck,
  effectiveMax,
  onToggleCheck,
  onClose,
}: {
  thesis: ThesisData;
  wideCheck: boolean;
  effectiveMax: number;
  onToggleCheck: () => void;
  onClose: () => void;
}) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,23,28,0.35)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
      }}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "360px",
          maxWidth: "90vw",
          height: "100%",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          padding: "24px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "var(--text-section)", margin: 0 }}>Thesis</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}
          >
            Close ✕
          </button>
        </div>

        <Field label="Name" value={thesis.name} />
        <Field label="Sectors" value={thesis.sectors.join(", ")} />
        <Field label="Stages" value={thesis.stages.join(", ")} />
        <Field label="Geographies" value={thesis.geos.join(", ")} />
        <Field label="Technical bar" value={String(thesis.technicalBar)} />
        <Field
          label="Check size"
          value={`${formatUsd(thesis.checkSizeMinCents)} – ${formatUsd(effectiveMax)}`}
        />

        {/* R4 live check-size toggle */}
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: "16px",
            padding: "12px",
            background: "var(--bg)",
            borderRadius: "var(--radius)",
            cursor: "pointer",
          }}
        >
          <input type="checkbox" checked={wideCheck} onChange={onToggleCheck} />
          <span>
            Raise check ceiling to <span className="mono">$2M</span>
            <span style={{ display: "block", color: "var(--muted)", fontSize: "var(--text-label)" }}>
              Off-thesis cards re-evaluate live — BrightCart un-greys.
            </span>
          </span>
        </label>
      </aside>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div style={{ color: "var(--muted)", fontSize: "var(--text-label)", textTransform: "uppercase" }}>
        {label}
      </div>
      <div>{value}</div>
    </div>
  );
}
