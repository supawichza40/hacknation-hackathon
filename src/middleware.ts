// Demo-lite investor gate (VC-BRAIN-PLAN.md §0.5 d13). Redirects an unauthenticated
// request for an investor surface (`/`, `/opportunities/*`) to `/login`. Public
// routes — `/apply`, `/login`, `/api/*`, assets — are never matched, so they stay
// open. The JSON APIs are UNAUTHENTICATED by design (red-team M-1): this gate is a
// demo convenience, not real access control.
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, sessionIsValid, isGatedPath } from "@/lib/auth";

export function middleware(req: NextRequest) {
  if (!isGatedPath(req.nextUrl.pathname)) return NextResponse.next();
  if (sessionIsValid(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("from", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

// Only run middleware on the gated investor surfaces (perf + defense in depth;
// isGatedPath re-checks inside). `/api/*` is deliberately absent.
export const config = {
  matcher: ["/", "/opportunities/:path*"],
};
