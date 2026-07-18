#!/usr/bin/env node
// R7 sourcing-scan deterministic scorer.
// Reads captured raw gh-search JSON + metadata.referenceTime, emits a ranked list.
// Deterministic: uses metadata.referenceTime as the "now" anchor (never Date.now()),
// so rerunning on the same capture reproduces an identical ranking.
// Usage: node scripts/scan-score.mjs   (writes data/replay/scan/ranking.json, prints top 10)

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const scanDir = join(dirname(fileURLToPath(import.meta.url)), "..", "data", "replay", "scan");
const meta = JSON.parse(readFileSync(join(scanDir, "metadata.json"), "utf8"));
const refMs = Date.parse(meta.referenceTime);
const W = meta.scoring.weights;
const DAY = 86400000;

// Load + dedupe by fullName; remember which queries surfaced each repo.
const byName = new Map();
for (const q of meta.queries) {
  const rows = JSON.parse(readFileSync(join(scanDir, q.file), "utf8"));
  for (const r of rows) {
    const cur = byName.get(r.fullName);
    if (cur) cur.sources.add(q.id);
    else byName.set(r.fullName, { repo: r, sources: new Set([q.id]) });
  }
}

// Raw per-repo signals.
const rows = [...byName.values()].map(({ repo, sources }) => {
  const daysSinceCreated = Math.max(1, (refMs - Date.parse(repo.createdAt)) / DAY);
  const daysSincePush = Math.max(0, (refMs - Date.parse(repo.pushedAt)) / DAY);
  const starVelocity = repo.stargazersCount / daysSinceCreated;
  const noOrgOwner = repo.owner?.type === "User" ? 1 : 0;
  return {
    fullName: repo.fullName,
    url: repo.url,
    stars: repo.stargazersCount,
    ownerType: repo.owner?.type ?? "Unknown",
    createdAt: repo.createdAt,
    pushedAt: repo.pushedAt,
    language: repo.language || null,
    description: repo.description || "",
    sources: [...sources].sort(),
    daysSinceCreated: round(daysSinceCreated, 2),
    daysSincePush: round(daysSincePush, 2),
    starVelocity: round(starVelocity, 4),
    commitRecency: round(1 / (1 + daysSincePush), 4),
    noOrgOwner,
  };
});

// Normalize star velocity to pool max, then weighted composite.
const maxSV = Math.max(...rows.map((r) => r.starVelocity), 1e-9);
for (const r of rows) {
  const svNorm = r.starVelocity / maxSV;
  r.starVelocityNorm = round(svNorm, 4);
  r.score = round(W.starVelocity * svNorm + W.commitRecency * r.commitRecency + W.noOrgOwner * r.noOrgOwner, 4);
}

// Deterministic order: score desc, then fullName asc.
rows.sort((a, b) => b.score - a.score || (a.fullName < b.fullName ? -1 : a.fullName > b.fullName ? 1 : 0));
rows.forEach((r, i) => (r.rank = i + 1));

const out = {
  generatedFrom: "data/replay/scan/ (deterministic replay of R7 sourcing scan)",
  referenceTime: meta.referenceTime,
  weights: W,
  totalUnique: rows.length,
  ranking: rows,
};
writeFileSync(join(scanDir, "ranking.json"), JSON.stringify(out, null, 2) + "\n");

console.log(`Scored ${rows.length} unique repos (ref ${meta.referenceTime}). Top 10:`);
for (const r of rows.slice(0, 10)) {
  console.log(
    `#${String(r.rank).padStart(2)} ${r.score.toFixed(4)}  ${r.fullName}  ` +
      `[${r.stars}★ v=${r.starVelocity} rec=${r.commitRecency} ${r.ownerType}]`,
  );
}

function round(n, d) {
  const f = 10 ** d;
  return Math.round(n * f) / f;
}
