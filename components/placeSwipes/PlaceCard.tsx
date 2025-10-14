import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Animated,
  Easing,
} from 'react-native';
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Car,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { ImageGalleryModal } from '../ImageGalleryModal';
import { SSText } from '../ui/SSText';
import { Card } from '../ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { calculateTimeAndDistance } from '@/endpoints/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { CalculateDistanceDto } from '@/dto/places/calculate-distance.dto';
import VibePill from '../ui/VibePill';
import { useAuth } from '@/hooks/useAuth';
import {
  getPrepareContext,
  getRecContext,
} from '@/endpoints/recommendations/endpoints';
import { useRecContextCache } from '@/store/useRecContextCache';
import SSSpinner from '../ui/SSSpinner';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/formatter';
import { capitalCase } from 'change-case';

export const TWO_DAYS_MS = 1000 * 60 * 60 * 24 * 2;

interface PlaceCardProps {
  place: IRecommendedPlace;
  onImagePress?: (images: string[], startIndex: number) => void;
}

export function PlaceCard({ place, onImagePress }: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [carouselWidth, setCarouselWidth] = useState(0);

  const { location } = useLocationStore();
  const imageScrollRef = useRef<ScrollView>(null);

  // Measure the actual width of the carousel container
  const onCarouselLayout = (e: any) => {
    const w = e.nativeEvent.layout.width;
    if (w !== carouselWidth) setCarouselWidth(w);
  };

  useEffect(() => {
    const fetchDistanceAndDuration = async () => {
      if (!place || !location) return;
      try {
        const dto: CalculateDistanceDto = {
          origin: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          destination: { latitude: place.latitude, longitude: place.longitude },
        };
        const result = await calculateTimeAndDistance(dto);
        if (result?.data) {
          setDistance(result.data?.distance);
          setDuration(result.data?.duration);
        }
      } catch {}
    };
    fetchDistanceAndDuration();
  }, [place, location]);

  // Keep the current slide centered if width changes
  useEffect(() => {
    if (!carouselWidth) return;
    imageScrollRef.current?.scrollTo({
      x: currentImageIndex * carouselWidth,
      animated: false,
    });
  }, [carouselWidth, currentImageIndex]);

  const handleImagePress = (index: number) => {
    if (onImagePress && place.images) onImagePress(place.images, index);
  };

  const handleImageChange = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const viewWidth = layoutMeasurement?.width || carouselWidth || 1;
    const index = Math.round(contentOffset.x / viewWidth);
    if (index !== currentImageIndex) setCurrentImageIndex(index);
  };

  const scrollToImage = (index: number) => {
    if (!carouselWidth) return;
    imageScrollRef.current?.scrollTo({
      x: index * carouselWidth,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) scrollToImage(currentImageIndex - 1);
  };

  const goToNextImage = () => {
    if (place.images && currentImageIndex < place.images.length - 1) {
      scrollToImage(currentImageIndex + 1);
    }
  };

  // ----- Rec Context + Cache -----
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [context, setContext] = useState<string | null>(null);
  const user = useAuth().user;

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
  // ----- Animate ONLY the “Why should you visit?” card -----
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const heightAnim = useRef(new Animated.Value(0)).current; // in px (animated container height)
  const opacityAnim = useRef(new Animated.Value(1)).current; // fade in/out
  const measuredContentH = useRef(0); // natural content height

  // Measure natural content height once it renders
  const onContentLayout = (e: any) => {
    const h = e.nativeEvent.layout.height || 0;
    if (h > measuredContentH.current) {
      measuredContentH.current = h;
      // if first mount on first image, expand to natural height
      if (!isCollapsed) {
        heightAnim.setValue(h);
      }
    }
  };

  // const animateCard = (collapse: boolean) => {
  //   setIsCollapsed(collapse);
  //   const toH = collapse ? 0 : Math.max(0, measuredContentH.current);
  //   Animated.parallel([
  //     Animated.timing(heightAnim, {
  //       toValue: toH,
  //       duration: 260,
  //       easing: Easing.out(Easing.cubic),
  //       useNativeDriver: false, // height cannot use native driver
  //     }),
  //     Animated.timing(opacityAnim, {
  //       toValue: collapse ? 0 : 1,
  //       duration: 220,
  //       easing: Easing.out(Easing.cubic),
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // };

  // Auto-collapse on 2nd image; expand on 1st
  // useEffect(() => {
  //   if (currentImageIndex === 1) animateCard(true);
  //   else if (currentImageIndex === 0) animateCard(false);
  // }, [currentImageIndex]);

  return (
    <Card elevation={4} className="flex-1 !rounded-3xl overflow-hidden">
      <View
        className="h-full relative rounded-3xl overflow-hidden"
        onLayout={onCarouselLayout}
      >
        <ScrollView
          ref={imageScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          className="h-full"
          nestedScrollEnabled
          style={{ flex: 1, height: '100%' }}
          contentOffset={{ x: currentImageIndex * (carouselWidth || 0), y: 0 }}
        >
          {place.images.map((image, index) => (
            <View
              key={index}
              style={{ width: carouselWidth || 0, height: '100%' }}
            >
              <TouchableOpacity
                onPress={() => handleImagePress(index)}
                activeOpacity={0.9}
                className="w-full h-full"
              >
                <Image
                  source={{ uri: image }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Image Navigation Arrows */}
        {place.images.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <TouchableOpacity
                className={cn(
                  'absolute transition-all left-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center z-20',
                  isCollapsed ? 'top-1/2' : 'top-1/4'
                )}
                style={{ marginTop: -20 }}
                onPress={goToPreviousImage}
                activeOpacity={0.7}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
            )}

            {currentImageIndex < place.images.length - 1 && (
              <TouchableOpacity
                className={cn(
                  'absolute transition-all right-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center z-20',
                  isCollapsed ? 'top-1/2' : 'top-1/4'
                )}
                style={{ marginTop: -20 }}
                onPress={goToNextImage}
                activeOpacity={0.7}
              >
                <ChevronRight size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Image Indicators */}
        {place.images.length > 1 && (
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2 z-10">
            {place.images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => scrollToImage(index)}
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                activeOpacity={0.7}
              />
            ))}
          </View>
        )}

        {/* Rating Badge */}
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
      </View>

      {/* Bottom OVERLAY stays (title + vibes + etc.) */}
      <View className="p-4 absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full">
        {distance !== null && duration !== null && (
          <View
            className="flex-row items-center w-fit bg-white px-3 py-1.5 rounded-full gap-1 z-10 mb-4"
            pointerEvents="none"
          >
            <Car size={16} />
            <SSText variant="semibold" className="text-sm text-gray-800">
              {`${(distance / 1000).toFixed(1)} km • ${formatDuration({
                seconds: duration,
              })}`}
            </SSText>
          </View>
        )}

        {
          place.category !== "other" && (
            <View
              className="flex-row items-center w-fit bg-white px-3 py-1.5 rounded-full gap-1 z-10 mb-4"
              pointerEvents="none"
            >
              <SSText variant="semibold" className="text-sm text-gray-800">
                {capitalCase(place.category)}
              </SSText>
            </View>
          )
        }

        <SSText variant="bold" className="text-3xl text-white mb-2">
          {place.name}
        </SSText>

        {/* Vibes Pills */}
        <View className="flex-row flex-wrap gap-2 mb-6">
          {place.vibes.map((vibe, index) => (
            <VibePill vibe={vibe} key={index} />
          ))}
        </View>

        {/* Only the context card minimizes with smooth animation */}
        {/* {isLoadingContext ? (
          <SSSpinner className="mb-4" />
        ) : context ? (
          <>
            <Animated.View
              style={{
                height: heightAnim,
                opacity: opacityAnim,
                overflow: 'hidden',
              }}
              className="mb-4"
            >
              <View
                className="p-4 bg-white border border-orange-400 rounded-xl"
                onLayout={onContentLayout}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <SSText
                    variant="semibold"
                    className="text-base text-muted-foreground"
                  >
                    Why should you visit?
                  </SSText>
                  <TouchableOpacity onPress={() => animateCard(true)}>
                    <ChevronDown size={20} color="gray" />
                  </TouchableOpacity>
                </View>
                <SSText className="text-sm">{context}</SSText>
              </View>
            </Animated.View>

            {isCollapsed && (
              <TouchableOpacity
                onPress={() => animateCard(false)}
                activeOpacity={0.8}
                className="absolute right-4 bottom-4 bg-white/90 rounded-full p-2"
              >
                <ChevronUp size={18} color="#111" />
              </TouchableOpacity>
            )}
          </>
        ) : null} */}
      </View>

      {onImagePress && (
        <ImageGalleryModal
          visible={false}
          images={place.images}
          startIndex={currentImageIndex}
          onClose={() => {}}
          onImageChange={handleImageChange}
        />
      )}
    </Card>
  );
}
