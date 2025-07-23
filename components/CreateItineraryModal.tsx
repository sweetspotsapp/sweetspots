import React from 'react';
import { Modal, View } from 'react-native';
import { IPlace } from '@/api/places/dto/place.dto';
import { ItineraryForm } from './ItineraryForm';

interface CreateItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedPlaces: IPlace[];
}

export function CreateItineraryModal({
  visible,
  onClose,
  onCreated,
  selectedPlaces,
}: CreateItineraryModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className='container mx-auto flex-1'>
        <ItineraryForm selectedPlaces={selectedPlaces} onCancel={onClose} onCreated={onCreated} />
      </View>
    </Modal>
  );
}
