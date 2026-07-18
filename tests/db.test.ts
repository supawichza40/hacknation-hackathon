// M1 tests — run with: node --test tests/db.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  getDb,
  upsertPerson,
  upsertOpportunityByRepo,
  getThesis,
  getOpportunityCards,
} from "../src/lib/db.ts";
import { evaluateThesisFit, normalizeRepoUrl } from "../src/lib/thesis.ts";
import { seedDemo } from "../scripts/seed-demo.ts";

function seededDb() {
  const db = getDb(":memory:");
  seedDemo(db);
  return db;
}

test("schema roundtrip: person + opportunity insert/read", () => {
  const db = getDb(":memory:");
  upsertPerson(db, { id: "p1", name: "Ada", founderScore: 90 });
  const id = upsertOpportunityByRepo(db, {
    id: "o1",
    personId: "p1",
    companyName: "Acme",
    repoUrl: "https://github.com/ada/acme",
    source: "inbound",
    status: "screening",
    sector: "AI infra",
    stage: "seed",
    geo: "US",
    askAmountCents: 5_000_000,
    createdAt: "2026-07-19T00:00:00Z",
    updatedAt: "2026-07-19T00:00:00Z",
  });
  assert.equal(id, "o1");
  const row = db.prepare("SELECT company_name, ask_amount_cents FROM opportunity WHERE id = ?").get("o1") as {
    company_name: string;
    ask_amount_cents: number;
  };
  assert.equal(row.company_name, "Acme");
  // Money is an INTEGER cent value, not a float.
  assert.equal(row.ask_amount_cents, 5_000_000);
  assert.equal(Number.isInteger(row.ask_amount_cents), true);
  db.close();
});

test("seed integrity: 4 opportunities, 3 visible, evidence + history present", () => {
  const db = seededDb();
  const total = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };
  const visible = db.prepare("SELECT COUNT(*) AS n FROM opportunity WHERE visible = 1").get() as { n: number };
  assert.equal(total.n, 4);
  assert.equal(visible.n, 3);

  // Every seeded opportunity has a why_surfaced evidence row (R3).
  const oppIds = (db.prepare("SELECT id FROM opportunity").all() as { id: string }[]).map((r) => r.id);
  for (const oid of oppIds) {
    const ev = db
      .prepare("SELECT COUNT(*) AS n FROM evidence WHERE opportunity_id = ? AND kind = 'why_surfaced'")
      .get(oid) as { n: number };
    assert.ok(ev.n >= 1, `missing why_surfaced evidence for ${oid}`);
  }

  // PipeWarden is seeded hidden.
  const pw = db.prepare("SELECT visible FROM opportunity WHERE id = 'opp-pipewarden'").get() as { visible: number };
  assert.equal(pw.visible, 0);

  // Returning-founder history beat.
  const hist = db.prepare("SELECT note FROM application_history WHERE opportunity_id = 'opp-ecc'").get() as {
    note: string;
  };
  assert.match(hist.note, /61.*82/);
  db.close();
});

test("dedup rule: same repo URL (reformatted) maps to the same Opportunity", () => {
  const db = seededDb();
  const before = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };

  // Different casing, trailing slash, and .git suffix — same identity.
  assert.equal(
    normalizeRepoUrl("https://github.com/supawichza40/ECC"),
    normalizeRepoUrl("http://www.GitHub.com/SupawichZa40/ECC.git/"),
  );

  const id = upsertOpportunityByRepo(db, {
    id: "opp-ecc-duplicate",
    personId: "person-supawich",
    companyName: "ECC (dup submission)",
    repoUrl: "https://www.github.com/SupawichZa40/ECC.git/",
    source: "inbound",
    status: "screening",
    sector: "AI infra",
    stage: "pre-seed",
    geo: "US",
    askAmountCents: 10_000_000,
    createdAt: "2026-07-19T00:00:00Z",
    updatedAt: "2026-07-19T01:00:00Z",
  });

  const after = db.prepare("SELECT COUNT(*) AS n FROM opportunity").get() as { n: number };
  assert.equal(id, "opp-ecc", "should resolve to existing ECC opportunity id");
  assert.equal(after.n, before.n, "no new row created for duplicate repo");
  db.close();
});

test("off-thesis evaluation: BrightCart fails check size; toggle un-fails it", () => {
  const db = seededDb();
  const thesis = getThesis(db);
  const cards = getOpportunityCards(db, thesis);

  const ecc = cards.find((c) => c.id === "opp-ecc")!;
  const brightcart = cards.find((c) => c.id === "opp-brightcart")!;

  assert.equal(ecc.fit.onThesis, true, "ECC should be on-thesis");
  assert.equal(brightcart.fit.onThesis, false, "BrightCart should be off-thesis");
  assert.equal(brightcart.fit.checks.checkSize, false);
  assert.equal(brightcart.fit.checks.sector, true, "only check size should fail");
  assert.ok(brightcart.fit.failReasons.includes("fails thesis: check size"));

  // R4 live toggle: raise the check ceiling to $2M and BrightCart clears thesis.
  const widened = evaluateThesisFit(
    { sector: "AI infra", stage: "seed", geo: "US", askAmountCents: 200_000_000 },
    { ...thesis, checkSizeMaxCents: 200_000_000 },
  );
  assert.equal(widened.onThesis, true, "widening check size should un-grey BrightCart");
  db.close();
});
