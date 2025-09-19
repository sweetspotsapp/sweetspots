import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { getItineraryById } from '@/api/itineraries/endpoints';
import SSSpinner from '@/components/ui/SSSpinner';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { ItineraryForm } from '@/components/itineraries/ItineraryForm';
import { goBack } from '@/utils/goBack';
import SSContainer from '@/components/SSContainer';

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

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <SSLinearGradient />
        <View className="flex-1 justify-center items-center">
          <SSSpinner size='large' className='mb-4'/>
          <SSText className="text-lg text-slate-500">
            Loading itinerary...
          </SSText>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SSContainer>
        <View className="flex-1 justify-center items-center px-10">
          <SSText
            variant="bold"
            className="text-2xl text-orange-600 text-center mb-3"
          >
            Itinerary not found
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6 mb-8">
            The itinerary you're looking for doesn't exist or has been removed.
          </SSText>
          <TouchableOpacity
            className="bg-orange-600 px-6 py-3 rounded-xl"
            onPress={() => goBack('/itineraries')}
          >
            <SSText variant="semibold" className="text-base text-white">
              Go Back
            </SSText>
          </TouchableOpacity>
        </View>
      </SSContainer>
    );
  }

  return (
    <>
      <SSContainer>
        <ItineraryForm
          itineraryId={id}
          onCancel={() => {
            goBack(`/itineraries/${id}`);
          }}
          onUpdated={() => {
            goBack(`/itineraries/${id}`);
          }}
        />
        {/* <SSLinearGradient /> */}
      </SSContainer>
    </>
  );
}
