import React, { useEffect, useState } from 'react';
import {
  View,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Zap,
} from 'lucide-react-native';
import { ReviewCarousel } from './ReviewCarousel';
import { AllReviewsModal } from './AllReviewsModal';
import { SSText } from './ui/SSText';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { calculateTimeAndDistance } from '@/api/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { formatDistance, formatDuration } from '@/utils/formatter';
import { CalculateDistanceDto } from '@/dto/places/calculate-distance.dto';

interface PlaceDetailsProps {
  place: IRecommendedPlace;
  onGoNow?: () => void;
  onFindSimilar?: () => void;
}

export function PlaceDetails({
  place,
  onGoNow,
  onFindSimilar,
}: PlaceDetailsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const { location } = useLocationStore();

  useEffect(() => {
    const fetchDistanceAndDuration = async () => {
      if (place && location) {
        try {
          const dto: CalculateDistanceDto = {
            origin: {
              latitude: location.latitude,
              longitude: location.longitude,
              // latitude: -37.899,
              // longitude: 145.123,
            },
            destination: {
              latitude: place.latitude,
              longitude: place.longitude,
            },
          };
          const result = await calculateTimeAndDistance(dto);
          if (result?.data) {
            setDistance(result.data?.distance);
            setDuration(result.data?.duration);
          }
        } catch (error) {
          // handle error if needed
        }
      }
    };
    fetchDistanceAndDuration();
  }, [place]);

  return (
    <Card elevation={4} className="flex-1 !rounded-3xl">
      {/* Image Carousel */}

      {/* Content */}
      {/* <View className="rounded-3xl rounded-ee-none rounded-es-none overflow-hidden">
        <View
          className="absolute top-4 right-4 flex-row items-center bg-white px-3 py-1.5 rounded-full gap-1 z-10"
          pointerEvents="none"
        >
          <Star size={16} color="#fbbf24" fill="#fbbf24" />
          <SSText variant="semibold" className="text-sm text-gray-800">
            {place.rating}
          </SSText>
          <SSText className="text-xs text-slate-500">
            ({place.reviewCount})
          </SSText>
        </View>
      </View> */}
      <View className="p-4">
        {/* Location & Time */}
        <View className="flex-row justify-between mb-5">
          <View className="flex-row items-center gap-1.5">
            <MapPin size={18} color="#64748b" />
            <SSText variant="medium" className="text-sm text-slate-500">
              {distance ? (
                formatDistance(distance)
              ) : (
                <ActivityIndicator className="ml-4" size={4} />
              )}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock size={18} color="#64748b" />
            <SSText variant="medium" className="text-sm text-slate-500">
              {duration ? (
                formatDuration({
                  seconds: duration,
                })
              ) : (
                <ActivityIndicator className="ml-4" size={4} />
              )}
            </SSText>
          </View>
          <View className="flex-row items-center gap-1.5">
            <DollarSign size={18} color="#64748b" />
            <SSText variant="medium" className="text-sm text-slate-500">
              {place.priceRange}
            </SSText>
          </View>
        </View>

        {/* Vibes Pills */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {place.vibes.map((vibe, index) => (
            <View
              key={index}
              className="bg-orange-50 border border-orange-600 px-3 py-1.5 rounded-2xl"
            >
              <SSText variant="medium" className="text-xs text-orange-600">
                {vibe}
              </SSText>
            </View>
          ))}
        </View>

        {/* Reviews Carousel */}
        {place.reviews && place.reviews.length > 0 && (
          <ReviewCarousel
            reviews={place.reviews}
            onSeeAll={() => setShowAllReviews(true)}
          />
        )}

        {/* Action Buttons */}
        <View className="gap-3 mb-5">
          <Button
            className="flex-row items-center justify-center bg-sky-500 py-3.5 rounded-xl gap-2"
            onPress={onGoNow}
          >
            <Navigation size={20} color="#ffffff" />
            <SSText variant="semibold" className="text-base text-white">
              Go Now
            </SSText>
          </Button>

          <Button variant="outline" onPress={onFindSimilar}>
            <Zap size={20} color="#10b981" />
            <SSText variant="semibold" className="text-base text-orange-600">
              Find Similar
            </SSText>
          </Button>
        </View>
      </View>
      {/* All Reviews Modal */}
      {place.reviews && (
        <AllReviewsModal
          visible={showAllReviews}
          onClose={() => setShowAllReviews(false)}
          placeName={place.name}
          placeId={place.id}
        />
      )}
    </Card>
  );
}
