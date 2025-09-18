import { getSavedPlaces } from '@/api/places/endpoints';
import { GetPlacesQueryDto } from '@/dto/places/get-places-query.dto';
import { ISavedPlace } from '@/dto/places/place.dto';
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore';
import { useState, useCallback } from 'react';

export const useSavedPlaces = (query?: GetPlacesQueryDto) => {
    const { savedPlaces, setSavedPlaces, setRefreshing, refreshing } = useSavedPlacesStore();

    const loadSavedPlaces = useCallback(async () => {
        console.log('Loading saved places...');
        setRefreshing(true);
        try {
            const res = await getSavedPlaces(query);
            const placesWithSelection: ISavedPlace[] =
                res?.data?.map((place: Omit<ISavedPlace, 'selected'>) => ({
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

    return {
        savedPlaces,
        refreshing,
        loadSavedPlaces,
        setSavedPlaces,
    };
};