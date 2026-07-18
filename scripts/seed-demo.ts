// Seeds the demo dataset (VC-BRAIN-PLAN.md §11, ruling d5: 3 shown + 1 hidden).
// Idempotent: fixed ids + upserts, safe to re-run. Runnable: `node scripts/seed-demo.ts`.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  getDb,
  upsertPerson,
  upsertOpportunityByRepo,
  upsertScreeningFacts,
  upsertEvidence,
  upsertApplicationHistory,
  type DB,
} from "../src/lib/db.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NOW = "2026-07-19T00:00:00Z";

export function seedDemo(db: DB): void {
  const thesis = JSON.parse(readFileSync(join(ROOT, "data", "thesis.json"), "utf8"));
  db.prepare(
    `INSERT INTO thesis (id, name, sectors, stages, geos, check_size_min_cents,
       check_size_max_cents, ownership_target, risk_appetite, technical_bar)
     VALUES (@id, @name, @sectors, @stages, @geos, @min, @max, @own, @risk, @bar)
     ON CONFLICT(id) DO UPDATE SET
       name=excluded.name, sectors=excluded.sectors, stages=excluded.stages, geos=excluded.geos,
       check_size_min_cents=excluded.check_size_min_cents,
       check_size_max_cents=excluded.check_size_max_cents,
       ownership_target=excluded.ownership_target, risk_appetite=excluded.risk_appetite,
       technical_bar=excluded.technical_bar`,
  ).run({
    id: thesis.id,
    name: thesis.name,
    sectors: JSON.stringify(thesis.sectors),
    stages: JSON.stringify(thesis.stages),
    geos: JSON.stringify(thesis.geos),
    min: thesis.checkSizeMinCents,
    max: thesis.checkSizeMaxCents,
    own: thesis.ownershipTarget ?? null,
    risk: thesis.riskAppetite,
    bar: thesis.technicalBar,
  });

  const tx = db.transaction(() => {
    // 1. ECC — hero, inbound via apply, Founder Score 82, returning founder.
    upsertPerson(db, {
      id: "person-supawich",
      name: "Supawich",
      emails: ["supawichza@gmail.com"],
      links: { github: "https://github.com/supawichza40/ECC" },
      founderScore: 82,
    });
    upsertOpportunityByRepo(db, {
      id: "opp-ecc",
      personId: "person-supawich",
      companyName: "ECC",
      deckPath: "data/demo/decks/ecc/slides.json",
      graphPath: "data/demo/graphs/ecc/knowledge-graph.json",
      repoUrl: "https://github.com/supawichza40/ECC",
      source: "inbound",
      sourceChannel: "apply",
      status: "screening",
      sector: "AI infra",
      stage: "pre-seed",
      geo: "US",
      askAmountCents: 10_000_000, // $100K — fits the check
      whySurfaced: "Founder applied directly via the apply form with a live GitHub repo + deck.",
      visible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    upsertScreeningFacts(
      db,
      "opp-ecc",
      {
        sector: { value: "AI infra", evidenceIds: ["ev-ecc-why"] },
        stage: { value: "pre-seed", evidenceIds: ["ev-ecc-why"] },
        ask: { value: "$100K", evidenceIds: ["ev-ecc-why"] },
      },
      ["ARR", "cap table"],
    );
    upsertEvidence(db, {
      id: "ev-ecc-why",
      opportunityId: "opp-ecc",
      artifactId: "apply-form",
      locator: "apply-form://submission/ecc",
      excerpt:
        "Inbound application: github.com/supawichza40/ECC + deck slides.json submitted via /apply.",
      kind: "why_surfaced",
    });
    // Returning-founder beat: prior application at a lower score.
    upsertApplicationHistory(db, {
      id: "hist-ecc-2025",
      personId: "person-supawich",
      opportunityId: "opp-ecc",
      appliedAt: "2025-10-01",
      founderScore: 61,
      note: "Applied Oct 2025 score 61 → now 82",
    });

    // 2. Lattice-DB — outbound showcase, Founder Score 74.
    upsertPerson(db, {
      id: "person-lattice",
      name: "Mara Ito",
      links: { github: "https://github.com/lattice-db/lattice" },
      founderScore: 74,
    });
    upsertOpportunityByRepo(db, {
      id: "opp-lattice",
      personId: "person-lattice",
      companyName: "Lattice-DB",
      graphPath: "data/demo/graphs/lattice/knowledge-graph.json",
      repoUrl: "https://github.com/lattice-db/lattice",
      source: "outbound",
      sourceChannel: "github",
      status: "sourced",
      sector: "AI infra",
      stage: "seed",
      geo: "EU",
      askAmountCents: 8_000_000, // $80K — fits
      whySurfaced: "Outbound GitHub scan: high star-velocity vector DB, solo technical founder.",
      visible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    upsertEvidence(db, {
      id: "ev-lattice-why",
      opportunityId: "opp-lattice",
      artifactId: "gh-scan",
      locator: "https://github.com/search?q=vector+database+embeddings&s=stars",
      excerpt: "Star velocity 12.4/day since Feb 2026; owner type User (solo); language Rust.",
      kind: "why_surfaced",
    });

    // 3. BrightCart — outbound, OFF-THESIS on check size ($2M raise vs $100K cap).
    upsertPerson(db, {
      id: "person-brightcart",
      name: "Devon Rhys",
      links: { github: "https://github.com/brightcart/brightcart" },
      founderScore: 68,
    });
    upsertOpportunityByRepo(db, {
      id: "opp-brightcart",
      personId: "person-brightcart",
      companyName: "BrightCart",
      graphPath: "data/demo/graphs/brightcart/knowledge-graph.json",
      repoUrl: "https://github.com/brightcart/brightcart",
      source: "outbound",
      sourceChannel: "hn",
      status: "sourced",
      sector: "AI infra",
      stage: "seed",
      geo: "US",
      askAmountCents: 200_000_000, // $2M — exceeds the $100K check cap
      whySurfaced: "Hacker News launch thread; strong traction but raising a $2M round.",
      visible: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    upsertEvidence(db, {
      id: "ev-brightcart-why",
      opportunityId: "opp-brightcart",
      artifactId: "hn-thread",
      locator: "https://news.ycombinator.com/item?id=41000000",
      excerpt: "\"Launching BrightCart — raising a $2M seed to scale our AI checkout infra.\"",
      kind: "why_surfaced",
    });

    // 4. PipeWarden — outbound, seeded hidden (visible=0) until the R7 scan replay pops it.
    upsertPerson(db, {
      id: "person-pipewarden",
      name: "Priya Nadic",
      links: { github: "https://github.com/pipewarden/pipewarden" },
      founderScore: 71,
    });
    upsertOpportunityByRepo(db, {
      id: "opp-pipewarden",
      personId: "person-pipewarden",
      companyName: "PipeWarden",
      graphPath: "data/demo/graphs/pipewarden/knowledge-graph.json",
      repoUrl: "https://github.com/pipewarden/pipewarden",
      source: "outbound",
      sourceChannel: "github",
      status: "sourced",
      sector: "AI infra",
      stage: "pre-seed",
      geo: "US",
      askAmountCents: 9_000_000, // $90K — fits
      whySurfaced: "Pending R7 scan replay — crosses the signal threshold live on stage.",
      visible: false,
      createdAt: NOW,
      updatedAt: NOW,
    });
    upsertEvidence(db, {
      id: "ev-pipewarden-why",
      opportunityId: "opp-pipewarden",
      artifactId: "scan-replay",
      locator: "data/replay/scan/ranking.json",
      excerpt: "Composite score crosses threshold on replay; surfaced during the live R7 demo.",
      kind: "why_surfaced",
    });
  });
  tx();
}

function isMain(): boolean {
  return process.argv[1] === fileURLToPath(import.meta.url);
}

if (isMain()) {
  const db = getDb();
  seedDemo(db);
  const shown = db.prepare("SELECT COUNT(*) AS n FROM opportunity WHERE visible = 1").get() as {
    n: number;
  };
  const total = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };
  const ev = db.prepare("SELECT COUNT(*) AS n FROM evidence").get() as { n: number };
  console.log(
    `Seeded ${total.n} opportunities (${shown.n} visible), ${ev.n} evidence rows into data/vc-brain.db`,
  );
  db.close();
}
