import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "VC Brain",
  description: "Venture diligence product — deploy $100K checks in 24 hours.",
};

const nav = [
  { href: "/", label: "Pipeline" },
  { href: "/apply", label: "Apply" },
  { href: "/login", label: "Login" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            padding: "12px 24px",
            background: "var(--surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Link
            href="/"
            style={{
              fontWeight: 600,
              fontSize: "var(--text-section)",
              color: "var(--text)",
            }}
          >
            VC Brain
          </Link>
          <nav style={{ display: "flex", gap: "16px" }}>
            {nav.map((item) => (
              <Link key={item.href} href={item.href} style={{ color: "var(--muted)" }}>
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
