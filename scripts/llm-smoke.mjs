// One real Anthropic API call — the live-path check the offline test suite can't run.
// Run once ANTHROPIC_API_KEY is set:
//   ANTHROPIC_API_KEY=sk-ant-... node scripts/llm-smoke.mjs
// Exercises the whole live path: client construction, the messages.create call, and text
// extraction, via the same callClaudeJson the app uses. Prints the model's reply, or the
// reason it would fall back to replay mode.
import { callClaudeJson, hasLiveLlm, MODEL } from "../src/lib/llm.ts";

if (!hasLiveLlm()) {
  console.error(
    "ANTHROPIC_API_KEY is not set — the app would run in replay/demo mode.\n" +
      "Set the key and re-run to exercise the live path.",
  );
  process.exit(1);
}

console.log(`Calling ${MODEL} …`);
try {
  const text = await callClaudeJson({
    prompt: 'Reply with STRICT JSON only: {"ok": true, "model": "<the model that answered>"}',
    maxTokens: 200,
  });
  console.log("Live response:\n" + text);
} catch (err) {
  console.error("Live call failed:", err instanceof Error ? err.message : err);
  process.exit(1);
}
