import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Animated,
  PanResponder,
  Alert,
  Linking,
  Platform,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, X, Filter } from 'lucide-react-native';
import { PlaceCard } from '@/components/placeSwipes/PlaceCard';
import { FilterModal } from '@/components/FilterModal';
import { ImageGalleryModal } from '@/components/ImageGalleryModal';
import { savePlaceToStorage, getVibePreferences } from '@/utils/storage';
import { SSText } from '@/components/ui/SSText';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { getRecommendations } from '@/endpoints/recommendations/endpoints';
import { recordSwipe } from '@/endpoints/swipes/endpoints';
import { useLocationStore } from '@/store/useLocationStore';
import { getCurrentCoordinates } from '@/utils/location';
import SSSpinner from '@/components/ui/SSSpinner';
import { PlaceDetails } from '@/components/placeSwipes/PlaceDetails';
import SSContainer from '@/components/SSContainer';
import { useHintsStore } from '@/store/useHintsStore';
import { useFeedbackNudgeStore } from '@/store/useFeedbackNudgeStore';
import { useAuth } from '@/hooks/useAuth';

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

const PAGE_SIZE = 10;
const PREFETCH_THRESHOLD = 3;
const CARDS_TO_PRERENDER = 4;
const CARD_SCALES = [1, 0.95, 0.9, 0.85];
const CARD_OPACITIES = [1, 1, 0, 0];
const CARD_Y_OFFSETS = [0, 0, 0, 0];

