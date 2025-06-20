import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Dimensions,
  Image,
  Animated,
  PanResponder,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, X, Navigation, Filter, RotateCcw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterModal } from '@/components/FilterModal';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { mockPlaces } from '@/data/mockPlaces';
import { Place } from '@/types/Place';
import { savePlaceToStorage, getVibePreferences } from '@/utils/storage';
import { SSText } from '@/components/ui/SSText';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function DiscoverTab() {
  const [places, setPlaces] = useState<Place[]>(mockPlaces);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [vibeFilters, setVibeFilters] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [distanceFilter, setDistanceFilter] = useState<number>(50);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [lastViewedImageIndex, setLastViewedImageIndex] = useState<{ [placeId: string]: number }>({});

  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadVibePreferences();
  }, []);

  const loadVibePreferences = async () => {
    const preferences = await getVibePreferences();
    setVibeFilters(preferences);
  };

  const resetCard = () => {
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
    opacity.setValue(1);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    const x = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;
    
    Animated.parallel([
      Animated.timing(position.x, {
        toValue: x,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start(() => {
      if (direction === 'right') {
        savePlaceToStorage(places[currentIndex]);
      }
      nextCard();
    });
  };

  const nextCard = () => {
    if (currentIndex < places.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetCard();
    } else {
      Alert.alert(
        'No more places!',
        'You\'ve seen all available spots. Check back later for more discoveries!',
        [{ text: 'OK' }]
      );
    }
  };

  const handleGoNow = (place: Place) => {
    const url = Platform.select({
      ios: `maps:?daddr=${place.latitude},${place.longitude}`,
      android: `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${place.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleFindSimilar = (place: Place) => {
    const similarPlaces = mockPlaces.filter(p => 
      p.id !== place.id && 
      p.vibes.some(vibe => place.vibes.includes(vibe))
    );
    setPlaces(similarPlaces);
    setCurrentIndex(0);
    resetCard();
  };

  const handleImagePress = (images: string[], startIndex: number) => {
    setGalleryImages(images);
    setGalleryStartIndex(startIndex);
    setShowGalleryModal(true);
  };

  const handleImageChange = (newIndex: number) => {
    const currentPlace = places[currentIndex];
    if (currentPlace) {
      setLastViewedImageIndex(prev => ({
        ...prev,
        [currentPlace.id]: newIndex
      }));
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        const isHorizontalGesture = Math.abs(gesture.dx) > Math.abs(gesture.dy) && Math.abs(gesture.dx) > 20;
        return isHorizontalGesture;
      },
      onPanResponderGrant: () => {
        position.setOffset({
          x: position.x._value,
          y: 0,
        });
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: 0 });
        rotate.setValue(gesture.dx * 0.1);
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        
        if (Math.abs(gesture.dx) > 120) {
          handleSwipe(gesture.dx > 0 ? 'right' : 'left');
        } else {
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.spring(rotate, {
              toValue: 0,
              useNativeDriver: false,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const rotateAndTranslate = {
    transform: [
      {
        rotate: rotate.interpolate({
          inputRange: [-200, 0, 200],
          outputRange: ['-30deg', '0deg', '30deg'],
        }),
      },
      ...position.getTranslateTransform(),
    ],
  };

  const likeOpacity = position.x.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = position.x.interpolate({
    inputRange: [-150, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  if (currentIndex >= places.length) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-10">
          <SSText variant="bold" className="text-3xl text-emerald-600 text-center mb-3">
            No more places!
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6">
            You've discovered all available spots. Check back later for more!
          </SSText>
        </View>
      </SafeAreaView>
    );
  }

  const currentPlace = places[currentIndex];

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={['#f0fdf4', '#ffffff']}
        className="absolute inset-0"
      />
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <SSText variant="bold" className="text-3xl text-emerald-600">
          SweetSpots
        </SSText>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => setShowFilterModal(true)}>
            <Filter size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => {
              setCurrentIndex(0);
              setPlaces(mockPlaces);
              resetCard();
            }}>
            <RotateCcw size={24} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Card Stack */}
      <View className="flex-1 items-center justify-center px-5 pb-30">
        {/* Next card (underneath) */}
        {currentIndex < places.length - 1 && (
          <View 
            className="absolute"
            style={[
              { 
                width: screenWidth - 40, 
                height: screenHeight * 0.65,
                transform: [{ scale: 0.95 }],
                opacity: 0.5
              }
            ]}>
            <PlaceCard 
              place={places[currentIndex + 1]} 
              onImagePress={handleImagePress}
              onGoNow={() => handleGoNow(places[currentIndex + 1])}
              onFindSimilar={() => handleFindSimilar(places[currentIndex + 1])}
            />
          </View>
        )}

        {/* Current card */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            { 
              width: screenWidth - 40, 
              height: screenHeight * 0.65,
              position: 'absolute'
            },
            rotateAndTranslate, 
            { opacity }
          ]}>
          <PlaceCard 
            place={currentPlace}
            onImagePress={handleImagePress}
            onGoNow={() => handleGoNow(currentPlace)}
            onFindSimilar={() => handleFindSimilar(currentPlace)}
          />

          {/* Swipe Indicators */}
          <Animated.View 
            className="absolute top-12 right-5 bg-emerald-600 px-5 py-2.5 rounded-lg z-10"
            style={[
              { opacity: likeOpacity },
              { transform: [{ rotate: '12deg' }] }
            ]}>
            <SSText variant="bold" className="text-white text-lg">
              LIKE
            </SSText>
          </Animated.View>
          <Animated.View 
            className="absolute top-12 left-5 bg-rose-500 px-5 py-2.5 rounded-lg z-10"
            style={[
              { opacity: passOpacity },
              { transform: [{ rotate: '-12deg' }] }
            ]}>
            <SSText variant="bold" className="text-white text-lg">
              PASS
            </SSText>
          </Animated.View>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <View 
        className="absolute left-0 right-0 flex-row justify-center items-center px-10 gap-10"
        style={{ bottom: Platform.OS === 'ios' ? 40 : 30 }}>
        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-rose-500 justify-center items-center shadow-lg"
          onPress={() => handleSwipe('left')}>
          <X size={32} color="#ffffff" strokeWidth={3} />
        </TouchableOpacity>

        <TouchableOpacity
          className="w-16 h-16 rounded-full bg-emerald-600 justify-center items-center shadow-lg"
          onPress={() => handleSwipe('right')}>
          <Heart size={32} color="#ffffff" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setVibeFilters(filters.vibes);
          setRatingFilter(filters.rating);
          setDistanceFilter(filters.distance);
          setPriceFilter(filters.priceRange);
          
          let filteredPlaces = mockPlaces;
          
          if (filters.vibes.length > 0) {
            filteredPlaces = filteredPlaces.filter(place =>
              place.vibes.some(vibe => filters.vibes.includes(vibe))
            );
          }
          
          if (filters.rating > 0) {
            filteredPlaces = filteredPlaces.filter(place => place.rating >= filters.rating);
          }
          
          if (filters.priceRange.length > 0) {
            filteredPlaces = filteredPlaces.filter(place =>
              filters.priceRange.includes(place.priceRange)
            );
          }
          
          setPlaces(filteredPlaces);
          setCurrentIndex(0);
          resetCard();
        }}
        currentFilters={{
          vibes: vibeFilters,
          rating: ratingFilter,
          distance: distanceFilter,
          priceRange: priceFilter,
        }}
      />

      <ImageGalleryModal
        visible={showGalleryModal}
        images={galleryImages}
        startIndex={galleryStartIndex}
        onClose={() => setShowGalleryModal(false)}
        onImageChange={handleImageChange}
      />
    </SafeAreaView>
  );
}