import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** One cached explanation for (userId, placeId) */
export type RecContext = {
  content: string;
  /** when the content was generated (from server or AI) */
  updatedAtISO: string;
  /** when it was last read (used for simple LRU pruning) */
  lastAccessISO: string;
};

type Key = string; // `${userId}:${placeId}`

type State = {
  /** Map keyed by `${userId}:${placeId}` */
  contexts: Record<Key, RecContext>;

  /** Read-only getter (sync) */
  get: (userId: string, placeId: string) => RecContext | undefined;

  /** Insert or update a context */
  set: (
    userId: string,
    placeId: string,
    content: string,
    updatedAt?: Date
  ) => void;

  /** Mark as accessed (bumps lastAccessISO) */
  touch: (userId: string, placeId: string) => void;

  /** Remove one entry */
  remove: (userId: string, placeId: string) => void;

  /** Clear all */
  clear: () => void;

  /** Is fresh given a TTL (ms)? */
  isFresh: (userId: string, placeId: string, ttlMs: number) => boolean;

  /**
   * Ensure a fresh context:
   * - if missing or stale → fetcher() is called, cached, and returned
   * - else → cached content is returned
   */
  ensure: (
    userId: string,
    placeId: string,
    fetcher: () => Promise<string>,
    ttlMs: number
  ) => Promise<string>;
};

const buildKey = (userId: string, placeId: string) => `${userId}:${placeId}`;
const nowISO = () => new Date().toISOString();

/** Hard cap for entries; prune oldest by lastAccessISO when exceeded */
const MAX_ENTRIES = 200;

export const useRecContextCache = create<State>()(
  persist(
    (set, get) => ({
      contexts: {},

      get: (userId, placeId) => {
        const key = buildKey(userId, placeId);
        return get().contexts[key];
      },

      set: (userId, placeId, content, updatedAt) =>
        set((state) => {
          const key = buildKey(userId, placeId);
          const next: Record<Key, RecContext> = { ...state.contexts };
          next[key] = {
            content,
            updatedAtISO: (updatedAt ?? new Date()).toISOString(),
            lastAccessISO: nowISO(),
          };

          // Simple LRU prune
          const keys = Object.keys(next);
          if (keys.length > MAX_ENTRIES) {
            keys
              .sort(
                (a, b) =>
                  new Date(next[a].lastAccessISO).getTime() -
                  new Date(next[b].lastAccessISO).getTime()
              )
              .slice(0, keys.length - MAX_ENTRIES)
              .forEach((k) => delete next[k]);
          }

          return { contexts: next };
        }),

      touch: (userId, placeId) =>
        set((state) => {
          const key = buildKey(userId, placeId);
          const entry = state.contexts[key];
          if (!entry) return {};
          return {
            contexts: {
              ...state.contexts,
              [key]: { ...entry, lastAccessISO: nowISO() },
            },
          };
        }),

      remove: (userId, placeId) =>
        set((state) => {
          const key = buildKey(userId, placeId);
          if (!state.contexts[key]) return {};
          const next = { ...state.contexts };
          delete next[key];
          return { contexts: next };
        }),

      clear: () => set({ contexts: {} }),

      isFresh: (userId, placeId, ttlMs) => {
        const entry = get().get(userId, placeId);
        if (!entry) return false;
        const age = Date.now() - new Date(entry.updatedAtISO).getTime();
        return age <= ttlMs;
      },

      ensure: async (userId, placeId, fetcher, ttlMs) => {
        const st = get();
        const existing = st.get(userId, placeId);
        if (existing && st.isFresh(userId, placeId, ttlMs)) {
          // touch and return cached
          st.touch(userId, placeId);
          return existing.content;
        }
        // fetch new, save, return
        const content = await fetcher();
        st.set(userId, placeId, content, new Date());
        return content;
      },
    }),
    {
      name: "rec-context-cache",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ contexts: s.contexts }),
      version: 1,
    }
  )
);

// Optional helpers if you want ISO <-> Date ergonomics
export const fromISO = (s?: string) => (s ? new Date(s) : undefined);