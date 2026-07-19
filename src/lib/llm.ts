// The single place the app talks to an LLM in production (VC-BRAIN-PLAN.md §7). Replaces
// the local `claude -p` subprocess with a real Anthropic API call via @anthropic-ai/sdk,
// so the deployed app runs live inference when ANTHROPIC_API_KEY is set. When the key is
// absent every caller catches NoLlmError and serves its captured replay (demo mode) — the
// fixtures under data/replay/, exactly as before. Importing this module is side-effect
// free: the client is constructed lazily, only when a live call is actually made.
import Anthropic from "@anthropic-ai/sdk";

// Single source of truth for the model — a one-line swap to change every call site.
// Opus 4.8 is the Wave-0 spike model. "claude-sonnet-5" is the cheaper option (same API
// surface) if cost matters more than the extra headroom.
export const MODEL = "claude-opus-4-8";

// Thrown when there is no API key (or a live call fails). Callers treat it as the signal
// to fall through to their existing replay fallback rather than surfacing a 500.
export class NoLlmError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoLlmError";
  }
}

// True iff a non-empty ANTHROPIC_API_KEY is configured. When false the app is in
// replay/demo mode and no network call is attempted.
export function hasLiveLlm(): boolean {
  const key = process.env.ANTHROPIC_API_KEY;
  return typeof key === "string" && key.trim().length > 0;
}

let client: Anthropic | null = null;
function getClient(): Anthropic {
  // `new Anthropic()` reads ANTHROPIC_API_KEY from the environment.
  if (!client) client = new Anthropic();
  return client;
}

function extractText(content: Anthropic.ContentBlock[]): string {
  let out = "";
  for (const block of content) {
    if (block.type === "text") out += block.text;
  }
  return out;
}

// One-shot structured call: send the prompt, return the model's text verbatim. The caller
// parses + zod-validates (and runs its own one-shot repair) exactly as it did with the CLI.
// No temperature/top_p/thinking: opus-4-8 400s on sampling params, and these are structured
// extraction calls that don't need thinking (keeps latency and cost down). On any API
// failure (rate limit, network, error response) we throw NoLlmError so the caller's replay
// fallback engages rather than 500ing the golden path.
export async function callClaudeJson(opts: {
  prompt: string;
  system?: string;
  maxTokens?: number;
}): Promise<string> {
  if (!hasLiveLlm()) throw new NoLlmError("ANTHROPIC_API_KEY not set");
  const { prompt, system, maxTokens = 16000 } = opts;
  try {
    const res = await getClient().messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: prompt }],
    });
    return extractText(res.content);
  } catch (err) {
    if (err instanceof NoLlmError) throw err;
    // RateLimitError, APIError, connection errors — all collapse to NoLlmError so the
    // caller replays instead of failing the request.
    throw new NoLlmError(`Anthropic API call failed: ${(err as Error).message}`);
  }
}

// Streaming variant for chat. Streams via messages.stream (so a longer answer never hits an
// HTTP timeout) and forwards text deltas through onText when the caller wants live tokens.
// Returns the complete text; the chat route parses that as JSON and runs cite-or-refuse
// before it re-streams the validated answer to the client. Throws NoLlmError with no key so
// chat serves its captured Q&A.
export async function streamClaude(opts: {
  prompt: string;
  system?: string;
  maxTokens?: number;
  onText?: (delta: string) => void;
}): Promise<string> {
  if (!hasLiveLlm()) throw new NoLlmError("ANTHROPIC_API_KEY not set");
  const { prompt, system, maxTokens = 4096, onText } = opts;
  try {
    const stream = getClient().messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: "user", content: prompt }],
    });
    if (onText) stream.on("text", (delta) => onText(delta));
    const final = await stream.finalMessage();
    return extractText(final.content);
  } catch (err) {
    if (err instanceof NoLlmError) throw err;
    throw new NoLlmError(`Anthropic streaming call failed: ${(err as Error).message}`);
  }
}
