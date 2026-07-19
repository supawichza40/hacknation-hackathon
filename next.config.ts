import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The webpack fallback build (scripts/render-build.sh) does not pick up
  // tsconfig's "@/*" paths the way Turbopack does — teach it the alias
  // directly. Turbopack ignores the `webpack` key.
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(process.cwd(), "src");
    return config;
  },
  // Presence of a `webpack` key makes Turbopack hard-error ("webpack config and
  // no turbopack config") — an empty turbopack config is Next's documented
  // opt-back-in, keeping the primary Turbopack build path alive.
  turbopack: {},
  serverExternalPackages: ["better-sqlite3"],
  // Next 16.2.10's built-in `next build` type-check worker cannot drive the
  // installed native typescript@7 package (its `exports` omit the JS API and
  // bin/tsc path Next resolves), so the worker crashes with `require(undefined)`
  // and exits 1. Type safety is enforced out-of-band by `tsc --noEmit`, which
  // passes clean against typescript@7. This only skips Next's redundant re-check.
  typescript: { ignoreBuildErrors: true },
  // Hide the dev-mode floating Next.js indicator so screen recordings and
  // screenshots stay clean (development-only UI; no production effect).
  devIndicators: false,
  // diligence.ts's dynamic fs reads make Turbopack's file tracing pull the WHOLE
  // repo (docs, PDFs, demo data) into the build trace — enough to blow the memory
  // cap on Render's build container (build died silently right after compile).
  // These dirs are never imported by route code; on Render's native Node runtime
  // the full repo is on disk at runtime anyway, so excluding them from the trace
  // changes nothing at runtime.
  outputFileTracingExcludes: {
    "*": ["./docs/**", "./HackathonMaterials/**", "./Topics/**", "./data/**", "./.ua/**"],
  },
  // One worker for page-data collection/static generation — N parallel Node
  // workers each load route bundles (incl. the better-sqlite3 native addon) and
  // together exceed small build containers. All routes are dynamic; build-time
  // parallelism buys nothing here.
  experimental: { cpus: 1 },
};

export default nextConfig;
