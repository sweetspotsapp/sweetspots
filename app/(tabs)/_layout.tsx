import React, { useEffect, useState } from 'react';
import { Tabs, Redirect } from 'expo-router';
import { Heart, User, Compass, Search, Briefcase } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { ui } = useOnboardingStore();
  const { user, loading } = useAuth();

  const [hydrated, setHydrated] = useState(
    useOnboardingStore.persist?.hasHydrated?.() ?? false
  );
  useEffect(() => {
    const unsub = useOnboardingStore.persist?.onFinishHydration?.(() => {
      setHydrated(true);
    });
    return unsub;
  }, []);

  if (loading || !hydrated) return null;

  const needsOnboarding = !ui.completed && !ui.dismissed;
  const isLoggedOut = !user;

  if (isLoggedOut && needsOnboarding) {
    return <Redirect href="/landing" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          elevation: 5,
          backgroundColor: '#ffffff',
          borderRadius: 30,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingTop: Platform.OS === 'ios' ? 20 : 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
        tabBarActiveTintColor: '#f97316',
        tabBarInactiveTintColor: '#fdba74',
        tabBarLabelStyle: { fontFamily: 'Poppins-Medium', fontSize: 12 },
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
          href: null,
          title: 'Search',
          tabBarIcon: ({ size, color }) => <Search size={size} color={color} />,
        }}
      />
            <Tabs.Screen
        name="places/[id]/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ size, color }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="itineraries"
        options={{
          title: 'Itineraries',
          tabBarIcon: ({ size, color }) => (
            <Briefcase size={size} color={color} />
          ),
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
