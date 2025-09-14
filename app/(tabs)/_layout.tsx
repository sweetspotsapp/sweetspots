import React from 'react';
import { Tabs } from 'expo-router';
import { Heart, User, Compass, Search, Briefcase } from 'lucide-react-native';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',          // Floating position
          bottom: 20,                     // Distance from bottom
          left: 20,                        // Distance from left edge
          right: 20,                       // Distance from right edge
          elevation: 5,                    // Android shadow
          backgroundColor: '#ffffff',
          borderRadius: 30,                // Rounded corners
          borderTopWidth: 0,               // Remove top border
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingTop: Platform.OS === 'ios' ? 20 : 10,
          shadowColor: '#000',             // iOS shadow
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: {
            width: 0,
            height: 4,
          },
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#fdba74',
        tabBarLabelStyle: {
          fontFamily: 'Poppins-Medium',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ size, color }) => (
            <Compass size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="itineraries"
        options={{
          title: 'Itineraries',
          tabBarIcon: ({ size, color }) => <Briefcase size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}