import * as React from 'react';
import Constants from 'expo-constants';
import { useFeedbackNudgeStore } from '@/store/useFeedbackNudgeStore';

const APP_VERSION = Constants?.expoConfig?.version ?? 'dev';

export function useMaybeShowFeedbackPrompt() {
  const shouldPrompt = useFeedbackNudgeStore((s) => s.shouldPrompt);
  const markPromptShown = useFeedbackNudgeStore((s) => s.markPromptShown);

  return React.useCallback(() => {
    const { ok, reason } = shouldPrompt(APP_VERSION);
    if (!ok) return { show: false as const };

    markPromptShown(APP_VERSION);
    return { show: true as const, reason };
  }, [shouldPrompt, markPromptShown]);
}