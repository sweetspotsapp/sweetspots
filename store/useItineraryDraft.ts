import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Store dates as ISO strings (safe for JSON)
export type ItineraryDraft = {
  query?: string;
  location: string;

  startDateISO: string | null;
  endDateISO: string | null;

  budget: number;
  targetCount: number;
  collaborator: string;
  collaborators: string[];

  lat: number | null;
  lon: number | null;
};

type State = {
  draft: ItineraryDraft;
  saveDraft: (draft: Partial<ItineraryDraft> | ItineraryDraft) => void; // merge or replace
  replaceDraft: (draft: ItineraryDraft) => void;                         // hard replace
  getDraft: () => ItineraryDraft;                                        // sync getter
  reset: () => void;
};

const initialDraft: ItineraryDraft = {
  query: "",
  location: "",
  startDateISO: null,
  endDateISO: null,
  budget: 0,
  targetCount: 0,
  collaborator: "",
  collaborators: [],
  lat: null,
  lon: null,
};

export const useItineraryDraft = create<State>()(
  persist(
    (set, get) => ({
      draft: initialDraft,
      saveDraft: (incoming) =>
        set((s) => ({
          draft: { ...s.draft, ...incoming },
        })),
      replaceDraft: (incoming) => set({ draft: { ...incoming } }),
      getDraft: () => get().draft,
      reset: () => set({ draft: initialDraft }),
    }),
    {
      name: "itinerary-draft",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ draft: s.draft }), // only persist the draft
      version: 1,
    }
  )
);

// Small helpers if you prefer working with Date in UI code:
export const toISO = (d: Date | null | undefined) => (d ? d.toISOString() : null);
export const fromISO = (s: string | null) => (s ? new Date(s) : null);