import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { MapPin, Clock, DollarSign, Banknote } from 'lucide-react-native';
import { ReviewCarousel } from './ReviewCarousel';
import { AllReviewsModal } from '../AllReviewsModal';
import { SSText } from '../ui/SSText';
// import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { calculateTimeAndDistance, hidePlace } from '@/endpoints/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import {
  formatCurrency,
  formatDistance,
  formatDuration,
} from '@/utils/formatter';
import { CalculateDistanceDto } from '@/dto/places/calculate-distance.dto';
import { cn } from '@/lib/utils';
import { IPlace, IPlaceImage } from '@/dto/places/place.dto';
import { ImageGalleryModal } from '../ImageGalleryModal';
import { syncPlaceOnce } from '@/lib/places/syncPlaceOnce';

interface PlaceDetailsProps {
  place: IRecommendedPlace | IPlace;
  onGoNow?: () => void;
  onFindSimilar?: () => void;
  skipFirstImage?: boolean;
}

export function PlaceDetails({
  place = {} as IRecommendedPlace | IPlace,
  skipFirstImage = false,
}: // onGoNow,
// onFindSimilar,
PlaceDetailsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const images = Array.isArray(place?.images)
    ? place?.images.slice(skipFirstImage ? 1 : 0, 4)
    : [];

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
              latitude: Number(place.latitude),
              longitude: Number(place.longitude),
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

  const openingHours =
    (place as IRecommendedPlace).openingHours ||
    (place as IPlace).googleOpeningHours;

  const [currentImageIndex, setCurrentImageIndex] = useState(-1);

  const handleImageChange = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
  };

  const handleImageError = (placeId: string, placeImageId?: string) => {
    console.log('Image failed to load, syncing place data...');
    // syncPlaceOnce(placeId);
    hidePlace(placeId);
  }

  return (
    <View className="pb-6">
      {/* Location & Time */}
      {images && images.length > 0 && (
        <View className="grid grid-cols-2 gap-2 mb-5">
          {images.map((img, index) => (
            <TouchableOpacity
              key={index}
              className={cn(
                'w-full h-40 bg-slate-200 rounded-xl overflow-hidden',
                index === 0 && 'row-span-2 h-[328px]'
              )}
              onPress={() =>
                setCurrentImageIndex(index + (skipFirstImage ? 1 : 0))
              }
            >
              <Image
                onLoadEnd={() => console.log('Image loaded')}
                onError={(err) => handleImageError(place.id, (img as IPlaceImage)?.id)}
                source={{ uri: (img as IPlaceImage)?.url || (img as string) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {location && distance && (
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
      )}

      <Card className="p-4 mb-5">
        <View className="flex-row items-center mb-3 gap-2">
          <Banknote size={20} />
          <SSText variant="semibold" className="text-xl">
            Price
          </SSText>
        </View>
        <SSText>
          {place.minPrice ? formatCurrency(place.minPrice) : 'Free'} -{' '}
          {formatCurrency(place.maxPrice as any)}
        </SSText>
      </Card>

      <Card className="mb-5">
        {/* <CardHeader>
          <CardTitle>
            About {place.name}
          </CardTitle>
        </CardHeader> */}
        <CardContent>
          <SSText className="text-justify">{place.description}</SSText>
        </CardContent>
      </Card>

      {openingHours && openingHours.length > 0 && (
        <Card className="mb-5">
          <CardContent>
            <View className="flex-row items-center mb-3 gap-2">
              <Clock size={20} />
              <SSText variant="semibold" className="text-xl">
                Opening Hours
              </SSText>
            </View>
            <SSText className="text-justify">
              {openingHours?.map((openHour, index) => {
                const openHoursArr = openHour.split(': ');
                const day = openHoursArr[0];
                const time = openHoursArr[1];
                const isToday =
                  day ===
                  new Date().toLocaleDateString('en-US', { weekday: 'long' });
                return (
                  <View
                    key={index}
                    className="flex-row justify-between w-full mb-1"
                  >
                    <SSText
                      className={cn(
                        'capitalize',
                        isToday && 'font-bold text-orange-500'
                      )}
                    >
                      {day}
                    </SSText>
                    <SSText>{time ? <>{time}</> : 'Closed'}</SSText>
                  </View>
                );
              })}
              {/* {place.} */}
            </SSText>
          </CardContent>
        </Card>
      )}

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
      {place.reviews && place.reviews.length > 0 && (
        <AllReviewsModal
          visible={showAllReviews}
          onClose={() => setShowAllReviews(false)}
          placeName={place.name}
          placeId={place.id}
        />
      )}
      <ImageGalleryModal
        visible={currentImageIndex >= 0}
        images={
          place.images?.map((img) =>
            typeof img === 'string' ? img : img.url
          ) || []
        }
        startIndex={currentImageIndex}
        onClose={() => {
          setCurrentImageIndex(-1);
        }}
        onImageChange={handleImageChange}
      />
    </View>
  );
}
