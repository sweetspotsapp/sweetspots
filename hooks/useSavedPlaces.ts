import { getSavedPlaces } from '@/endpoints/places/endpoints';
import { GetPlacesQueryDto } from '@/dto/places/get-places-query.dto';
import { ISavedPlace } from '@/dto/places/place.dto';
import { useSavedPlacesStore } from '@/store/useSavedPlacesStore';
import { useState, useCallback, useEffect } from 'react';

export const useSavedPlaces = (query?: GetPlacesQueryDto) => {
    const { savedPlaces, setSavedPlaces, setRefreshing, refreshing } = useSavedPlacesStore();

    const loadSavedPlaces = useCallback(async () => {
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
    }, [...Object.values(query || {}), setRefreshing, setSavedPlaces]);

    useEffect(() => {
        loadSavedPlaces();
    }, [...Object.values(query || {})]);

    return {
        savedPlaces,
        refreshing,
        loadSavedPlaces,
        setSavedPlaces,
    };
};