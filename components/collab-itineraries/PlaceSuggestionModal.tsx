import { View, Modal } from 'react-native';
import React, { useEffect, useState } from 'react';
import { IPlace } from '@/dto/places/place.dto';
import ModalHeader from '../ui/ModalHeader';
import SSContainer from '../SSContainer';
import { PlaceDetails } from '../placeSwipes/PlaceDetails';
import { ScrollView } from 'react-native-gesture-handler';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { getUserProfileById } from '@/endpoints/users/endpoints';
import ProfileAvatar from '../user/ProfileAvatar';
import SSSpinner from '../ui/SSSpinner';
import ItineraryPlaceStatus from './ItineraryPlaceStatus';
import { useAuth } from '@/hooks/useAuth';
import { CheckCircle, XCircle, XCircleIcon } from 'lucide-react-native';
import { AlertDialog } from '../ui/AlertDialog';
import { updateItineraryPlace } from '@/endpoints/itinerary-places/endpoints';
import { ItineraryPlaceSuggestionStatus } from '@/dto/itinerary-places/itinerary-place-status.enum';

export default function PlaceSuggestionModal({
  visible,
  onClose,
  place,
  itineraryPlace,
  onAddPlaceToItinerary,
  onCancelSuggestion,
  onFinishReject,
  hideAddButton = false,
}: {
  visible: boolean;
  onClose: () => void;
  place: IPlace;
  itineraryPlace: IItineraryPlace;
  onAddPlaceToItinerary: () => void;
  onCancelSuggestion?: () => void;
  onFinishReject?: () => void;
  hideAddButton?: boolean;
}) {
  const user = useAuth().user;
  const [userProfile, setUserProfile] = useState<IUserProfile | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);
  const [isConfirmingReject, setIsConfirmingReject] = useState(false);
  const isOwnerSuggestion = itineraryPlace.userId === user?.uid;

  useEffect(() => {
    if (itineraryPlace.userId) {
      getUserProfileById(itineraryPlace.userId).then((res) => {
        if (res.success && res.data) {
          setUserProfile(res.data);
        }
      });
    }
  }, [itineraryPlace.userId]);

  function handleConfirmCancelSuggestion() {
    if (onCancelSuggestion) {
      onCancelSuggestion();
    }
  }

  const [isRejecting, setIsRejecting] = useState(false);
  function handleConfirmRejectSuggestion() {
    if (itineraryPlace.id) {
      setIsRejecting(true);
      updateItineraryPlace(itineraryPlace.id, {
        suggestionStatus: ItineraryPlaceSuggestionStatus.Rejected,
      }).then((res) => {
        if (res.success) {
          if (onFinishReject) {
            onFinishReject();
          }
        }
      }).finally(() => {
        setIsRejecting(false);
      });
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <AlertDialog
        title="Reject Suggestion?"
        message="Are you sure you want to reject this suggestion?"
        onConfirm={handleConfirmRejectSuggestion}
        visible={isConfirmingReject}
        onCancel={() => setIsConfirmingReject(false)}
        disabled={isRejecting}
      />
      <AlertDialog
        title="Cancel Suggestion?"
        message="Are you sure you want to cancel this suggestion? This action is irreversible."
        onConfirm={handleConfirmCancelSuggestion}
        visible={isConfirmingCancel}
        onCancel={() => setIsConfirmingCancel(false)}
      />
      <SSContainer disableBottomPadding className="relative flex-1">
        {!hideAddButton && (
          <View className="absolute bottom-6 inset-x-0 z-10 p-4 flex-row gap-4">
            <Button
              variant="outline"
              className="min-w-32"
              onPress={() => setIsConfirmingReject(true)}
            >
              <XCircle size={16} />
              <SSText>Reject</SSText>
            </Button>
            <Button className="flex-1" onPress={onAddPlaceToItinerary}>
              <CheckCircle size={16} className="text-white" />
              <SSText>Add to Itinerary</SSText>
            </Button>
          </View>
        )}
        <ModalHeader title={place.name} onClose={onClose} />
        <View className="flex-row justify-between items-center">
          {userProfile ? (
            <View className="flex-row gap-2 my-4">
              <ProfileAvatar user={userProfile} />
              <View>
                <SSText className="text-xs text-muted-foreground">
                  Suggested by
                </SSText>
                <SSText className="text-sm font-medium">
                  {userProfile.username}
                </SSText>
              </View>
            </View>
          ) : (
            <SSSpinner />
          )}
          <ItineraryPlaceStatus itineraryPlace={itineraryPlace} />
        </View>
        {isOwnerSuggestion && onCancelSuggestion && (
          <View className="flex-row justify-between items-center gap-4 mb-4">
            <Button
              className="flex-1"
              variant="outline"
              onPress={() => setIsConfirmingCancel(true)}
            >
              <XCircleIcon size={16} />
              <SSText>Cancel Suggestion</SSText>
            </Button>
          </View>
        )}
        <ScrollView>
          <View className="pb-24">
            <PlaceDetails place={place} />
          </View>
        </ScrollView>
      </SSContainer>
    </Modal>
  );
}
