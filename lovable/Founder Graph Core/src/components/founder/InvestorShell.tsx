import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { isAuthed, signOut } from "@/lib/session";

const NAV = [
  { to: "/", label: "Pipeline" },
  { to: "/opportunities/ecc", label: "Diligence" },
  { to: "/opportunities/ecc/graph", label: "Graph" },
] as const;

export function InvestorShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname === "/apply" || pathname === "/login") {
      setReady(true);
      return;
    }
    if (!isAuthed()) {
      router.navigate({ to: "/login" });
      return;
    }
    setReady(true);
  }, [pathname, router]);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-surface">
        <div className="mx-auto flex h-12 max-w-[1440px] items-center gap-6 px-6">
          <Link to="/" className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
            <span className="inline-block h-4 w-4 rounded-sm bg-[color:var(--accent)]" />
            FounderGraph
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => {
              const active =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={
                    "rounded-md px-2.5 py-1 text-[13px] transition-colors " +
                    (active
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground")
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="label-xs">investor@foundergraph.demo</span>
            <button
              onClick={() => {
                signOut();
                router.navigate({ to: "/login" });
              }}
              className="rounded-md border border-border px-2 py-1 text-[12px] text-muted-foreground hover:text-foreground"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
    </div>
  );
}
