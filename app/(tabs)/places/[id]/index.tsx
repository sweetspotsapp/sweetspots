import { View, Text } from 'react-native';
import React, { useCallback } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IPlace } from '@/dto/places/place.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';
import SSContainer from '@/components/SSContainer';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import SSSpinner from '@/components/ui/SSSpinner';
import { PlaceDetails } from '@/components/placeSwipes/PlaceDetails';
import { BackArrowButton } from '@/components/BackArrowButton';
import { SSText } from '@/components/ui/SSText';

export default function PlaceDetailsScreen() {
  const { id, from } = useLocalSearchParams<{ id: string, from?: string }>();
  console.log(from)

  const [place, setPlace] = React.useState<IPlace | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const onFocus = useCallback(() => {
    loadPlace();
  }, [id]);

  useFocusEffect(onFocus);

  const loadPlace = async () => {
    try {
      const res = await getPlaceById(id);
      if (res?.data) {
        setPlace(res.data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <SSContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center  pt-2.5 pb-4">
          <BackArrowButton fallbackUrl={from as any || "/saved"} forceFallback/>
        </View>
        {loading ? (
          <SSSpinner />
        ) : place ? (
          <>
            <SSText variant="bold" className="text-3xl text-gray-800 mb-3">
              {place?.name}
            </SSText>
            <PlaceDetails place={place} />
          </>
        ) : (
          <View className="flex-1 justify-center items-center mt-10">
            <Text className="text-gray-500">Place not found.</Text>
          </View>
        )}
      </ScrollView>
    </SSContainer>
  );
}
