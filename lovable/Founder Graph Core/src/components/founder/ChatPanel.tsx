import { useEffect, useRef, useState } from "react";
import type { GraphNode } from "./GraphCanvas";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  citations?: string[];
  streaming?: boolean;
  refusal?: boolean;
};

type Props = {
  nodes: GraphNode[];
  unavailable: boolean;
  forceStreaming: boolean;
  forceCited: boolean;
  forceRefuse: boolean;
  prefill: string;
  onPrefillConsumed: () => void;
  onCite: (nodeId: string) => void;
};

type Canned = { match: RegExp; text: string; citations: string[] };
const CANNED: Canned[] = [
  {
    match: /(latency|100 ?ms|340|routing)/i,
    text:
      "The deck claims sub-100ms agent routing in production, but the repo's own benchmark reports a 340ms median across 10k runs. Treat the headline as contradicted until the founder reconciles the two numbers.",
    citations: ["claim-routing-latency", "file-bench-readme"],
  },
  {
    match: /(replay|deterministic)/i,
    text:
      "Deterministic replay is implemented in src/replay.ts. It records agent traces and re-runs them against a fixed seed — the strongest technical asset in the repo.",
    citations: ["file-replay", "concept-agent-orchestration"],
  },
  {
    match: /(stars?|traction|oss|open ?source)/i,
    text:
      "The 1.2k GitHub stars claim is verified against the repo's own star count, and the README frames the project consistently.",
    citations: ["claim-oss-traction", "file-readme"],
  },
  {
    match: /(orchestrat|concept|agent)/i,
    text:
      "Agent orchestration is the umbrella concept that both the routing claim and the replay engine ladder up to.",
    citations: ["concept-agent-orchestration", "file-router"],
  },
  {
    match: /(design ?partners?|customers?)/i,
    text:
      "The '3 paying design partners' claim is unsupported — no artifact in the repo or deck substantiates it. Flag it for the founder call.",
    citations: ["claim-design-partners"],
  },
];

const REHEARSED = [
  {
    q: "What contradicts the sub-100ms claim?",
    a: "bench/README.md reports 340ms median across 10k runs — the deck's headline claim does not match the repo's own numbers.",
    citations: ["claim-routing-latency", "file-bench-readme"],
  },
  {
    q: "What's the strongest technical asset?",
    a: "src/replay.ts — deterministic replay of agent traces. Cited across the concept graph.",
    citations: ["file-replay"],
  },
];

function pickAnswer(q: string): { text: string; citations: string[] } | null {
  for (const c of CANNED) if (c.match.test(q)) return { text: c.text, citations: c.citations };
  return null;
}

