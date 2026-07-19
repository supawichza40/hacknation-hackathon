import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type DevState = { id: string; label: string };

type Ctx = {
  states: DevState[];
  active: string | null;
  register: (screen: string, states: DevState[], defaultId: string) => void;
  unregister: (screen: string) => void;
  setActive: (id: string) => void;
  screen: string | null;
};

const DevStateContext = createContext<Ctx | null>(null);

export function DevStateProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<string | null>(null);
  const [states, setStates] = useState<DevState[]>([]);
  const [active, setActive] = useState<string | null>(null);

  const value = useMemo<Ctx>(
    () => ({
      states,
      active,
      screen,
      register: (nextScreen, nextStates, defaultId) => {
        setScreen(nextScreen);
        setStates(nextStates);
        setActive(defaultId);
      },
      unregister: (nextScreen) => {
        setScreen((cur) => (cur === nextScreen ? null : cur));
        setStates((cur) => (cur.length && screen === nextScreen ? [] : cur));
      },
      setActive: (id) => setActive(id),
    }),
    [states, active, screen],
  );

  return <DevStateContext.Provider value={value}>{children}</DevStateContext.Provider>;
}

/** Screen registers its states. Returns current forced state id. */
export function useDevStates(screen: string, states: DevState[], defaultId: string): string {
  const ctx = useContext(DevStateContext);
  if (!ctx) throw new Error("useDevStates must be used inside DevStateProvider");

  // Register on mount; unregister on unmount.
  // Serialize state list for stable dependency.
  const key = states.map((s) => s.id).join("|");
  useEffect(() => {
    ctx.register(screen, states, defaultId);
    return () => ctx.unregister(screen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, key, defaultId]);

  return ctx.active ?? defaultId;
}

export function useDevStateContext() {
  const ctx = useContext(DevStateContext);
  if (!ctx) throw new Error("useDevStateContext must be used inside DevStateProvider");
  return ctx;
}
