// Demo-lite investor gate (VC-BRAIN-PLAN.md §0.5 d13). This is NOT production auth:
// a single shared credential, a presence-checked session cookie, and the JSON APIs
// remain UNAUTHENTICATED by design (red-team M-1). Do not describe it as real auth.
//
// Edge-safe: this module has zero Node imports so it can be pulled into Next.js
// middleware (Edge runtime). The credential compare lives in credentials.ts
// (Node-only) and never reaches the edge bundle.
export const SESSION_COOKIE = "fg_session";
export const SESSION_VALUE = "investor-demo"; // demo sentinel, not a secret

export function sessionIsValid(cookieValue: string | undefined | null): boolean {
  return cookieValue === SESSION_VALUE;
}

// Investor surfaces behind the gate: Pipeline (`/`) and every `/opportunities/*`
// page. Everything else — `/apply`, `/login`, `/api/*`, static assets — is public.
export function isGatedPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/opportunities" ||
    pathname.startsWith("/opportunities/")
  );
}
