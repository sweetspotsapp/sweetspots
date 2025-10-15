// app/(onboarding)/QuestionnaireScreen.tsx
import React, { useMemo } from 'react';
import { View, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Banknote,
  CircleAlert,
  HandMetal,
  Luggage,
  SmilePlus,
  X,
} from 'lucide-react-native';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import SSContainer from '@/components/SSContainer';
import { Button } from '@/components/ui/button';
import { SSText } from '@/components/ui/SSText';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { syncOnboardingAfterAuth } from '@/lib/onboardingSync';

const QuestionTitle = ({
  emoji,
  icon,
  text,
}: {
  emoji?: string;
  icon?: React.ReactNode;
  text: string;
}) => (
  <View className="mb-5 flex-row gap-2 items-center">
    {icon}
    <SSText variant="bold" className="text-lg text-slate-900">
      {emoji} {text}
    </SSText>
  </View>
);

/** --------------------
 * Options (copy from your UI)
 * -------------------- */
const travelerTypeOpts = [
  {
    key: 'planner',
    label: 'I’m Planner – love organizing everything',
    emoji: '📒',
  },
  { key: 'chill', label: 'I’m Chill – go with the flow', emoji: '🧘' },
  { key: 'mix', label: 'A mix – some plans, some freedom', emoji: '🌀' },
] as const;

const companionOpts = [
  { key: 'solo', label: 'Solo Explorer', emoji: '🧭' },
  { key: 'friends', label: 'Friend Group Adventurer', emoji: '🧑‍🤝‍🧑' },
  { key: 'couple', label: 'Couple on a Trip', emoji: '❤️' },
  { key: 'family', label: 'Family Traveler', emoji: '👨‍👩‍👧‍👦' },
  { key: 'budgetBackpacker', label: 'Budget Backpacker', emoji: '🎒' },
  { key: 'comfortSeeker', label: 'Chill & Comfort Seeker', emoji: '🛋️' },
] as const;

const vibeOpts = [
  { key: 'chill', label: 'Chill & laid-back', emoji: '🧊' },
  { key: 'social', label: 'Lively & social', emoji: '🎉' },
  { key: 'nature', label: 'Nature & outdoors', emoji: '🏞️' },
  { key: 'city', label: 'City & urban', emoji: '🏙️' },
  { key: 'mixed', label: 'A bit of everything', emoji: '✨' },
] as const;

const budgetOpts = [
  { key: 'budget', label: 'Budget (under $50/day)', emoji: '💸' },
  { key: 'mid', label: 'Mid-range ($50–100/day)', emoji: '💵' },
  { key: 'comfortable', label: 'Comfortable ($100–200/day)', emoji: '💳' },
  { key: 'premium', label: 'Premium ($200+/day)', emoji: '💎' },
] as const;

const reqOpts = [
  { key: 'accessible', label: 'Disability-accessible', emoji: '🧩' },
  { key: 'dietary', label: 'Dietary needs (vegan, halal etc.)', emoji: '🥗' },
  { key: 'lowEnergy', label: 'Low-energy / relaxing only', emoji: '🌙' },
  {
    key: 'familyFriendly',
    label: 'Family / kid-friendly options',
    emoji: '🧸',
  },
  { key: 'smokeFree', label: 'Smoke-free environment', emoji: '🚭' },
  { key: 'petFriendly', label: 'Pet-friendly spots', emoji: '🐾' },
  { key: 'none', label: 'None — I’m all good', emoji: '✈️' },
] as const;

/** --------------------
 * Main Screen
 * -------------------- */
