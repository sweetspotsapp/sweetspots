import React, { useEffect, useState } from 'react';
import {
  View,
  Image,
  ScrollView,
  TouchableOpacity,
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReviewCarousel } from './ReviewCarousel';
import { AllReviewsModal } from './AllReviewsModal';
import { ImageGalleryModal } from './ImageGalleryModal';
import { SSText } from './ui/SSText';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { calculateTimeAndDistance } from '@/api/places/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { formatDistance, formatDuration } from '@/utils/formatter';
import { CalculateDistanceDto } from '@/dto/places/calculate-distance.dto';

const { width: screenWidth } = Dimensions.get('window');

interface PlaceCardProps {
  place: IRecommendedPlace;
  onImagePress?: (images: string[], startIndex: number) => void;
  onGoNow?: () => void;
  onFindSimilar?: () => void;
}

export function PlaceCard({
  place,
  onImagePress,
  onGoNow,
  onFindSimilar,
}: PlaceCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  const handleImagePress = (index: number) => {
    if (onImagePress && place.images !== undefined) {
      onImagePress(place.images, index);
    }
  };

  const handleImageChange = (newIndex: number) => {
    setCurrentImageIndex(newIndex);
  };

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const imageWidth = screenWidth - 40;
    const index = Math.round(contentOffset.x / imageWidth);
    setCurrentImageIndex(index);
  };

  const scrollToImage = (index: number) => {
    const imageWidth = screenWidth - 40;
    imageScrollRef.current?.scrollTo({
      x: index * imageWidth,
      animated: true,
    });
    setCurrentImageIndex(index);
  };

  const imageScrollRef = React.useRef<ScrollView>(null);

  const goToPreviousImage = () => {
    if (currentImageIndex > 0) {
      scrollToImage(currentImageIndex - 1);
    }
  };

  const goToNextImage = () => {
    if (place.images && currentImageIndex < place.images.length - 1) {
      scrollToImage(currentImageIndex + 1);
    }
  };

  return (
    <Card elevation={4} className="flex-1 !rounded-3xl">
      {/* Image Carousel */}

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        bounces={false}
      >
        <View className="h-2/5 relative rounded-3xl rounded-ee-none rounded-es-none overflow-hidden">
          <ScrollView
            ref={imageScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            nestedScrollEnabled={true}
            contentOffset={{ x: currentImageIndex * (screenWidth - 40), y: 0 }}
          >
            {place.images.map((image, index) => (
              <View
                key={index}
                style={{ width: screenWidth - 40, height: '100%' }}
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

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
            }}
            pointerEvents="none"
          />

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
                  <ChevronLeft size={24} color="#ffffff" />
                </TouchableOpacity>
              )}

              {currentImageIndex < place.images.length - 1 && (
                <TouchableOpacity
                  className="absolute top-1/2 right-4 w-10 h-10 rounded-full bg-black/50 justify-center items-center z-10"
                  style={{ marginTop: -20 }}
                  onPress={goToNextImage}
                  activeOpacity={0.7}
                >
                  <ChevronRight size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </>
          )}

          {/* Image Indicators */}
          {place.images.length > 1 && (
            <View
              className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2 z-10"
              pointerEvents="none"
            >
              {place.images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => scrollToImage(index)}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                  activeOpacity={0.7}
                  // pointerEvents="auto"
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
        <View className='p-4'>

          <SSText variant="bold" className="text-3xl text-gray-800 mb-2">
            {place.name}
          </SSText>
          <SSText className="text-base text-gray-600 leading-6 mb-5">
            {place.description.replace(/\*/g, '')}
          </SSText>

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
                className="bg-emerald-50 border border-emerald-600 px-3 py-1.5 rounded-2xl"
              >
                <SSText variant="medium" className="text-xs text-emerald-600">
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
              <SSText variant="semibold" className="text-base text-emerald-600">
                Find Similar
              </SSText>
            </Button>
          </View>
        </View>
      </ScrollView>

      {/* All Reviews Modal */}
      {place.reviews && (
        <AllReviewsModal
          visible={showAllReviews}
          onClose={() => setShowAllReviews(false)}
          placeName={place.name}
          placeId={place.id}
        />
      )}

      {/* Image Gallery Modal */}
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
