import { useState, type FormEvent, type ChangeEvent } from "react";
import { addSubmission, makeOpportunityId } from "@/lib/submissions";
import { Chip } from "./Chip";

export type ApplyState =
  | "initial"
  | "file-selected"
  | "validation-error"
  | "upload-rejected"
  | "submitting"
  | "success"
  | "server-failure";

const MAX_MB = 10;
const ACCEPT = "application/pdf";

export type ApplyValues = {
  companyName: string;
  repoUrl: string;
  founderName: string;
  links: string;
};

function sanitizeFileName(name: string) {
  const base = name.replace(/[\\/]/g, "_").replace(/[^\w.\-]+/g, "_");
  if (base.length <= 60) return base;
  const dot = base.lastIndexOf(".");
  const ext = dot > -1 ? base.slice(dot) : "";
  return `${base.slice(0, 50)}…${ext}`;
}

function isValidRepoUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function ApplyForm({
  forcedState,
  onSuccess,
}: {
  forcedState?: ApplyState;
  onSuccess: (id: string, values: ApplyValues) => void;
}) {
  const [values, setValues] = useState<ApplyValues>({
    companyName: "",
    repoUrl: "",
    founderName: "",
    links: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ApplyValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Dev-state overrides for demo.
  const forcedErrors: Partial<Record<keyof ApplyValues, string>> =
    forcedState === "validation-error" ? { companyName: "Company name is required.", repoUrl: "Repo URL is required." } : {};
  const forcedFileError = forcedState === "upload-rejected" ? `Only PDF up to ${MAX_MB}MB. That file was rejected.` : null;
  const forcedServerError = forcedState === "server-failure" ? "Something went wrong on our end. Your entries are preserved — try again." : null;
  const forcedFileName = forcedState === "file-selected" ? "pitch_deck_v3.pdf" : null;
  const isSubmitting = submitting || forcedState === "submitting";

  const shownErrors = { ...errors, ...forcedErrors };
  const shownFileError = fileError ?? forcedFileError;
  const shownServerError = serverError ?? forcedServerError;
  const shownFileName = fileName ?? forcedFileName;

  function update<K extends keyof ApplyValues>(k: K, v: string) {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFileError(null);
    if (!f) {
      setFile(null);
      setFileName(null);
      return;
    }
    const isPdf = f.type === ACCEPT || f.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setFile(null);
      setFileName(null);
      setFileError(`Only PDF files are accepted (up to ${MAX_MB}MB).`);
      e.target.value = "";
      return;
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      setFileName(null);
      setFileError(`File exceeds ${MAX_MB}MB limit.`);
      e.target.value = "";
      return;
    }
    setFile(f);
    setFileName(sanitizeFileName(f.name));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof ApplyValues, string>> = {};
    if (!values.companyName.trim()) next.companyName = "Company name is required.";
    if (!values.repoUrl.trim()) next.repoUrl = "Repo URL is required.";
    else if (!isValidRepoUrl(values.repoUrl.trim())) next.repoUrl = "Enter a valid http(s) URL.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setServerError(null);
    if (!validate()) return;
    setSubmitting(true);
    // Simulated latency; no real network.
    await new Promise((r) => setTimeout(r, 900));
    const id = makeOpportunityId(values.companyName);
    addSubmission({
      id,
      name: values.companyName.trim(),
      founder: values.founderName.trim() || "Unknown founder",
      founderScore: 60 + Math.floor(Math.random() * 20),
      thesisFit: "pass",
      sourceChannels: ["apply"],
      whySurfaced: "inbound apply",
      timer: "just now",
      inbound: true,
      summary: `Applied via public form.`,
      repoUrl: values.repoUrl.trim(),
      deckFileName: file ? sanitizeFileName(file.name) : undefined,
      links: values.links.trim() || undefined,
      submittedAt: new Date().toISOString(),
    });
    setSubmitting(false);
    onSuccess(id, values);
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {shownServerError ? (
        <div className="rounded-md border border-[color:var(--negative)]/40 bg-[color:var(--negative)]/5 px-3 py-2 text-[12.5px] text-foreground">
          <Chip variant="negative" mono>server failure</Chip>
          <span className="ml-2">{shownServerError}</span>
        </div>
      ) : null}

      <Field
        label="Company name"
        required
        error={shownErrors.companyName}
        input={
          <input
            type="text"
            value={values.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className={inputCls(!!shownErrors.companyName)}
            placeholder="e.g. Lattice-DB"
            autoComplete="organization"
          />
        }
      />

      <Field
        label="Repo URL"
        required
        error={shownErrors.repoUrl}
        input={
          <input
            type="url"
            value={values.repoUrl}
            onChange={(e) => update("repoUrl", e.target.value)}
            className={`${inputCls(!!shownErrors.repoUrl)} font-mono text-[12.5px]`}
            placeholder="https://github.com/your-org/your-repo"
            autoComplete="off"
          />
        }
      />

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-[13px] font-medium text-foreground">Deck upload</label>
          <span className="text-[11.5px] text-muted-foreground">
            Optional — we can start from your repo alone
          </span>
        </div>
        <div className="flex items-center gap-3">
          <label
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-[12.5px] hover:border-foreground/40"
          >
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFile} />
            <span>Choose PDF…</span>
          </label>
          {shownFileName ? (
            <span className="mono truncate text-[12px] text-muted-foreground" title={shownFileName}>
              {shownFileName}
            </span>
          ) : (
            <span className="text-[12px] text-muted-foreground">No file selected</span>
          )}
        </div>
        <div className="mt-1 text-[11.5px] text-muted-foreground">
          PDF only, up to {MAX_MB}MB.
        </div>
        {shownFileError ? (
          <div className="mt-1 text-[12px] text-[color:var(--negative)]">{shownFileError}</div>
        ) : null}
      </div>

      <Field
        label="Founder name"
        input={
          <input
            type="text"
            value={values.founderName}
            onChange={(e) => update("founderName", e.target.value)}
            className={inputCls(false)}
            placeholder="Optional"
            autoComplete="name"
          />
        }
      />

      <Field
        label="Links"
        hint="Optional — website, LinkedIn, prior work, etc."
        input={
          <textarea
            value={values.links}
            onChange={(e) => update("links", e.target.value)}
            rows={3}
            className={`${inputCls(false)} resize-none`}
            placeholder="One per line"
          />
        }
      />

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-md bg-[color:var(--accent)] px-4 py-2 text-[13px] font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Submitting…
            </>
          ) : (
            "Submit application"
          )}
        </button>
        <span className="text-[11.5px] text-muted-foreground">
          You'll get an opportunity ID you can reference.
        </span>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  hint,
  error,
  input,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  input: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-[13px] font-medium text-foreground">
          {label}
          {required ? <span className="ml-1 text-[color:var(--negative)]">*</span> : null}
        </label>
        {hint ? <span className="text-[11.5px] text-muted-foreground">{hint}</span> : null}
      </div>
      {input}
      {error ? <div className="mt-1 text-[12px] text-[color:var(--negative)]">{error}</div> : null}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-md border bg-surface px-3 py-2 text-[13px] text-foreground outline-none",
    "placeholder:text-muted-foreground/70",
    hasError ? "border-[color:var(--negative)]/60" : "border-border focus:border-[color:var(--accent)]",
  ].join(" ");
}
