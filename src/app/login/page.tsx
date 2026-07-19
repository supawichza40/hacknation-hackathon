"use client";

import { useState, type CSSProperties } from "react";

// Demo-lite investor login (VC-BRAIN-PLAN.md §0.5 d13). Posts the single demo
// credential to /api/login; on success the session cookie is set and we land on
// Pipeline. Honest copy: this is a demo gate, not production authentication.
export default function LoginPage() {
  const [email, setEmail] = useState("investor@foundergraph.demo");
  const [password, setPassword] = useState("demo");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("Those credentials don’t match the demo investor login.");
        setSubmitting(false);
        return;
      }
      // Full navigation so the new cookie applies and middleware re-runs.
      const from = new URLSearchParams(window.location.search).get("from");
      window.location.href = from && from.startsWith("/") ? from : "/";
    } catch {
      setError("Couldn’t reach the server. Check it’s running and try again.");
      setSubmitting(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <p style={eyebrow}>FounderGraph · Investor</p>
        <h1 style={title}>Sign in</h1>
        <p style={subtitle}>Investor diligence workspace. Founders don’t need an account — they can</p>
        <p style={{ ...subtitle, marginTop: 0 }}>
          <a href="/apply">apply here</a>.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <label style={label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={input}
          />

          <label style={{ ...label, marginTop: "12px" }} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={input}
          />

          {error && (
            <p role="alert" style={errorText}>
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} style={{ ...button, opacity: submitting ? 0.6 : 1 }}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={hintBox}>
          <span style={{ fontWeight: 600 }}>Demo credential</span>
          <span className="mono" style={{ color: "var(--text)" }}>
            investor@foundergraph.demo / demo
          </span>
        </div>
        <p style={disclaimer}>
          Demo gate only — a single shared login, not production authentication. The
          data APIs stay open.
        </p>
      </div>
    </div>
  );
}

const wrap: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  paddingTop: "48px",
};
const card: CSSProperties = {
  width: "100%",
  maxWidth: "380px",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  padding: "28px",
};
const eyebrow: CSSProperties = {
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  margin: "0 0 6px",
};
const title: CSSProperties = { fontSize: "var(--text-title)", margin: "0 0 8px" };
const subtitle: CSSProperties = { color: "var(--muted)", margin: "0 0 2px", fontSize: "var(--text-body)" };
const label: CSSProperties = {
  display: "block",
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  margin: "16px 0 6px",
};
const input: CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  fontSize: "var(--text-body)",
  fontFamily: "var(--font-ui)",
  color: "var(--text)",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  outline: "none",
};
const button: CSSProperties = {
  width: "100%",
  marginTop: "20px",
  padding: "10px 14px",
  fontSize: "var(--text-body)",
  fontWeight: 600,
  color: "#fff",
  background: "var(--accent)",
  border: "1px solid var(--accent)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
};
const errorText: CSSProperties = {
  color: "var(--negative)",
  fontSize: "var(--text-body)",
  margin: "14px 0 0",
};
const hintBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2px",
  marginTop: "20px",
  padding: "10px 12px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  fontSize: "var(--text-body)",
};
const disclaimer: CSSProperties = {
  color: "var(--muted)",
  fontSize: "var(--text-label)",
  lineHeight: 1.5,
  margin: "12px 0 0",
};
