"use client";

import { useSyncExternalStore } from "react";

// Vehicle comparison selection, kept in localStorage so it survives navigation
// and stays in sync across tabs. Only ids + display basics are stored; the
// compare page always re-reads vehicle data from the database.

import { COMPARE_MAX, COMPARE_MIN, compareHref } from "@/lib/compare";

export { COMPARE_MAX, COMPARE_MIN, compareHref };
const KEY = "zmr-compare-v1";

export interface CompareItem { id: string; title: string; image?: string }
export type AddResult = "added" | "duplicate" | "full";

interface State { items: CompareItem[]; notice: string | null }

const EMPTY: State = { items: [], notice: null };
let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function read(): CompareItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .filter((i): i is CompareItem => i && typeof i.id === "string" && typeof i.title === "string")
      .filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true)))
      .slice(0, COMPARE_MAX);
  } catch {
    return [];
  }
}

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { items: read(), notice: null };
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) set({ items: read(), notice: null }, false);
  });
}

function set(next: State, persist = true) {
  state = next;
  if (persist) {
    try { localStorage.setItem(KEY, JSON.stringify(next.items)); } catch { /* storage unavailable */ }
  }
  listeners.forEach((l) => l());
}

let noticeTimer: ReturnType<typeof setTimeout> | null = null;
function notify(notice: string) {
  set({ ...state, notice }, false);
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => set({ ...state, notice: null }, false), 4000);
}

export const compareActions = {
  add(item: CompareItem): AddResult {
    ensureLoaded();
    if (state.items.some((i) => i.id === item.id)) {
      notify(`${item.title} is already in your comparison.`);
      return "duplicate";
    }
    if (state.items.length >= COMPARE_MAX) {
      notify(`You can compare up to ${COMPARE_MAX} vehicles. Remove one to add ${item.title}.`);
      return "full";
    }
    set({ items: [...state.items, item], notice: null });
    return "added";
  },
  remove(id: string) {
    ensureLoaded();
    set({ items: state.items.filter((i) => i.id !== id), notice: null });
  },
  replace(oldId: string, item: CompareItem) {
    ensureLoaded();
    if (state.items.some((i) => i.id === item.id)) {
      notify(`${item.title} is already in your comparison.`);
      return;
    }
    set({ items: state.items.map((i) => (i.id === oldId ? item : i)), notice: null });
  },
  /** Replace the whole selection (e.g. from a shared /compare?ids= link). */
  setAll(items: CompareItem[]) {
    ensureLoaded();
    const seen = new Set<string>();
    const unique = items.filter((i) => (seen.has(i.id) ? false : (seen.add(i.id), true))).slice(0, COMPARE_MAX);
    set({ items: unique, notice: null });
  },
  clear() {
    ensureLoaded();
    set({ items: [], notice: null });
  },
};

function subscribe(cb: () => void) {
  ensureLoaded();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useCompare() {
  const s = useSyncExternalStore(subscribe, () => (ensureLoaded(), state), () => EMPTY);
  return {
    items: s.items,
    notice: s.notice,
    count: s.items.length,
    isFull: s.items.length >= COMPARE_MAX,
    has: (id: string) => s.items.some((i) => i.id === id),
    ...compareActions,
  };
}
