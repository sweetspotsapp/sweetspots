import { View, Text, Modal } from 'react-native';
import React from 'react';
import { IPlace } from '@/dto/places/place.dto';
import ModalHeader from '../ui/ModalHeader';
import SSContainer from '../SSContainer';
import { PlaceDetails } from '../placeSwipes/PlaceDetails';
import { ScrollView } from 'react-native-gesture-handler';

export default function PlaceDetailsModal({
  visible,
  onClose,
  place,
}: {
  visible: boolean;
  onClose: () => void;
  place?: IPlace;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SSContainer disableBottomPadding className="relative flex-1">
        <ModalHeader title={place?.name} onClose={onClose} />
        <ScrollView>
          {place && (
            <View className="pb-24">
              <PlaceDetails place={place} />
            </View>
          )}
        </ScrollView>
      </SSContainer>
    </Modal>
  );
}
