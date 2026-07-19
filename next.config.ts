import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
