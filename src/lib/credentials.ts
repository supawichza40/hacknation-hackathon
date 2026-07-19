// Constant-time check of the single demo investor credential (VC-BRAIN-PLAN.md
// §0.5 d13). Node-only (node:crypto) — imported only by the /api/login route
// handler (Node runtime), never by the Edge middleware.
//
// Demo-lite: one hard-coded credential from the environment, with the visible
// demo defaults baked in so the login works out of the box. Not real user auth.
import { createHash, timingSafeEqual } from "node:crypto";

const DEMO_EMAIL = process.env.DEMO_INVESTOR_EMAIL ?? "investor@foundergraph.demo";
const DEMO_PASSWORD = process.env.DEMO_INVESTOR_PASSWORD ?? "demo";

// Hash both sides to a fixed length first, so timingSafeEqual never throws on a
// length mismatch and the comparison stays constant-time regardless of input.
function constEq(a: string, b: string): boolean {
  const ah = createHash("sha256").update(a).digest();
  const bh = createHash("sha256").update(b).digest();
  return timingSafeEqual(ah, bh);
}

export function verifyCredentials(email: string, password: string): boolean {
  // Evaluate both compares before combining — no short-circuit timing signal.
  const okEmail = constEq(email.trim().toLowerCase(), DEMO_EMAIL.trim().toLowerCase());
  const okPassword = constEq(password, DEMO_PASSWORD);
  return okEmail && okPassword;
}
