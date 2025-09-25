// app/faded-masked-bg.tsx
import SSContainer from '@/components/SSContainer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SSText } from '@/components/ui/SSText';
import { Link } from 'expo-router';
import * as React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  runOnJS,
} from 'react-native-reanimated';
// import MaskedView from "@react-native-masked-view/masked-view"; // <- if you need real masking

const { width: W, height: H } = Dimensions.get('window');

// Scenic photos (backgrounds)
const SCENES = [
  require('assets/images/scenes/scene-1.png'),
  require('assets/images/scenes/scene-2.png'),
  require('assets/images/scenes/scene-3.png'),
];

// Single mask PNG (ideally with transparent cutouts)
const MASK = require('assets/images/masks/mask.png');

// Config
const FADE_MS = 650; // fade duration
const HOLD_MS = 4500; // time each photo stays before next fade
const MIN_SCALE = 1.0; // subtle Ken Burns min
const MAX_SCALE = 1.03; // subtle Ken Burns max
const ZOOM_MS = 6000; // duration of zoom in/out

export default function FadedMaskedBackground() {
  const [current, setCurrent] = React.useState(0);
  const [next, setNext] = React.useState((0 + 1) % SCENES.length);

  // Fade opacity of the "next" image (current is always visible under it)
  const fade = useSharedValue(0);

  // Gentle Ken Burns zoom (applied to both images)
  const zoom = useSharedValue(1);
  React.useEffect(() => {
    zoom.value = withRepeat(
      withTiming(MAX_SCALE, {
        duration: ZOOM_MS,
        easing: Easing.inOut(Easing.quad),
      }),
      -1,
      true // yoyo
    );
  }, [zoom]);

  const zoomStyle = useAnimatedStyle(() => ({
    transform: [{ scale: zoom.value }],
  }));
  const nextOpacityStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  // Auto-advance
  React.useEffect(() => {
    const tick = () => {
      // prepare next index
      setNext((prev) => {
        const idx = (current + 1) % SCENES.length;
        return idx;
      });

      // fade in the next image
      fade.value = withTiming(
        1,
        { duration: FADE_MS, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) {
            // swap: next becomes current, hide fade layer
            runOnJS(setCurrent)((current + 1) % SCENES.length);
            fade.value = 0;
          }
        }
      );
    };

    const id = setInterval(tick, HOLD_MS);
    return () => clearInterval(id);
  }, [current, fade]);

  return (
    <>
      <SSContainer disableGradient>
        <View className="h-auto flex-1 justify-center">
          <SSText
            variant="bold"
            className="!text-4xl text-shadow text-white drop-shadow-md"
          >
            Welcome to SweetSpots!
          </SSText>
          <SSText className="!text-2xl text-shadow text-white drop-shadow-2xl my-4">
            We make planning fun again. Discover spots you'll actually want to
            go.
          </SSText>
          <View className="w-fit">
              <Link href={'/onboarding'} asChild>
            <Button size="xl" className="bg-white">
              <SSText variant="bold" className="!text-orange-500">
                Get Started
              </SSText>
            </Button>
              </Link>
            <View className="flex-row items-center justify-between w-full gap-3 my-4">
              <Separator className="flex-1 bg-white" />
              <SSText className="text-sm text-white">or</SSText>
              <Separator className="flex-1 bg-white" />
            </View>
            <View className="flex-row items-center">
              <Link href={'/(auth)/login'} asChild>
                <Button>
                  <SSText variant="bold">Login</SSText>
                </Button>
              </Link>
              <SSText className="mx-2 text-white"> / </SSText>
              <Link href={'/(auth)/register'} asChild>
                <Button>
                  <SSText variant="bold">Register</SSText>
                </Button>
              </Link>
            </View>
          </View>
        </View>
      </SSContainer>
      <View style={styles.container}>
        {/* --- Background layer: two stacked images --- */}
        <Animated.Image
          key={`bg-current-${current}`}
          source={SCENES[current]}
          style={[StyleSheet.absoluteFill, styles.bgImage, zoomStyle]}
          resizeMode="cover"
        />
        <Animated.Image
          key={`bg-next-${next}`}
          source={SCENES[next]}
          style={[
            StyleSheet.absoluteFill,
            styles.bgImage,
            nextOpacityStyle,
            zoomStyle,
          ]}
          resizeMode="cover"
        />

        <Image source={MASK} style={styles.mask} resizeMode="cover" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7E199',
    position: 'absolute',
    zIndex: -100,
  }, // pleasant fallback color
  bgImage: { width: '100%', height: '100%' },
  mask: { position: 'absolute', width: W, height: H, left: 0, top: 0 },
});
