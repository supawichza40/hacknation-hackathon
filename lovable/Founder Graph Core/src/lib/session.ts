// Fake session — in-memory + localStorage. No real auth.
const KEY = "fg.session";

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function signIn() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, "1");
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
