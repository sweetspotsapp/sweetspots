import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Heart,
  MapPin,
  Settings,
  Bell,
  User,
  Calendar,
  Share2,
  Star
} from 'lucide-react-native';
import { router } from 'expo-router';
import { SSText } from '@/components/ui/SSText';
import SSLinearBackground from '@/components/ui/SSLinearBackground';

export default function ProfileTab() {
  const menuItems = [
    {
      icon: Heart,
      title: 'Saved Places',
      subtitle: '24 places saved',
      onPress: () => router.push('/(tabs)/saved'),
      color: '#f43f5e',
    },
    {
      icon: Calendar,
      title: 'My Itineraries',
      subtitle: '3 upcoming trips',
      onPress: () => router.push('/itineraries'),
      color: '#0ea5e9',
    },
    {
      icon: MapPin,
      title: 'Location Settings',
      subtitle: 'Manage your location preferences',
      onPress: () => { },
      color: '#10b981',
    },
    {
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Stay updated on new places',
      onPress: () => { },
      color: '#f59e0b',
    },
    {
      icon: Share2,
      title: 'Share SweetSpots',
      subtitle: 'Invite friends to discover amazing places',
      onPress: () => { },
      color: '#8b5cf6',
    },
    {
      icon: Settings,
      title: 'Settings',
      subtitle: 'App preferences and account',
      onPress: () => { },
      color: '#64748b',
    },
        {
      icon: Settings,
      title: 'Login',
      subtitle: 'App preferences and account',
      onPress: () => {
        router.push('/(auth)/login');
       },
      color: '#64748b',
    },
  ];

  return (
    <SSLinearBackground>
      <SafeAreaView className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View className="items-center py-10">
            <View className="relative mb-4">
              <Image
                source={{ uri: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400' }}
                className="w-25 h-25 rounded-full border-4 border-emerald-600"
              />
              <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-emerald-600 justify-center items-center border-3 border-white">
                <User size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>

            <SSText variant="bold" className="text-3xl text-gray-800 mb-1">
              Alex Johnson
            </SSText>
            <SSText className="text-base text-slate-500 mb-6">
              Travel Enthusiast
            </SSText>

            {/* Stats */}
            <View className="flex-row items-center bg-white px-8 py-5 rounded-2xl shadow-sm">
              <View className="items-center flex-1">
                <SSText variant="bold" className="text-2xl text-emerald-600 mb-1">
                  42
                </SSText>
                <SSText variant="medium" className="text-xs text-slate-500">
                  Places Visited
                </SSText>
              </View>
              <View className="w-px h-7 bg-slate-200 mx-4" />
              <View className="items-center flex-1">
                <SSText variant="bold" className="text-2xl text-emerald-600 mb-1">
                  8
                </SSText>
                <SSText variant="medium" className="text-xs text-slate-500">
                  Itineraries
                </SSText>
              </View>
              <View className="w-px h-7 bg-slate-200 mx-4" />
              <View className="items-center flex-1">
                <SSText variant="bold" className="text-2xl text-emerald-600 mb-1">
                  4.9
                </SSText>
                <SSText variant="medium" className="text-xs text-slate-500">
                  Rating
                </SSText>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="px-5 pt-5">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center bg-white px-5 py-4 rounded-xl mb-3 shadow-sm"
                onPress={item.onPress}>
                <View
                  className="w-12 h-12 rounded-xl justify-center items-center mr-4"
                  style={{ backgroundColor: `${item.color}15` }}>
                  <item.icon size={24} color={item.color} />
                </View>
                <View className="flex-1">
                  <SSText variant="semibold" className="text-base text-gray-800 mb-0.5">
                    {item.title}
                  </SSText>
                  <SSText className="text-sm text-slate-500">
                    {item.subtitle}
                  </SSText>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* App Info */}
          <View className="items-center py-10 px-5">
            <SSText variant="medium" className="text-sm text-slate-500 mb-1">
              SweetSpots v1.0.0
            </SSText>
            <SSText className="text-xs text-slate-400 text-center">
              Discover amazing places around you
            </SSText>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SSLinearBackground>
  );
}