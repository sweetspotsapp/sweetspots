import {
  getMyOnboarding,
  upsertMyOnboarding,
} from '@/endpoints/users-onboarding/endpoints';
import { useOnboardingStore } from '@/store/useOnboardingStore';

const pickPayload = () => {
  const { answers, ui } = useOnboardingStore.getState();
  return {
    travelerType: answers.travelerType,
    companion: answers.companion,
    vibes: answers.vibes,
    budget: answers.budget,
    requirements: answers.requirements,
    completed: ui.completed,
    dismissed: ui.dismissed,
  };
};

export async function syncOnboardingAfterAuth() {
  try {
    const res = await getMyOnboarding();
    const server = res?.data ?? null;

    console.log('syncOnboardingAfterAuth', { server });

    if (
      server?.budget &&
      server?.companion &&
      server?.travelerType &&
      server?.vibes?.length &&
      server?.requirements?.length
    ) {
      console.log('  - pulling from server');
      useOnboardingStore.setState((prev) => ({
        answers: {
          travelerType: server.travelerType ?? undefined,
          companion: server.companion ?? undefined,
          vibes: server.vibes ?? [],
          budget: server.budget ?? undefined,
          requirements: server.requirements ?? [],
          email: prev.answers.email ?? server.email ?? '',
        },
        ui: {
          step: prev.ui.step ?? 0,
          dismissed: !!server.dismissed,
          completed: !!server.completed,
          dismissedAt: prev.ui.dismissedAt,
          completedAt: prev.ui.completedAt,
        },
      }));
      return;
    }

    await upsertMyOnboarding(pickPayload());
  } catch (e) {
    console.log('syncOnboardingAfterAuth skipped:', (e as any)?.message ?? e);
  }
}

export async function pushOnboardingIfAuthed() {
  try {
    await upsertMyOnboarding(pickPayload());
  } catch (e) {
    console.log('pushOnboardingIfAuthed failed:', (e as any)?.message ?? e);
  }
}
