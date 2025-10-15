import { OnboardingAnswers } from '@/store/useOnboardingStore';
import { api } from '../client';
import { ApiResponse } from '../pagination.dto';
export const getMyOnboarding = async (): Promise<ApiResponse<OnboardingAnswers & {
  completed: boolean;
  dismissed: boolean;
}>> => {
  const res = await api.get('/onboarding/me');
  return res.data;
};

export type UpsertOnboardingPayload = {
  travelerType?: string;
  companion?: string;
  vibes?: string[];
  budget?: string;
  requirements?: string[];
  completed?: boolean;
  dismissed?: boolean;
  tutorialSeenPages?: string[];
  tutorialCompleted?: boolean;
};

export const upsertMyOnboarding = async (
  data: UpsertOnboardingPayload
): Promise<ApiResponse<any>> => {
  console.log('upsertMyOnboarding', { data });
  const res = await api.put('/onboarding/me', data);
  return res.data;
};

export const markOnboardingCompleted = async () => {
  const res = await api.patch('/onboarding/me/complete');
  return res.data;
};

export const markOnboardingDismissed = async () => {
  const res = await api.patch('/onboarding/me/dismiss');
  return res.data;
};
