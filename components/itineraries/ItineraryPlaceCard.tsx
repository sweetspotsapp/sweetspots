import { View, Text, Image } from 'react-native';
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { SSText } from '../ui/SSText';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { Calendar, Clock, DollarSign, MapPin, Star } from 'lucide-react-native';
import { formatCurrency, formatDuration } from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/button';
import { tapIn, tapOut } from '@/endpoints/collab-itinerary/endpoints';

export default function ItineraryPlaceCard({
  place,
  index,
  tappedIn,
}: {
  place: IItineraryPlace;
  index: number;
  tappedIn: boolean;
}) {
  const user = useAuth().user;
  const isOwner = user?.uid === place?.userId;
  const [isTappedIn, setIsTappedIn] = React.useState(tappedIn);

  const [isLoading, setIsLoading] = React.useState(false);

  function handleTapInOut() {
    setIsLoading(true);
    if (isTappedIn) {
      tapOut(place.id, user?.uid || '')
        .then(() => setIsTappedIn(false))
        .finally(() => setIsLoading(false));
    } else {
      tapIn(place.id, user?.uid || '')
        .then(() => setIsTappedIn(true))
        .finally(() => setIsLoading(false));
    }
  }

  return (
    <Card>
      <CardContent>
        <View className="flex-row items-start mb-3">
          <View className="w-8 h-8 rounded-full bg-orange-600 justify-center items-center mr-3 mt-1">
            <SSText variant="bold" className="text-sm text-white">
              {index + 1}
            </SSText>
          </View>
          {place.imageUrl && (
            <Image
              source={{ uri: place.imageUrl }}
              className="w-20 h-20 rounded-xl mr-3"
              style={{ resizeMode: 'cover' }}
            />
          )}

          <View className="flex-1">
            <SSText variant="semibold" className="text-lg text-gray-800 mb-1">
              {place.place?.name}
            </SSText>
            <SSText
              className="text-sm text-slate-500 leading-5"
              numberOfLines={2}
            >
              {place.place?.description}
            </SSText>
          </View>

          {/* <TouchableOpacity
                          className="w-10 h-10 rounded-full bg-orange-50 border border-orange-600 justify-center items-center ml-2 mt-1"
                          onPress={() => handleNavigateToPlace(place)}
                        >
                          <Navigation size={20} className="text-orange-500" />
                        </TouchableOpacity> */}
        </View>

        {/* Schedule Info */}
        {(place.visitDate ||
          place.visitTime ||
          place.visitDuration ||
          place.estimatedCost) && (
          <View className="flex-row flex-wrap gap-3 mb-3 px-3 py-2 bg-slate-50 rounded-lg">
            {place.visitDate && (
              <View className="flex-row items-center gap-1">
                <Calendar size={14} color="#64748b" />
                <SSText className="text-xs text-slate-500">
                  {place.visitDate}
                </SSText>
              </View>
            )}
            {place.visitTime && (
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#64748b" />
                <SSText className="text-xs text-slate-500">
                  {place.visitTime}
                </SSText>
              </View>
            )}
            {place.visitDuration && (
              <View className="flex-row items-center gap-1">
                <Clock size={14} color="#64748b" />
                <SSText className="text-xs text-slate-500">
                  {formatDuration({ hours: place.visitDuration })}
                </SSText>
              </View>
            )}
            {place.estimatedCost && (
              <View className="flex-row items-center gap-1">
                <DollarSign size={14} color="#64748b" />
                <SSText className="text-xs text-slate-500">
                  {formatCurrency(place.estimatedCost)}
                </SSText>
              </View>
            )}
          </View>
        )}

        <View className="flex-row gap-3 mb-3">
          <View className="flex-row items-center gap-1">
            <Star size={14} color="#fbbf24" fill="#fbbf24" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place?.place?.rating}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1">
            <MapPin size={14} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place.place?.distance}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1">
            <DollarSign size={14} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              {place.place?.priceRange}
            </SSText>
          </View>
        </View>

        {/* VIBES */}
        {/* <View className="flex-row flex-wrap gap-1.5 items-center mb-2">
                        {place.vibes.slice(0, 3).map((vibe, vibeIndex) => (
                          <View key={vibeIndex} className="bg-orange-50 border border-orange-600 px-2 py-1 rounded-xl">
                            <SSText variant="medium" className="text-xs text-orange-600">
                              {vibe}
                            </SSText>
                          </View>
                        ))}
                        {place.vibes.length > 3 && (
                          <SSText variant="medium" className="text-xs text-slate-500">
                            +{place.vibes.length - 3}
                          </SSText>
                        )}
                      </View> */}

        {place.notes && (
          <View className="bg-amber-50 p-3 rounded-lg mt-2">
            <SSText variant="semibold" className="text-xs text-amber-800 mb-1">
              Notes:
            </SSText>
            <SSText className="text-sm text-amber-800 leading-5">
              {place.notes}
            </SSText>
          </View>
        )}
        {!isOwner && (
          <View className="flex-row justify-between items-center mt-2">
            {/* AVATARS HERE */}
            <Button
              variant={isTappedIn ? 'outline' : 'default'}
              onPress={handleTapInOut}
              disabled={isLoading}
            >
              <SSText>{!isTappedIn ? "I'm In!" : "I'm Out!"}</SSText>
            </Button>
          </View>
        )}
      </CardContent>
    </Card>
  );
}
