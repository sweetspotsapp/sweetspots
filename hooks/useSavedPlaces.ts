import { ISavedPlace } from '@/api/places/dto/place.dto';
import { getSavedPlaces } from '@/utils/storage';
import { useState, useCallback } from 'react';

export const useSavedPlaces = () => {
    const [savedPlaces, setSavedPlaces] = useState<ISavedPlace[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadSavedPlaces = useCallback(async () => {
        setRefreshing(true);
        try {
            const res = await getSavedPlaces();
            const placesWithSelection: ISavedPlace[] =
                res?.map((place: Omit<ISavedPlace, 'selected'>) => ({
                    ...place,
                    selected: false,
                })) ?? [];
            setSavedPlaces(placesWithSelection);
        } catch (err) {
            console.error('Failed to load saved places', err);
        } finally {
            setRefreshing(false);
        }
    }, []);

    // Action to refresh the saved places
    const refresh = useCallback(async () => {
        await loadSavedPlaces();
    }, [loadSavedPlaces]);

    return {
        savedPlaces,
        refreshing,
        loadSavedPlaces,
        setSavedPlaces,
        refresh,
    };
};