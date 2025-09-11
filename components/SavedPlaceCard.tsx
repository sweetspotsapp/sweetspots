import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import {
  Star,
  MapPin,
  Clock,
  CircleCheck as CheckCircle,
} from 'lucide-react-native';
// import { SavedPlace } from '@/types/Place';
import { SSText } from './ui/SSText';
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { IPlace } from '@/dto/places/place.dto';
import VibePill from './ui/VibePill';

interface SavedPlaceCardProps {
  place: IPlace;
  isSelectionMode: boolean;
  onSelect: () => void;
  isSelected?: boolean;
}

export function SavedPlaceCard({
  place,
  isSelectionMode,
  onSelect,
  isSelected = false,
}: SavedPlaceCardProps) {
  return (
    <TouchableOpacity
      // className={`flex-row bg-white rounded-2xl mb-4 overflow-hidden shadow-sm ${
      //   place.selected ? 'border-2 border-orange-700' : ''
      // }`}
      onPress={isSelectionMode ? onSelect : undefined}
      activeOpacity={isSelectionMode ? 0.7 : 1}
    >
      <Card
        className={cn(
          'md:flex-row items-center overflow-hidden',
          isSelected && '!border-2 !border-orange-400',
          {
            'border-2 border-orange-70': isSelected,
          }
        )}
      >
        {/* {place.images?.[0] && ( */}
          <Image
            source={{ uri: place.images?.[0].url }}
            // height={120}
            // width={120}
            className="w-full md:w-32 h-32"
            style={{ resizeMode: 'cover' }}
          />
        {/* )} */}
        <CardContent className="flex-1 w-full">
          <View className="flex-1">
            <View className="flex-row justify-between items-center mb-2 flex-wrap">
              <SSText
                variant="semibold"
                className="text-lg text-gray-800 flex-1"
                numberOfLines={1}
              >
                {place.name}
              </SSText>
              {isSelectionMode && (
                <CheckCircle
                  size={24}
                  color={isSelected ? '#065f46' : '#e2e8f0'}
                  fill={isSelected ? '#065f46' : 'transparent'}
                />
              )}
            </View>

            {/* <SSText
              className="text-sm text-slate-500 leading-5 mb-3"
              numberOfLines={2}
            >
              {place.description}
            </SSText> */}

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

            <View className="flex-row items-center gap-1.5 flex-wrap">
              {place.vibes.slice(0, 3).map((vibe, index) => (
                <VibePill vibe={vibe} key={index} />
              ))}
              {place.vibes.length > 3 && (
                <SSText variant="medium" className="text-xs text-slate-500">
                  +{place.vibes.length - 3}
                </SSText>
              )}
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
}
