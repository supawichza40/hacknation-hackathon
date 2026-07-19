import { useEffect, useState } from "react";
import type { Opportunity } from "@/components/founder/OpportunityCard";

const KEY = "foundergraph.submissions";
const EVENT = "foundergraph:submissions-changed";

export type Submission = Opportunity & {
  repoUrl: string;
  deckFileName?: string;
  links?: string;
  submittedAt: string;
};

function read(): Submission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Submission[]) : [];
  } catch {
    return [];
  }
}

function write(list: Submission[]) {
  window.sessionStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function addSubmission(s: Submission) {
  write([...read(), s]);
}

export function makeOpportunityId(companyName: string) {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 20) || "opp";
  const rand = Math.random().toString(36).slice(2, 6);
  return `apl-${slug}-${rand}`;
}

export function useSubmissions(): Submission[] {
  const [list, setList] = useState<Submission[]>(() => read());
  useEffect(() => {
    const sync = () => setList(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
