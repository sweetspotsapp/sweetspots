import { View } from 'react-native';
import React from 'react';
import { Card } from '../ui/card';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { Link, router } from 'expo-router';
import { IUserNotification } from '@/dto/notifications/notification.dto';
import { markNotificationAsRead } from '@/endpoints/notifications/endpoints';

export default function NotificationCard({
  notification,
}: {
  notification: IUserNotification;
}) {
  function handleRead() {
    markNotificationAsRead(notification.id);
  }

  function renderAction() {
    switch (notification.type) {
      case 'itinerary-collaboration':
        return (
          <Button
            onPress={() => {
              handleRead();
              router.push(`/itineraries/${notification.data?.itineraryId}`);
            }}
            className="mt-2 self-start"
            size="sm"
          >
            <SSText className="text-sm font-medium">View Itinerary</SSText>
          </Button>
        );
      case 'itinerary-place-suggested':
        return (
          <Button
            onPress={() => {
              handleRead();
              router.push(
                `/itineraries/${notification.data?.itineraryId}`
              );
            }}
            className="mt-2 self-start"
            size="sm"
          >
            <SSText className="text-sm font-medium">View Suggested Place</SSText>
          </Button>
        );
      default:
        return null;
    }
  }

  return (
    <Card
      className={`p-4 mb-3 rounded-2xl border border-border/60 bg-background/70 
      shadow-sm active:scale-[0.98] transition-all`}
    >
      <View className="flex-row justify-between items-start">
        <SSText className="text-lg font-semibold flex-shrink" numberOfLines={2}>
          {notification.title}
        </SSText>
        {!notification.isRead && (
          <View className="w-2.5 h-2.5 bg-primary rounded-full ml-2 mt-1" />
        )}
      </View>

      <SSText
        className="text-muted-foreground mt-1 leading-relaxed"
        numberOfLines={3}
      >
        {notification.message}
      </SSText>

      {notification.sentAt && (
        <SSText className="text-xs text-muted-foreground mt-3">
          {new Date(notification.sentAt).toLocaleString()}
        </SSText>
      )}

      {renderAction()}
    </Card>
  );
}
