// Demo-lite investor login (VC-BRAIN-PLAN.md §0.5 d13). POST validates the single
// demo credential with a constant-time compare and, on success, sets a session
// cookie the middleware presence-checks. Not real auth — see src/lib/auth.ts.
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";
import { verifyCredentials } from "@/lib/credentials";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyCredentials(email, password)) {
    return NextResponse.json({ error: "invalid credentials" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h demo session
  });
  return res;
}
