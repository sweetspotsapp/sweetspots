import { IPlace } from '@/dto/places/place.dto';
import { create } from 'zustand';

type SavedPlace = IPlace & { selected?: boolean };

interface SavedPlacesStore {
  savedPlaces: SavedPlace[];
  setSavedPlaces: (places: SavedPlace[]) => void;
  addSavedPlace: (place: SavedPlace) => void;
  removeSavedPlace: (id: string) => void;
  toggleSelected: (id: string) => void;
  refreshing?: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

export const useSavedPlacesStore = create<SavedPlacesStore>((set) => ({
  savedPlaces: [],
  refreshing: false,
  setRefreshing: (refreshing) => set({ refreshing }),
  setSavedPlaces: (places) => set({ savedPlaces: places }),
  addSavedPlace: (place) =>
    set((state) => ({
      savedPlaces: [...state.savedPlaces, place],
    })),
  removeSavedPlace: (id) =>
    set((state) => ({
      savedPlaces: state.savedPlaces.filter((p) => p.id !== id),
    })),
  toggleSelected: (id) =>
    set((state) => ({
      savedPlaces: state.savedPlaces.map((p) =>
        p.id === id ? { ...p, selected: !p.selected } : p
      ),
    })),
}));
