import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Star, MapPin, Clock, CircleCheck as CheckCircle } from 'lucide-react-native';
import { SavedPlace } from '@/types/Place';
import { SSText } from './ui/SSText';

interface SavedPlaceCardProps {
  place: SavedPlace;
  isSelectionMode: boolean;
  onSelect: () => void;
}

export function SavedPlaceCard({ place, isSelectionMode, onSelect }: SavedPlaceCardProps) {
  return (
    <TouchableOpacity
      className={`flex-row bg-white rounded-2xl mb-4 overflow-hidden shadow-sm ${
        place.selected ? 'border-2 border-emerald-700' : ''
      }`}
      onPress={isSelectionMode ? onSelect : undefined}
      activeOpacity={isSelectionMode ? 0.7 : 1}>
      
      <Image source={{ uri: place.images[0] }} className="w-30 h-30" style={{ resizeMode: 'cover' }} />
      
      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <SSText variant="semibold" className="text-lg text-gray-800 flex-1" numberOfLines={1}>
            {place.name}
          </SSText>
          {isSelectionMode && (
            <CheckCircle 
              size={24} 
              color={place.selected ? '#065f46' : '#e2e8f0'}
              fill={place.selected ? '#065f46' : 'transparent'}
            />
          )}
        </View>
        
        <SSText className="text-sm text-slate-500 leading-5 mb-3" numberOfLines={2}>
          {place.description}
        </SSText>
        
        <View className="flex-row gap-4 mb-3">
          <View className="flex-row items-center gap-1">
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place.rating}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place.distance}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1">
            <Clock size={14} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place.duration}
            </SSText>
          </View>
        </View>
        
        <View className="flex-row items-center gap-1.5">
          {place.vibes.slice(0, 3).map((vibe, index) => (
            <View key={index} className="bg-teal-50 border border-emerald-700 px-2 py-1 rounded-xl">
              <SSText variant="medium" className="text-xs text-emerald-700">
                {vibe}
              </SSText>
            </View>
          ))}
          {place.vibes.length > 3 && (
            <SSText variant="medium" className="text-xs text-slate-500">
              +{place.vibes.length - 3}
            </SSText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}