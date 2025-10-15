import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  RefreshCcw,
  Plus,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { SSText } from '@/components/ui/SSText';
import { getMyItineraries } from '@/endpoints/itineraries/endpoints';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { formatCurrency } from '@/utils/formatter';
import SSSpinner from '@/components/ui/SSSpinner';
import { Button } from '@/components/ui/button';
import { CreateItineraryModal } from '@/components/itineraries/CreateItineraryModal';
import SSContainer from '@/components/SSContainer';
import { Card } from '@/components/ui/card';

export default function ItinerariesScreen() {
  const [itineraries, setItineraries] = useState<IItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadItineraries();
  }, []);

  const loadItineraries = async () => {
    setIsLoading(true);
    try {
      const res = await getMyItineraries();
      setItineraries(res.data?.data ?? []);
    } catch (error) {
      console.error('Error loading itineraries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  const renderItinerary = ({ item }: { item: IItinerary }) => (
    <TouchableOpacity onPress={() => router.push(`/itineraries/${item.id}`)}>
      <Card>
        {item.coverImage && (
          <Image
            source={{ uri: item.coverImage }}
            className="w-full h-40"
            style={{ resizeMode: 'cover' }}
          />
        )}

        <View className="p-5">
          <SSText variant="semibold" className="text-xl text-gray-800 mb-2">
            {item.name}
          </SSText>
          {item.description && (
            <SSText
              className="text-sm text-slate-500 leading-5 mb-4"
              numberOfLines={2}
            >
              {item.description}
            </SSText>
          )}

          {/* Trip Dates */}
          {item.startDate && item.endDate && (
            <View className="flex-row items-center bg-orange-50 px-3 py-2 rounded-xl mb-4 gap-2">
              <Calendar size={14} className="text-orange-500" />
              <SSText
                variant="medium"
                className="text-sm text-orange-600 flex-1"
              >
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </SSText>
              <SSText
                variant="semibold"
                className="text-xs text-orange-600 bg-white px-2 py-1 rounded-lg"
              >
                {getDurationInDays(item.startDate, item.endDate)} days
              </SSText>
            </View>
          )}

          {/* Trip Summary */}
          <View className="flex-row gap-4 mb-4 pb-4 border-b border-slate-100">
            {/* <View className="flex-row items-center gap-1.5">
              <MapPin size={14} color="#64748b" />
              <SSText variant="semibold" className="text-sm text-gray-800">
                {item.places.length} places
              </SSText>
            </View> */}

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
      </Card>
    </TouchableOpacity>
  );

  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateItinerary = () => {
    setShowCreateModal(true);
  };

  const handleCreatedItinerary = () => {
    setShowCreateModal(true);
  };

  return (
    <>
      <CreateItineraryModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreatedItinerary}
        // selectedPlaces={savedPlaces.filter((p) =>
        //   selectedPlaceIds.includes(p.id)
        // )}
      />
      <SSContainer>
        <Button
          className="absolute bottom-24 right-5 shadow-lg z-10 w-fit"
          onPress={handleCreateItinerary}
        >
          <Plus size={24} className="text-white" />
          <SSText variant="semibold">Create Itinerary</SSText>
        </Button>
        {/* Header */}
        <View className="flex-row justify-between items-center pb-4 pt-2.5">
          {/* <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={() => goBack('/profile')}
          >
            <ArrowLeft size={24} className="text-orange-500" />
          </TouchableOpacity> */}
          <SSText variant="bold" className="text-3xl text-orange-600">
            My Trips
          </SSText>
          {Platform.OS === 'web' ? (
            <TouchableOpacity
              className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
              onPress={loadItineraries}
            >
              <RefreshCcw size={24} className="text-orange-500" />
            </TouchableOpacity>
          ) : (
            <View className="w-11" />
          )}
        </View>

        {/* Itineraries List */}
        {isLoading ? (
          <SSSpinner className="mb-4" />
        ) : (
          <FlatList
            data={itineraries}
            renderItem={renderItinerary}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerClassName='gap-4'
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center pt-25 px-10">
                <SSText
                  variant="bold"
                  className="text-2xl text-orange-600 text-center mb-3"
                >
                  No itineraries yet
                </SSText>
                <SSText className="text-base text-slate-500 text-center leading-6">
                  Create your first itinerary by selecting places from your
                  saved collection!
                </SSText>
              </View>
            }
          />
        )}
      </SSContainer>
    </>
  );
}
