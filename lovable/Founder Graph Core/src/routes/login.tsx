import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isAuthed, signIn } from "@/lib/session";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — FounderGraph" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("investor@foundergraph.demo");
  const [password, setPassword] = useState("demo");

  useEffect(() => {
    if (isAuthed()) router.navigate({ to: "/" });
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          signIn();
          router.navigate({ to: "/" });
        }}
        className="w-full max-w-sm rounded-md border border-border bg-surface p-6"
      >
        <div className="mb-6 flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-sm bg-[color:var(--accent)]" />
          <span className="text-[13px] font-semibold">FounderGraph</span>
        </div>
        <h1 className="mb-1 text-[18px] font-semibold">Sign in</h1>
        <p className="mb-6 text-[13px] text-muted-foreground">
          Demo: <span className="mono">investor@foundergraph.demo / demo</span>
        </p>
        <label className="label-xs mb-1 block">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-[color:var(--accent)]"
        />
        <label className="label-xs mb-1 block">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-6 w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-[13px] outline-none focus:border-[color:var(--accent)]"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-[color:var(--accent)] px-3 py-1.5 text-[13px] font-medium text-white hover:opacity-90"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
