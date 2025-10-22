// app.config.ts
import 'dotenv/config';
import { ExpoConfig } from '@expo/config-types';

const config: ExpoConfig = {
  name: 'SweetSpots',
  slug: 'sweetspots',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  android: {
    permissions: ['ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION'],
    googleServicesFile: './google-services.json',
    package: 'com.sweetspots.sweetspotsapp',
    config: {
      googleMaps: {
        apiKey: process.env.ANDROID_GOOGLE_MAPS_SDK_KEY, // Android native SDK
      },
    },
  },
  ios: {
    supportsTablet: true,
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'This app uses your location to show nearby places.',
    },
    googleServicesFile: './GoogleService-Info.plist',
    bundleIdentifier: 'com.sweetspots.sweetspotsapp',
    config: {
      googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_SDK_KEY, // iOS native SDK
    },
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-font',
    'expo-web-browser',
    'expo-secure-store',
    'expo-notifications',
    '@react-native-firebase/app',
    '@react-native-firebase/auth',
    // [
    //   'expo-build-properties',
    //   {
    //     ios: {
    //       useFrameworks: 'static',
    //     },
    //   },
    // ],
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    // Firebase / Google Auth
    GOOGLE_EXPO_CLIENT_ID: process.env.GOOGLE_EXPO_CLIENT_ID,
    GOOGLE_IOS_CLIENT_ID: process.env.GOOGLE_IOS_CLIENT_ID,
    GOOGLE_ANDROID_CLIENT_ID: process.env.GOOGLE_ANDROID_CLIENT_ID,

    // Renamed Firebase keys
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_WEB_KEY,
  },
};

export default config;
