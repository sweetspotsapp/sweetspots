import { IUserProfile } from '@/dto/users/user-profile.dto';
import React from 'react';
import { View } from 'react-native';
import { SSText } from '../ui/SSText';
import { Card } from '../ui/card';
import ProfileAvatar from '../user/ProfileAvatar';
import { Check, Undo2, XIcon } from 'lucide-react-native';
import { Button } from '../ui/button';

export default function ShareItineraryUserCard({
  user,
  checked,
  onRemove,
  className,
  isRestore,
}: {
  user: IUserProfile;
  checked?: boolean;
  onRemove?(): void;
  className?: string;
  isRestore?: boolean;
}) {
  return (
    <Card className={`p-2 ${className}`}>
      <View className="flex-row items-center gap-2">
        <ProfileAvatar user={user} />
        <View>
          <SSText>
            {user.firstName} {user.lastName}
          </SSText>
          <SSText className="text-xs text-muted-foreground">
            {user.username}
          </SSText>
        </View>
        {checked && <Check className="ml-auto text-green-400" size={20} />}
        {onRemove && (
          <Button variant="ghost" className="ml-auto" onPress={onRemove}>
            {isRestore ? <Undo2 size={20} /> : <XIcon size={20} />}
          </Button>
        )}
      </View>
    </Card>
  );
}
