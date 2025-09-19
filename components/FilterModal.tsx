import React, { useState } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { X, Star } from 'lucide-react-native';
import { SSText } from './ui/SSText';
import SSLinearGradient from './ui/SSLinearGradient';
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
  }) => void;
  currentFilters: {
    vibes: string[];
    rating: number;
    distance: number;
    priceRange: string[];
  };
}

const allVibes = [
  'cozy', 'chill', 'romantic', 'adventurous', 'trendy', 'upscale',
  'local', 'authentic', 'scenic', 'peaceful', 'sophisticated',
  'good coffee', 'instagram-worthy', 'live music', 'date night',
  'workout', 'nature', 'challenging', 'foodie', 'weekend activity',
  'city views', 'cocktails', 'special occasion', 'sunset views'
];

const priceRanges = ['Free', '$', '$$', '$$$', '$$$$'];

export function FilterModal({ visible, onClose, onApply, currentFilters }: FilterModalProps) {
  const [selectedVibes, setSelectedVibes] = useState<string[]>(currentFilters.vibes);
  const [selectedRating, setSelectedRating] = useState<number>(currentFilters.rating);
  const [selectedDistance, setSelectedDistance] = useState<number>(currentFilters.distance);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>(currentFilters.priceRange);

  const toggleVibe = (vibe: string) => {
    setSelectedVibes(prev =>
      prev.includes(vibe)
        ? prev.filter(v => v !== vibe)
        : [...prev, vibe]
    );
  };

  const togglePriceRange = (range: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleApply = () => {
    onApply({
      vibes: selectedVibes,
      rating: selectedRating,
      distance: selectedDistance,
      priceRange: selectedPriceRanges,
    });
    onClose();
  };

  const clearAll = () => {
    setSelectedVibes([]);
    setSelectedRating(0);
    setSelectedDistance(50);
    setSelectedPriceRanges([]);
  };

  const getTotalFilters = () => {
    let count = 0;
    if (selectedVibes.length > 0) count += selectedVibes.length;
    if (selectedRating > 0) count += 1;
    if (selectedPriceRanges.length > 0) count += selectedPriceRanges.length;
    return count;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SSContainer disableBottomPadding>
        <ModalHeader
          title="Filters"
          onClose={onClose}
        />

        {/* Content */}
        <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
          {/* Rating Filter */}
          <View className="mb-8 mt-4">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Minimum Rating
            </SSText>
            <View className="flex-row gap-3">
              {[0, 3, 4, 4.5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  className={`flex-row items-center border-2 px-4 py-2.5 rounded-full gap-1.5 ${selectedRating === rating
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                    }`}
                  onPress={() => setSelectedRating(rating)}>
                  <Star
                    size={16}
                    color={selectedRating === rating ? '#ffffff' : '#fbbf24'}
                    fill={selectedRating === rating ? '#ffffff' : '#fbbf24'}
                  />
                  <SSText
                    variant="medium"
                    className={`text-sm ${selectedRating === rating ? 'text-white' : 'text-slate-500'
                      }`}>
                    {rating === 0 ? 'Any' : `${rating}+`}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Distance Filter */}
          <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Distance: {selectedDistance === 50 ? 'Any' : `${selectedDistance} km`}
            </SSText>
            <View className="px-2">
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
              <View className="flex-row justify-between mt-2">
                <SSText className="text-xs text-slate-500">1 km</SSText>
                <SSText className="text-xs text-slate-500">50+ km</SSText>
              </View>
            </View>
          </View>

          {/* Price Range Filter */}
          <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-4">
              Price Range
            </SSText>
            <View className="flex-row gap-3">
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range}
                  className={`border-2  py-3 rounded-full min-w-15 items-center ${selectedPriceRanges.includes(range)
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                    }`}
                  onPress={() => togglePriceRange(range)}>
                  <SSText
                    variant="medium"
                    className={`text-sm ${selectedPriceRanges.includes(range) ? 'text-white' : 'text-slate-500'
                      }`}>
                    {range}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Vibes Filter */}
          <View className="mb-8">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-2">
              Vibes
            </SSText>
            <SSText className="text-sm text-slate-500 mb-4">
              Choose the vibes that match your mood
            </SSText>
            <View className="flex-row flex-wrap gap-3 pb-25">
              {allVibes.map((vibe) => (
                <TouchableOpacity
                  key={vibe}
                  className={`border-2 px-4 py-2.5 rounded-full ${selectedVibes.includes(vibe)
                      ? 'bg-orange-600 border-orange-600'
                      : 'bg-white border-slate-200'
                    }`}
                  onPress={() => toggleVibe(vibe)}>
                  <SSText
                    variant="medium"
                    className={`text-sm ${selectedVibes.includes(vibe) ? 'text-white' : 'text-slate-500'
                      }`}>
                    {vibe}
                  </SSText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View className="flex-row  pb-10 pt-5 gap-3 bg-white border-t border-slate-100">
          <Button variant="outline" onPress={clearAll}>
            <SSText>
              Clear All
            </SSText>
          </Button>

          <Button className='flex-1' onPress={handleApply}>
            <SSText>
              Apply {getTotalFilters() > 0 && `(${getTotalFilters()})`}
            </SSText>
          </Button>
        </View>
      </SSContainer>
    </Modal>
  );
}