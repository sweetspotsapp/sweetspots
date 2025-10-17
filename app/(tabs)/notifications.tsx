import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { IUserNotification } from '@/dto/notifications/notification.dto';
import { getUserNotifications } from '@/endpoints/notifications/endpoints';
import { FlatList } from 'react-native-gesture-handler';
import NotificationCard from '@/components/notifications/NotificationCard';
import SSContainer from '@/components/SSContainer';
import { SSText } from '@/components/ui/SSText';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<IUserNotification[]>([]);

  console.log('notifications', notifications);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await getUserNotifications();
      console.log('fetched notifications', res);
      setNotifications(res.data || []);
    };

    fetchNotifications();
  }, []);

  return (
    <SSContainer>
      <View className="flex-row justify-between items-center pb-4 pt-2.5">
        <SSText variant="bold" className="text-3xl text-orange-600">
          Notifications
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
        renderItem={({ item }) => (
          <View className='mb-4'>
            <NotificationCard notification={item} />
          </View>
      )}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="!gap-4"
        columnWrapperClassName="gap-4"
        className='gap-4'
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center pt-25 px-10">
            <Text className="text-2xl text-orange-600 text-center mb-3 font-bold">
              No notifications yet
            </Text>
            <Text className="text-base text-slate-500 text-center leading-6">
              You have no notifications at the moment.
            </Text>
          </View>
        }
      />
    </SSContainer>
  );
}
