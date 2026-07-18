import Link from "next/link";

export default function PipelinePage() {
  return (
    <section>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>Pipeline</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
        Deal pipeline board — thesis lives in a settings drawer. Scaffold placeholder (M0).
      </p>
      <Link href="/opportunities/hero" style={{ color: "var(--accent)" }}>
        Open hero opportunity →
      </Link>
    </section>
  );
}
