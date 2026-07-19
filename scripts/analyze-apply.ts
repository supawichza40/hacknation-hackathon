// Out-of-process runner for the /apply analysis job (spawned by spawnApplyAnalysis in
// src/lib/apply.ts). Running the heavy pipeline here — not inside the route — keeps
// graph/io-write.ts out of every route bundle (its dynamic fs would make the bundler
// trace the whole project). Job state lives in the DB (analysis_status), so this
// process just updates that and exits; it never throws back to a request.
//
// Usage: node scripts/analyze-apply.ts --opp <opportunityId> --repo <githubUrl> --slug <slug>
import { validateGithubRepoUrl } from "../src/lib/apply.ts";
import { runApplyAnalysis } from "../src/lib/apply-analyze.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const opportunityId = arg("opp");
  const repo = arg("repo");
  const slug = arg("slug");
  if (!opportunityId || !repo || !slug) {
    console.error("analyze-apply: --opp, --repo and --slug are all required");
    process.exit(2);
  }

  // Defense in depth: never hand an unvalidated URL to git clone, even if this CLI is
  // invoked directly. The route already validated, so this normally just re-derives.
  const gh = validateGithubRepoUrl(repo);
  if (!gh.ok) {
    console.error(`analyze-apply: refusing non-GitHub repo URL — ${gh.error}`);
    process.exit(2);
  }

  const outcome = await runApplyAnalysis({ opportunityId, slug, cloneUrl: gh.cloneUrl });
  console.log(`analyze-apply: ${opportunityId} -> ${outcome.status}${outcome.reason ? ` (${outcome.reason})` : ""}`);
  process.exit(0);
}

await main();
