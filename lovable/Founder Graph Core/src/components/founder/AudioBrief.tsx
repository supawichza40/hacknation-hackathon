import { useEffect, useRef, useState } from "react";
import brief from "@/data/brief-ecc.json";
import audioAsset from "@/assets/brief-ecc.mp3.asset.json";

type State = "ready" | "loading" | "unavailable";

export function AudioBrief({ state }: { state: State }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(brief.durationSec);
  const [showScript, setShowScript] = useState(false);

  // Wire audio events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setElapsed(Math.floor(a.currentTime));
    const onMeta = () => {
      if (!isNaN(a.duration) && isFinite(a.duration)) setDuration(Math.floor(a.duration));
    };
    const onEnd = () => {
      setPlaying(false);
      setElapsed(Math.floor(a.duration || duration));
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [duration]);

  // Force stop when marked unavailable
  useEffect(() => {
    if (state === "unavailable") {
      const a = audioRef.current;
      if (a) a.pause();
      setPlaying(false);
      setShowScript(true);
    }
  }, [state]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      if (a.ended || a.currentTime >= (a.duration || 0) - 0.05) {
        a.currentTime = 0;
        setElapsed(0);
      }
      void a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  };

  const disabled = state !== "ready";
  const mm = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, "0")}`;
  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <>
      <audio ref={audioRef} src={audioAsset.url} preload="metadata" />
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface px-2 py-1">
        <button
          onClick={toggle}
          disabled={disabled}
          className={
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] " +
            (disabled
              ? "bg-[color:var(--color-muted)] text-muted-foreground"
              : "bg-[color:var(--accent)] text-white hover:opacity-90")
          }
          aria-label={playing ? "Pause brief" : "Play brief"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="flex flex-col">
          <span className="label-xs leading-none">
            {state === "loading"
              ? "Loading brief…"
              : state === "unavailable"
              ? "Audio unavailable"
              : "Pre-recorded brief"}
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <div className="h-[3px] w-24 overflow-hidden rounded-sm bg-[color:var(--color-muted)]">
              <div
                className="h-full bg-[color:var(--accent)] transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="mono text-[10px] text-muted-foreground">
              {mm(elapsed)} / {mm(duration)}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowScript((s) => !s)}
          className="ml-1 rounded-sm px-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          {showScript ? "hide" : "script"}
        </button>
      </div>
      {showScript || state === "unavailable" ? (
        <div className="mt-2 max-w-[380px] rounded-md border border-border bg-[color:var(--color-muted)] p-2 text-[12px] leading-snug text-foreground">
          {state === "unavailable" ? (
            <div className="label-xs mb-1 text-[color:var(--warning)]">Audio unavailable · printed script</div>
          ) : (
            <div className="label-xs mb-1">Script (pre-recorded)</div>
          )}
          {brief.script}
        </div>
      ) : null}
    </>
  );
}
