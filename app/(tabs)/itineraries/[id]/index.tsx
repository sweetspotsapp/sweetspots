import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MapPin,
  Calendar,
  Share2,
  Clock,
  DollarSign,
  EditIcon,
  Plus,
  Bell,
} from 'lucide-react-native';
import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { SSText } from '@/components/ui/SSText';
import SSLinearGradient from '@/components/ui/SSLinearGradient';
import { getItineraryById } from '@/endpoints/itineraries/endpoints';
import SSSpinner from '@/components/ui/SSSpinner';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import ShareItineraryModal from '@/components/itineraries/ShareItineraryModal';
import { goBack } from '@/utils/goBack';
import SSContainer from '@/components/SSContainer';
import { BackArrowButton } from '@/components/BackArrowButton';
import { IItineraryUser } from '@/dto/itinerary-users/itinerary-user.dto';
import {
  getItineraryCollaborators,
  getTappedInItineraryPlaces,
  tapAllIn,
  tapAllOut,
} from '@/endpoints/collab-itinerary/endpoints';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItineraryMap from '@/components/itinerary-maps/ItineraryMap';
import { IPlace } from '@/dto/places/place.dto';
import PlaceDetailsModal from '@/components/places/PlaceDetailsModal';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { ItineraryTimeline } from '@/components/itineraries/ItineraryTimeline';

