import { View, Text } from 'react-native';
import React from 'react';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function ProfileAvatar({ user }: { user: IUserProfile }) {
  return (
    <Avatar alt={`${user.firstName} ${user.lastName}'s Avatar`}>
      {user.avatarUrl && <AvatarImage source={{ uri: user.avatarUrl }} />}
      <AvatarFallback>
        <Text>
          {user.firstName?.charAt(0)}
          {user.lastName?.charAt(0)}
        </Text>
      </AvatarFallback>
    </Avatar>
  );
}
