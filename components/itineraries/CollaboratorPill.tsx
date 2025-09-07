import { View, TouchableOpacity } from 'react-native';
import React from 'react';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { Mail, User, X } from 'lucide-react-native';
import { SSText } from '../ui/SSText';

interface CollaboratorPillProps {
  collaborator: string;
  profile?: IUserProfile;
  onRemove?: (collaborator: string) => void;
}

export default function CollaboratorPill({
  collaborator,
  profile,
  onRemove,
}: CollaboratorPillProps) {
  const identity = profile?.username || profile?.email || collaborator;
  return (
    <View className="flex-row items-center bg-orange-50 border border-orange-600 px-3 py-1.5 rounded-2xl gap-1.5">
      {collaborator.includes('@') ? (
        <Mail size={14} className="text-orange-500" />
      ) : (
        <User size={14} className="text-orange-500" />
      )}
      <SSText variant="medium" className="text-xs text-orange-600">
        {collaborator}
      </SSText>
      {onRemove && (
        <TouchableOpacity onPress={() => onRemove(collaborator)}>
          <X size={14} color="#f43f5e" />
        </TouchableOpacity>
      )}
    </View>
  );
}
