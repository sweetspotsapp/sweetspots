import React, { useEffect, useState } from 'react';
import { Tabs, Redirect, router } from 'expo-router';
import { Heart, User, Compass, Search, Briefcase } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import { useAuth } from '@/hooks/useAuth';
import SavedTabIconWithHint from '@/components/SavedTabIconWithHint';
import { useFeedbackNudgeStore } from '@/store/useFeedbackNudgeStore';
import Constants from 'expo-constants';
import FeedbackDialog from '@/components/feedbacks/FeedbackDialog';

export default function TabLayout() {
  const { ui, answers, goToStep } = useOnboardingStore();
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

  const needsOnboarding = !ui.completed && !ui.dismissed;
  const isLoggedOut = !user;

  const [open, setOpen] = React.useState(false);
  const APP_VERSION = Constants?.expoConfig?.version ?? 'dev';
  const promptOk = useFeedbackNudgeStore((s) => s.shouldPrompt(APP_VERSION).ok);
  const markPromptShown = useFeedbackNudgeStore((s) => s.markPromptShown);

  React.useEffect(() => {
    if (promptOk) {
      setOpen(true);
      markPromptShown(APP_VERSION);
    }
  }, [promptOk, markPromptShown, APP_VERSION]);

  React.useEffect(() => {
    console.log("YAHOOO", { user, answers });
    if (user && answers.email !== user.email && !ui.dismissed) {
      useOnboardingStore.setState({
        answers: {
          requirements: [],
          vibes: [],
          email: user.email ?? '',
          budget: undefined,
          companion: undefined,
          travelerType: undefined,
        },
        ui: { ...ui, step: 0, dismissed: false, completed: false },
      });
      goToStep(0);
      router.replace('/onboarding');
    }
  }, [user, answers]);

  if (loading || !hydrated) return null;

  if (isLoggedOut && needsOnboarding) {
    return <Redirect href="/landing" />;
  }

  return (
    <>
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
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
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
            tabBarIcon: ({ size, color }) => (
              <SavedTabIconWithHint size={size} color={color} />
            ),
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
      <FeedbackDialog open={open} onOpenChange={setOpen} showNeverAskAgain />
    </>
  );
}
