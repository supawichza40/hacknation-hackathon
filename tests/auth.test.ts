// M5 demo-lite auth tests — run with: node --test tests/auth.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { SESSION_VALUE, sessionIsValid, isGatedPath } from "../src/lib/auth.ts";
import { verifyCredentials } from "../src/lib/credentials.ts";

test("gate: investor surfaces are gated, public routes are not", () => {
  assert.equal(isGatedPath("/"), true);
  assert.equal(isGatedPath("/opportunities/ecc"), true);
  assert.equal(isGatedPath("/opportunities/ecc/graph"), true);
  assert.equal(isGatedPath("/apply"), false);
  assert.equal(isGatedPath("/login"), false);
  assert.equal(isGatedPath("/api/apply"), false);
});

test("session: only the exact session value is valid", () => {
  assert.equal(sessionIsValid(undefined), false);
  assert.equal(sessionIsValid(""), false);
  assert.equal(sessionIsValid("nope"), false);
  assert.equal(sessionIsValid(SESSION_VALUE), true);
});

test("gate decision mirrors the middleware: unauthed → redirect, authed → allow, public → bypass", () => {
  const decide = (pathname: string, cookie: string | undefined) =>
    isGatedPath(pathname) && !sessionIsValid(cookie) ? "redirect" : "allow";
  assert.equal(decide("/", undefined), "redirect");
  assert.equal(decide("/opportunities/ecc", undefined), "redirect");
  assert.equal(decide("/", SESSION_VALUE), "allow");
  assert.equal(decide("/apply", undefined), "allow");
});

test("credentials: only the exact demo credential verifies", () => {
  assert.equal(verifyCredentials("investor@foundergraph.demo", "demo"), true);
  assert.equal(verifyCredentials("INVESTOR@FounderGraph.demo", "demo"), true); // email is case-insensitive
  assert.equal(verifyCredentials("investor@foundergraph.demo", "wrong"), false);
  assert.equal(verifyCredentials("attacker@evil.com", "demo"), false);
  assert.equal(verifyCredentials("", ""), false);
});
