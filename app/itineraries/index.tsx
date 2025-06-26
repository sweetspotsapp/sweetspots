import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Users, MapPin, Clock, DollarSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { IItinerary } from '@/api/itineraries/dto/itinerary.dto';
import { getMyItineraries } from '@/api/itineraries/endpoints';

export default function ItinerariesScreen() {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    const res = await getMyItineraries();
    setItineraries(res.data?.data ?? []);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(0)}`;
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    return `${wholeHours}h ${minutes}min`;
  };

  const getDurationInDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const renderItinerary = ({ item }: { item: IItinerary }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-sm"
      onPress={() => router.push(`/itineraries/${item.id}`)}>
      {item.coverImage && (
        <Image source={{ uri: item.coverImage }} className="w-full h-40" style={{ resizeMode: 'cover' }} />
      )}
      
      <View className="p-5">
        <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
          {item.name}
        </SSText>
        {item.description && (
          <SSText className="text-sm text-slate-500 leading-5 mb-4" numberOfLines={2}>
            {item.description}
          </SSText>
        )}
        
        {/* Trip Dates */}
        {item.startDate && item.endDate && (
          <View className="flex-row items-center bg-emerald-50 px-3 py-2 rounded-xl mb-4 gap-2">
            <Calendar size={14} color="#10b981" />
            <SSText variant="medium" className="text-sm text-emerald-600 flex-1">
              {formatDate(item.startDate)} - {formatDate(item.endDate)}
            </SSText>
            <SSText variant="semibold" className="text-xs text-emerald-600 bg-white px-2 py-1 rounded-lg">
              {getDurationInDays(item.startDate, item.endDate)} days
            </SSText>
          </View>
        )}
        
        {/* Trip Summary */}
        <View className="flex-row gap-4 mb-4 pb-4 border-b border-slate-100">
          <View className="flex-row items-center gap-1.5">
            <MapPin size={14} color="#64748b" />
            <SSText variant="semibold" className="text-sm text-gray-800">
              {/* {item.places.length} places */}
            </SSText>
          </View>
          
          {item.totalDuration && (
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color="#64748b" />
              <SSText variant="semibold" className="text-sm text-gray-800">
                {formatDuration(item.totalDuration)}
              </SSText>
            </View>
          )}
          
          {item.totalEstimatedCost && (
            <View className="flex-row items-center gap-1.5">
              <DollarSign size={14} color="#64748b" />
              <SSText variant="semibold" className="text-sm text-gray-800">
                {formatCurrency(Number(item.totalEstimatedCost))}
              </SSText>
            </View>
          )}
        </View>
        
        <View className="flex-row flex-wrap gap-4">
          <View className="flex-row items-center gap-1.5">
            <Calendar size={16} color="#64748b" />
            <SSText variant="medium" className="text-xs text-slate-500">
              Created {formatDate(item.createdAt)}
            </SSText>
          </View>
          
          {/* {item.collaborators.length > 0 && (
            <View className="flex-row items-center gap-1.5">
              <Users size={16} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {item.collaborators.length} collaborators
              </SSText>
            </View>
          )} */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1">
      <SSLinearGradient />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-5">
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
          onPress={() => router.back()}>
          <ArrowLeft size={24} color="#10b981" />
        </TouchableOpacity>
        <SSText variant="bold" className="text-2xl text-emerald-600">
          My Itineraries
        </SSText>
        <View className="w-11" />
      </View>

      {/* Itineraries List */}
      <FlatList
        data={itineraries}
        renderItem={renderItinerary}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center pt-25 px-10">
            <SSText variant="bold" className="text-2xl text-emerald-600 text-center mb-3">
              No itineraries yet
            </SSText>
            <SSText className="text-base text-slate-500 text-center leading-6">
              Create your first itinerary by selecting places from your saved collection!
            </SSText>
          </View>
        }
      />
    </SafeAreaView>
  );
}