export function ChatPanel({
  nodes,
  unavailable,
  forceStreaming,
  forceCited,
  forceRefuse,
  prefill,
  onPrefillConsumed,
  onCite,
}: Props) {
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  useEffect(() => {
    if (prefill) {
      setInput(prefill);
      onPrefillConsumed();
    }
  }, [prefill, onPrefillConsumed]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [msgs]);

  // Force-streaming demo state: show a persistent streaming message.
  useEffect(() => {
    if (!forceStreaming) return;
    setMsgs([
      { id: "u-demo", role: "user", text: "What contradicts the sub-100ms claim?" },
      {
        id: "a-demo",
        role: "assistant",
        text: "The deck claims sub-100ms agent routing in production, but the repo's",
        streaming: true,
      },
    ]);
  }, [forceStreaming]);

  useEffect(() => {
    if (!forceCited) return;
    setMsgs([
      { id: "u-c", role: "user", text: "What contradicts the sub-100ms claim?" },
      {
        id: "a-c",
        role: "assistant",
        text:
          "The deck claims sub-100ms agent routing in production, but the repo's own benchmark reports a 340ms median across 10k runs.",
        citations: ["claim-routing-latency", "file-bench-readme"],
      },
    ]);
  }, [forceCited]);

  useEffect(() => {
    if (!forceRefuse) return;
    setMsgs([
      { id: "u-r", role: "user", text: "What's the founder's blood type?" },
      {
        id: "a-r",
        role: "assistant",
        text: "No citable evidence for that — try narrower.",
        refusal: true,
      },
    ]);
  }, [forceRefuse]);

  async function send() {
    const q = input.trim();
    if (!q || busy) return;
    setInput("");
    const uid = `u-${Date.now()}`;
    const aid = `a-${Date.now()}`;
    setMsgs((m) => [...m, { id: uid, role: "user", text: q }]);
    const pick = pickAnswer(q);
    if (!pick) {
      setMsgs((m) => [
        ...m,
        {
          id: aid,
          role: "assistant",
          text: "No citable evidence for that — try narrower.",
          refusal: true,
        },
      ]);
      return;
    }
    setBusy(true);
    setMsgs((m) => [...m, { id: aid, role: "assistant", text: "", streaming: true }]);
    const tokens = pick.text.split(/(\s+)/);
    for (let i = 0; i < tokens.length; i++) {
      await new Promise((r) => setTimeout(r, 22));
      setMsgs((m) =>
        m.map((x) =>
          x.id === aid ? { ...x, text: x.text + tokens[i] } : x,
        ),
      );
    }
    setMsgs((m) =>
      m.map((x) =>
        x.id === aid ? { ...x, streaming: false, citations: pick.citations } : x,
      ),
    );
    setBusy(false);
  }

  return (
    <aside className="flex h-full w-[380px] shrink-0 flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="label-xs">Ask this graph</span>
        <span className={"label-xs " + (unavailable ? "text-[color:var(--negative)]" : "text-muted-foreground")}>
          {unavailable ? "unavailable · rehearsed replay" : "grounded · cites nodes"}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {unavailable ? (
          <div className="space-y-3">
            <div className="rounded-md border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/10 px-3 py-2 text-[12px] text-foreground">
              Live chat unavailable. Rehearsed replay Q&amp;A below.
            </div>
            {REHEARSED.map((r, i) => (
              <div key={i} className="rounded-md border border-border p-3">
                <div className="text-[13px] font-medium text-foreground">{r.q}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-foreground">{r.a}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {r.citations.map((cid) => (
                    <button
                      key={cid}
                      onClick={() => onCite(cid)}
                      className="mono rounded-md border border-border bg-[color:var(--bg)] px-1.5 py-0.5 text-[11px] text-foreground hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                    >
                      {nodeById.get(cid)?.name ?? cid}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : msgs.length === 0 ? (
          <div className="text-[12px] text-muted-foreground">
            Try: <span className="mono">"what contradicts the sub-100ms claim?"</span>
          </div>
        ) : (
          <div className="space-y-4">
            {msgs.map((m) => (
              <div key={m.id}>
                <div className="label-xs mb-1">{m.role === "user" ? "you" : "assistant"}</div>
                <div
                  className={
                    "rounded-md border px-3 py-2 text-[13px] leading-relaxed " +
                    (m.role === "user"
                      ? "border-border bg-[color:var(--bg)] text-foreground"
                      : m.refusal
                      ? "border-[color:var(--negative)]/30 bg-[color:var(--negative)]/5 text-foreground"
                      : "border-border bg-surface text-foreground")
                  }
                >
                  {m.text}
                  {m.streaming ? (
                    <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-[color:var(--accent)]" />
                  ) : null}
                </div>
                {m.citations && m.citations.length ? (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <span className="label-xs mr-1 self-center">cites</span>
                    {m.citations.map((cid) => (
                      <button
                        key={cid}
                        onClick={() => onCite(cid)}
                        className="mono rounded-md border border-border bg-[color:var(--bg)] px-1.5 py-0.5 text-[11px] text-foreground hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                      >
                        {nodeById.get(cid)?.name ?? cid}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>

      {!unavailable && (
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Ask about a claim, file, or concept…"
              className="flex-1 resize-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[13px] text-foreground outline-none focus:border-[color:var(--accent)]"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="rounded-md bg-[color:var(--accent)] px-3 py-2 text-[12px] font-medium text-white disabled:opacity-40"
            >
              {busy ? "…" : "send"}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
