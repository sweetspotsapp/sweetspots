import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Dimensions,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
  Platform,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { cn } from '@/lib/utils';

const { width, height } = Dimensions.get('window');
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export interface ImageGalleryModalProps {
  visible: boolean;
  images: string[];
  startIndex: number;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

export function ImageGalleryModal({
  visible,
  images,
  startIndex,
  onClose,
  onImageChange,
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const scrollRef = useRef<ScrollView>(null);
  const scale = useSharedValue(1);
  const scaleOffset = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const isZoomed = useSharedValue(false);
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  const dismissY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setCurrentIndex(startIndex);
      scrollRef.current?.scrollTo({ x: startIndex * width, animated: false });
      resetZoom();
    }
  }, [visible, startIndex]);

  const resetZoom = () => {
    scale.value = 1;
    scaleOffset.value = 1;
    translateX.value = 0;
    translateY.value = 0;
    offsetX.value = 0;
    offsetY.value = 0;
    dismissY.value = 0;
    isZoomed.value = false;
    runOnJS(setIsScrollEnabled)(true);
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      offsetX.value = translateX.value;
      offsetY.value = translateY.value;
    })
    .onUpdate((e) => {
      if (isZoomed.value) {
        translateX.value = offsetX.value + e.translationX / scale.value;
        translateY.value = offsetY.value + e.translationY / scale.value;
      }
    })
    .onEnd(() => {
      if (!isZoomed.value) return;
      const maxPanX = ((scale.value - 1) * width) / 2;
      const maxPanY = ((scale.value - 1) * height) / 2;
      translateX.value = withSpring(
        Math.max(-maxPanX, Math.min(maxPanX, translateX.value))
      );
      translateY.value = withSpring(
        Math.max(-maxPanY, Math.min(maxPanY, translateY.value))
      );
    });

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      scaleOffset.value = scale.value;
    })
    .onUpdate((e) => {
      'worklet';
      if (!e || typeof e.scale !== 'number' || isNaN(e.scale)) return;
      const next = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, scaleOffset.value * e.scale)
      );
      scale.value = next;
      isZoomed.value = next > 1.05;
      runOnJS(setIsScrollEnabled)(next <= 1.05);
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.05) {
        scale.value = withTiming(1);
        scaleOffset.value = 1;
        translateX.value = withTiming(0);
        translateY.value = withTiming(0);
        offsetX.value = 0;
        offsetY.value = 0;
        isZoomed.value = false;
        runOnJS(setIsScrollEnabled)(true);
      } else {
        scale.value = withTiming(2, { duration: 200 });
        scaleOffset.value = 2;
        isZoomed.value = true;
        runOnJS(setIsScrollEnabled)(false);
      }
    });

  const swipeDownGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (!isZoomed.value && e.translationY > 0) {
        dismissY.value = e.translationY;
      }
    })
    .onEnd((e) => {
      if (!isZoomed.value && e.translationY > 100 && e.velocityY > 500) {
        runOnJS(onClose)();
        runOnJS(resetZoom)();
      } else {
        dismissY.value = withSpring(0);
      }
    });

  const composedGesture = Gesture.Race(
    swipeDownGesture,
    Gesture.Simultaneous(
      Gesture.Simultaneous(panGesture, pinchGesture),
      doubleTapGesture
    )
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: dismissY.value },
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleScroll = (e: any) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
      onImageChange?.(index);
      runOnJS(resetZoom)();
    }
  };

  const handleThumbnailPress = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
    onImageChange?.(index);
    resetZoom();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={() => {
        resetZoom();
        onClose();
      }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.9)',
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <GestureDetector gesture={composedGesture}>
          <Animated.View className="flex-1">
            <TouchableOpacity
              className="absolute left-4 z-10"
              onPress={() => {
                resetZoom();
                onClose();
              }}
            >
              <X color="white" size={28} />
            </TouchableOpacity>

            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              onMomentumScrollEnd={handleScroll}
              scrollEnabled={isScrollEnabled}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              bounces={false}
            >
              {images.map((uri, index) => (
                <View key={index} style={{ width, height, overflow: 'hidden' }}>
                  <Animated.Image
                    source={{ uri }}
                    className="w-full h-full"
                    resizeMode="contain"
                    style={animatedStyle}
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </GestureDetector>

        {/* Thumbnails */}
        <FlatList
          data={images}
          keyExtractor={(_, i) => i.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          className="absolute bottom-12"
          renderItem={({ item, index }) => (
            <TouchableOpacity
              className={cn(
                'mx-1 border rounded-md',
                currentIndex === index ? 'border-white' : 'border-transparent'
              )}
              onPress={() => handleThumbnailPress(index)}
            >
              <Image
                source={{ uri: item }}
                className="w-[60px] h-[60px] rounded-md"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}
