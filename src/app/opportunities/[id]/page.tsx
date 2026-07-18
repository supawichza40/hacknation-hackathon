import Link from "next/link";

export default async function OpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
        Diligence — <span className="mono">{id}</span>
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 24px" }}>
        Overview + Claims + Memo, one scrolling page with a decision CTA. Scaffold placeholder (M0).
      </p>
      <Link href={`/opportunities/${id}/graph`} style={{ color: "var(--accent)" }}>
        Open graph explorer →
      </Link>
    </section>
  );
}
