import { View, Text } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { IPlace } from '@/dto/places/place.dto';
import { getPlaceById } from '@/endpoints/places/endpoints';
import SSContainer from '@/components/SSContainer';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import SSSpinner from '@/components/ui/SSSpinner';
import { PlaceDetails } from '@/components/placeSwipes/PlaceDetails';
import { BackArrowButton } from '@/components/BackArrowButton';
import { SSText } from '@/components/ui/SSText';
import { useAuth } from '@/hooks/useAuth';
import { useRecContextCache } from '@/store/useRecContextCache';
import { getRecContext } from '@/endpoints/recommendations/endpoints';
import { TWO_DAYS_MS } from '@/components/placeSwipes/PlaceCard';

export default function PlaceDetailsScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();

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

  const [isLoadingContext, setIsLoadingContext] = useState(false);

  const [context, setContext] = useState<string | null>(null);
  const user = useAuth().user;

  useEffect(() => {
    if (!user || !place?.id) return;

    const cache = useRecContextCache.getState();
    const isFresh = cache.isFresh(user.uid, place.id, TWO_DAYS_MS);

    if (isFresh) {
      const cached = cache.get(user.uid, place.id);
      if (cached) {
        setContext(cached.content);
        return;
      }
    }

    setIsLoadingContext(true);
    getRecContext({ userId: user.uid, placeId: place.id })
      .then((res) => {
        if (res?.data) {
          setContext(res.data);
          cache.set(user.uid, place.id, res.data, new Date());
        }
      })
      .catch((err) => {
        console.error('Failed to load rec context:', err);
      })
      .finally(() => {
        setIsLoadingContext(false);
      });
  }, [place?.id, user?.uid]);

  return (
    <SSContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center  pt-2.5 pb-4">
          <BackArrowButton
            fallbackUrl={(from as any) || '/saved'}
            forceFallback
          />
        </View>
        {loading ? (
          <SSSpinner />
        ) : place ? (
          <>
            <SSText variant="bold" className="text-3xl text-gray-800 mb-3">
              {place?.name}
            </SSText>
            {isLoadingContext ? (
              <SSSpinner className="mb-4" />
            ) : context ? (
              <>
                <View className="p-4 bg-white border border-orange-400 rounded-xl mb-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <SSText
                      variant="semibold"
                      className="text-base text-muted-foreground"
                    >
                      Why should you visit?
                    </SSText>
                  </View>
                  <SSText className="text-sm">{context}</SSText>
                </View>
              </>
            ) : null}
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
