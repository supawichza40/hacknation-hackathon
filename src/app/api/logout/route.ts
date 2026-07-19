// Clears the demo-lite investor session cookie and returns to /login. GET so a
// plain nav link can trigger it (VC-BRAIN-PLAN.md §0.5 d13).
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/login", req.url));
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
