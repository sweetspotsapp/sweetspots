import { View } from 'react-native'
import React from 'react'
import { Search } from 'lucide-react-native'
import { TextInput } from 'react-native-gesture-handler'

type SearchInputProps = {
    value: string
    onTextChange: (query: string) => void
    placeholder?: string
}

export default function SearchInput({
    value,
    onTextChange,
    placeholder = "Search saved places...",
}: SearchInputProps) {
    return (
        <View className="flex-row items-center bg-white mb-5 px-4 py-3 rounded-xl gap-3 shadow-sm">
            <Search size={20} color="#64748b" />
            <TextInput
                className="flex-1 text-base text-gray-800"
                placeholder={placeholder}
                value={value}
                onChangeText={onTextChange}
                placeholderTextColor="#94a3b8"
            />
        </View>
    )
}