export default function DiscoverTab() {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions()
  const { setLocation, location } = useLocationStore();
  useEffect(() => {
    (async () => {
      const coords = await getCurrentCoordinates();
      if (coords) setLocation(coords);
    })();
  }, []);

  const [places, setPlaces] = useState<IRecommendedPlace[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [vibeFilters, setVibeFilters] = useState<string[]>([]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [distanceFilter, setDistanceFilter] = useState<number>(50);
  const [priceFilter, setPriceFilter] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasNext, setHasNext] = useState(true);

  const [lastViewedImageIndex, setLastViewedImageIndex] = useState<{
    [placeId: string]: number;
  }>({});

  const [cardStack, setCardStack] = useState<CardStackItem[]>([]);
  const stackAnimationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isAnimatingRef = useRef(false);

  const pageRef = useRef(1);
  const seedRef = useRef<string>('');
  const inFlightPageRef = useRef<number | null>(null);
  const bootstrappingRef = useRef(false);

  useEffect(() => {
    (async () => {
      const preferences = await getVibePreferences();
      setVibeFilters(preferences);
    })();
  }, []);

  useEffect(() => {
    seedRef.current = makeSeed();
    pageRef.current = 1;
    setHasNext(true);
    setPlaces([]);
    setCurrentIndex(0);
    setCardStack([]);
    bootstrappingRef.current = true;
    setIsLoading(true);
    fetchPage({ page: 1, replace: true }).finally(() => {
      bootstrappingRef.current = false;
      setIsLoading(false);
    });
  }, [
    vibeFilters,
    ratingFilter,
    distanceFilter,
    priceFilter,
    location?.latitude,
    location?.longitude,
  ]);

  useEffect(() => {
    initializeCardStack();
  }, [places, currentIndex]);

  useEffect(() => {
    const remaining = places.length - currentIndex;
    if (
      !bootstrappingRef.current &&
      !isLoading &&
      remaining <= PREFETCH_THRESHOLD &&
      hasNext &&
      !isFetchingMore &&
      inFlightPageRef.current === null
    ) {
      fetchPage({ page: pageRef.current + 1, replace: false });
    }
  }, [currentIndex, places.length, hasNext, isFetchingMore, isLoading]);

  const fetchPage = async ({
    page,
    replace,
  }: {
    page: number;
    replace: boolean;
  }) => {
    if (inFlightPageRef.current === page) return;
    if (!hasNext && !replace) return;

    inFlightPageRef.current = page;
    if (!replace) setIsFetchingMore(true);

    try {
      const res = await getRecommendations({
        // forDemo: user?.email === 'kao@gmail.com',
        forDemo: true,
        limit: PAGE_SIZE,
        page,
        vibes: vibeFilters,
        rating: ratingFilter > 0 ? ratingFilter : undefined,
        distance: distanceFilter,
        priceRange: priceFilter,
        latitude: location?.latitude ?? -37.8136,
        longitude: location?.longitude ?? 144.9631,
        seed: seedRef.current,
      });

      const payload = res?.data;
      const incoming: IRecommendedPlace[] = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data)
        ? payload.data
        : [];

      const uniqueIncoming = dedupeById(incoming);
      setPlaces((prev) =>
        replace ? uniqueIncoming : dedupeById([...prev, ...uniqueIncoming])
      );

      const nextFlag = true
      setHasNext(nextFlag);
      pageRef.current = page;
    } catch (e) {
      console.error('Failed to load recommendations:', e);
    } finally {
      if (!replace) setIsFetchingMore(false);
      inFlightPageRef.current = null;
    }
  };

  const createCardStackItem = (
    place: IRecommendedPlace,
    stackIndex: number,
    placeIndex: number
  ): CardStackItem => ({
    id: `${place.id}-${placeIndex}`,
    place,
    index: placeIndex,
    position: new Animated.ValueXY({ x: 0, y: 0 }),
    scale: new Animated.Value(CARD_SCALES[stackIndex] ?? 0.8),
    opacity: new Animated.Value(CARD_OPACITIES[stackIndex] ?? 0.2),
    rotate: new Animated.Value(0),
    zIndex: CARDS_TO_PRERENDER - stackIndex,
  });

  const initializeCardStack = () => {
    const newStack: CardStackItem[] = [];
    for (let i = 0; i < CARDS_TO_PRERENDER; i++) {
      const placeIndex = currentIndex + i;
      if (placeIndex < places.length) {
        newStack.push(createCardStackItem(places[placeIndex], i, placeIndex));
      }
    }
    setCardStack(newStack);
  };

  const user = useAuth().user;

  const animateStackMovement = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const animations = cardStack
      .map((card, index) => {
        if (index === 0) return null;
        const newStackIndex = index - 1;
        return Animated.parallel([
          Animated.spring(card.scale, {
            toValue: CARD_SCALES[newStackIndex] ?? 1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(card.opacity, {
            toValue: CARD_OPACITIES[newStackIndex] ?? 1,
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(card.position, {
            toValue: { x: 0, y: CARD_Y_OFFSETS[newStackIndex] ?? 0 },
            useNativeDriver: false,
            tension: 100,
            friction: 8,
          }),
        ]);
      })
      .filter(Boolean) as Animated.CompositeAnimation[];

    Animated.parallel(animations).start((finished) => {
      if (!finished) {
        isAnimatingRef.current = false;
        return;
      }

      setCardStack((prevStack) => {
        const newStack = prevStack.slice(1);
        const lastIndex =
          newStack.length > 0
            ? newStack[newStack.length - 1].index
            : currentIndex;
        const nextPlaceIndex = lastIndex + 1;
        if (nextPlaceIndex < places.length) {
          newStack.push(
            createCardStackItem(
              places[nextPlaceIndex],
              newStack.length,
              nextPlaceIndex
            )
          );
        }
        return newStack.map((card, i) => ({
          ...card,
          zIndex: CARDS_TO_PRERENDER - i,
        }));
      });

      setCurrentIndex((prev) => prev + 1);
      isAnimatingRef.current = false;
    });
  };

  const recordSwipeStore = useFeedbackNudgeStore((s) => s.recordSwipe);
  const handleSwipe = (direction: 'left' | 'right') => {
    if (isAnimatingRef.current) return;
    if (currentIndex >= places.length - 1) {
      Alert.alert('No more places!');
      return;
    }

    const topCard = cardStack[0];
    if (!topCard) return;

    const x = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;

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
      if (!finished) return;
      if (direction === 'right') {
        savePlaceToStorage(topCard.place)
        useHintsStore.getState().triggerSavedHint();
      };
      recordSwipe({ placeId: topCard.place.id, direction });
      recordSwipeStore();
      animateStackMovement();
    });
  };

  const handleGoNow = (place: IRecommendedPlace) => {
    const url = Platform.select({
      ios: `maps:?daddr=${place.latitude},${place.longitude}`,
      android: `geo:${place.latitude},${place.longitude}?q=${place.latitude},${place.longitude}(${place.name})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`,
    });
    if (url) Linking.openURL(url);
  };

  const handleFindSimilar = (_place: IRecommendedPlace) => {
    resetCardStack();
  };

  const handleImagePress = (images: string[], startIndex: number) => {
    setGalleryImages(images);
    setGalleryStartIndex(startIndex);
    setShowGalleryModal(true);
  };

  const resetCardStack = () => {
    if (stackAnimationRef.current) stackAnimationRef.current.stop();
    isAnimatingRef.current = false;
    setCurrentIndex(0);
    setCardStack([]);
  };

  const createPanResponder = (card: CardStackItem) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !isAnimatingRef.current &&
        Math.abs(g.dx) > Math.abs(g.dy) &&
        Math.abs(g.dx) > 20,
      onPanResponderMove: (_, g) => {
        card.position.setValue({ x: g.dx, y: 0 });
        card.rotate.setValue(g.dx * 0.0008);
      },
      onPanResponderRelease: (_, g) => {
        card.position.flattenOffset();
        if (Math.abs(g.dx) > 120) handleSwipe(g.dx > 0 ? 'right' : 'left');
        else {
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <SSSpinner />
        <SSText className="text-lg text-slate-500">Loading places...</SSText>
      </SafeAreaView>
    );
  }

  // if (currentIndex >= places.length) {
  //   return (
  //     <SafeAreaView className="flex-1">
  //       <View className="flex-1 justify-center items-center px-10">
  //         <SSText
  //           variant="bold"
  //           className="text-3xl text-orange-600 text-center mb-3"
  //         >
  //           No more places!
  //         </SSText>
  //       </View>
  //     </SafeAreaView>
  //   );
  // }

  return (
    <>
      <SSContainer>
        <View className="flex-row justify-between items-center py-3">
          <View className='flex-row items-center gap-2'>
            <SSText variant="bold" className="text-3xl text-orange-600">
              SweetSpots
            </SSText>
            <SSText className="text-2xl text-orange-600">
              Alpha
            </SSText>
          </View>
          {/* <View className="flex-row gap-3">
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
              onPress={() => setShowFilterModal(true)}
            >
              <Filter size={24} className="text-orange-300" />
            </TouchableOpacity>
          </View> */}
        </View>

        <ScrollView className="flex-1">
          <View className="flex-1 grid md:grid-cols-2 gap-6 container mx-auto justify-center pb-30">
            <View
              className="md:sticky top-0 h-full w-full"
              style={{ height: screenHeight * 0.8 }}
            >
              <View className="relative h-full w-full">
                <View className="absolute bottom-0 left-0 right-0 flex-row justify-center items-center px-10 gap-10 z-10">
                  <TouchableOpacity
                    className="w-16 h-16 rounded-full border bg-white border-orange-500 justify-center items-center shadow-lg"
                    onPress={() => handleSwipe('left')}
                  >
                    <X size={32} className="text-orange-500" strokeWidth={3} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="w-16 h-16 rounded-full bg-orange-500 justify-center items-center shadow-lg"
                    onPress={() => handleSwipe('right')}
                  >
                    <Heart size={32} color="#ffffff" strokeWidth={3} />
                  </TouchableOpacity>
                </View>

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
                          width: '100%',
                          height: screenHeight * 0.8,
                          position: 'absolute',
                          top: 0,
                          zIndex: card.zIndex,
                        },
                        rotateAndTranslate,
                        { opacity: card.opacity },
                      ]}
                    >
                      <PlaceCard
                        place={card.place}
                        onImagePress={handleImagePress}
                      />

                      {isTopCard && (
                        <>
                          <Animated.View
                            className="absolute top-12 left-5 bg-orange-600 py-2.5 rounded-lg z-10"
                            style={[
                              { opacity: likeOpacity },
                              { transform: [{ rotate: '-12deg' }] },
                            ]}
                          >
                            <SSText
                              variant="bold"
                              className="text-white text-lg"
                            >
                              LIKE
                            </SSText>
                          </Animated.View>
                          <Animated.View
                            className="absolute top-12 right-5 bg-rose-500 py-2.5 rounded-lg z-10"
                            style={[
                              { opacity: passOpacity },
                              { transform: [{ rotate: '12deg' }] },
                            ]}
                          >
                            <SSText
                              variant="bold"
                              className="text-white text-lg"
                            >
                              PASS
                            </SSText>
                          </Animated.View>
                        </>
                      )}
                    </Animated.View>
                  );
                })}
              </View>
            </View>

            <View className="w-full">
              <PlaceDetails
                place={places[currentIndex]}
                onGoNow={() => handleGoNow(places[currentIndex])}
                onFindSimilar={() => handleFindSimilar(places[currentIndex])}
                skipFirstImage
              />
            </View>
          </View>

          {isFetchingMore && (
            <View className="py-6 items-center">
              <SSSpinner />
              <SSText className="text-slate-500 mt-2">Loading more…</SSText>
            </View>
          )}
        </ScrollView>
      </SSContainer>
{/* 
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={(filters) => {
          setVibeFilters(filters.vibes);
          setRatingFilter(filters.rating);
          setDistanceFilter(filters.distance);
          setPriceFilter(filters.priceRange);
          resetCardStack();
        }}
        currentFilters={{
          vibes: vibeFilters,
          rating: ratingFilter,
          distance: distanceFilter,
          priceRange: priceFilter,
        }}
      /> */}

      <ImageGalleryModal
        visible={showGalleryModal}
        images={galleryImages}
        startIndex={galleryStartIndex}
        onClose={() => setShowGalleryModal(false)}
      />
    </>
  );
}

function dedupeById(items: IRecommendedPlace[]) {
  const seen = new Set<string>();
  const out: IRecommendedPlace[] = [];
  for (const it of items) {
    if (!it?.id || seen.has(it.id)) continue;
    seen.add(it.id);
    out.push(it);
  }
  return out;
}

function makeSeed() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
