import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import { SSText } from './ui/SSText';
import { SavedPlaceCard } from './SavedPlaceCard';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { IPlace, ISavedPlace } from '@/dto/places/place.dto';
import SSSpinner from './ui/SSSpinner';
import SearchInput from './ui/SearchInput';

type SavedPlacesProps = {
  isSelectionMode?: boolean;
  onSelectPlace?: (placeId: string) => void;
  selectedPlaceIds?: string[];
  hiddenPlaceIds?: string[];
};

export default function SavedPlaces({
  isSelectionMode = false,
  onSelectPlace = () => {},
  selectedPlaceIds = [],
  hiddenPlaceIds = [],
}: SavedPlacesProps) {
  const { savedPlaces, loadSavedPlaces, refreshing } = useSavedPlaces();
  const [filteredPlaces, setFilteredPlaces] = useState<ISavedPlace[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [savedPlaces, searchQuery]);

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

  const renderPlaceCard = ({ item }: { item: IPlace }) => (
    <SavedPlaceCard
      place={item}
      isSelected={selectedPlaceIds.includes(item.id)}
      isSelectionMode={isSelectionMode}
      onSelect={() => onSelectPlace(item.id)}
    />
  );

  return (
    <>
      {/* Search Bar */}
      <SearchInput
        value={searchQuery}
        onTextChange={setSearchQuery}
      />

      {refreshing ? <SSSpinner className='mb-4'/> : (
        <FlatList
          data={filteredPlaces}
          renderItem={renderPlaceCard}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          contentContainerClassName="gap-3 grid grid-cols-2"
          onRefresh={loadSavedPlaces}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center pt-25">
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
