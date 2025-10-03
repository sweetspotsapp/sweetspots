import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Star, ChevronLeft, ChevronRight, Car } from 'lucide-react-native';
import { ImageGalleryModal } from '../ImageGalleryModal';
import { SSText } from '../ui/SSText';
import { Card } from '../ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { calculateTimeAndDistance } from '@/endpoints/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { CalculateDistanceDto } from '@/dto/places/calculate-distance.dto';
import VibePill from '../ui/VibePill';

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
    // include location so it updates when user location changes
  }, [place, location]);

  // Keep the current slide centered if width changes (e.g., window resized)
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
          // contentOffset only sets initial; actual positioning handled in effects/scrollTo
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
                className="absolute top-1/2 left-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center z-10"
                style={{ marginTop: -20 }}
                onPress={goToPreviousImage}
                activeOpacity={0.7}
              >
                <ChevronLeft size={24} className="text-white" />
              </TouchableOpacity>
            )}

            {currentImageIndex < place.images.length - 1 && (
              <TouchableOpacity
                className="absolute top-1/2 right-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center z-10"
                style={{ marginTop: -20 }}
                onPress={goToNextImage}
                activeOpacity={0.7}
              >
                <ChevronRight size={24} className="text-white" />
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

      <View className="p-4 absolute bottom-0 left-0 bg-gradient-to-t from-black/60 to-transparent w-full">
      {
        distance !== null && duration !== null && (
          <View
            className="flex-row items-center w-fit bg-white px-3 py-1.5 rounded-full gap-1 z-10"
            pointerEvents="none"
          >
            <Car size={16} />
            <SSText variant="semibold" className="text-sm text-gray-800">
                {`${(distance / 1000).toFixed(1)} km • ${Math.round(duration)} min`}
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