export default function ItineraryDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [itinerary, setItinerary] = useState<IItinerary | null>(null);
  const [itineraryUsers, setItineraryUsers] = useState<IItineraryUser[]>([]);
  const [tappedInItineraryPlaces, setTappedInItineraryPlaces] = useState<
    IItineraryPlace[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'places' | 'maps'>('places');
  const [selectedPlace, setSelectedPlace] = useState<IPlace | null>(null);
  const [isUpdatingAllInOut, setIsUpdatingAllInOut] = useState(false);
  const [isLoadingTappedPlaces, setIsLoadingTappedPlaces] = useState(false);

  const isAllIn =
    tappedInItineraryPlaces.length ===
    (itinerary?.itineraryPlaces?.length || 0);
  const user = useAuth().user;

  async function loadTappedInPlaces() {
    if (!user) return;

    setIsLoadingTappedPlaces(true);
    getTappedInItineraryPlaces(id, user.uid)
      .then((res) => {
        setTappedInItineraryPlaces(
          (res.data || []).map((ip) => ({
            ...ip,
            imageUrl: itinerary?.itineraryPlaces?.find(
              (itp) => itp.id === ip.id
            )?.imageUrl,
          }))
        );
      })
      .finally(() => {
        setIsLoadingTappedPlaces(false);
      });
  }

  useEffect(() => {
    loadTappedInPlaces();
  }, [user]);

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
      const collaboratorsRes = await getItineraryCollaborators(id);
      const itineraryCollaborators = collaboratorsRes.data || [];
      setItineraryUsers(itineraryCollaborators);
    } catch (error) {
      console.error('Error loading itinerary:', error);
    } finally {
      setLoading(false);
    }
  };

  const [isSharing, setIsSharing] = useState(false);
  const handleToggleShare = () => {
    setIsSharing((prev) => !prev);
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
          <SSSpinner size="large" className="mb-4" />
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
            className="text-2xl text-orange-600 text-center mb-3"
          >
            Itinerary not found
          </SSText>
          <SSText className="text-base text-slate-500 text-center leading-6 mb-8">
            The itinerary you're looking for doesn't exist or has been removed.
          </SSText>
          <TouchableOpacity
            className="bg-orange-600 px-6 py-3 rounded-xl"
            onPress={() => goBack('/itineraries')}
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

  const itineraryUser = itineraryUsers?.find((iu) => iu.userId === user?.uid);
  const isOwner = itineraryUser?.role === 'owner';
  const isEditor = itineraryUser?.role === 'editor';

  function handleSelectPlace(place: IPlace) {
    setSelectedPlace(place);
  }

  function handleAllInToggle() {
    if (!itinerary) return;
    setIsUpdatingAllInOut(true);
    if (isAllIn) {
      tapAllOut(itinerary.id, user?.uid || '')
        .then(() => {
          setTappedInItineraryPlaces([]);
          loadTappedInPlaces();
        })
        .finally(() => setIsUpdatingAllInOut(false));
    } else {
      tapAllIn(itinerary.id, user?.uid || '')
        .then(() => {
          setTappedInItineraryPlaces(itinerary.itineraryPlaces || []);
          loadTappedInPlaces();
        })
        .finally(() => setIsUpdatingAllInOut(false));
    }
  }

  return (
    <>
      <PlaceDetailsModal
        visible={selectedPlace !== null}
        onClose={() => setSelectedPlace(null)}
        place={selectedPlace as IPlace}
      />
      <ShareItineraryModal
        visible={isSharing}
        onClose={handleToggleShare}
        itinerary={itinerary}
        onFinished={loadItinerary}
      />
      <SSContainer>
        <Button
          disabled={isUpdatingAllInOut}
          variant={isAllIn ? 'outline' : 'default'}
          className="absolute z-50 bottom-24 left-5 right-5 shadow-lg"
          onPress={handleAllInToggle}
        >
          <SSText variant="semibold">I'm All {isAllIn ? 'Out' : 'In'}!</SSText>
        </Button>
        {/* Header */}
        <View className="flex-row justify-between items-center  pt-2.5 pb-4">
          <BackArrowButton fallbackUrl="/itineraries" forceFallback />

          <View className="flex-row gap-3">
            {isOwner && (
              <>
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
                  onPress={handleToggleShare}
                >
                  <Share2 size={24} className="text-orange-500" />
                </TouchableOpacity>
                <TouchableOpacity
                  className="w-11 h-11 rounded-full bg-white justify-center items-center shadow-sm"
                  onPress={handleEditItinerary}
                >
                  <EditIcon size={24} className="text-orange-500" />
                </TouchableOpacity>
              </>
            )}
            <Link href={`/itineraries/${id}/notifications`}>
              <TouchableOpacity className="w-11 h-11 rounded-full bg-orange-600 justify-center items-center shadow-sm">
                <Bell size={24} className="text-white" />
              </TouchableOpacity>
            </Link>
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
          <View className="">
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
              <View className="flex-row items-center bg-orange-50 px-4 py-3 rounded-xl mb-6 gap-3">
                <Calendar size={20} className="text-orange-500" />
                <View className="flex-1">
                  <SSText
                    variant="semibold"
                    className="text-base text-orange-600"
                  >
                    {formatDate(itinerary.startDate)} -{' '}
                    {formatDate(itinerary.endDate)}
                  </SSText>
                  <SSText className="text-sm text-orange-700">
                    {tripDays} days
                  </SSText>
                </View>
              </View>
            )}

            {/* Trip Summary */}
            {/* {(itinerary.totalEstimatedCost || itinerary.totalDuration) && (
              <View className="mb-8">
                <SSText
                  variant="semibold"
                  className="text-xl text-gray-800 mb-4"
                >
                  Trip Summary
                </SSText>
                <View className="grid grid-cols-2 gap-4">
                  {itinerary.totalEstimatedCost && (
                    <Card className="p-4 justify-center items-center">
                      <DollarSign size={20} className="text-orange-500" />
                      <SSText
                        variant="bold"
                        className="text-xl text-gray-800 mt-2 mb-1"
                      >
                        {formatCurrency(itinerary.minEstimatedCost)} -{' '}
                        {formatCurrency(itinerary.maxEstimatedCost)}
                      </SSText>
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        Total Cost
                      </SSText>
                    </Card>
                  )}

                  {itinerary.totalDuration && (
                    <Card className="p-4 justify-center items-center">
                      <Clock size={20} color="#0ea5e9" />
                      <SSText
                        variant="bold"
                        className="text-xl text-gray-800 mt-2 mb-1 text-center"
                      >
                        {formatDuration({ hours: itinerary.totalDuration })}
                      </SSText>
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500 text-center"
                      >
                        Total Time
                      </SSText>
                    </Card>
                  )}

                  <Card className="p-4 justify-center items-center">
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
                  </Card>

                  {tripDays > 0 && itinerary.totalEstimatedCost && (
                    <Card className="p-4 justify-center items-center">
                      <Calendar size={20} color="#8b5cf6" />
                      <SSText
                        variant="bold"
                        className="text-xl text-gray-800 mt-2 mb-1"
                      >
                        {formatCurrency(
                          Number(itinerary.minEstimatedCost) / tripDays
                        )}{' '}
                        -{' '}
                        {formatCurrency(
                          Number(itinerary.maxEstimatedCost) / tripDays
                        )}
                      </SSText>
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        Per Day
                      </SSText>
                    </Card>
                  )}
                </View>
              </View>
            )} */}

            {/* Collaborators */}
            {/* {(itinerary.collaborators || []).length > 0 && (
              <View className="mb-8">
                <SSText
                  variant="semibold"
                  className="text-xl text-gray-800 mb-4"
                >
                  Collaborators
                </SSText>
                <View className="flex-row flex-wrap gap-3">
                  {(itinerary.collaborators || []).map(
                    (collaborator, index) => (
                      <View
                        key={index}
                        className="flex-row items-center bg-slate-100 px-3 py-2 rounded-full gap-2"
                      >
                        <View className="w-6 h-6 rounded-full bg-orange-600 justify-center items-center">
                          <SSText
                            variant="semibold"
                            className="text-xs text-white"
                          >
                            {collaborator.charAt(0).toUpperCase()}
                          </SSText>
                        </View>
                        <SSText
                          variant="medium"
                          className="text-xs text-slate-500"
                        >
                          {collaborator}
                        </SSText>
                      </View>
                    )
                  )}
                </View>
              </View>
            )} */}
            {isLoadingTappedPlaces ? (
              <SSSpinner />
            ) : (
              <Tabs value={tab} onValueChange={(value) => setTab(value as any)} className='mb-4'>
                <View className="md:flex-row md:items-center gap-2 justify-between">
                  <TabsList>
                    <TabsTrigger value="places">
                      <SSText>Spots</SSText>
                    </TabsTrigger>
                    <TabsTrigger value="maps">
                      <SSText>Maps</SSText>
                    </TabsTrigger>
                  </TabsList>
                  <View className="flex-row w-full md:w-fit justify-between">
                    {!isOwner ? (
                      <Link
                        href={`/itineraries/${id}/your-suggestions`}
                        asChild
                      >
                        <Button variant="ghost">
                          <SSText>Your Suggestions</SSText>
                        </Button>
                      </Link>
                    ) : (
                      <Link
                        href={`/itineraries/${id}/place-suggestions`}
                        asChild
                      >
                        <Button variant="ghost">
                          <SSText>See Chiller's Suggestions</SSText>
                        </Button>
                      </Link>
                    )}
                    <Link href={`/itineraries/${id}/add-places`} asChild>
                      <Button>
                        <Plus size={16} className="text-white" />
                        <SSText>{isEditor ? 'Suggest' : 'Add'} New Spot</SSText>
                      </Button>
                    </Link>
                  </View>
                </View>
                <TabsContent value="places">
                  <ItineraryTimeline
                    itinerary={itinerary}
                    handleSelectPlace={handleSelectPlace}
                    tappedInItineraryPlaces={tappedInItineraryPlaces}
                  />
                  {/* <View className="mb-10 gap-4">
                  {itinerary.itineraryPlaces?.map((place, index) => (
                    <TouchableOpacity
                      key={place.id}
                      onPress={() => {
                        handleSelectPlace(place.place!);
                      }}
                    >
                      <ItineraryPlaceCard
                        index={index}
                        place={place}
                        tappedIn={tappedInItineraryPlaces
                          .map((ip) => ip.id)
                          .includes(place.id)}
                      />
                    </TouchableOpacity>
                  ))}
                </View> */}
                </TabsContent>
                <TabsContent value="maps">
                  {/* TODO: should be just places that we tap in */}
                  <ItineraryMap
                    itineraryId={id}
                    itineraryPlaces={tappedInItineraryPlaces}
                    onPressPlace={handleSelectPlace}
                  />
                </TabsContent>
              </Tabs>
            )}
          </View>
        </ScrollView>
      </SSContainer>
    </>
  );
}
