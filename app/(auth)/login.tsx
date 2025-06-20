import React from 'react';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, TextInput, Alert } from 'react-native';
import { saveToken } from '@/utils/token';
import { login } from '@/api/endpoints/auth';
import { Button } from '@/~/components/ui/button';
import { SSText } from '@/components/ui/SSText';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const { accessToken } = await login(email, password);
      await saveToken(accessToken);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Login failed', 'Check your credentials.');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
      className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 h-14 text-sm text-gray-800"
      placeholder="Email"
      value={email}
      onChangeText={setEmail}
      placeholderTextColor="#94a3b8"
      style={{ fontFamily: 'PlusJakartaSans-Regular', marginBottom: 12 }}
      autoCapitalize="none"
      keyboardType="email-address"
      />
      <TextInput
      className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 h-14 text-sm text-gray-800"
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