import { View } from 'react-native';
import React, { useState } from 'react';
import { SSText } from '@/components/ui/SSText';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import SearchInput from '@/components/ui/SearchInput';

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <SSLinearBackground>
        <SafeAreaView className="flex-1 container mx-auto mt-4">
          <ScrollView showsVerticalScrollIndicator className='px-4'>
            <SearchInput value={searchQuery} onTextChange={setSearchQuery} />
            <SSText>Search</SSText>
          </ScrollView>
        </SafeAreaView>
      </SSLinearBackground>
    </>
  );
}
