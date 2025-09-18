import { TouchableOpacity } from 'react-native';
import React from 'react';
import { ArrowLeft } from 'lucide-react-native';
import { goBack, RoutePath } from '@/utils/goBack';

type SSBackButtonProps = {
  fallbackUrl?: RoutePath;
};

export default function SSBackButton({ fallbackUrl }: SSBackButtonProps) {
  return (
    <TouchableOpacity
      className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
      onPress={() => goBack((fallbackUrl as RoutePath) || '/', false)}
    >
      <ArrowLeft size={24} className="text-orange-500" />
    </TouchableOpacity>
  );
}
