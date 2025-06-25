import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, CircleCheck as CheckCircle, Plus } from 'lucide-react-native';

import { getSavedPlaces } from '@/api/places/endpoints';
import { IPlace } from '@/api/places/dto/place.dto';
import { SavedPlaceCard } from '@/components/SavedPlaceCard';
import { CreateItineraryModal } from '@/components/CreateItineraryModal';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { Button } from '@/components/ui/button';

export default function SavedTab() {
  const [savedPlaces, setSavedPlaces] = useState<
    (IPlace & { selected?: boolean })[]
  >([]);
  const [filteredPlaces, setFilteredPlaces] = useState<
    (IPlace & { selected?: boolean })[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [savedPlaces, searchQuery]);

  useEffect(() => {
    const count = savedPlaces.filter((place) => place.selected).length;
    setSelectedCount(count);
  }, [savedPlaces]);

  const loadSavedPlaces = async () => {
    setRefreshing(true);
    try {
      const res = await getSavedPlaces();
      const placesWithSelection =
        res.data?.map((place) => ({
          ...place,
          selected: false,
        })) ?? [];
      setSavedPlaces(placesWithSelection);
    } catch (err) {
      console.error('Failed to load saved places', err);
    } finally {
      setRefreshing(false);
    }
  };

  const filterPlaces = () => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(savedPlaces);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const filtered = savedPlaces.filter(
      (place) =>
        place.name.toLowerCase().includes(lowerQuery) ||
        place.vibes.some((vibe) => vibe.toLowerCase().includes(lowerQuery))
    );
    setFilteredPlaces(filtered);
  };

  const handleSelectPlace = (placeId: string) => {
    setSavedPlaces((prev) =>
      prev.map((place) =>
        place.id === placeId ? { ...place, selected: !place.selected } : place
      )
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      // turning OFF selection mode, clear selections
      setSavedPlaces((prev) => prev.map((p) => ({ ...p, selected: false })));
    }
  };

  const handleCreateItinerary = () => {
    if (selectedCount === 0) {
      Alert.alert(
        'No places selected',
        'Please select at least one place to create an itinerary.'
      );
      return;
    }
    setShowCreateModal(true);
  };

  const onItineraryCreated = () => {
    setShowCreateModal(false);
    setIsSelectionMode(false);
    setSavedPlaces((prev) => prev.map((p) => ({ ...p, selected: false })));
  };

  const renderPlaceCard = ({
    item,
  }: {
    item: IPlace & { selected?: boolean };
  }) => (
    <SavedPlaceCard
      place={item}
      isSelectionMode={isSelectionMode}
      onSelect={() => handleSelectPlace(item.id)}
    />
  );

  return (
    <SafeAreaView className="flex-1">
      <SSLinearGradient />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <SSText variant="bold" className="text-3xl text-emerald-600">
          Saved Places
        </SSText>
        <TouchableOpacity
          className={`w-11 h-11 rounded-full justify-center items-center ${
            isSelectionMode
              ? 'bg-emerald-600'
              : 'bg-white border-2 border-emerald-600'
          }`}
          onPress={toggleSelectionMode}
        >
          <CheckCircle
            size={24}
            color={isSelectionMode ? '#ffffff' : '#10b981'}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white mx-5 mb-5 px-4 py-3 rounded-xl gap-3 shadow-sm">
        <Search size={20} color="#64748b" />
        <TextInput
          className="flex-1 text-base text-gray-800"
          placeholder="Search saved places..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#94a3b8"
          style={{ fontFamily: 'PlusJakartaSans-Regular' }}
        />
      </View>

      {/* Places List */}
      <FlatList
        data={filteredPlaces}
        renderItem={renderPlaceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        contentContainerClassName='gap-3'
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

      {/* Floating Create Button */}
      {selectedCount > 0 && (
        <Button
          className="absolute bottom-7 left-5 right-5 shadow-lg"
          onPress={handleCreateItinerary}
        >
          <Plus size={24} color="#ffffff" />
          <SSText variant="semibold" className="text-white text-base">
            Create Itinerary ({selectedCount})
          </SSText>
        </Button>
      )}

      <CreateItineraryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={onItineraryCreated}
        selectedPlaces={savedPlaces.filter((p) => p.selected)}
      />
    </SafeAreaView>
  );
}
