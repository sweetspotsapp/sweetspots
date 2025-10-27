import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { IUserNotification } from '@/dto/notifications/notification.dto';
import { getUserNotifications } from '@/endpoints/notifications/endpoints';
import SSContainer from '@/components/SSContainer';
import { SSText } from '@/components/ui/SSText';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { getItineraryById } from '@/endpoints/itineraries/endpoints';
import { FlatList } from 'react-native-gesture-handler';
import NotificationCard from '@/components/notifications/NotificationCard';
import SSSpinner from '@/components/ui/SSSpinner';
import SSBackButton from '@/components/SSBackButton';

export default function ItineraryNotifications() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const [isLoadingItinerary, setIsLoadingItinerary] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [notifications, setNotifications] = useState<IUserNotification[]>([]);

  useEffect(() => {
    if (!id) return;
    setIsLoadingItinerary(false);
    getItineraryById(id)
      .then((res) => {
        setItinerary(res.data || null);
      })
      .finally(() => {
        setIsLoadingItinerary(false);
      });
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    getUserNotifications({
      itineraryId: id,
      limit: 30,
      page: 1,
    })
      .then((res) => {
        setNotifications(res.data || []);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <SSContainer>
      {isLoading || isLoadingItinerary ? (
        <SSSpinner />
      ) : (
        <>
          <View className="pb-4 pt-2.5">
            <SSBackButton />
            <SSText variant="bold" className="text-3xl text-orange-600 mt-3">
              Notifications
            </SSText>
            <SSText className="text-xl text-muted-foreground">
              for {itinerary?.name}
            </SSText>
            {/* {Platform.OS === 'web' ? (
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
              onPress={loadItineraries}
            >
              <RefreshCcw size={24} className="text-orange-500" />
            </TouchableOpacity>
          ) : (
            <View className="w-11" />
          )} */}
          </View>
          <FlatList
            data={notifications}
            renderItem={({ item }) => <NotificationCard notification={item} />}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="!gap-4"
            columnWrapperClassName="gap-4"
            className="gap-4"
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center pt-25 px-10">
                <SSText className="text-2xl text-orange-600 text-center mb-3 font-bold">
                  No notifications yet
                </SSText>
                <SSText className="text-base text-slate-500 text-center leading-6">
                  You have no notifications at the moment.
                </SSText>
              </View>
            }
          />
        </>
      )}
    </SSContainer>
  );
}
