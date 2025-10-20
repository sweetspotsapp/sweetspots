import React, { useEffect, useState } from 'react';
import {
  View,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import {
  MapPin,
  Clock,
  DollarSign,
  Banknote,
  CircleCheck,
  Info,
  Pin,
  Phone,
  Globe,
  Lightbulb,
} from 'lucide-react-native';
import { ReviewCarousel } from './ReviewCarousel';
import { AllReviewsModal } from '../AllReviewsModal';
import { SSText } from '../ui/SSText';
// import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import {
  // calculateTimeAndDistance,
  hidePlace,
} from '@/endpoints/places/endpoints';
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
import {
  getPrepareContext,
  getRecContext,
} from '@/endpoints/recommendations/endpoints';
import { useAuth } from '@/hooks/useAuth';
import SSSpinner from '../ui/SSSpinner';
import { useRecContextCache } from '@/store/useRecContextCache';
import { TWO_DAYS_MS } from './PlaceCard';
import { getPlaceImages } from '@/endpoints/place-images/endpoints';

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
  // const [distance, setDistance] = useState<number | null>(null);
  // const [duration, setDuration] = useState<number | null>(null);
  const user = useAuth().user;

  const [placeImages, setPlaceImages] = useState<(IPlaceImage | string)[]>(
    Array.isArray(place.images) ? (place.images as IPlaceImage[]) : []
  );

  const images = Array.isArray(placeImages)
    ? placeImages.slice(skipFirstImage ? 1 : 0, 4)
    : [];

  const { location } = useLocationStore();

  useEffect(() => {
    if (!place.images || place.images.length === 0) {
      getPlaceImages({
        placeId: place?.id,
      }).then((res) => {
        if (res.success && res.data) {
          setPlaceImages(res.data.data);
        }
      });
    }
  }, [place.images]);

  // useEffect(() => {
  //   const fetchDistanceAndDuration = async () => {
  //     if (place && location) {
  //       try {
  //         const dto: CalculateDistanceDto = {
  //           origin: {
  //             latitude: location.latitude,
  //             longitude: location.longitude,
  //             // latitude: -37.899,
  //             // longitude: 145.123,
  //           },
  //           destination: {
  //             latitude: Number(place.latitude),
  //             longitude: Number(place.longitude),
  //           },
  //         };
  //         const result = await calculateTimeAndDistance(dto);
  //         if (result?.data) {
  //           setDistance(result.data?.distance);
  //           setDuration(result.data?.duration);
  //         }
  //       } catch (error) {
  //         // handle error if needed
  //       }
  //     }
  //   };
  //   fetchDistanceAndDuration();
  // }, [place]);

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
  };

  const [isLoadingPrepareContext, setIsLoadingPrepareContext] = useState(false);
  const [thingsToPrepare, setThingsToPrepare] = useState<{ item: string }[]>(
    []
  );

  useEffect(() => {
    console.log('Change placae');
    if (user?.uid && place?.id) {
      setIsLoadingPrepareContext(true);
      getPrepareContext({ userId: user.uid, placeId: place.id })
        .then((res) => {
          if (res?.data) setThingsToPrepare(res.data);
        })
        .catch((err) => {
          console.error('Failed to load prepare context:', err);
        })
        .finally(() => {
          setIsLoadingPrepareContext(false);
        });
    }
  }, [place?.id, user?.uid]);

  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [context, setContext] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !place?.id) return;

    const cache = useRecContextCache.getState();
    const isFresh = cache.isFresh(user.uid, place.id, TWO_DAYS_MS);

    if (isFresh) {
      const cached = cache.get(user.uid, place.id);
      if (cached) {
        setContext(cached.content);
        return;
      }
    }

    setIsLoadingContext(true);
    getRecContext({ userId: user.uid, placeId: place.id })
      .then((res) => {
        if (res?.data) {
          setContext(res.data);
          cache.set(user.uid, place.id, res.data, new Date());
        }
      })
      .catch((err) => {
        console.error('Failed to load rec context:', err);
      })
      .finally(() => {
        setIsLoadingContext(false);
      });
  }, [place?.id, user?.uid]);

  return (
    <View className="pb-6 gap-5">
      {/* Location & Time */}
      {images && images.length > 0 && (
        <View className="grid grid-cols-2 gap-2 ">
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
                onError={(err) =>
                  handleImageError(place.id, (img as IPlaceImage)?.id)
                }
                source={{ uri: (img as IPlaceImage)?.url || (img as string) }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* {location && distance && (
        <Card className="p-4 flex-row justify-between ">
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
      )} */}

      <Card className="p-4 gap-2">
        <View className="flex-row items-center mb-3 gap-2">
          <Info size={20} />
          <SSText variant="semibold" className="text-xl">
            Spot Info
          </SSText>
        </View>
        {Boolean(place.address) && (
          <View>
            <View className="flex-row gap-2 items-center">
              <MapPin size={16} />
              <SSText className="text-justify" variant="semibold">
                Address
              </SSText>
            </View>
            <SSText className="mb-2">{place.address}</SSText>
          </View>
        )}
        {Boolean(
          (place as IRecommendedPlace).phoneNumber ||
            (place as IPlace).googlePhoneNumber
        ) && (
          <View>
            <View className="flex-row gap-2 items-center">
              <Phone size={16} />
              <SSText className="text-justify" variant="semibold">
                Phone
              </SSText>
            </View>
            <SSText className="mb-2">
              {(place as IRecommendedPlace).phoneNumber ||
                (place as IPlace).googlePhoneNumber}
            </SSText>
          </View>
        )}
        {Boolean(
          (place as IRecommendedPlace).websiteUrl ||
            (place as IPlace).googleWebsite
        ) && (
          <View>
            <View className="flex-row gap-2 items-center">
              <Globe size={16} />
              <SSText className="text-justify" variant="semibold">
                Website
              </SSText>
            </View>
            <Pressable
              onPress={() => {
                const url =
                  (place as IRecommendedPlace).websiteUrl ||
                  (place as IPlace).googleWebsite;
                if (url) {
                  let formattedUrl = url;
                  if (!/^https?:\/\//i.test(url)) {
                    formattedUrl = 'http://' + url;
                  }
                  // Open the URL in a web browser
                  if (Platform.OS === 'web') {
                    window.open(formattedUrl, '_blank');
                    return;
                  }
                  // Use Expo's WebBrowser to open the link
                  import('expo-web-browser').then((WebBrowser) => {
                    WebBrowser.openBrowserAsync(formattedUrl);
                  });
                }
              }}
            >
              <SSText className="mb-2">
                {(place as IRecommendedPlace).websiteUrl ||
                  (place as IPlace).googleWebsite}
              </SSText>
            </Pressable>
          </View>
        )}
      </Card>

      {isLoadingContext ? (
        <SSSpinner />
      ) : (
        context && (
          <Card className="">
            <CardContent>
              <View className="flex-row items-center mb-3 gap-2">
                <Lightbulb size={20} />
                <SSText variant="semibold" className="text-xl">
                  Why Should You Visit?
                </SSText>
              </View>
              <SSText className="text-sm">{context}</SSText>
            </CardContent>
          </Card>
        )
      )}

      <Card className="p-4 ">
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

      {/* <Card className="">
        <CardHeader>
          <CardTitle>
            About {place.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SSText className="text-justify">{place.description}</SSText>
        </CardContent>
      </Card> */}

      {openingHours && openingHours.length > 0 && (
        <Card className="">
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

      {isLoadingPrepareContext ? (
        <SSSpinner />
      ) : (
        thingsToPrepare.length > 0 && (
          <Card className="">
            <CardContent>
              <View className="flex-row items-center mb-3 gap-2">
                <CircleCheck size={20} />
                <SSText variant="semibold" className="text-xl">
                  Things to Prepare
                </SSText>
              </View>
              {thingsToPrepare.map((thing, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between py-2 border-b border-b-slate-200 last:border-b-0"
                >
                  <SSText className="text-sm">{thing.item}</SSText>
                </View>
              ))}
            </CardContent>
          </Card>
        )
      )}

      {/* Reviews Carousel */}
      {place.reviews && place.reviews.length > 0 && (
        <ReviewCarousel
          reviews={place.reviews}
          onSeeAll={() => setShowAllReviews(true)}
        />
      )}

      {/* Action Buttons */}
      {/* <View className="gap-3 ">
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
          placeImages.map((img) => (typeof img === 'string' ? img : img.url)) ||
          []
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
