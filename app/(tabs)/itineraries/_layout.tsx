import React from 'react';
import { Stack } from 'expo-router/stack';

export default function ItinerariesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'My Itineraries',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="choose-places"
        options={{
          title: 'Choose Places',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/index"
        options={{
          title: 'Itinerary Details',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/edit"
        options={{
          title: 'Edit Itinerary',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/add-places"
        options={{
          title: 'Add Places to Itinerary',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/place-suggestions"
        options={{
          title: 'Suggested Spots',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/your-suggestions"
        options={{
          title: 'Your Suggested Spots',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]/notifications"
        options={{
          title: 'Notifications',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

// import React from 'react'
// import { Stack } from 'expo-router'

// export default function layout() {
//   return (
//     <Stack screenOptions={{ headerShown: false }}/>
//   )
// }
