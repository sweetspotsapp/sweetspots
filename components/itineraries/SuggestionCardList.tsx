import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { getUserProfileById } from '@/api/users/endpoints';

export type Suggestion = {
    id: string;
    value: string;
    uid: string;
    userName?: string;
};

type SuggestionCardListProps = {
    suggestions: Suggestion[];
    title: string;
    onSuggestionStatusChange: (id: string, action: 'accepted' | 'rejected') => void;
};

const SuggestionCard: React.FC<{
    suggestion: Suggestion;
    onSuggestionStatusChange: (id: string, action: 'accepted' | 'rejected') => void;
}> = ({ suggestion, onSuggestionStatusChange }) => {
    const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);

    useEffect(() => {
        if (suggestion.uid && !suggestion.userName) {
            const fetchUserProfile = async () => {
                const profile = await getUserProfileById(suggestion.uid);
                if (profile.data) setUserProfile(profile.data);
            };
            fetchUserProfile();
        }
    }, [suggestion]);

    const userName = suggestion.userName || (userProfile ? userProfile.firstName : null);

    return (
        <View
            key={suggestion.id}
            className="flex-row items-center gap-2 mb-2"
        >
            {userName && (
                <SSText className="text-sm text-gray-600">
                    Suggested by {userName}
                </SSText>
            )}
            <SSText className="text-sm text-gray-600">{suggestion.value}</SSText>
            <Button
                variant="outline"
                size="sm"
                onPress={() => onSuggestionStatusChange(suggestion.id, 'accepted')}
            >
                Accept
            </Button>
            <Button
                variant="outline"
                size="sm"
                onPress={() => onSuggestionStatusChange(suggestion.id, 'rejected')}
            >
                Reject
            </Button>
        </View>
    );
};

const SuggestionCardList: React.FC<SuggestionCardListProps> = ({
    suggestions,
    onSuggestionStatusChange,
    title
}) => {
    if (suggestions.length === 0) return null;

    return (
        <View className="mb-4">
            <SSText variant="semibold" className="text-base text-gray-800 mb-2">
                {title}
            </SSText>
            {suggestions.map((suggestion) => (
                <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onSuggestionStatusChange={onSuggestionStatusChange}
                />
            ))}
        </View>
    );
};

export default SuggestionCardList;