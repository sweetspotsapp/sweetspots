import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { Link, useRouter } from 'expo-router';
import { register as registerWithEmail, loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SSText } from '@/components/ui/SSText';
import { SSControlledInput } from '@/components/ui/SSControlledInput';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { Toast } from 'toastify-react-native';
import { firebaseErrorMessage } from '@/lib/utils';
import { Home } from 'lucide-react-native';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { UserCredential } from 'firebase/auth';
import { saveToken } from '@/utils/token';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';

type RegisterFormData = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, dirtyFields },
  } = useForm<RegisterFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onboardingData = useOnboardingStore((s) => s.answers);
  const goToStep = useOnboardingStore((s) => s.goToStep);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  useEffect(() => {
    if (!dirtyFields.username) {
      const email = watch('email') || '';
      setValue('username', email.includes('@') ? email.split('@')[0] : email);
    }
  }, [dirtyFields.username, watch, setValue]);

  // Shared: after successful auth (already logged in)
  const finalizeAuth = async (cred: UserCredential, emailHint?: string) => {
    const token = await cred.user.getIdToken();
    await saveToken(token);

    const email = emailHint ?? cred.user.email ?? '';
    const current = useOnboardingStore.getState().answers;
    const onboardingUi = useOnboardingStore.getState().ui;

    // First-time or different email → restart onboarding
    if (
      current.email !== email &&
      !onboardingUi.completed &&
      !onboardingUi.dismissed
    ) {
      useOnboardingStore.setState({
        answers: {
          requirements: [],
          vibes: [],
          companion: undefined,
          budget: undefined,
          travelerType: undefined,
          email,
        },
      });
      goToStep(0);
      router.replace('/onboarding');
      return;
    }

    // Otherwise go straight in
    Toast.success('Welcome! Your account is ready.');
    router.replace('/(tabs)');
  };

  // Wrapper: handles loading + error toast
  const runRegisterFlow = async (
    getCred: () => Promise<UserCredential>,
    emailHint?: string
  ) => {
    setIsSubmitting(true);
    try {
      const cred = await getCred();
      await finalizeAuth(cred, emailHint);
    } catch (err: any) {
      console.log(err);
      Toast.error(firebaseErrorMessage(err?.code));
      // If email exists, nudge to login (but we don't navigate automatically anymore)
      // because register() auto-logs in when successful.
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email/password registration → returns logged-in UserCredential
  const onSubmit = (data: RegisterFormData) =>
    runRegisterFlow(
      () =>
        registerWithEmail(
          data.email,
          data.password,
          data.firstName,
          data.lastName,
          data.username || data.email.split('@')[0]
        ),
      data.email
    );

  // “Register with Google” (same function as login)
  const handleRegisterWithGoogle = () =>
    runRegisterFlow(() => loginWithGoogle());

  const password = watch('password');

  return (
    <SSLinearBackground>
      <View className="gap-3 justify-center items-center flex-1 container max-w-xl mx-auto px-4">
        <SSText className="text-2xl font-bold">Register</SSText>
        <SSText className="text-sm text-muted-foreground">
          Create your account to continue.
        </SSText>

        <View className="my-4 w-full gap-3">
          <View className="flex-row gap-3">
            <SSControlledInput
              name="firstName"
              control={control}
              placeholder="First Name"
              className="flex-1"
              autoCapitalize="words"
              error={errors.firstName?.message}
            />
            <SSControlledInput
              name="lastName"
              control={control}
              placeholder="Last Name"
              className="flex-1"
              autoCapitalize="words"
              error={errors.lastName?.message}
            />
          </View>
          <SSControlledInput
            name="email"
            control={control}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
          <SSControlledInput
            name="username"
            control={control}
            placeholder="Username"
            autoCapitalize="none"
            error={errors.username?.message}
          />
          <SSControlledInput
            name="password"
            control={control}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password?.message}
          />
          <SSControlledInput
            name="confirmPassword"
            control={control}
            placeholder="Confirm Password"
            secureTextEntry
            autoCapitalize="none"
            error={
              watch('confirmPassword') !== password
                ? 'Passwords do not match'
                : undefined
            }
          />
        </View>

        <Button
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          className="w-full"
        >
          <SSText>{isSubmitting ? 'Creating…' : 'Register'}</SSText>
        </Button>

        <View className="flex-row items-center justify-between w-full gap-3 my-4">
          <Separator className="flex-1" />
          <SSText className="text-sm text-muted-foreground">or</SSText>
          <Separator className="flex-1" />
        </View>

        <Button
          disabled={isSubmitting}
          onPress={handleRegisterWithGoogle}
          variant='outline'
          className="w-full border border-[#4285F4]"
        >
          <FcGoogle size={16} color="white" />
          <SSText>Continue with Google</SSText>
        </Button>

        <View>
          <SSText className="text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <SSText
              className="text-blue-500"
              onPress={() => router.push('/(auth)/login')}
            >
              Login here
            </SSText>
          </SSText>
        </View>

        <Link href="/" asChild>
          <Button variant="outline" className="mt-6">
            <Home size={16} />
            <SSText>Back to Home</SSText>
          </Button>
        </Link>
      </View>
    </SSLinearBackground>
  );
}
