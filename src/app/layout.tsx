import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE, sessionIsValid } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "FounderGraph — investor diligence",
  description:
    "Investor diligence workspace: memory-backed pipeline, evidence-cited claims, and a repo knowledge graph.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const authed = sessionIsValid(store.get(SESSION_COOKIE)?.value);

  return (
    <html lang="en">
      <body>
        <header style={headerStyle}>
          <Link href="/" style={brandStyle}>
            FounderGraph
          </Link>
          <nav style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <Link href="/" style={navLink}>
              Pipeline
            </Link>
            <Link href="/apply" style={navLink}>
              Apply
            </Link>
            {authed ? (
              <a href="/api/logout" style={navLink}>
                Log out
              </a>
            ) : (
              <Link href="/login" style={navLink}>
                Log in
              </Link>
            )}
          </nav>
          <span style={sessionBadge}>{authed ? "Investor session" : "Demo"}</span>
        </header>
        <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px" }}>{children}</main>
      </body>
    </html>
  );
}

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "24px",
  padding: "12px 24px",
  background: "var(--surface)",
  borderBottom: "1px solid var(--border)",
};
const brandStyle: CSSProperties = {
  fontWeight: 600,
  fontSize: "var(--text-section)",
  color: "var(--text)",
};
const navLink: CSSProperties = { color: "var(--muted)", fontSize: "var(--text-body)" };
const sessionBadge: CSSProperties = {
  marginLeft: "auto",
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
};
