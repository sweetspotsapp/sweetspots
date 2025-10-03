import React, { useState } from 'react';
import { View, Modal, TouchableOpacity, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { X, Star, Users, Wallet, Mountain } from 'lucide-react-native';
import { SSText } from './ui/SSText';
import ModalHeader from './ui/ModalHeader';
import SSContainer from './SSContainer';
import { Button } from './ui/button';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    vibes: string[];
    rating: number;
    distance: number;
    priceRange: string[];
    groupSize: string;
    budget: number;
  }) => void;
  currentFilters: {
    vibes: string[];
    rating: number;
    distance: number;
    priceRange: string[];
    groupSize: string;
    budget: number;
  };
}

const allVibes = [
  'Hidden gems',
  'Iconic places',
  'Historical & cultural',
  'Chill & relaxation',
  'Food & local eats',
  'Adventure & outdoors',
];

const priceRanges = ['Free', '$', '$$', '$$$', '$$$$'];

const groupSizes = ['Solo', '2', '3-4', '4-6', '+'];

export function FilterModal({
  visible,
  onClose,
  onApply,
  currentFilters,
}: FilterModalProps) {
  const [selectedVibes, setSelectedVibes] = useState<string[]>(
    currentFilters.vibes
  );
  const [selectedRating, setSelectedRating] = useState<number>(
    currentFilters.rating
  );
  const [selectedDistance, setSelectedDistance] = useState<number>(
    currentFilters.distance
  );
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(
    currentFilters.priceRange
  );
  const [selectedGroupSize, setSelectedGroupSize] = useState<string>(
    currentFilters.groupSize || 'Solo'
  );
  const [selectedBudget, setSelectedBudget] = useState<number>(
    currentFilters.budget || 600
  );

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    );
  };

  const handleApply = () => {
    onApply({
      vibes: selectedVibes,
      rating: selectedRating,
      distance: selectedDistance,
      priceRange: selectedPriceRanges,
      groupSize: selectedGroupSize,
      budget: selectedBudget,
    });
    onClose();
  };

  const clearAll = () => {
    setSelectedVibes([]);
    setSelectedRating(0);
    setSelectedDistance(50);
    setSelectedPriceRanges([]);
    setSelectedGroupSize('Solo');
    setSelectedBudget(600);
  };

  const getTotalFilters = () => {
    let count = 0;
    if (selectedVibes.length > 0) count += selectedVibes.length;
    if (selectedRating > 0) count += 1;
    if (selectedPriceRanges.length > 0) count += selectedPriceRanges.length;
    if (selectedGroupSize !== 'Solo') count += 1;
    if (selectedBudget < 600) count += 1;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SSContainer disableBottomPadding>
        <ModalHeader title="Filters" onClose={onClose} />

        <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
          {/* Group Size */}
          <View className="mb-8 mt-4">
            <View className="flex-row items-center mb-2 gap-2">
              <Users size={18} color="#f97316" />
              <SSText variant="semibold" className="text-lg text-gray-800">
                How many people are you traveling with?
              </SSText>
            </View>
            <SSText className="text-sm text-slate-500 mb-4">
              Tell us your crew size so we can match the right spots for you.
            </SSText>
            <View className="flex-row gap-3 flex-wrap">
              {groupSizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  className={`border-2 px-5 py-2.5 rounded-full ${
                    selectedGroupSize === size
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                  }`}
                  onPress={() => setSelectedGroupSize(size)}
                >
                  <SSText
                    className={`${
                      selectedGroupSize === size
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {size}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Budget */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2 gap-2">
              <Wallet size={18} color="#f97316" />
              <SSText variant="semibold" className="text-lg text-gray-800">
                What’s your budget range?
              </SSText>
            </View>
            <SSText className="text-sm text-slate-500 mb-4">
              Set your budget so we only show spots that fit your wallet.
            </SSText>
            <SSText className="mb-2">{`0-${selectedBudget}$`}</SSText>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={600}
              value={selectedBudget}
              onValueChange={setSelectedBudget}
              step={10}
              minimumTrackTintColor="#f97316"
              maximumTrackTintColor="#e2e8f0"
            />
          </View>

          {/* Vibes */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2 gap-2">
              <Mountain size={18} color="#f97316" />
              <SSText variant="semibold" className="text-lg text-gray-800">
                What type of experience are you after?
              </SSText>
            </View>
            <SSText className="text-sm text-slate-500 mb-4">
              Choose the vibe that matches your trip. (Select all that fit your
              vibe)
            </SSText>
            <View className="flex-row flex-wrap gap-3">
              {allVibes.map((vibe) => (
                <TouchableOpacity
                  key={vibe}
                  className={`border-2 px-4 py-2.5 rounded-full ${
                    selectedVibes.includes(vibe)
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                  }`}
                  onPress={() => toggleVibe(vibe)}
                >
                  <SSText
                    className={`${
                      selectedVibes.includes(vibe)
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {vibe}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Keep existing filters below (rating, distance, price range) */}
          {/* Rating */}
          <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Minimum Rating
            </SSText>
            <View className="flex-row gap-3">
              {[0, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  className={`flex-row items-center border-2 px-4 py-2.5 rounded-full gap-1.5 ${
                    selectedRating === rating
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                  }`}
                  onPress={() => setSelectedRating(rating)}
                >
                  <Star
                    size={16}
                    color={selectedRating === rating ? '#ffffff' : '#fbbf24'}
                    fill={selectedRating === rating ? '#ffffff' : '#fbbf24'}
                  />
                  <SSText
                    className={`${
                      selectedRating === rating
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance */}
          <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Distance:{' '}
              {selectedDistance === 50 ? 'Any' : `${selectedDistance} km`}
            </SSText>
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={1}
              maximumValue={50}
              value={selectedDistance}
              onValueChange={setSelectedDistance}
              step={1}
              minimumTrackTintColor="#10b981"
              maximumTrackTintColor="#e2e8f0"
            />
          </View>

          {/* Price Range */}
          {/* <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Price Range
            </SSText>
            <View className="flex-row gap-3">
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range}
                  className={`border-2 py-3 rounded-full min-w-15 items-center ${
                    selectedPriceRanges.includes(range)
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                  }`}
                  onPress={() => togglePriceRange(range)}
                >
                  <SSText
                    className={`${
                      selectedPriceRanges.includes(range)
                        ? 'text-white'
                        : 'text-slate-500'
                    }`}
                  >
                    {range}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View> */}
        </ScrollView>

        {/* Footer */}
        <View className="flex-row  pb-10 pt-5 gap-3 bg-white border-t border-slate-100">
          <Button variant="outline" onPress={clearAll}>
            <SSText>Clear All</SSText>
          </Button>

          <Button className="flex-1" onPress={handleApply}>
            <SSText>
              Apply {getTotalFilters() > 0 && `(${getTotalFilters()})`}
            </SSText>
          </Button>
        </View>
      </SSContainer>
    </Modal>
  );
}
