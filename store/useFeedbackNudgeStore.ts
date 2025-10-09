import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PromptReason = 'swipe_threshold' | 'itinerary_created' | 'manual';
type Version = string; // e.g. from Constants.manifest?.version or your own

type FeedbackNudgeState = {
  // counters
  totalSwipes: number;
  swipesSinceLastPrompt: number;
  itinerariesCreated: number;

  // prefs / gating
  lastPromptAt?: string | null;        // ISO
  lastPromptVersion?: Version | null;
  dismissedAt?: string | null;         // last time user closed prompt
  neverAskAgain: boolean;

  // configurable thresholds (tweak at runtime if you want)
  swipeThreshold: number;              // e.g. 30
  cooldownDays: number;                // e.g. 7

  // actions
  recordSwipe: () => void;
  recordItineraryCreated: () => void;

  markPromptShown: (appVersion: Version) => void;
  dismissOnce: () => void;
  setNeverAskAgain: () => void;

  shouldPrompt: (appVersion: Version) => { ok: boolean; reason?: PromptReason };
  resetNudges: () => void; // for debug/testing
};

const daysToMs = (d: number) => d * 24 * 60 * 60 * 1000;

export const useFeedbackNudgeStore = create<FeedbackNudgeState>()(
  persist(
    (set, get) => ({
      totalSwipes: 0,
      swipesSinceLastPrompt: 0,
      itinerariesCreated: 0,

      lastPromptAt: null,
      lastPromptVersion: null,
      dismissedAt: null,
      neverAskAgain: false,

      swipeThreshold: 30,
      cooldownDays: 7,

      recordSwipe: () =>
        set((s) => ({
          totalSwipes: s.totalSwipes + 1,
          swipesSinceLastPrompt: s.swipesSinceLastPrompt + 1,
        })),

      recordItineraryCreated: () =>
        set((s) => ({ itinerariesCreated: s.itinerariesCreated + 1 })),

      markPromptShown: (appVersion) =>
        set(() => ({
          lastPromptAt: new Date().toISOString(),
          lastPromptVersion: appVersion,
          swipesSinceLastPrompt: 0,
        })),

      dismissOnce: () =>
        set(() => ({ dismissedAt: new Date().toISOString() })),

      setNeverAskAgain: () => set(() => ({ neverAskAgain: true })),

      shouldPrompt: (appVersion) => {
        const {
          neverAskAgain,
          lastPromptAt,
          lastPromptVersion,
          cooldownDays,
          swipesSinceLastPrompt,
          swipeThreshold,
          itinerariesCreated,
        } = get();

        if (neverAskAgain) return { ok: false };

        // Cooldown check
        const now = Date.now();
        const last = lastPromptAt ? new Date(lastPromptAt).getTime() : 0;
        const cooledDown = !last || now - last > daysToMs(cooldownDays);

        // Per-version: allow one prompt per app version (optional)
        const newVersion = !lastPromptVersion || lastPromptVersion !== appVersion;

        // Heuristic #1: user swiped enough times since last prompt
        if (cooledDown && swipesSinceLastPrompt >= swipeThreshold) {
          return { ok: true, reason: 'swipe_threshold' };
        }

        // Heuristic #2: user created at least one itinerary since last prompt
        if (cooledDown && itinerariesCreated > 0 && newVersion) {
          return { ok: true, reason: 'itinerary_created' };
        }

        return { ok: false };
      },

      resetNudges: () =>
        set(() => ({
          totalSwipes: 0,
          swipesSinceLastPrompt: 0,
          itinerariesCreated: 0,
          lastPromptAt: null,
          lastPromptVersion: null,
          dismissedAt: null,
          neverAskAgain: false,
        })),
    }),
    {
      name: 'feedback-nudge-v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // optional migrate if you change shape later
    }
  )
);