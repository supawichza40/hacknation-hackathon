// check:done — the automated DoD Layer-3 gate (docs/product/08-definition-of-done.md).
// Runs every committed gate, prints a concise pass/fail report, and exits non-zero if any
// gate is red. Honesty over green: a red result that reflects a real gap is the correct
// output. Never auto-pushes; push-state is reported, not fixed.
import { spawnSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(REPO);

const PLANNED_OPPS = ["opp-ecc", "opp-lattice", "opp-brightcart", "opp-pipewarden"];
const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail: detail || "" });
  console.log(`[${ok ? "PASS" : "FAIL"}] ${name}${detail ? " — " + detail : ""}`);
}

function sh(cmd, args, timeout = 300_000) {
  const r = spawnSync(cmd, args, { encoding: "utf8", timeout, maxBuffer: 64 * 1024 * 1024 });
  const out = ((r.stdout || "") + (r.stderr || "")).split("\n").filter(Boolean);
  return { status: r.status, out, err: r.error };
}
function tail(lines, n = 12) {
  return lines.slice(-n).join(" | ").slice(0, 500);
}

console.log("check:done — DoD Layer-3 automated gate\n" + "-".repeat(48));

// Setup (not a scored gate): idempotent seed so smoke + the demo-set check have real data.
{
  const s = sh("npm", ["run", "seed"], 60_000);
  console.log(`(setup) npm run seed: ${s.status === 0 ? "ok" : "FAILED — " + tail(s.out)}`);
}

// (a) tests
{
  const r = sh("npm", ["test"], 180_000);
  record("test — npm test", r.status === 0, r.status === 0 ? tail(r.out.slice(-3), 3) : tail(r.out));
}

// (b) typecheck
{
  const tsc = join(REPO, "node_modules", ".bin", "tsc");
  if (!existsSync(tsc)) {
    record("typecheck — tsc --noEmit", false, "node_modules/.bin/tsc not found (run npm install)");
  } else {
    const r = sh(tsc, ["--noEmit"], 180_000);
    record("typecheck — tsc --noEmit", r.status === 0, r.status === 0 ? "clean" : tail(r.out));
  }
}

// (c) build
{
  const r = sh("npm", ["run", "build"], 420_000);
  record("build — npm run build", r.status === 0, r.status === 0 ? "next build ok" : tail(r.out));
}

// (d) golden smoke (offline)
{
  const r = sh("npm", ["run", "smoke:golden"], 120_000);
  const line = r.out.find((l) => /beats passed/.test(l)) || tail(r.out);
  record("smoke:golden — offline golden path", r.status === 0, line);
}

