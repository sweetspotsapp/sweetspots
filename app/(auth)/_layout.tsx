import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function AuthLayout() {
  return (
    // <View className="flex-1 bg-white">
    //   <View className="mt-20 items-center">
    //     <Text className="text-2xl font-bold text-gray-800">Travel Tinder</Text>
    //   </View>
    //   <View className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack>
    //   </View>
    // </View>
  );
}