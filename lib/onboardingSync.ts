import { getMyOnboarding, upsertMyOnboarding } from '@/endpoints/users-onboarding/endpoints';
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

    if (server) {
      useOnboardingStore.setState((prev) => ({
        answers: {
          travelerType: server.travelerType ?? undefined,
          companion: server.companion ?? undefined,
          vibes: server.vibes ?? [],
          budget: server.budget ?? undefined,
          requirements: server.requirements ?? [],
        },
        ui: {
          // keep local step/timestamps
          step: prev.ui.step ?? 0,
          dismissed: !!server.dismissed,
          completed: !!server.completed,
          dismissedAt: prev.ui.dismissedAt,
          completedAt: prev.ui.completedAt,
        },
      }));
      return;
    }

    // No server record => push only allowed fields
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