export default function QuestionnaireScreen() {
  const {
    answers,
    ui,
    updateAnswers,
    nextStep,
    prevStep,
    dismiss,
    markCompleted,
    isComplete,
  } = useOnboardingStore();

  const canNext = useMemo(() => {
    switch (ui.step) {
      case 0:
        return !!answers.travelerType;
      case 1:
        return !!answers.companion;
      case 2:
        return answers.vibes.length > 0;
      case 3:
        return !!answers.budget;
      case 4:
        return true;
      default:
        return false;
    }
  }, [ui.step, answers]);

  const handleFinish = () => {
    // markCompleted();
    syncOnboardingAfterAuth();
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    dismiss();
    router.replace('/(tabs)');
  };

  const renderOptions = (
    data: readonly { key: string; label: string; emoji: string }[],
    selected: string | string[] | undefined,
    onSelect: (key: string) => void,
    multiple = false
  ) => (
    <View className="gap-3">
      {data.map((item) => {
        const isSelected = multiple
          ? Array.isArray(selected) && selected.includes(item.key)
          : selected === item.key;
        return (
          <Button
            key={item.key}
            variant={isSelected ? 'default' : 'outline'}
            className="justify-start"
            onPress={() => onSelect(item.key)}
          >
            <SSText
              variant="semibold"
              className={isSelected ? 'text-white' : 'text-slate-700'}
            >
              {item.emoji} {item.label}
            </SSText>
          </Button>
        );
      })}
    </View>
  );

  function renderStep(uiStep: number, answers: any, updateAnswers: any) {
    switch (uiStep) {
      case 0:
        return (
          <View>
            <QuestionTitle
              icon={<Luggage />}
              text="What kind of traveler are you?"
            />
            {renderOptions(
              [
                {
                  key: 'planner',
                  label: 'I’m Planner – love organizing everything',
                  emoji: '📒',
                },
                {
                  key: 'chill',
                  label: 'I’m Chill – go with the flow',
                  emoji: '🧘',
                },
                {
                  key: 'mix',
                  label: 'A mix – some plans, some freedom',
                  emoji: '🌀',
                },
              ] as const,
              answers.travelerType,
              (key) => updateAnswers({ travelerType: key })
            )}
          </View>
        );

      case 1:
        return (
          <View>
            <QuestionTitle
              icon={<SmilePlus />}
              text="How do you usually travel?"
            />
            {renderOptions(
              [
                { key: 'solo', label: 'Solo Explorer', emoji: '🧭' },
                {
                  key: 'friends',
                  label: 'Friend Group Adventurer',
                  emoji: '🧑‍🤝‍🧑',
                },
                { key: 'couple', label: 'Couple on a Trip', emoji: '❤️' },
                { key: 'family', label: 'Family Traveler', emoji: '👨‍👩‍👧‍👦' },
                {
                  key: 'budgetBackpacker',
                  label: 'Budget Backpacker',
                  emoji: '🎒',
                },
                {
                  key: 'comfortSeeker',
                  label: 'Chill & Comfort Seeker',
                  emoji: '🛋️',
                },
              ] as const,
              answers.companion,
              (key) => updateAnswers({ companion: key })
            )}
          </View>
        );

      case 2:
        return (
          <View>
            <QuestionTitle
              icon={<HandMetal />}
              text="What vibe are you chasing?"
            />
            {renderOptions(
              [
                { key: 'chill', label: 'Chill & laid-back', emoji: '🧊' },
                { key: 'social', label: 'Lively & social', emoji: '🎉' },
                { key: 'nature', label: 'Nature & outdoors', emoji: '🏞️' },
                { key: 'city', label: 'City & urban', emoji: '🏙️' },
                { key: 'mixed', label: 'A bit of everything', emoji: '✨' },
              ] as const,
              answers.vibes,
              (key: string) => {
                const set = new Set(answers.vibes as string[]);
                set.has(key) ? set.delete(key) : set.add(key);
                updateAnswers({ vibes: Array.from(set) });
              },
              true
            )}
          </View>
        );

      case 3:
        return (
          <View>
            <QuestionTitle
              icon={<Banknote />}
              text="What’s your usual travel budget (per day, not counting flights)?"
            />
            {renderOptions(
              [
                { key: 'budget', label: 'Budget (under $50/day)', emoji: '🪙' },
                { key: 'mid', label: 'Mid-range ($50–100/day)', emoji: '💵' },
                {
                  key: 'comfortable',
                  label: 'Comfortable ($100–200/day)',
                  emoji: '💳',
                },
                { key: 'premium', label: 'Premium ($200+/day)', emoji: '💎' },
              ] as const,
              answers.budget,
              (key) => updateAnswers({ budget: key })
            )}
          </View>
        );

      case 4:
        return (
          <View>
            <QuestionTitle
              icon={<CircleAlert />}
              text="Do you have any special requirements for your trip?"
            />
            {renderOptions(
              [
                {
                  key: 'accessible',
                  label: 'Disability-accessible',
                  emoji: '🧩',
                },
                {
                  key: 'dietary',
                  label: 'Dietary needs (vegan, halal etc.)',
                  emoji: '🥗',
                },
                {
                  key: 'lowEnergy',
                  label: 'Low-energy / relaxing activities only',
                  emoji: '🌙',
                },
                {
                  key: 'familyFriendly',
                  label: 'Family / kid-friendly options',
                  emoji: '🧸',
                },
                {
                  key: 'smokeFree',
                  label: 'Smoke-free environment',
                  emoji: '🚭',
                },
                {
                  key: 'petFriendly',
                  label: 'Pet-friendly spots',
                  emoji: '🐾',
                },
                { key: 'none', label: 'None — I’m all good', emoji: '✈️' },
              ] as const,
              answers.requirements,
              (key: string) => {
                if (key === 'none')
                  return updateAnswers({ requirements: ['none'] });
                const set = new Set(
                  (answers.requirements as string[]).filter((r) => r !== 'none')
                );
                set.has(key) ? set.delete(key) : set.add(key);
                updateAnswers({ requirements: Array.from(set) });
              },
              true
            )}
          </View>
        );

      default:
        return null;
    }
  }

  const [isConfirmingDismiss, setIsConfirmingDismiss] = React.useState(false);

  function handleConfirmDismiss() {
    setIsConfirmingDismiss(false);
    handleSkip();
  }

  return (
    <SSContainer>
      <AlertDialog
        title="Skip Onboarding?"
        message={`You'll miss out on personalised recommendations.\n\nAre you sure you want to skip?`}
        visible={isConfirmingDismiss}
        onCancel={() => setIsConfirmingDismiss(false)}
        onConfirm={handleConfirmDismiss}
      />
      {/* Header */}
      <View className="flex-row items-center justify-between py-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
          disabled={ui.step === 0}
          onPress={prevStep}
        >
          <ArrowLeft
            size={22}
            className={ui.step === 0 ? 'text-slate-300' : 'text-orange-500'}
          />
        </TouchableOpacity>

        {/* <SSText variant="bold" className="text-2xl text-orange-600">
          Onboarding
        </SSText> */}
        {/* Progress Dots */}
        <View className="flex-row items-center justify-center mb-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              className={[
                'h-2 rounded-full mx-1',
                ui.step === i ? 'bg-orange-500 w-6' : 'bg-orange-200 w-2.5',
              ].join(' ')}
            />
          ))}
        </View>

        <TouchableOpacity
          className="w-10 h-10 rounded-full bg-white items-center justify-center"
          onPress={() => setIsConfirmingDismiss(true)}
          accessibilityLabel="Skip onboarding"
        >
          <X size={20} className="text-orange-500" />
        </TouchableOpacity>
      </View>

      {/* Step Content */}
      <View className="mb-6">
        {renderStep(ui.step, answers, updateAnswers)}
      </View>

      {/* Footer */}
      <View className="mt-auto pt-4">
        <Button
          className="w-full"
          disabled={!canNext}
          onPress={() => {
            if (ui.step < 4) nextStep();
            else handleFinish();
          }}
        >
          <SSText variant="semibold" className="text-white">
            {ui.step < 4 ? 'Next' : isComplete() ? 'Let’s go' : 'Next'}
          </SSText>
        </Button>

        <TouchableOpacity
          disabled={ui.step === 0}
          className="mt-2 w-full py-3 rounded-xl bg-slate-100 items-center"
          onPress={prevStep}
        >
          <SSText variant="semibold" className="text-slate-400">
            Back
          </SSText>
        </TouchableOpacity>

        {Platform.OS === 'web' ? <View className="h-2" /> : null}
      </View>
    </SSContainer>
  );
}
