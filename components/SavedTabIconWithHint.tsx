// components/SavedTabIconWithHint.tsx
import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { Heart } from 'lucide-react-native';
import { useHintsStore } from '@/store/useHintsStore';
import { SSText } from './ui/SSText';

type Props = { size: number; color: string };

export default function SavedTabIconWithHint({ size, color }: Props) {
  const show = useHintsStore((s) => s.showSavedHint);
  const dismiss = useHintsStore((s) => s.dismissSavedHint);

  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    if (!show) return;
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 6, duration: 160, useNativeDriver: true }),
      ]).start(() => dismiss());
    }, 2800);

    return () => clearTimeout(t);
  }, [show]);

  return (
    <View className="items-center">
      <Heart size={size} color={color} />
      {show && (
        <>
          {/* tap to dismiss overlay (keeps touches inside) */}
          <Pressable className="absolute inset-0" onPress={dismiss} />
          <View
            className="absolute -top-9 left-1/2 -translate-x-1/2 w-56 items-center"
            style={{ opacity: fade, transform: [{ translateY }] }}
            pointerEvents="none"
          >
            {/* Arrow (rotated square) */}
            {/* Bubble */}
            <View className="bg-white px-3 py-2 rounded-xl shadow-lg">
              <SSText className="text-xs text-center">
                Liked places will be saved here!
              </SSText>
            </View>
            <View className="w-4 h-4 bg-white rotate-45 -mt-2 rounded-[2px]" />
          </View>
        </>
      )}
    </View>
  );
}