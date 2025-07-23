import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Share2,
  Navigation,
  Star,
  Clock,
  DollarSign,
  EditIcon,
} from 'lucide-react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { getItineraries } from '@/utils/storage';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { Card, CardContent } from '@/components/ui/card';
import { getItineraryById } from '@/api/itineraries/endpoints';
import { IItinerary } from '@/api/itineraries/dto/itinerary.dto';
import { formatCurrency, formatDuration } from '@/utils/formatter';

export default function ItineraryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   loadItinerary();
  // }, [id]);

  const onFocus = useCallback(() => {
    loadItinerary();
  }, [id]);

  useFocusEffect(onFocus);

  const loadItinerary = async () => {
    try {
      const response = await getItineraryById(id as string);
      if (response.success && response.data) {
        setItinerary(response.data);
      } else {
        console.error('Failed to fetch itinerary:', response.message);
      }
    } catch (error) {
      console.error('Error loading itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShareItinerary = () => {
    Alert.alert(
      'Share Itinerary',
      'Share this itinerary with friends and family',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share Link', onPress: () => console.log('Share link') },
        { text: 'Invite People', onPress: () => console.log('Invite people') },
      ]
    );
  };

  const handleEditItinerary = () => {
    router.push(`/itineraries/${id}/edit`);
  };

  const handleNavigateToPlace = (place: any) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`;
    console.log('Navigate to:', place.name);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDurationInDays = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1">
        <SSLinearGradient />
        <View className="flex-1 justify-center items-center">
          <SSText className="text-lg text-slate-500">
            Loading itinerary...
          </SSText>
        </View>
      </SafeAreaView>
    );
  }

  if (!itinerary) {
    return (
      <SafeAreaView className="flex-1">
        <SSLinearGradient />
        <View className="flex-1 justify-center items-center px-10">
          <SSText
            variant="bold"
            className="text-2xl text-emerald-600 text-center mb-3"
          >
            Itinerary not found
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6 mb-8">
            The itinerary you're looking for doesn't exist or has been removed.
          </SSText>
          <TouchableOpacity
            className="bg-emerald-600 px-6 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <SSText variant="semibold" className="text-base text-white">
              Go Back
            </SSText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const tripDays = getDurationInDays(
    itinerary.startDate || undefined,
    itinerary.endDate || undefined
  );

  return (
    <SafeAreaView className="flex-1">
      <SSLinearGradient />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 pt-2.5 pb-4">
        <TouchableOpacity
          className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#10b981" />
        </TouchableOpacity>

        <View className="flex-row gap-3">
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={handleShareItinerary}
          >
            <Share2 size={24} color="#10b981" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
            onPress={handleEditItinerary}
          >
            <EditIcon size={24} color="#10b981" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cover Image */}
        {/* {itinerary.coverImage && (
          <View className="h-50 mx-5 rounded-2xl overflow-hidden mb-5">
            <Image 
              source={{ uri: itinerary.coverImage }} 
              className="w-full h-[300px]"
              style={{ resizeMode: 'contain', borderRadius: 16 }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.6)']}
              className="absolute bottom-0 left-0 right-0 h-1/2"
            />
          </View>
        )} */}

        {/* Itinerary Info */}
        <View className="px-5">
          <SSText variant="bold" className="text-3xl text-gray-800 mb-3">
            {itinerary.name}
          </SSText>

          {itinerary.description && (
            <SSText className="text-base text-slate-500 leading-6 mb-5">
              {itinerary.description}
            </SSText>
          )}

          {/* Trip Dates */}
          {itinerary.startDate && itinerary.endDate && (
            <View className="flex-row items-center bg-emerald-50 px-4 py-3 rounded-xl mb-6 gap-3">
              <Calendar size={20} color="#10b981" />
              <View className="flex-1">
                <SSText
                  variant="semibold"
                  className="text-base text-emerald-600"
                >
                  {formatDate(itinerary.startDate)} -{' '}
                  {formatDate(itinerary.endDate)}
                </SSText>
                <SSText className="text-sm text-emerald-700">
                  {tripDays} days
                </SSText>
              </View>
            </View>
          )}

          {/* Trip Summary */}
          {(itinerary.totalEstimatedCost || itinerary.totalDuration) && (
            <View className="mb-8">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-4">
                Trip Summary
              </SSText>
              <View className="flex-row flex-wrap gap-4">
                {itinerary.totalEstimatedCost && (
                  <View className="flex-1 min-w-[45%] items-center bg-white p-4 rounded-xl shadow-sm">
                    <DollarSign size={20} color="#10b981" />
                    <SSText
                      variant="bold"
                      className="text-xl text-gray-800 mt-2 mb-1"
                    >
                      {formatCurrency(itinerary.totalEstimatedCost)}
                    </SSText>
                    <SSText variant="medium" className="text-xs text-slate-500">
                      Total Cost
                    </SSText>
                  </View>
                )}

                {itinerary.totalDuration && (
                  <View className="flex-1 min-w-[45%] items-center bg-white p-4 rounded-xl shadow-sm">
                    <Clock size={20} color="#0ea5e9" />
                    <SSText
                      variant="bold"
                      className="text-xl text-gray-800 mt-2 mb-1"
                    >
                      {formatDuration({ hours: itinerary.totalDuration })}
                    </SSText>
                    <SSText variant="medium" className="text-xs text-slate-500">
                      Total Time
                    </SSText>
                  </View>
                )}

                <View className="flex-1 min-w-[45%] items-center bg-white p-4 rounded-xl shadow-sm">
                  <MapPin size={20} color="#f59e0b" />
                  <SSText
                    variant="bold"
                    className="text-xl text-gray-800 mt-2 mb-1"
                  >
                    {itinerary.placesCount}
                  </SSText>
                  <SSText variant="medium" className="text-xs text-slate-500">
                    Places
                  </SSText>
                </View>

                {tripDays > 0 && itinerary.totalEstimatedCost && (
                  <View className="flex-1 min-w-[45%] items-center bg-white p-4 rounded-xl shadow-sm">
                    <Calendar size={20} color="#8b5cf6" />
                    <SSText
                      variant="bold"
                      className="text-xl text-gray-800 mt-2 mb-1"
                    >
                      {formatCurrency(
                        Number(itinerary.totalEstimatedCost) / tripDays
                      )}
                    </SSText>
                    <SSText variant="medium" className="text-xs text-slate-500">
                      Per Day
                    </SSText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Collaborators */}
          {(itinerary.collaborators || []).length > 0 && (
            <View className="mb-8">
              <SSText variant="semibold" className="text-xl text-gray-800 mb-4">
                Collaborators
              </SSText>
              <View className="flex-row flex-wrap gap-3">
                {(itinerary.collaborators || []).map((collaborator, index) => (
                  <View
                    key={index}
                    className="flex-row items-center bg-slate-100 px-3 py-2 rounded-full gap-2"
                  >
                    <View className="w-6 h-6 rounded-full bg-emerald-600 justify-center items-center">
                      <SSText variant="semibold" className="text-xs text-white">
                        {collaborator.charAt(0).toUpperCase()}
                      </SSText>
                    </View>
                    <SSText variant="medium" className="text-xs text-slate-500">
                      {collaborator}
                    </SSText>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Places List */}
          <View className="mb-10 gap-4">
            <SSText variant="semibold" className="text-xl text-gray-800">
              Places to Visit
            </SSText>

            {itinerary.itineraryPlaces?.map((place, index) => (
              <Card key={place.id}>
                <CardContent>
                  <View className="flex-row items-start mb-3">
                    <View className="w-8 h-8 rounded-full bg-emerald-600 justify-center items-center mr-3 mt-1">
                      <SSText variant="bold" className="text-sm text-white">
                        {place.orderIndex || index + 1}
                      </SSText>
                    </View>
                    {place.imageUrl && (
                      <Image
                        source={{ uri: place.imageUrl }}
                        className="w-20 h-20 rounded-xl mr-3"
                        style={{ resizeMode: 'cover' }}
                      />
                    )}

                    <View className="flex-1">
                      <SSText
                        variant="semibold"
                        className="text-lg text-gray-800 mb-1"
                      >
                        {place.place?.name}
                      </SSText>
                      <SSText
                        className="text-sm text-slate-500 leading-5"
                        numberOfLines={2}
                      >
                        {place.place?.description}
                      </SSText>
                    </View>

                    <TouchableOpacity
                      className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-600 justify-center items-center ml-2 mt-1"
                      onPress={() => handleNavigateToPlace(place)}
                    >
                      <Navigation size={20} color="#10b981" />
                    </TouchableOpacity>
                  </View>

                  {/* Schedule Info */}
                  {(place.visitDate ||
                    place.visitTime ||
                    place.visitDuration ||
                    place.estimatedCost) && (
                    <View className="flex-row flex-wrap gap-3 mb-3 px-3 py-2 bg-slate-50 rounded-lg">
                      {place.visitDate && (
                        <View className="flex-row items-center gap-1">
                          <Calendar size={14} color="#64748b" />
                          <SSText className="text-xs text-slate-500">
                            {place.visitDate}
                          </SSText>
                        </View>
                      )}
                      {place.visitTime && (
                        <View className="flex-row items-center gap-1">
                          <Clock size={14} color="#64748b" />
                          <SSText className="text-xs text-slate-500">
                            {place.visitTime}
                          </SSText>
                        </View>
                      )}
                      {place.visitDuration && (
                        <View className="flex-row items-center gap-1">
                          <Clock size={14} color="#64748b" />
                          <SSText className="text-xs text-slate-500">
                            {formatDuration({ hours: place.visitDuration })}
                          </SSText>
                        </View>
                      )}
                      {place.estimatedCost && (
                        <View className="flex-row items-center gap-1">
                          <DollarSign size={14} color="#64748b" />
                          <SSText className="text-xs text-slate-500">
                            {formatCurrency(place.estimatedCost)}
                          </SSText>
                        </View>
                      )}
                    </View>
                  )}

                  <View className="flex-row gap-3 mb-3">
                    <View className="flex-row items-center gap-1">
                      <Star size={14} color="#fbbf24" fill="#fbbf24" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {place?.place?.rating}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={14} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {place.place?.distance}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <DollarSign size={14} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {place.place?.priceRange}
                      </SSText>
                    </View>
                  </View>

                  {/* VIBES */}
                  {/* <View className="flex-row flex-wrap gap-1.5 items-center mb-2">
                    {place.vibes.slice(0, 3).map((vibe, vibeIndex) => (
                      <View key={vibeIndex} className="bg-emerald-50 border border-emerald-600 px-2 py-1 rounded-xl">
                        <SSText variant="medium" className="text-xs text-emerald-600">
                          {vibe}
                        </SSText>
                      </View>
                    ))}
                    {place.vibes.length > 3 && (
                      <SSText variant="medium" className="text-xs text-slate-500">
                        +{place.vibes.length - 3}
                      </SSText>
                    )}
                  </View> */}

                  {place.notes && (
                    <View className="bg-amber-50 p-3 rounded-lg mt-2">
                      <SSText
                        variant="semibold"
                        className="text-xs text-amber-800 mb-1"
                      >
                        Notes:
                      </SSText>
                      <SSText className="text-sm text-amber-800 leading-5">
                        {place.notes}
                      </SSText>
                    </View>
                  )}
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
