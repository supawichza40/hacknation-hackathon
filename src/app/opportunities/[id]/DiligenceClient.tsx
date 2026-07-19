"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DiligenceView, Slide } from "@/lib/diligence";
import type { Claim } from "@/lib/claims";
import type { AxisScore, Trend } from "@/lib/scoring";
import type { Verdict, DecisionRow } from "@/lib/decision";
import type { Memo } from "@/lib/memo";

const TRUST: Record<Claim["status"], { color: string; label: string }> = {
  verified: { color: "var(--positive)", label: "verified" },
  unsupported: { color: "var(--warning)", label: "unsupported" },
  contradicted: { color: "var(--negative)", label: "contradicted" },
};

const TREND_GLYPH: Record<Trend, string> = {
  improving: "▲",
  declining: "▼",
  baseline: "—",
};

const VERDICT_LABEL: Record<Verdict, string> = {
  invest: "Invest",
  pass: "Pass",
  more_info: "More info",
};

function usd(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtElapsed(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

const card: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "16px",
};

const sectionTitle: React.CSSProperties = {
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  margin: "0 0 12px",
};

const badge: React.CSSProperties = {
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--muted)",
  border: "1px solid var(--border)",
  borderRadius: "999px",
  padding: "2px 8px",
};

const banner: React.CSSProperties = {
  borderRadius: "var(--radius)",
  padding: "12px 16px",
  fontSize: "var(--text-body)",
  border: "1px solid var(--border)",
};

