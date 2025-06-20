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
        name="[id]" 
        options={{ 
          title: 'Itinerary Details',
          headerShown: false,
        }} 
      />
    </Stack>
  );
}