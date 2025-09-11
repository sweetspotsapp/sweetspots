import React from 'react';
import { View } from 'react-native';
import { SSText } from './SSText';

type VibePillProps = {
    vibe: string;
    className?: string;
};

export default function VibePill({ vibe, className }: VibePillProps) {
    return (
        <View className={`bg-white border border-orange-600 px-3 py-1.5 rounded-2xl ${className ?? ''}`}>
            <SSText variant="medium" className="text-xs text-orange-600">
                {vibe}
            </SSText>
        </View>
    );
}