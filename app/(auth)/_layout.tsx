import React from 'react';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import SSLinearBackground from '@/components/ui/SSLinearBackground';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
      // header: () => {
      //   return (
      //     <View className="flex-row items-center justify-between px-4 py-2">
      //       <Text className="text-lg font-semibold text-gray-800">Authentication</Text>
      //       <Text className="text-sm text-gray-500">Please log in or register</Text>
      //     </View>
      //   )
      // }
    }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}