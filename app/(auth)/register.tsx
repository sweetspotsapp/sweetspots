import React from 'react';
import { View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { register as registerWithEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SSText } from '@/components/ui/SSText';
import { SSControlledInput } from '@/components/ui/SSControlledInput';
import SSLinearBackground from '@/components/ui/SSLinearBackground';

type RegisterFormData = {
  name: string;
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
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { email, password } = data;
    try {
      await registerWithEmail(email, password);
      Alert.alert('Success', 'Account created. Please log in.');
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Registration failed', 'Something went wrong. Try again.');
    }
  };

  const password = watch('password');

  return (
    <SSLinearBackground>
      <View className="gap-3 justify-center items-center flex-1 container max-w-xl mx-auto px-4">
        <SSText className="text-2xl font-bold">Register</SSText>
        <SSText className="text-sm text-muted-foreground">
          Create your account to continue.
        </SSText>

        <View className="my-4 w-full gap-3">
          <SSControlledInput
            name="name"
            control={control}
            placeholder="Name"
            autoCapitalize="words"
            error={errors.name?.message}
          />
          <SSControlledInput
            name="email"
            control={control}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
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

        <Button onPress={handleSubmit(onSubmit)}>
          <SSText>Register</SSText>
        </Button>
      </View>
    </SSLinearBackground>
  );
}