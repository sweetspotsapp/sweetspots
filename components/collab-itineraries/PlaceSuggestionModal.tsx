import { View, Text, Modal } from 'react-native';
import React from 'react';
import { IPlace } from '@/dto/places/place.dto';
import ModalHeader from '../ui/ModalHeader';
import SSContainer from '../SSContainer';
import { PlaceDetails } from '../placeSwipes/PlaceDetails';
import { ScrollView } from 'react-native-gesture-handler';
import { Card } from '../ui/card';
import { SSText } from '../ui/SSText';
import { Button } from '../ui/button';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';

export default function PlaceSuggestionModal({
  visible,
  onClose,
  place,
  onAddPlaceToItinerary,
}: {
  visible: boolean;
  onClose: () => void;
  place: IPlace;
  onAddPlaceToItinerary: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SSContainer disableBottomPadding className="relative flex-1">
        <Button className="absolute bottom-6 inset-x-0 z-10 p-4" onPress={onAddPlaceToItinerary}>
          <SSText>Add to Itinerary</SSText>
        </Button>
        <ModalHeader onClose={onClose} />
        <ScrollView>
          <View className="pb-24">
            <PlaceDetails place={place} />
          </View>
        </ScrollView>
      </SSContainer>
    </Modal>
  );
}
