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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, X, Navigation, Filter, RotateCcw } from 'lucide-react-native';
import { PlaceCard } from '@/components/PlaceCard';
import { FilterModal } from '@/components/FilterModal';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { savePlaceToStorage, getVibePreferences } from '@/utils/storage';
import { SSText } from '@/components/ui/SSText';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { getRecommendations } from '@/api/recommendations/endpoints';
import { recordSwipe } from '@/api/swipes/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { getCurrentCoordinates } from '@/utils/location';
import SSSpinner from '@/components/ui/SSSpinner';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CardStackItem {
  id: string;
  place: IRecommendedPlace;
  index: number;
  position: Animated.ValueXY;
  scale: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  zIndex: number;
}

export default function DiscoverTab() {
  // Fetch user's current location and set it in the store
  const { setLocation, location } = useLocationStore();
  useEffect(() => {
    const init = async () => {
      const coords = await getCurrentCoordinates();
      if (coords) {
        console.log('Fetched current coordinates:', coords);
        setLocation(coords);
      }
    };

    init();
  }, []);

  const [places, setPlaces] = useState<IRecommendedPlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [forceUpdate, setForceUpdate] = useState(0); // Force re-render trigger
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [vibeFilters, setVibeFilters] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [distanceFilter, setDistanceFilter] = useState<number>(50);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastViewedImageIndex, setLastViewedImageIndex] = useState<{
    [placeId: string]: number;
  }>({});

  // Use a ref to track the actual current index
  // Card stack management
  const [cardStack, setCardStack] = useState<CardStackItem[]>([]);
  const stackAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isAnimatingRef = useRef(false);

  // Card configuration
  const CARDS_TO_PRERENDER = 4;
  const CARD_SCALES = [1, 0.95, 0.9, 0.85];
  const CARD_OPACITIES = [1, 1, 0, 0];
  const CARD_Y_OFFSETS = [0, 0, 0, 0];

  // Animation values for current card
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadVibePreferences();
  }, []);

  useEffect(() => {
    initializeCardStack();
  }, [places, currentIndex]);

  const loadVibePreferences = async () => {
    const preferences = await getVibePreferences();
    setVibeFilters(preferences);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [vibeFilters, ratingFilter, distanceFilter, priceFilter]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await getRecommendations({
        vibes: vibeFilters,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        distance: distanceFilter,
        priceRange: priceFilter,
        latitude: location?.latitude || -37.8136, // Example: Melbourne CBD
        longitude: location?.longitude || 144.9631,
      });
      setPlaces(res.data || []);
      resetCardStack();
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createCardStackItem = (
    place: IRecommendedPlace,
    stackIndex: number,
    placeIndex: number
  ): CardStackItem => {
    const scaleValue = CARD_SCALES[stackIndex] || 0.8;
    const opacityValue = CARD_OPACITIES[stackIndex] || 0.2;
    const yOffset = CARD_Y_OFFSETS[stackIndex] || 0;

    return {
      id: `${place.id}-${placeIndex}`,
      place,
      index: placeIndex,
      position: new Animated.ValueXY({ x: 0, y: 0 }),
      scale: new Animated.Value(scaleValue),
      opacity: new Animated.Value(opacityValue),
      rotate: new Animated.Value(0),
      zIndex: CARDS_TO_PRERENDER - stackIndex,
    };
  };

  const initializeCardStack = () => {
    const newStack: CardStackItem[] = [];

    for (let i = 0; i < CARDS_TO_PRERENDER; i++) {
      const placeIndex = currentIndex + i;
      if (placeIndex < places.length) {
        const cardItem = createCardStackItem(places[placeIndex], i, placeIndex);
        newStack.push(cardItem);
      }
    }

    setCardStack(newStack);
  };

  const animateStackMovement = () => {
    if (isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const animations = cardStack
      .map((card, index) => {
        if (index === 0) {
          // Top card slides out
          return null;
        }

        // Move each card up one position
        const newStackIndex = index - 1;
        const newScale = CARD_SCALES[newStackIndex] || 1;
        const newOpacity = CARD_OPACITIES[newStackIndex] || 1;
        const newYOffset = CARD_Y_OFFSETS[newStackIndex] || 0;

        return Animated.parallel([
          Animated.spring(card.scale, {
            toValue: newScale,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(card.opacity, {
            toValue: newOpacity,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(card.position, {
            toValue: { x: 0, y: newYOffset },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]);
      })
      .filter(Boolean) as Animated.CompositeAnimation[];

    stackAnimationRef.current = Animated.parallel(animations);

    stackAnimationRef.current.start((finished) => {
      if (finished) {
        // Update the stack after animation completes
        setCardStack((prevStack) => {
          const newStack = prevStack.slice(1); // Remove the top card

          // Add a new card at the bottom if available
          const lastIndex =
            newStack.length > 0
              ? newStack[newStack.length - 1].index
              : currentIndex;
          const nextPlaceIndex = lastIndex + 1;

          if (nextPlaceIndex < places.length) {
            const newCard = createCardStackItem(
              places[nextPlaceIndex],
              newStack.length,
              nextPlaceIndex
            );
            newStack.push(newCard);
          }

          // Update z-index values
          return newStack.map((card, index) => ({
            ...card,
            zIndex: CARDS_TO_PRERENDER - index,
          }));
        });

        setCurrentIndex((prev) => prev + 1);
        isAnimatingRef.current = false;
      }
    });
  };

  const resetCurrentCard = () => {
    position.setValue({ x: 0, y: 0 });
    rotate.setValue(0);
    opacity.setValue(1);
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    // const currentIdx = currentIndexRef.current;
    if (isAnimatingRef.current) return;
    if (currentIndex >= places.length - 1) {
      Alert.alert('No more places!');
      return;
    }

    const topCard = cardStack[0];
    if (!topCard) return;

    const x = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;
    const rotateValue = direction === 'right' ? '30deg' : '-30deg';

    // Animate the top card out
    Animated.parallel([
      Animated.timing(topCard.position, {
        toValue: { x, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(topCard.opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(topCard.rotate, {
        toValue: direction === 'right' ? 0.5 : -0.5,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start((finished) => {
      if (finished) {
        // Save the liked place - commented out storage usage
        if (direction === 'right') {
          savePlaceToStorage(topCard.place);
        }

        recordSwipe({
          placeId: topCard.place.id,
          direction,
        });

        // Animate the rest of the stack
        animateStackMovement();
      }
    });
  };

  const handleGoNow = (place: IRecommendedPlace) => {
    const url = Platform.select({
      ios: `maps:?daddr=${place.latitude},${place.longitude}`,
      android: `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${place.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const handleFindSimilar = (place: IRecommendedPlace) => {
    // const similarPlaces = mockPlaces.filter(p =>
    //   p.id !== place.id &&
    //   p.vibes.some(vibe => place.vibes.includes(vibe))
    // );
    // setPlaces(similarPlaces);
    resetCardStack();
  };

  const handleImagePress = (images: string[], startIndex: number) => {
    setGalleryImages(images);
    setGalleryStartIndex(startIndex);
    setShowGalleryModal(true);
  };

  const handleImageChange = (newIndex: number) => {
    const currentPlace = places[currentIndex];

    if (currentPlace) {
      setLastViewedImageIndex((prev) => ({
        ...prev,
        [currentPlace.id]: newIndex,
      }));
    }
  };

  const resetCardStack = () => {
    // resetCurrentCard();
    // nextCardScale.setValue(0.95);
    // nextCardOpacity.setValue(0.5);
    // thirdCardScale.setValue(0.9);
    // thirdCardOpacity.setValue(0.3);
    // currentIndexRef.current = 0;
    // setCurrentIndex(0);
    if (stackAnimationRef.current) {
      stackAnimationRef.current.stop();
    }
    isAnimatingRef.current = false;
    setCurrentIndex(0);
  };

  const createPanResponder = (card: CardStackItem) => {
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => {
        if (isAnimatingRef.current) return false;
        const isHorizontalGesture =
          Math.abs(gesture.dx) > Math.abs(gesture.dy) &&
          Math.abs(gesture.dx) > 20;
        return isHorizontalGesture;
      },
      // onPanResponderGrant: () => {
      //   card.position.setOffset({
      //     x: card.position.x._value,
      //     y: card.position.y._value,
      //   });
      // },
      onPanResponderMove: (_, gesture) => {
        card.position.setValue({ x: gesture.dx, y: 0 });
        card.rotate.setValue(gesture.dx * 0.0008);
      },
      onPanResponderRelease: (_, gesture) => {
        card.position.flattenOffset();

        if (Math.abs(gesture.dx) > 120) {
          handleSwipe(gesture.dx > 0 ? 'right' : 'left');
        } else {
          Animated.parallel([
            Animated.spring(card.position, {
              toValue: { x: 0, y: CARD_Y_OFFSETS[0] },
              useNativeDriver: false,
              tension: 100,
              friction: 8,
            }),
            Animated.spring(card.rotate, {
              toValue: 0,
              useNativeDriver: false,
              tension: 100,
              friction: 8,
            }),
          ]).start();
        }
      },
    });
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <SSSpinner />
        <SSText className="text-lg text-slate-500">Loading places...</SSText>
      </SafeAreaView>
    );
  }

  if (currentIndex >= places.length) {
    return (
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-10">
          <SSText
            variant="bold"
            className="text-3xl text-emerald-600 text-center mb-3"
          >
            No more places!
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6">
            You've discovered all available spots. Check back later for more!
          </SSText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SSLinearBackground>
        <SafeAreaView className="flex-1">
          {/* Header */}
          <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
            <SSText variant="bold" className="text-3xl text-emerald-600">
              SweetSpots
            </SSText>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
                onPress={() => setShowFilterModal(true)}
              >
                <Filter size={24} color="#10b981" />
              </TouchableOpacity>
              {/* <TouchableOpacity
                className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
                onPress={() => {
                  setPlaces(mockPlaces);
                  resetCardStack();
                }}
              >
                <RotateCcw size={24} color="#10b981" />
              </TouchableOpacity> */}
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center px-5">
              <SSSpinner />
              <SSText className="text-lg text-slate-500">
                Loading places...
              </SSText>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-5 pb-30">
              {cardStack.map((card, index) => {
                const isTopCard = index === 0;
                const panResponder = isTopCard
                  ? createPanResponder(card)
                  : null;

                const rotateAndTranslate = {
                  transform: [
                    {
                      rotate: card.rotate.interpolate({
                        inputRange: [-1, 0, 1],
                        outputRange: ['-30deg', '0deg', '30deg'],
                      }),
                    },
                    { scale: card.scale },
                    ...card.position.getTranslateTransform(),
                  ],
                };

                const likeOpacity = isTopCard
                  ? card.position.x.interpolate({
                      inputRange: [0, 150],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    })
                  : new Animated.Value(0);

                const passOpacity = isTopCard
                  ? card.position.x.interpolate({
                      inputRange: [-150, 0],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    })
                  : new Animated.Value(0);

                return (
                  <Animated.View
                    key={card.id}
                    {...(panResponder?.panHandlers || {})}
                    style={[
                      {
                        width: screenWidth - 40,
                        height: screenHeight * 0.65,
                        position: 'absolute',
                        zIndex: card.zIndex,
                      },
                      rotateAndTranslate,
                      { opacity: card.opacity },
                    ]}
                  >
                    <PlaceCard
                      place={card.place}
                      onImagePress={handleImagePress}
                      onGoNow={() => handleGoNow(card.place)}
                      onFindSimilar={() => handleFindSimilar(card.place)}
                    />

                    {/* Swipe Indicators - Only show on top card */}
                    {isTopCard && (
                      <>
                        {/* Swipe Indicators */}
                        <Animated.View
                          className="absolute top-12 left-5 bg-emerald-600 px-5 py-2.5 rounded-lg z-10"
                          style={[
                            { opacity: likeOpacity },
                            { transform: [{ rotate: '-12deg' }] },
                          ]}
                        >
                          <SSText variant="bold" className="text-white text-lg">
                            LIKE
                          </SSText>
                        </Animated.View>
                        <Animated.View
                          className="absolute top-12 right-5 bg-rose-500 px-5 py-2.5 rounded-lg z-10"
                          style={[
                            { opacity: passOpacity },
                            { transform: [{ rotate: '12deg' }] },
                          ]}
                        >
                          <SSText variant="bold" className="text-white text-lg">
                            PASS
                          </SSText>
                        </Animated.View>
                      </>
                    )}
                  </Animated.View>
                );
              })}
            </View>
          )}
          {/* Card Stack */}

          {/* Action Buttons */}
          <View
            className="absolute left-0 right-0 flex-row justify-center items-center px-10 gap-10 z-10"
            style={{ bottom: Platform.OS === 'ios' ? 40 : 30 }}
          >
            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-rose-500 justify-center items-center shadow-lg"
              onPress={() => handleSwipe('left')}
            >
              <X size={32} color="#ffffff" strokeWidth={3} />
            </TouchableOpacity>

            <TouchableOpacity
              className="w-16 h-16 rounded-full bg-emerald-600 justify-center items-center shadow-lg"
              onPress={() => handleSwipe('right')}
            >
              <Heart size={32} color="#ffffff" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SSLinearBackground>
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setVibeFilters(filters.vibes);
          setRatingFilter(filters.rating);
          setDistanceFilter(filters.distance);
          setPriceFilter(filters.priceRange);

          // let filteredPlaces = mockPlaces;

          // if (filters.vibes.length > 0) {
          //   filteredPlaces = filteredPlaces.filter(place =>
          //     place.vibes.some(vibe => filters.vibes.includes(vibe))
          //   );
          // }

          // if (filters.rating > 0) {
          //   filteredPlaces = filteredPlaces.filter(place => place.rating >= filters.rating);
          // }

          // if (filters.priceRange.length > 0) {
          //   filteredPlaces = filteredPlaces.filter(place =>
          //     filters.priceRange.includes(place.priceRange)
          //   );
          // }

          // setPlaces(filteredPlaces);
          resetCardStack();
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
    </>
  );
}