// Async-analysis status for an /apply submission. While "analyzing", it polls the
// status endpoint and refreshes the server component when the job finishes; on
// "analysis_unavailable" it shows the real reason (honest, never a fabricated score).
// Nothing renders once the analysis is ready or for a normally-seeded opportunity.
function AnalysisBanner({ view }: { view: DiligenceView }) {
  const router = useRouter();
  const status = view.analysisStatus;

  useEffect(() => {
    if (status !== "analyzing") return;
    const t = setInterval(async () => {
      try {
        const res = await fetch(`/api/apply/status?id=${encodeURIComponent(view.opportunityId)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { analysisStatus?: string | null };
        if (data.analysisStatus && data.analysisStatus !== "analyzing") router.refresh();
      } catch {
        // transient network error — keep polling
      }
    }, 4000);
    return () => clearInterval(t);
  }, [status, view.opportunityId, router]);

  if (status === "analyzing") {
    return (
      <div
        role="status"
        style={{ ...banner, borderColor: "var(--accent)", color: "var(--text)" }}
      >
        <strong>Analyzing repository…</strong> Cloning the repo, extracting the knowledge graph,
        scoring the axes, and drafting the memo. This can take a couple of minutes — the page
        refreshes itself when the analysis is ready.
      </div>
    );
  }
  if (status === "analysis_unavailable") {
    return (
      <div role="alert" style={{ ...banner, borderColor: "var(--warning)", color: "var(--text)" }}>
        <strong>Analysis unavailable.</strong>{" "}
        {view.analysisReason ?? "The analysis pipeline could not complete for this repository."}
      </div>
    );
  }
  return null;
}

export default function DiligenceClient({ view }: { view: DiligenceView }) {
  const contradicted = useMemo(
    () => view.claims.find((c) => c.status === "contradicted") ?? null,
    [view.claims],
  );
  const slide = (n: number): Slide | undefined => view.slides.find((s) => s.slideNo === n);

  const [openClaim, setOpenClaim] = useState<Claim | null>(null);
  const [showReasoning, setShowReasoning] = useState(false);
  const [showBrief, setShowBrief] = useState(false);

  // R2 signal->decision timer: starts when the analyst opens the file, freezes
  // when a decision is saved. Measures this session's diligence latency (honest).
  const [t0] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());
  const [decision, setDecision] = useState<DecisionRow | null>(view.decision);
  const [savedAt, setSavedAt] = useState<number | null>(view.decision ? Date.now() : null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict>("invest");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (savedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [savedAt]);

  const timerMs = (savedAt ?? now) - t0;

  async function submitDecision() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/decide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: view.slug, verdict, note: note.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.decision) {
        throw new Error(data.error ?? "decision was not confirmed");
      }
      // Success is taken ONLY from the read-back row the API returns.
      setDecision(data.decision as DecisionRow);
      setSavedAt(Date.now());
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Async /apply analysis status (analyzing / unavailable); nothing when ready */}
      <AnalysisBanner view={view} />

      {/* Header */}
      <header style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ flex: "1 1 320px" }}>
          <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 6px" }}>{view.companyName}</h1>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
            <span style={badge}>{view.source}</span>
            {view.sourceChannel && <span style={badge}>{view.sourceChannel}</span>}
            <span style={badge}>{view.status}</span>
            <span style={{ color: "var(--muted)" }}>{view.personName}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ textAlign: "right" }}>
            <div style={sectionTitle}>Founder Score</div>
            <div className="mono" style={{ fontSize: "32px", lineHeight: 1, fontWeight: 600 }}>
              {view.founderScore}
            </div>
          </div>
          <span
            style={{
              ...badge,
              color: "var(--text)",
              borderColor: savedAt ? "var(--positive)" : "var(--border)",
            }}
            title="Time from opening this file to saving a decision"
          >
            Signal → decision:{" "}
            <span className="mono">{savedAt ? fmtElapsed(timerMs) : fmtElapsed(timerMs)}</span>
            {savedAt ? " (final)" : ""}
          </span>
          <button
            type="button"
            onClick={() => setShowBrief((v) => !v)}
            style={{
              ...badge,
              cursor: "pointer",
              color: "var(--accent)",
              borderColor: "var(--accent)",
              background: "var(--surface)",
            }}
          >
            ▶ Play investment brief
          </button>
        </div>
      </header>

      {/* Replay-mode provenance label */}
      {view.provenanceLabel && (
        <div
          style={{
            ...card,
            padding: "8px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            borderColor: "var(--accent)",
          }}
        >
          <span style={{ color: "var(--muted)", fontSize: "var(--text-body)" }}>
            {view.provenanceLabel}
          </span>
          <button
            type="button"
            onClick={() => setShowReasoning(true)}
            style={{
              ...badge,
              cursor: "pointer",
              color: "var(--accent)",
              borderColor: "var(--accent)",
              background: "var(--surface)",
            }}
          >
            Show reasoning
          </button>
        </div>
      )}

      {/* Play investment brief — honest fallback (no MP3 yet) */}
      {showBrief && (
        <div style={{ ...card, borderColor: "var(--accent)" }}>
          <div style={sectionTitle}>Voice unavailable — script:</div>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            {view.companyName}, {view.stage} {view.sector}. Founder score{" "}
            <span className="mono">{view.founderScore}</span>
            {view.axes[0]?.trend === "improving" ? " and rising" : ""}. Strongest axis is{" "}
            {[...view.axes].sort((a, b) => b.score - a.score)[0]?.label} at{" "}
            <span className="mono">{[...view.axes].sort((a, b) => b.score - a.score)[0]?.score}</span>;
            weakest is {[...view.axes].sort((a, b) => a.score - b.score)[0]?.label} at{" "}
            <span className="mono">{[...view.axes].sort((a, b) => a.score - b.score)[0]?.score}</span>
            {contradicted
              ? ` — one core product claim ("${contradicted.text}") is contradicted by the repo.`
              : "."}{" "}
            Recommendation is deferred to your decision below.
          </p>
        </div>
      )}

      {/* Overview */}
      <div style={card}>
        <div style={sectionTitle}>Overview</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", marginBottom: "12px" }}>
          <Meta label="Sector" value={view.sector} />
          <Meta label="Stage" value={view.stage} />
          <Meta label="Geo" value={view.geo} />
          <Meta label="Ask" value={usd(view.askAmountCents)} mono />
          <Meta label="Graph" value={`${view.graph.nodes} nodes · ${view.graph.edges} edges`} />
        </div>
        {view.whySurfaced && (
          <p style={{ margin: "0 0 12px", color: "var(--muted)" }}>{view.whySurfaced}</p>
        )}
        {view.facts.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {view.facts.map((f) => (
              <span key={f.key} style={badge}>
                {f.key}: <span className="mono" style={{ color: "var(--text)" }}>{f.value}</span>
              </span>
            ))}
          </div>
        )}
        {view.unknowns.length > 0 && (
          <p style={{ margin: "12px 0 0", color: "var(--warning)", fontSize: "var(--text-body)" }}>
            Unknowns: {view.unknowns.join(", ")}
          </p>
        )}
      </div>

      {/* Axis score cards */}
      <div>
        <div style={sectionTitle}>Scores</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {view.axes.map((a) => (
            <AxisCard key={a.axis} axis={a} />
          ))}
        </div>
      </div>

      {/* Claims list with trust states */}
      <div style={card}>
        <div style={sectionTitle}>Deck claims · trust</div>
        {view.claims.length === 0 ? (
          <p style={{ margin: 0, color: "var(--muted)" }}>No claims extracted for this opportunity yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {view.claims.map((c) => {
              const t = TRUST[c.status];
              const clickable = c.status === "contradicted";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={clickable ? () => setOpenClaim(c) : undefined}
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "1px solid var(--border)",
                    borderLeft: `3px solid ${t.color}`,
                    borderRadius: "var(--radius)",
                    background: "var(--surface)",
                    cursor: clickable ? "pointer" : "default",
                    font: "inherit",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      ...badge,
                      color: t.color,
                      borderColor: t.color,
                      flexShrink: 0,
                    }}
                  >
                    {t.label}
                  </span>
                  <span style={{ flex: 1 }}>
                    {c.text}
                    <span className="mono" style={{ color: "var(--muted)", marginLeft: "8px" }}>
                      slide {c.slideNo}
                    </span>
                  </span>
                  {clickable && (
                    <span style={{ color: t.color, flexShrink: 0 }}>See conflict →</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Investment memo (M4 — LLM call #2) */}
      <div style={card}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "12px" }}>
          <div style={sectionTitle}>Investment memo</div>
          {view.memoProvenanceLabel && (
            <span style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
              {view.memoProvenanceLabel}
            </span>
          )}
        </div>
        {view.memo ? (
          <MemoView memo={view.memo} claims={view.claims} />
        ) : (
          <span style={{ color: "var(--muted)" }}>No memo generated for this opportunity yet.</span>
        )}
      </div>

      {/* Decision CTA */}
      <div style={{ ...card, borderColor: decision ? "var(--positive)" : "var(--border)" }}>
        <div style={sectionTitle}>Decision</div>
        {decision ? (
          <div>
            <p style={{ margin: "0 0 4px" }}>
              Saved decision:{" "}
              <strong style={{ color: "var(--positive)" }}>{VERDICT_LABEL[decision.verdict]}</strong>{" "}
              <span className="mono" style={{ color: "var(--muted)" }}>
                {decision.decidedAt.slice(0, 19).replace("T", " ")}Z
              </span>
            </p>
            {decision.note && <p style={{ margin: "0 0 8px", color: "var(--muted)" }}>“{decision.note}”</p>}
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "var(--text-body)" }}>
              This is your recorded decision (read back from the database) — not an AI recommendation.
            </p>
            <button
              type="button"
              onClick={() => {
                setDecision(null);
                setSavedAt(null);
              }}
              style={{
                ...badge,
                marginTop: "12px",
                cursor: "pointer",
                color: "var(--accent)",
                borderColor: "var(--accent)",
                background: "var(--surface)",
              }}
            >
              Change decision
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {(Object.keys(VERDICT_LABEL) as Verdict[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVerdict(v)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "var(--radius)",
                    border: `1px solid ${verdict === v ? "var(--accent)" : "var(--border)"}`,
                    background: verdict === v ? "var(--accent)" : "var(--surface)",
                    color: verdict === v ? "#fff" : "var(--text)",
                    cursor: "pointer",
                    font: "inherit",
                  }}
                >
                  {VERDICT_LABEL[v]}
                </button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              rows={2}
              style={{
                width: "100%",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "8px",
                font: "inherit",
                resize: "vertical",
              }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                type="button"
                onClick={submitDecision}
                disabled={saving}
                style={{
                  padding: "8px 20px",
                  borderRadius: "var(--radius)",
                  border: "1px solid var(--accent)",
                  background: saving ? "var(--muted)" : "var(--accent)",
                  color: "#fff",
                  cursor: saving ? "wait" : "pointer",
                  font: "inherit",
                }}
              >
                {saving ? "Saving…" : "Save decision"}
              </button>
              {error && <span style={{ color: "var(--negative)" }}>{error}</span>}
            </div>
          </div>
        )}
      </div>

      <div>
        <Link href={`/opportunities/${view.slug}/graph`} style={{ color: "var(--accent)" }}>
          Open graph explorer →
        </Link>
      </div>

      {/* THE WOW MOMENT — split evidence view for the contradicted claim */}
      {openClaim && (
        <EvidenceSplit claim={openClaim} slide={slide(openClaim.slideNo)} onClose={() => setOpenClaim(null)} />
      )}

      {/* R5 reasoning drawer */}
      {showReasoning && (
        <ReasoningDrawer view={view} onClose={() => setShowReasoning(false)} />
      )}
    </section>
  );
}

const MEMO_SECTIONS: { key: keyof Memo["sections"]; label: string }[] = [
  { key: "thesisFit", label: "Thesis fit" },
  { key: "team", label: "Team" },
  { key: "market", label: "Market" },
  { key: "product", label: "Product" },
  { key: "risks", label: "Risks" },
];

function MemoView({ memo, claims }: { memo: Memo; claims: Claim[] }) {
  const claimText = new Map(claims.map((c) => [c.id, c.text]));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
      {memo.recommendation && (
        <p style={{ margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{memo.recommendation}</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {MEMO_SECTIONS.map(({ key, label }) => {
          const s = memo.sections[key];
          return (
            <div key={key}>
              <div style={{ ...sectionTitle, margin: "0 0 4px" }}>{label}</div>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{s.text}</p>
              {s.citations.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "6px" }}>
                  {s.citations.map((c, i) => (
                    <span
                      key={`${c.ref}-${i}`}
                      className="mono"
                      title={c.quote ?? claimText.get(c.ref) ?? c.ref}
                      style={{
                        ...badge,
                        color: "var(--accent)",
                        borderColor: "var(--accent)",
                        textTransform: "none",
                      }}
                    >
                      ↳ {c.ref}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* R6 gaps — honest "not disclosed" rows, never inferred values */}
      {memo.gaps.length > 0 && (
        <div>
          <div style={{ ...sectionTitle, margin: "0 0 6px" }}>Disclosure gaps</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {memo.gaps.map((g) => (
              <div
                key={g.category}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "baseline",
                  padding: "6px 10px",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--warning)",
                  borderRadius: "var(--radius)",
                }}
              >
                <span style={{ fontWeight: 600, minWidth: "128px" }}>{g.category}</span>
                <span style={{ color: "var(--warning)", fontSize: "var(--text-body)" }}>{g.note}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div style={sectionTitle}>{label}</div>
      <div className={mono ? "mono" : undefined} style={{ fontSize: "var(--text-body)" }}>
        {value}
      </div>
    </div>
  );
}

function AxisCard({ axis }: { axis: AxisScore }) {
  const trendColor =
    axis.trend === "improving"
      ? "var(--positive)"
      : axis.trend === "declining"
        ? "var(--negative)"
        : "var(--muted)";
  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "var(--text-section)", fontWeight: 600 }}>{axis.label}</span>
        <span className="mono" style={{ fontSize: "24px", fontWeight: 600 }}>
          {axis.score}
        </span>
      </div>
      <p style={{ margin: "8px 0", color: "var(--muted)", minHeight: "2.6em" }}>{axis.because}</p>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-label)" }}>
        <span style={{ color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {axis.evidenceCount} evidence
        </span>
        <span style={{ color: trendColor, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {TREND_GLYPH[axis.trend]} {axis.trend}
        </span>
      </div>
    </div>
  );
}

function EvidenceSplit({
  claim,
  slide,
  onClose,
}: {
  claim: Claim;
  slide: Slide | undefined;
  onClose: () => void;
}) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const deckEv = claim.evidence.filter((e) => e.locator.startsWith("deck://"));
  const repoEv = claim.evidence.filter((e) => !e.locator.startsWith("deck://"));

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,23,28,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 50,
        opacity: shown ? 1 : 0,
        transition: "opacity 180ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          maxWidth: "860px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          transform: shown ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
          transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ ...badge, color: "var(--negative)", borderColor: "var(--negative)" }}>
              contradicted
            </span>
            <strong>{claim.text}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ ...badge, cursor: "pointer", background: "var(--surface)" }}
          >
            Close
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
          <div style={{ padding: "16px", borderRight: "1px solid var(--border)" }}>
            <div style={sectionTitle}>The deck says</div>
            {slide && (
              <p style={{ margin: "0 0 10px", fontWeight: 600 }}>
                Slide {slide.slideNo}: {slide.title}
              </p>
            )}
            {deckEv.map((e, i) => (
              <blockquote
                key={i}
                style={{
                  margin: "0 0 8px",
                  padding: "8px 10px",
                  borderLeft: "3px solid var(--negative)",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                }}
              >
                <p style={{ margin: "0 0 4px" }}>“{e.excerpt}”</p>
                <span className="mono" style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
                  {e.locator}
                </span>
              </blockquote>
            ))}
          </div>
          <div style={{ padding: "16px" }}>
            <div style={sectionTitle}>The repo shows</div>
            {repoEv.map((e, i) => (
              <blockquote
                key={i}
                style={{
                  margin: "0 0 8px",
                  padding: "8px 10px",
                  borderLeft: "3px solid var(--positive)",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                }}
              >
                <p style={{ margin: "0 0 4px" }}>“{e.excerpt}”</p>
                <span className="mono" style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
                  {e.locator}
                </span>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReasoningDrawer({ view, onClose }: { view: DiligenceView; onClose: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(r);
  }, []);
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,23,28,0.4)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 50,
        opacity: shown ? 1 : 0,
        transition: "opacity 180ms ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          width: "min(440px, 92vw)",
          height: "100%",
          overflow: "auto",
          padding: "20px",
          transform: shown ? "translateX(0)" : "translateX(24px)",
          transition: "transform 220ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "var(--text-section)", margin: 0 }}>How this was reasoned</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ ...badge, cursor: "pointer", background: "var(--surface)" }}
          >
            Close
          </button>
        </div>
        {view.reasoning.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No provenance steps captured for this opportunity.</p>
        ) : (
          <ol style={{ margin: "16px 0 0", padding: 0, listStyle: "none" }}>
            {view.reasoning.map((s, i) => (
              <li
                key={i}
                style={{
                  position: "relative",
                  paddingLeft: "20px",
                  paddingBottom: "16px",
                  borderLeft: i === view.reasoning.length - 1 ? "1px solid transparent" : "1px solid var(--border)",
                  marginLeft: "4px",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "-5px",
                    top: "3px",
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                  }}
                />
                <div style={{ fontWeight: 600 }}>{s.stage}</div>
                {s.note && <div style={{ color: "var(--muted)" }}>{s.note}</div>}
                {s.startedAt && (
                  <div className="mono" style={{ color: "var(--muted)", fontSize: "var(--text-label)" }}>
                    {s.startedAt.slice(0, 19).replace("T", " ")}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
