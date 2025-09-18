import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SSText } from '../ui/SSText';
import SSSpinner from '../ui/SSSpinner';
import SearchInput from '../ui/SearchInput';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { DiscoverPlaceCard } from './DiscoverPlaceCard';
import { getRecommendations } from '@/api/recommendations/endpoints';

type DiscoverPlacesProps = {
  isSelectionMode?: boolean;
  onSelectPlace?: (placeId: string) => void;
  selectedPlaceIds?: string[];
  hiddenPlaceIds?: string[];
  coords?: { lat: number; lon: number };
};

export default function DiscoverPlaces({
  isSelectionMode = false,
  onSelectPlace = () => {},
  selectedPlaceIds = [],
  hiddenPlaceIds = [],
  coords,
}: DiscoverPlacesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const { savedPlaces, loadSavedPlaces, refreshing } = useSavedPlaces();
  const [savedPlaces, setSavedPlaces] = useState<IRecommendedPlace[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<IRecommendedPlace[]>([]);

  useEffect(() => {
    filterPlaces();
  }, [savedPlaces, searchQuery]);

  async function fetchRecommendations() {
    setIsLoading(true);
    try {
      const res = await getRecommendations({
        latitude: coords?.lat || -37.8136,
        longitude: coords?.lon || 144.9631,
        limit: 30,
      });

      setSavedPlaces(res.data || []);
    } finally {
      setIsLoading(false);
    }
  }

  console.log(savedPlaces);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [searchQuery]);

  const filterPlaces = () => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(
        savedPlaces.filter((place) => hiddenPlaceIds.indexOf(place.id) === -1)
      );
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = savedPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.vibes.some((vibe: string) =>
          vibe.toLowerCase().includes(lowerQuery)
        )
    );
    setFilteredPlaces(
      filtered.filter((place) => hiddenPlaceIds.indexOf(place.id) === -1)
    );
  };

  const renderPlaceCard = ({ item }: { item: IRecommendedPlace }) => (
    <DiscoverPlaceCard
      place={item}
      isSelected={selectedPlaceIds.includes(item.id)}
      isSelectionMode={isSelectionMode}
      onSelect={() => onSelectPlace(item.id)}
    />
  );

  return (
    <>
      {/* Search Bar */}
      <SearchInput value={searchQuery} onTextChange={setSearchQuery} />

      {isLoading ? (
        <SSSpinner className="mb-4" />
      ) : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlaceCard}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          contentContainerClassName="gap-3 grid grid-cols-2"
          onRefresh={fetchRecommendations}
          ListEmptyComponent={
            <View className="flex-1 col-span-2 justify-center items-center pt-25">
              <SSText
                variant="bold"
                className="text-2xl text-orange-600 text-center mb-3"
              >
                No saved places yet
              </SSText>
              <SSText className="text-base text-slate-500 text-center leading-6">
                Start swiping right on places you love to see them here!
              </SSText>
            </View>
          }
        />
      )}
    </>
  );
}
