import React, { useEffect, useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { SSText } from './ui/SSText';
import { Search } from 'lucide-react-native';
import { IPlace, ISavedPlace } from '@/api/places/dto/place.dto';
import { SavedPlaceCard } from './SavedPlaceCard';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';

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
  const [filteredPlaces, setFilteredPlaces] = useState<
    ISavedPlace[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [savedPlaces, searchQuery]);

  const filterPlaces = () => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(savedPlaces.filter((place) => hiddenPlaceIds.indexOf(place.id) === -1));
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = savedPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.vibes.some((vibe) => vibe.toLowerCase().includes(lowerQuery))
    );
    setFilteredPlaces(filtered.filter((place) => hiddenPlaceIds.indexOf(place.id) === -1));
  };

  const renderPlaceCard = ({
    item,
  }: {
    item: IPlace;
  }) => (
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
      <View className="flex-row items-center bg-white mx-5 mb-5 px-4 py-3 rounded-xl gap-3 shadow-sm">
        <Search size={20} color="#64748b" />
        <TextInput
          className="flex-1 text-base text-gray-800"
          placeholder="Search saved places..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Places List */}
      <FlatList
        data={filteredPlaces}
        renderItem={renderPlaceCard}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        contentContainerClassName="gap-3"
        onRefresh={loadSavedPlaces}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center pt-25 px-10">
            <SSText
              variant="bold"
              className="text-2xl text-emerald-600 text-center mb-3"
            >
              No saved places yet
            </SSText>
            <SSText className="text-base text-slate-500 text-center leading-6">
              Start swiping right on places you love to see them here!
            </SSText>
          </View>
        }
      />
    </>
  );
}