// (e) artifact validation + dangling IDs + demo set
{
  const problems = [];
  const parse = (p) => JSON.parse(readFileSync(join(REPO, p), "utf8"));
  const walkJson = (dir) => {
    const abs = join(REPO, dir);
    if (!existsSync(abs)) return [];
    const acc = [];
    for (const name of readdirSync(abs)) {
      const rel = join(dir, name);
      if (statSync(join(REPO, rel)).isDirectory()) acc.push(...walkJson(rel));
      else if (name.endsWith(".json")) acc.push(rel);
    }
    return acc;
  };
  try {
    const { parseGraph } = await import("../src/lib/graph/schema.ts");
    const { parseClaims } = await import("../src/lib/claims.ts");
    const { parseMemo } = await import("../src/lib/memo.ts");

    // schema-validate every graph that exists
    for (const gdir of readdirSync(join(REPO, "data/demo/graphs"))) {
      const p = `data/demo/graphs/${gdir}/knowledge-graph.json`;
      if (!existsSync(join(REPO, p))) continue;
      try {
        parseGraph(parse(p));
      } catch (e) {
        problems.push(`graph ${gdir}: ${String(e.message).slice(0, 120)}`);
      }
    }
    // ecc claims / memo / deck / tour
    let claims, memo, deck, tour, eccGraph;
    try {
      claims = parseClaims(parse("data/demo/claims/ecc/claims.json"));
    } catch (e) {
      problems.push(`claims: ${String(e.message).slice(0, 120)}`);
    }
    try {
      memo = parseMemo(parse("data/demo/memos/ecc/memo.json"));
    } catch (e) {
      problems.push(`memo: ${String(e.message).slice(0, 120)}`);
    }
    try {
      deck = parse("data/demo/decks/ecc/slides.json");
      if (!Array.isArray(deck) || !deck.every((s) => Number.isInteger(s.slideNo)))
        problems.push("deck: not an array of slides with slideNo");
    } catch (e) {
      problems.push(`deck: ${String(e.message).slice(0, 120)}`);
    }
    try {
      tour = parse("data/demo/tours/tour-ecc.json");
      if (!Array.isArray(tour.steps) || tour.steps.length < 2)
        problems.push("tour: missing ordered steps");
    } catch (e) {
      problems.push(`tour: ${String(e.message).slice(0, 120)}`);
    }
    try {
      eccGraph = parseGraph(parse("data/demo/graphs/ecc/knowledge-graph.json"));
    } catch {
      /* already reported above */
    }

    // every replay JSON must at least parse
    for (const rel of walkJson("data/replay")) {
      try {
        parse(rel);
      } catch (e) {
        problems.push(`replay ${rel}: ${String(e.message).slice(0, 80)}`);
      }
    }

    // dangling-ID checks scoped to the ECC hero demo
    if (eccGraph) {
      const nodeIds = new Set(eccGraph.nodes.map((n) => n.id));
      for (const e of eccGraph.edges)
        if (!nodeIds.has(e.source) || !nodeIds.has(e.target))
          problems.push(`ecc graph dangling edge ${e.source}->${e.target}`);
      if (tour && Array.isArray(tour.steps))
        for (const s of tour.steps)
          if (!nodeIds.has(s.nodeId)) problems.push(`tour step dangling node ${s.nodeId}`);
      try {
        const chat = parse("data/replay/chat/ecc.json");
        for (const c of chat.citations || [])
          if (!nodeIds.has(c.nodeId)) problems.push(`chat citation dangling node ${c.nodeId}`);
      } catch {
        problems.push("chat replay data/replay/chat/ecc.json unreadable");
      }
    }
    if (claims && memo) {
      const claimIds = new Set(claims.map((c) => c.id));
      const slideNos = new Set((deck || []).map((s) => s.slideNo));
      for (const [sec, s] of Object.entries(memo.sections || {}))
        for (const cit of s.citations || [])
          if (!claimIds.has(cit.ref))
            problems.push(`memo ${sec} cites missing claim id ${cit.ref}`);
      for (const c of claims)
        for (const ev of c.evidence || []) {
          const m = /^deck:\/\/[^/]+\/slide\/(\d+)/.exec(ev.locator);
          if (m && !slideNos.has(Number(m[1])))
            problems.push(`claim ${c.id} cites missing deck slide ${m[1]}`);
        }
    }

    // demo set = exactly the planned opportunities
    const { getDb } = await import("../src/lib/db.ts");
    const db = getDb();
    const ids = db
      .prepare("SELECT id FROM opportunity ORDER BY id")
      .all()
      .map((r) => r.id);
    db.close();
    const got = [...ids].sort();
    const want = [...PLANNED_OPPS].sort();
    if (JSON.stringify(got) !== JSON.stringify(want))
      problems.push(`demo set is ${got.join(",")} — expected ${want.join(",")}`);

    record(
      "artifacts — schema + dangling IDs + demo set",
      problems.length === 0,
      problems.length ? problems.slice(0, 6).join(" ; ") : "all artifacts valid; no dangling IDs",
    );
  } catch (e) {
    record("artifacts — schema + dangling IDs + demo set", false, `validator error: ${e.message}`);
  }
}

// (f) secret scan — real key shapes only (env VAR NAMES are fine). Reports files, not values.
{
  const pat =
    "(sk-ant-[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9]{32,}|AKIA[0-9A-Z]{16}|xai-[A-Za-z0-9]{20,}|tvly-[A-Za-z0-9]{20,}|sk_[a-f0-9]{40,}|ghp_[A-Za-z0-9]{36})";
  const r = sh(
    "git",
    ["grep", "-lIE", "--untracked", pat, "--", ".", ":!data/vc-brain.db", ":!*.example"],
    30_000,
  );
  // git grep exit 1 = no matches (clean); 0 = matches (leak); >1 = error
  if (r.status === 1) record("secrets — no live keys in tracked/untracked files", true, "clean");
  else if (r.status === 0)
    record("secrets — no live keys in tracked/untracked files", false, `LEAK in: ${r.out.join(", ")}`);
  else record("secrets — no live keys in tracked/untracked files", false, `git grep error: ${tail(r.out)}`);
}

// (g) push-state — Law 1: push == done. Reported, never auto-pushed.
{
  const dirty = sh("git", ["status", "--porcelain"], 15_000).out;
  const head = (sh("git", ["rev-parse", "HEAD"], 15_000).out[0] || "").trim();
  const originRes = sh("git", ["rev-parse", "origin/dispatch/lovable-frontend"], 15_000);
  const origin = (originRes.out[0] || "").trim();
  const clean = dirty.length === 0;
  const synced = head && origin && head === origin;
  const detail = clean
    ? synced
      ? "clean tree; HEAD == origin/dispatch/lovable-frontend"
      : `HEAD ${head.slice(0, 8)} != origin ${origin.slice(0, 8) || "(missing)"}`
    : `${dirty.length} uncommitted path(s); HEAD ${head.slice(0, 8)} vs origin ${origin.slice(0, 8) || "(missing)"}`;
  record("push-state — clean tree pushed to origin branch", clean && synced, detail);
}

// Report
const fail = results.filter((r) => !r.ok);
console.log("-".repeat(48));
console.log(`check:done: ${results.length - fail.length}/${results.length} gates PASS`);
if (fail.length) console.log("RED gates: " + fail.map((r) => r.name.split(" — ")[0]).join(", "));
process.exit(fail.length ? 1 : 0);