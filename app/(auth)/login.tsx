import React from 'react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { saveToken } from '@/utils/token';
import { SSText } from '@/components/ui/SSText';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Separator } from '@/components/ui/separator';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const userCred = await login(email, password);
      const token = await userCred.user.getIdToken(); // get Firebase ID token
      await saveToken(token);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', 'Check your credentials.');
    }
  };

  const { promptAsync: loginWithGoogle, authError } = useGoogleAuth();

  const handleGoogleLogin = async () => {
    try {
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
      <View className='gap-3 justify-center items-center flex-1 container max-w-xl mx-auto'>
        <SSText className='text-2xl font-bold'>Login</SSText>
        <SSText className='text-sm text-muted-foreground'>Welcome back! Please login to continue.</SSText>
        <View className='my-4 w-full gap-3'>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>
        <Button onPress={handleLogin}>
          <SSText>Login</SSText>
        </Button>
        <View className='flex-row items-center justify-between w-full gap-3 my-4'>
          <Separator className='flex-1' />
          <SSText className='text-sm text-muted-foreground'>or continue with</SSText>
          <Separator className='flex-1' />
        </View>
        <Button
          onPress={handleGoogleLogin}
          className="flex-row items-center justify-center bg-white border border-[#4285F4] rounded-md py-2 px-4 shadow-sm"
          style={{
            elevation: 2,
          }}
        >
          <Ionicons name="logo-google" size={20} color="#4285F4" style={{ marginRight: 8 }} />
          <SSText className="text-[#4285F4] font-semibold">Sign in with Google</SSText>
        </Button>
        {/* <Button title="Login" onPress={handleLogin} /> */}
      </View>
    </SSLinearBackground>
  );
}