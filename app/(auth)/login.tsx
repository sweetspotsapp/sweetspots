import React from 'react';
import { useRouter } from 'expo-router';
import { View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { saveToken } from '@/utils/token';
import { SSText } from '@/components/ui/SSText';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Separator } from '@/components/ui/separator';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { SSControlledInput } from '@/components/ui/SSControlledInput';

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    try {
      const userCred = await login(data.email, data.password);
      const token = await userCred.user.getIdToken();
      await saveToken(token);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', 'Check your credentials.');
    }
  };

  const { promptAsync: loginWithGoogle, authError } = useGoogleAuth();

  const handleGoogleLogin = async () => {
    try {
      const { auth } = require('@/lib/firebase');
      await loginWithGoogle();
      const token = await auth.currentUser?.getIdToken();
      if (token) {
        await saveToken(token);
        router.replace('/(tabs)');
      }
    } catch (err) {
      Alert.alert('Google login failed', authError?.message || 'Something went wrong');
    }
  };

  return (
    <SSLinearBackground>
      <View className="gap-3 justify-center items-center flex-1 container max-w-xl mx-auto px-4">
        <SSText className="text-2xl font-bold">Login</SSText>
        <SSText className="text-sm text-muted-foreground">Welcome back! Please login to continue.</SSText>
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
        <Button onPress={handleSubmit(handleLogin)}>
          <SSText>Login</SSText>
        </Button>
        <View className="flex-row items-center justify-between w-full gap-3 my-4">
          <Separator className="flex-1" />
          <SSText className="text-sm text-muted-foreground">or continue with</SSText>
          <Separator className="flex-1" />
        </View>
        {/* <Button
          onPress={handleGoogleLogin}
          className="flex-row items-center justify-center bg-white border border-[#4285F4] rounded-md py-2 px-4 shadow-sm"
          style={{ elevation: 2 }}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 8 }} />
          <SSText className="text-[#4285F4]">Sign in with Google</SSText>
        </Button> */}
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
      </View>
    </SSLinearBackground>
  );
}