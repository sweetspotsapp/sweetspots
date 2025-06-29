import { create } from 'zustand';

interface LocationState {
  location: { latitude: number; longitude: number } | null;
  setLocation: (loc: { latitude: number; longitude: number }) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  location: null,
  setLocation: (loc) => set({ location: loc }),
}));