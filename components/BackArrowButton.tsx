import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Link } from 'expo-router';
import { goBack } from '@/utils/goBack';

export type RoutePath = React.ComponentProps<typeof Link>['href'];

type BackArrowButtonProps = {
    fallbackUrl: RoutePath;
    forceFallback?: boolean;
};

export const BackArrowButton: React.FC<BackArrowButtonProps> = ({
    fallbackUrl,
    forceFallback = false,
}) => (
    <TouchableOpacity
        className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
        onPress={() => goBack(fallbackUrl, forceFallback)}
        accessibilityLabel="Go back"
    >
        <ArrowLeft size={24} className="text-orange-500" />
    </TouchableOpacity>
);