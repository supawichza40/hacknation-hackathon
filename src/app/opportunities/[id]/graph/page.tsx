export default async function GraphPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <section>
      <h1 style={{ fontSize: "var(--text-title)", margin: "0 0 8px" }}>
        Graph explorer — <span className="mono">{id}</span>
      </h1>
      <p style={{ color: "var(--muted)", margin: 0 }}>
        React Flow node drawer + streaming cited chat. Scaffold placeholder (M0).
      </p>
    </section>
  );
}
