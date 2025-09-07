import React, { useEffect, useState } from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native';
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Navigation,
  Zap,
} from 'lucide-react-native';
import { ReviewCarousel } from './ReviewCarousel';
import { AllReviewsModal } from '../AllReviewsModal';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
    <>
      {/* Location & Time */}
      <Card className="p-4 flex-row justify-between mb-5">
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
      </Card>

      {/* Reviews Carousel */}
      {place.reviews && place.reviews.length > 0 && (
        <ReviewCarousel
          reviews={place.reviews}
          onSeeAll={() => setShowAllReviews(true)}
        />
      )}

      {/* Action Buttons */}
      {/* <View className="gap-3 mb-5">
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
          <Zap size={20} className="text-orange-500" />
          <SSText variant="semibold" className="text-base text-orange-600">
            Find Similar
          </SSText>
        </Button>
      </View> */}
      {/* All Reviews Modal */}
      {place.reviews && (
        <AllReviewsModal
          visible={showAllReviews}
          onClose={() => setShowAllReviews(false)}
          placeName={place.name}
          placeId={place.id}
        />
      )}
    </>
  );
}
