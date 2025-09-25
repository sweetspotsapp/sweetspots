import React, { useEffect } from 'react';
import { View } from 'react-native';
import { set, useForm } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { register as registerWithEmail } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { SSText } from '@/components/ui/SSText';
import { SSControlledInput } from '@/components/ui/SSControlledInput';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { Toast } from 'toastify-react-native';
import { firebaseErrorMessage } from '@/lib/utils';

type RegisterFormData = {
  // name: string;
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
      // name: '',
      firstName: '',
      lastName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (!dirtyFields.username) {
      setValue('username', watch('email').split('@')[0]);
      // Optionally, you can validate username uniqueness here
      // For now, we assume it's always valid
    }
  }, [dirtyFields.username, watch('email'), setValue]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerWithEmail(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.username || data.email.split('@')[0]
      ); // Assuming username is optional
      Toast.success('Account created. Please log in.');
      router.replace('/(auth)/login');
    } catch (err) {
      console.log(firebaseErrorMessage((err as any).code));
      Toast.error(firebaseErrorMessage((err as any).code));
      if ((err as any).code === 'auth/email-already-in-use') {
        router.replace('/(auth)/login');
        return;
      }
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

        <Button onPress={handleSubmit(onSubmit)}>
          <SSText>Register</SSText>
        </Button>
      </View>
    </SSLinearBackground>
  );
}
