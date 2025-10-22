import React from 'react';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';
import { useForm } from 'react-hook-form';
import { saveToken } from '@/utils/token';
import { SSText } from '@/components/ui/SSText';
import { login, loginWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { Separator } from '@/components/ui/separator';
import { SSControlledInput } from '@/components/ui/SSControlledInput';
import { Home } from 'lucide-react-native';
import { Toast } from 'toastify-react-native';
import { firebaseErrorMessage } from '@/lib/utils';
import { useOnboardingStore } from '@/store/useOnboardingStore';
import type { UserCredential } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ defaultValues: { email: '', password: '' } });

  const goToStep = useOnboardingStore((s) => s.goToStep);
  const answers = useOnboardingStore((s) => s.answers);

  // Shared “after auth” logic
  const finalizeLogin = async (cred: UserCredential, emailHint?: string) => {
    const token = await cred.user.getIdToken();
    await saveToken(token);

    const email = emailHint ?? cred.user.email ?? '';
    const onboardingAnswers = useOnboardingStore.getState().answers;
    const onboardingUi = useOnboardingStore.getState().ui;

    if (
      onboardingAnswers.email !== email &&
      !onboardingUi.completed &&
      !onboardingUi.dismissed
    ) {
      useOnboardingStore.setState({
        answers: {
          requirements: [],
          vibes: [],
          email,
          budget: undefined,
          companion: undefined,
          travelerType: undefined,
        },
      });
      goToStep(0);
      router.replace('/onboarding');
      return;
    }

    router.replace('/(tabs)');
  };

  // Wrap an auth action with common loading & error handling
  const runAuthFlow = async (
    getCred: () => Promise<UserCredential>,
    emailHint?: string
  ) => {
    setIsLoggingIn(true);
    try {
      const cred = await getCred();
      await finalizeLogin(cred, emailHint);
    } catch (err: any) {
      console.log(err);
      Toast.error(firebaseErrorMessage(err?.code));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogin = (data: LoginFormData) =>
    runAuthFlow(() => login(data.email, data.password), data.email);

  const handleGoogleLogin = () => runAuthFlow(() => loginWithGoogle());

  return (
    <SSLinearBackground>
      <View className="gap-3 justify-center items-center flex-1 container max-w-xl mx-auto px-4">
        <SSText className="text-2xl font-bold">Login</SSText>
        <SSText className="text-sm text-muted-foreground">
          Welcome back! Please login to continue.
        </SSText>

        <View className="my-4 w-full gap-3">
          <SSControlledInput
            name="email"
            control={control}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
          />
          <SSControlledInput
            name="password"
            control={control}
            placeholder="Password"
            secureTextEntry
            autoCapitalize="none"
            error={errors.password?.message}
          />
        </View>

        <Button
          onPress={handleSubmit(handleLogin)}
          className="w-full"
          disabled={isLoggingIn}
        >
          <SSText>Login</SSText>
        </Button>

        <View className="flex-row items-center justify-between w-full gap-3 my-4">
          <Separator className="flex-1" />
          <SSText className="text-sm text-muted-foreground">or</SSText>
          <Separator className="flex-1" />
        </View>

        <Button
          onPress={handleGoogleLogin}
          variant="outline"
          className="w-full border border-[#4285F4]"
          disabled={isLoggingIn}
        >
          <FcGoogle size={16} color="white" />
          <SSText>Sign in with Google</SSText>
        </Button>

        <View>
          <SSText className="text-sm text-muted-foreground mt-4">
            Don't have an account?{' '}
            <SSText
              className="text-blue-500"
              onPress={() => router.push('/(auth)/register')}
            >
              Register here
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
