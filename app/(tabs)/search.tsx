import { View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SSText } from '@/components/ui/SSText';
import SSLinearBackground from '@/components/ui/SSLinearBackground';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import SearchInput from '@/components/ui/SearchInput';
import { IRecommendedPlace } from '@/dto/recommendations/recommendation.dto';
import { getRecommendations } from '@/api/recommendations/endpoints';
import useLocation from '@/hooks/useLocation';
import SSContainer from '@/components/SSContainer';

export default function SearchTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [places, setPlaces] = useState<IRecommendedPlace[]>([]);

  const { location } = useLocation();

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await getRecommendations({
        latitude: location?.latitude || -37.8136,
        longitude: location?.longitude || 144.9631,
      });
      setPlaces(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [searchQuery]);

  return (
    <>
      <SSContainer>
        <ScrollView showsVerticalScrollIndicator className="px-4">
          <SearchInput value={searchQuery} onTextChange={setSearchQuery} />
          {/* <SSText>Search</SSText> */}
        </ScrollView>
      </SSContainer>
    </>
  );
}
