"use client";

import { useState, type CSSProperties } from "react";

// Public founder application (VC-BRAIN-PLAN.md §0.5 d9, screen map §5.4). Minimal
// inbound form → POST /api/apply → an inbound Opportunity the investor sees in
// Pipeline. Deck is an OPTIONAL URL (no file upload = no traversal surface).
type Fields = { companyName?: string; repoUrl?: string; deckUrl?: string };
type Status = "initial" | "submitting" | "success" | "error";

export default function ApplyPage() {
  const [companyName, setCompanyName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [deckUrl, setDeckUrl] = useState("");
  const [founderName, setFounderName] = useState("");
  const [links, setLinks] = useState("");

  const [status, setStatus] = useState<Status>("initial");
  const [fieldErrors, setFieldErrors] = useState<Fields>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<{ opportunityId: string; deduped: boolean } | null>(null);

  function clientValidate(): Fields {
    const f: Fields = {};
    if (!companyName.trim()) f.companyName = "Company name is required.";
    if (!repoUrl.trim()) f.repoUrl = "A public repo URL is required.";
    else if (!/^https?:\/\//i.test(repoUrl.trim())) f.repoUrl = "Enter a valid http(s) URL.";
    if (deckUrl.trim() && !/^https?:\/\//i.test(deckUrl.trim()))
      f.deckUrl = "Enter a valid http(s) deck URL, or leave it blank.";
    return f;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return; // double-submit guard

    const clientErrors = clientValidate();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      setStatus("initial");
      return;
    }

    setStatus("submitting");
    setFieldErrors({});
    setFormError(null);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          repoUrl: repoUrl.trim(),
          deckUrl: deckUrl.trim() || undefined,
          founderName: founderName.trim() || undefined,
          links: links.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResult({ opportunityId: data.opportunityId, deduped: Boolean(data.deduped) });
        setStatus("success");
        return;
      }
      if (res.status === 400 && data?.fields) {
        setFieldErrors(data.fields as Fields);
        setStatus("initial");
        return;
      }
      // Values stay in state, so nothing the founder typed is lost on failure.
      setFormError("We couldn’t save your application. Nothing was recorded — please try again.");
      setStatus("error");
    } catch {
      setFormError("Couldn’t reach the server. Nothing was recorded — please try again.");
      setStatus("error");
    }
  }

  function reset() {
    setCompanyName("");
    setRepoUrl("");
    setDeckUrl("");
    setFounderName("");
    setLinks("");
    setResult(null);
    setFieldErrors({});
    setFormError(null);
    setStatus("initial");
  }

  if (status === "success" && result) {
    return (
      <div style={narrow}>
        <div style={{ ...card, borderColor: "var(--positive)" }}>
          <p style={{ ...eyebrow, color: "var(--positive)" }}>Application received</p>
          <h1 style={title}>You’re in the pipeline</h1>
          <p style={subtitle}>
            {result.deduped
              ? "We already had this repo on file — we’ve refreshed your existing application."
              : "Thanks — an investor will see your company as an inbound opportunity."}
          </p>
          <div style={hintBox}>
            <span style={{ fontSize: "var(--text-label)", textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>
              Opportunity ID
            </span>
            <span className="mono" style={{ color: "var(--text)" }}>
              {result.opportunityId}
            </span>
          </div>
          <button type="button" onClick={reset} style={secondaryButton}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <div style={narrow}>
      <p style={eyebrow}>FounderGraph</p>
      <h1 style={title}>Apply for diligence</h1>
      <p style={subtitle}>
        Point us at your repo and we’ll start the analysis. A deck is optional — we
        can start from your code alone.
      </p>

      <form onSubmit={onSubmit} noValidate style={{ marginTop: "20px", maxWidth: "560px" }}>
        <Field
          id="companyName"
          label="Company name"
          required
          value={companyName}
          onChange={setCompanyName}
          error={fieldErrors.companyName}
          placeholder="Acme AI"
        />
        <Field
          id="repoUrl"
          label="Repository URL"
          required
          value={repoUrl}
          onChange={setRepoUrl}
          error={fieldErrors.repoUrl}
          placeholder="https://github.com/acme/acme"
          mono
        />
        <Field
          id="deckUrl"
          label="Deck URL"
          hint="Optional — we can start from your repo alone."
          value={deckUrl}
          onChange={setDeckUrl}
          error={fieldErrors.deckUrl}
          placeholder="https://…/deck.pdf"
          mono
        />
        <Field
          id="founderName"
          label="Your name"
          hint="Optional"
          value={founderName}
          onChange={setFounderName}
          placeholder="Ada Lovelace"
        />
        <Field
          id="links"
          label="Other links"
          hint="Optional — LinkedIn, site, anything useful"
          value={links}
          onChange={setLinks}
          placeholder="https://linkedin.com/in/…"
        />

        {formError && (
          <p role="alert" style={errorText}>
            {formError}
          </p>
        )}

        <button type="submit" disabled={submitting} style={{ ...button, opacity: submitting ? 0.6 : 1 }}>
          {submitting ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}

function Field(props: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <label htmlFor={props.id} style={labelStyle}>
        {props.label}
        {props.required && <span style={{ color: "var(--negative)" }}> *</span>}
        {props.hint && <span style={hintInline}> — {props.hint}</span>}
      </label>
      <input
        id={props.id}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        aria-invalid={props.error ? true : undefined}
        style={{
          ...inputStyle,
          fontFamily: props.mono ? "var(--font-mono)" : "var(--font-ui)",
          borderColor: props.error ? "var(--negative)" : "var(--border)",
        }}
      />
      {props.error && <p style={fieldErrorText}>{props.error}</p>}
    </div>
  );
}

const narrow: CSSProperties = { maxWidth: "640px" };
const card: CSSProperties = {
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
const subtitle: CSSProperties = { color: "var(--muted)", margin: 0, fontSize: "var(--text-body)" };
const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--text-label)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  marginBottom: "6px",
};
const hintInline: CSSProperties = { textTransform: "none", letterSpacing: 0, fontWeight: 400 };
const inputStyle: CSSProperties = {
  width: "100%",
  padding: "9px 11px",
  fontSize: "var(--text-body)",
  color: "var(--text)",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
  outline: "none",
};
const button: CSSProperties = {
  marginTop: "8px",
  padding: "10px 18px",
  fontSize: "var(--text-body)",
  fontWeight: 600,
  color: "#fff",
  background: "var(--accent)",
  border: "1px solid var(--accent)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
};
const secondaryButton: CSSProperties = {
  marginTop: "20px",
  padding: "9px 16px",
  fontSize: "var(--text-body)",
  fontWeight: 600,
  color: "var(--accent)",
  background: "var(--surface)",
  border: "1px solid var(--accent)",
  borderRadius: "var(--radius)",
  cursor: "pointer",
};
const errorText: CSSProperties = { color: "var(--negative)", fontSize: "var(--text-body)", margin: "4px 0 0" };
const fieldErrorText: CSSProperties = { color: "var(--negative)", fontSize: "var(--text-label)", margin: "6px 0 0" };
const hintBox: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  marginTop: "20px",
  padding: "12px",
  background: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius)",
};
