import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  Share2,
  CreditCard as Edit3,
  Navigation,
  Star,
  Clock,
  DollarSign,
} from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getItineraries } from '@/utils/storage';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { Card, CardContent } from '@/components/ui/card';
import { getItineraryById } from '@/api/itineraries/endpoints';
import { IItinerary } from '@/api/itineraries/dto/itinerary.dto';
import { formatCurrency, formatDuration } from '@/utils/formatter';
import { ItineraryForm } from '@/components/ItineraryForm';

export default function EditItineraryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItinerary();
  }, [id]);

  const loadItinerary = async () => {
    try {
      const response = await getItineraryById(id as string);
      if (response.success && response.data) {
        setItinerary(response.data);
      } else {
        console.error('Failed to fetch itinerary:', response.message);
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareItinerary = () => {
    Alert.alert(
      'Share Itinerary',
      'Share this itinerary with friends and family',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share Link', onPress: () => console.log('Share link') },
        { text: 'Invite People', onPress: () => console.log('Invite people') },
      ]
    );
  };

  const handleEditItinerary = () => {
    Alert.alert('Edit Itinerary', 'Editing functionality coming soon!', [
      { text: 'OK' },
    ]);
  };

  const handleNavigateToPlace = (place: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    console.log('Navigate to:', place.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDurationInDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <SSLinearGradient />
        <View className="flex-1 justify-center items-center">
          <SSText className="text-lg text-slate-500">
            Loading itinerary...
          </SSText>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView className="flex-1">
        <SSLinearGradient />
        <View className="flex-1 justify-center items-center px-10">
          <SSText
            variant="bold"
            className="text-2xl text-emerald-600 text-center mb-3"
          >
            Itinerary not found
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6 mb-8">
            The itinerary you're looking for doesn't exist or has been removed.
          </SSText>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <SSText variant="semibold" className="text-base text-white">
              Go Back
            </SSText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tripDays = getDurationInDays(
    itinerary.startDate || undefined,
    itinerary.endDate || undefined
  );

  return (
    <SafeAreaView className="flex-1">
      <ItineraryForm itineraryId={id} onCancel={() => {
        router.back();
      }} />
      {/* <SSLinearGradient /> */}
    </SafeAreaView>
  );
}
