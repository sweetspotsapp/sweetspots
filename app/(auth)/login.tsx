import React from 'react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert } from 'react-native';
import { saveToken } from '@/utils/token';
import { SSText } from '@/components/ui/SSText';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      // const { accessToken } = await login(email, password);
      // await saveToken(accessToken);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', 'Check your credentials.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Input
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      placeholderTextColor="#94a3b8"
      style={{ fontFamily: 'PlusJakartaSans-Regular', marginBottom: 12 }}
      autoCapitalize="none"
      keyboardType="email-address"
      />
      <Input
      placeholder="Password"
      value={password}
      onChangeText={setPassword}
      placeholderTextColor="#94a3b8"
      style={{ fontFamily: 'PlusJakartaSans-Regular', marginBottom: 20 }}
      secureTextEntry
      autoCapitalize="none"
      />
      <Button>
        <SSText>Login</SSText>
      </Button>
      {/* <Button title="Login" onPress={handleLogin} /> */}
    </View>
  );
}