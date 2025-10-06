import { create } from 'zustand';

type HintsState = {
  showSavedHint: boolean;
  lastShownAt?: number;
  triggerSavedHint: () => void;
  dismissSavedHint: () => void;
};

export const useHintsStore = create<HintsState>((set, get) => ({
  showSavedHint: false,
  lastShownAt: undefined,
  triggerSavedHint: () => {
    const now = Date.now();
    const last = get().lastShownAt ?? 0;
    if (now - last > 10_000) set({ showSavedHint: true, lastShownAt: now });
  },
  dismissSavedHint: () => set({ showSavedHint: false }),
}));