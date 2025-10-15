import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type OnboardingAnswers = {
  email?: string;
  travelerType?: "planner" | "chill" | "mix";
  companion?: "solo" | "friends" | "couple" | "family" | "budgetBackpacker" | "comfortSeeker";
  vibes: ("chill" | "social" | "nature" | "city" | "mixed")[];
  budget?: "budget" | "mid" | "comfortable" | "premium";
  requirements: (
    | "accessible"
    | "dietary"
    | "lowEnergy"
    | "familyFriendly"
    | "smokeFree"
    | "petFriendly"
    | "none"
  )[];
};

export type OnboardingUI = {
  step: number;
  dismissed: boolean;
  completed: boolean;
  dismissedAt?: string;
  completedAt?: string;
};

type OnboardingState = {
  answers: OnboardingAnswers;
  ui: OnboardingUI;

  updateAnswers: (patch: Partial<OnboardingAnswers>) => void;

  nextStep: () => void;
  prevStep: () => void;
  goToStep: (i: number) => void;

  markCompleted: () => void;
  dismiss: () => void;

  isComplete: () => boolean;
  reset: () => void;
  clear: () => void;
};

const initialAnswers: OnboardingAnswers = {
  vibes: [],
  requirements: [],
};

const initialUI: OnboardingUI = {
  step: 0,
  dismissed: false,
  completed: false,
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      answers: initialAnswers,
      ui: initialUI,

      /* ----- Update any field in answers ----- */
      updateAnswers: (patch) =>
        set((state) => ({
          answers: { ...state.answers, ...patch },
        })),

      /* ----- Step control ----- */
      nextStep: () =>
        set((state) => ({
          ui: { ...state.ui, step: Math.min(state.ui.step + 1, 4) },
        })),
      prevStep: () =>
        set((state) => ({
          ui: { ...state.ui, step: Math.max(state.ui.step - 1, 0) },
        })),
      goToStep: (i) =>
        set((state) => ({
          ui: { ...state.ui, step: Math.max(0, Math.min(i, 4)) },
        })),

      /* ----- Completion / Dismiss ----- */
      markCompleted: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            completed: true,
            dismissed: false,
            completedAt: new Date().toISOString(),
          },
        })),
      dismiss: () =>
        set((state) => ({
          ui: {
            ...state.ui,
            dismissed: true,
            completed: false,
            dismissedAt: new Date().toISOString(),
          },
        })),

      /* ----- Helpers ----- */
      isComplete: () => {
        const { travelerType, companion, budget, vibes } = get().answers;
        return !!(travelerType && companion && budget && vibes.length > 0);
      },

      reset: () =>
        set({
          answers: initialAnswers,
          ui: { ...initialUI, dismissed: false, completed: false },
        }),

      clear: () => set({ answers: initialAnswers, ui: initialUI }),
    }),
    {
      name: "onboarding-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);