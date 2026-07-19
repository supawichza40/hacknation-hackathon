import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ApplyForm, type ApplyState, type ApplyValues } from "@/components/founder/ApplyForm";
import { ApplySuccess } from "@/components/founder/ApplySuccess";
import { useDevStates } from "@/lib/dev-state";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Apply — FounderGraph" },
      {
        name: "description",
        content:
          "Founders: apply for consideration. Share your repo — a deck is optional.",
      },
    ],
  }),
  component: ApplyPage,
});

const STATES: { id: ApplyState; label: string }[] = [
  { id: "initial", label: "initial" },
  { id: "file-selected", label: "file selected (sanitized)" },
  { id: "validation-error", label: "validation error" },
  { id: "upload-rejected", label: "upload rejected" },
  { id: "submitting", label: "submitting (locked)" },
  { id: "success", label: "success" },
  { id: "server-failure", label: "server failure" },
];

function ApplyPage() {
  const forced = useDevStates("Apply", STATES, "initial") as ApplyState;
  const [result, setResult] = useState<{ id: string; company: string } | null>(null);

  const showSuccess = result !== null || forced === "success";
  const successId = result?.id ?? "apl-demo-preview-x92k";
  const successCompany = result?.company ?? "";

  function handleSuccess(id: string, values: ApplyValues) {
    setResult({ id, company: values.companyName.trim() });
  }

  const formForced: ApplyState | undefined = forced === "success" ? undefined : forced;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 rounded-sm bg-[color:var(--accent)]" />
            <span className="text-[13px] font-semibold text-foreground">FounderGraph</span>
          </div>
          <span className="label-xs text-muted-foreground">Founder application</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {showSuccess ? (
          <>
            <h1 className="mb-6 text-[24px] font-semibold text-foreground">Application received</h1>
            <ApplySuccess
              opportunityId={successId}
              companyName={successCompany}
              onReset={() => setResult(null)}
            />
          </>
        ) : (
          <>
            <h1 className="mb-2 text-[24px] font-semibold text-foreground">Apply</h1>
            <p className="mb-8 max-w-xl text-[13px] text-muted-foreground">
              We read your repo first. A deck is optional. Fewer fields, faster reply — you'll get
              an opportunity ID you can reference.
            </p>
            <ApplyForm forcedState={formForced} onSuccess={handleSuccess} />
          </>
        )}

        <div className="mt-10 text-[12px] text-muted-foreground">
          Not a founder?{" "}
          <Link to="/login" className="text-[color:var(--accent)] hover:underline">
            Investor sign-in
          </Link>
        </div>
      </main>
    </div>
  );
}
