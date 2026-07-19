import Link from "next/link";
import { getDiligenceView } from "@/lib/diligence";
import DiligenceClient from "./DiligenceClient";

// Reads the SQLite file at request time so a fresh seed/decision shows without a rebuild.
export const dynamic = "force-dynamic";

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getDiligenceView(id);

  if (!view) {
    return (
      <section>
        <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
          Diligence — <span className="mono">{id}</span>
        </h1>
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "var(--text-section)" }}>Opportunity not found</p>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>
            No opportunity is registered for <span className="mono">{id}</span>.{" "}
            <Link href="/" style={{ color: "var(--accent)" }}>
              Back to pipeline
            </Link>
          </p>
        </div>
      </section>
    );
  }

  return <DiligenceClient view={view} />;
}
