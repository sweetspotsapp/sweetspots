import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { ISavedPlace } from '@/dto/places/place.dto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_PLACES_KEY = 'saved_places';
const ITINERARIES_KEY = 'itineraries';
const VIBE_PREFERENCES_KEY = 'vibe_preferences';

// Saved Places
export const savePlaceToStorage = async (place: any): Promise<void> => {
  try {
    const savedPlaces = await getSavedPlaces();
    const savedPlace: ISavedPlace = {
      ...place,
      savedAt: new Date().toISOString(),
      selected: false,
    };
    
    // Check if already saved
    if (!savedPlaces.find(p => p.id === place.id)) {
      savedPlaces.push(savedPlace);
      await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(savedPlaces));
    }
  } catch (error) {
    console.error('Error saving place:', error);
  }
};

export const getSavedPlaces = async (): Promise<ISavedPlace[]> => {
  try {
    const data = await AsyncStorage.getItem(SAVED_PLACES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting saved places:', error);
    return [];
  }
};

export const togglePlaceSelection = async (placeId: string): Promise<void> => {
  try {
    const savedPlaces = await getSavedPlaces();
    const updatedPlaces = savedPlaces.map(place =>
      place.id === placeId ? { ...place, selected: !place.selected } : place
    );
    await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updatedPlaces));
  } catch (error) {
    console.error('Error toggling place selection:', error);
  }
};

export const clearSelectedPlaces = async (): Promise<void> => {
  try {
    const savedPlaces = await getSavedPlaces();
    const updatedPlaces = savedPlaces.map(place => ({ ...place, selected: false }));
    await AsyncStorage.setItem(SAVED_PLACES_KEY, JSON.stringify(updatedPlaces));
  } catch (error) {
    console.error('Error clearing selections:', error);
  }
};

// Itineraries
// export const createItinerary = async (data: {
//   name: string;
//   description?: string;
//   places: ItineraryPlace[];
//   collaborators: string[];
//   isPublic: boolean;
//   startDate?: string;
//   endDate?: string;
//   totalEstimatedCost?: number;
//   totalDuration?: number;
// }): Promise<void> => {
//   try {
//     const itineraries = await getItineraries();
//     const newItinerary: Itinerary = {
//       id: Date.now().toString(),
//       name: data.name,
//       description: data.description,
//       places: data.places,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//       coverImage: data.places[0]?.images[0],
//       collaborators: data.collaborators,
//       isPublic: data.isPublic,
//       startDate: data.startDate,
//       endDate: data.endDate,
//       totalEstimatedCost: data.totalEstimatedCost,
//       totalDuration: data.totalDuration,
//     };
    
//     itineraries.push(newItinerary);
//     await AsyncStorage.setItem(ITINERARIES_KEY, JSON.stringify(itineraries));
//   } catch (error) {
//     console.error('Error creating itinerary:', error);
//     throw error;
//   }
// };

export const getItineraries = async (): Promise<IItinerary[]> => {
  try {
    const data = await AsyncStorage.getItem(ITINERARIES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting itineraries:', error);
    return [];
  }
};

export const updateItinerary = async (id: string, updates: Partial<IItinerary>): Promise<void> => {
  try {
    const itineraries = await getItineraries();
    const updatedItineraries = itineraries.map(itinerary =>
      itinerary.id === id 
        ? { ...itinerary, ...updates, updatedAt: new Date().toISOString() }
        : itinerary
    );
    await AsyncStorage.setItem(ITINERARIES_KEY, JSON.stringify(updatedItineraries));
  } catch (error) {
    console.error('Error updating itinerary:', error);
    throw error;
  }
};

export const deleteItinerary = async (id: string): Promise<void> => {
  try {
    const itineraries = await getItineraries();
    const filteredItineraries = itineraries.filter(itinerary => itinerary.id !== id);
    await AsyncStorage.setItem(ITINERARIES_KEY, JSON.stringify(filteredItineraries));
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    throw error;
  }
};

// Vibe Preferences
export const saveVibePreferences = async (vibes: string[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(VIBE_PREFERENCES_KEY, JSON.stringify(vibes));
  } catch (error) {
    console.error('Error saving vibe preferences:', error);
  }
};

export const getVibePreferences = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem(VIBE_PREFERENCES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting vibe preferences:', error);
    return [];
  }
};

export const saveHelpfulReview = async (reviewId: string): Promise<void> => {
  try {
    const savedReviews = await getSavedHelpfulReviews();
    if (!savedReviews.includes(reviewId)) {
      savedReviews.push(reviewId);
      await AsyncStorage.setItem('helpful_reviews', JSON.stringify(savedReviews));
    }
  } catch (error) {
    console.error('Error saving helpful review:', error);
  }
}

export const getSavedHelpfulReviews = async (): Promise<string[]> => {
  try {
    const data = await AsyncStorage.getItem('helpful_reviews');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting helpful reviews:', error);
    return [];
  }
};