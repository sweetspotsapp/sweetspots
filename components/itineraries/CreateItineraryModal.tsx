import React from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { ItineraryForm } from './ItineraryForm';
import { IPlace } from '@/dto/places/place.dto';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SSControlledInput } from '../ui/SSControlledInput';
import { SSControlledPicker } from '../ui/SSControlledDateTimePicker';
import { Label } from '../ui/label';
import CollaboratorPill from './CollaboratorPill';
import { SSText } from '../ui/SSText';
import { X } from 'lucide-react-native';

interface CreateItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedPlaces: IPlace[];
}

const initItinerarySchema = yup.object().shape({
  location: yup.string().required('Location is required'),

  startDate: yup
    .date()
    .required('Start date is required')
    .typeError('Start date must be a valid date'),

  endDate: yup
    .date()
    .required('End date is required')
    .typeError('End date must be a valid date')
    .test(
      'is-after-start',
      'End date must be after or same as start date',
      function (value) {
        const { startDate } = this.parent;
        return !startDate || !value || value >= startDate;
      }
    ),

  budget: yup.number().required('Budget is required').min(0),

  collaborator: yup
    .string()
    .required('Collaborator is required')
    .min(3, 'Collaborator must be at least 3 characters'),

  collaborators: yup
    .array()
    .of(yup.string().required('Collaborator is required')),
});

export function CreateItineraryModal({
  visible,
  onClose,
  onCreated,
  selectedPlaces,
}: CreateItineraryModalProps) {
  const { control, setValue, getValues, watch } = useForm({
    resolver: yupResolver(initItinerarySchema),
  });

  const handleAddCollaborator = (collaborator: string) => {
    setValue('collaborators', [
      ...(getValues('collaborators') || []),
      collaborator,
    ]);
  };

  const handleRemoveCollaborator = (collaborator: string) => {
    const currentCollaborators = getValues('collaborators') || [];
    const updatedCollaborators = currentCollaborators.filter(
      (c) => c !== collaborator
    );
    setValue('collaborators', updatedCollaborators);
  };

  const collaborators = watch('collaborators') || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-row justify-between items-center px-5 pt-5 pb-4 border-b border-slate-100">
        <SSText variant="bold" className="text-2xl text-gray-800">
          Make Plan!
        </SSText>
        {/* {onCancel && ( */}
        <TouchableOpacity
          onPress={onClose}
          className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center"
        >
          <X size={24} color="#1f2937" />
        </TouchableOpacity>
        {/* )} */}
      </View>
      <View className="container mx-auto flex-1">
        <View className="mb-4">
          <Label className="text-xl font-bold" htmlFor="trip-name">
            Where do you want to go?
          </Label>
          <SSControlledInput control={control} name="location" />
        </View>
        <View className="mb-4">
          <Label className="text-xl font-bold" htmlFor="trip-dates">
            When do you want to go?
          </Label>
          <SSControlledPicker
            control={control}
            name="startDate"
            placeholder="From..."
            valueAsDate
          />
          <SSControlledPicker
            control={control}
            name="endDate"
            placeholder="To..."
            valueAsDate
          />
        </View>
        <View className="mb-4">
          <Label className="text-xl font-bold" htmlFor="trip-budget">
            What is your budget?
          </Label>
          <SSControlledInput control={control} name="budget" valueAsNumber />
        </View>
        <View className="mb-4">
          <Label className="text-xl font-bold" htmlFor="trip-collaborator">
            Who is going with you?
          </Label>
          <SSControlledInput
            control={control}
            name="collaborator"
            helperText="Add a collaborator"
            onSubmitEditing={(e) => handleAddCollaborator(e.nativeEvent.text)}
          />
          <View className="flex-row flex-wrap gap-2">
            {collaborators.map((collaborator, index) => (
              <CollaboratorPill
                key={index}
                collaborator={collaborator}
                onRemove={() => handleRemoveCollaborator(collaborator)}
              />
            ))}
          </View>
        </View>

        {/* <ItineraryForm selectedPlaces={selectedPlaces} onCancel={onClose} onCreated={onCreated} /> */}
      </View>
    </Modal>
  );
}
