import React, { useEffect } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { IPlace } from '@/dto/places/place.dto';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { SSControlledInput } from '../ui/SSControlledInput';
import { SSControlledPicker } from '../ui/SSControlledDateTimePicker';
import { Label } from '../ui/label';
import CollaboratorPill from './CollaboratorPill';
import { SSText } from '../ui/SSText';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getAutocompleteCities } from '@/api/google-maps/endpoints';
import SSSpinner from '../ui/SSSpinner';

interface CreateItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
  selectedPlaces: IPlace[];
}

const initItinerarySchema = yup.object().shape({
  query: yup.string().optional(),
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
        const { startDate } = this.parent as { startDate?: Date };
        return !startDate || !value || value >= startDate;
      }
    ),

  budget: yup.number().required('Budget is required').min(0),

  collaborator: yup
    .string()
    .required('Collaborator is required')
    .min(3, 'Collaborator must be at least 3 characters'),

  collaborators: yup.array().of(yup.string().required('Collaborator is required')),
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
    setValue('collaborators', [...(getValues('collaborators') || []), collaborator]);
  };

  const handleRemoveCollaborator = (collaborator: string) => {
    const currentCollaborators = getValues('collaborators') || [];
    const updatedCollaborators = currentCollaborators.filter((c: string) => c !== collaborator);
    setValue('collaborators', updatedCollaborators);
  };

  const collaborators = watch('collaborators') || [];
  const query = watch('query');

  const [loadingCities, setLoadingCities] = React.useState(false);
  const [cities, setCities] = React.useState<string[]>([]);
  const [selectedCity, setSelectedCity] = React.useState<string | null>(null);
  const [suppressFetch, setSuppressFetch] = React.useState(false);

  // If the user edits the input after picking a city, unfreeze search
  useEffect(() => {
    if (selectedCity && query !== selectedCity) {
      setSelectedCity(null);
      setSuppressFetch(false);
    }
  }, [query, selectedCity]);

  // Fetch suggestions with a small debounce; don't fetch when frozen
  useEffect(() => {
    // Clear list and loading state when query is empty or fetch is suppressed
    if (!query || (suppressFetch && selectedCity === query)) {
      setCities([]);
      setLoadingCities(false);
      return;
    }

    // Avoid hammering API for very short queries
    if (query.length < 2 || suppressFetch) {
      setCities([]);
      setLoadingCities(false);
      return;
    }

    let cancelled = false;
    const t = setTimeout(() => {
      setLoadingCities(true);
      getAutocompleteCities({ input: query })
        .then((results) => {
          if (cancelled) return;
          const suggs = results?.data?.suggestions ?? [];
          setCities(suggs.map((s: any) => s.description));
        })
        .catch(() => {
          if (!cancelled) setCities([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingCities(false);
        });
    }, 250); // debounce

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, suppressFetch, selectedCity]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      transparent
      className="flex justify-center items-center"
    >
      {/* Overlay to close when tapping outside */}
      <TouchableOpacity
        onPress={onClose}
        className="bg-black/50 justify-center absolute inset-0"
        activeOpacity={1}
      />

      <View className="container my-auto max-w-4xl mx-auto px-4 gap-4 justify-center">
        {/* Destination */}
        <Card className="p-4">
          <View>
            <Label className="text-xl font-bold" htmlFor="trip-name">
              Where do you want to go?
            </Label>
            <SSControlledInput control={control} name="query" />
          </View>

          {loadingCities ? (
            <SSSpinner />
          ) : (
            cities.length > 0 && (
              <View className="mt-2 max-h-40 overflow-y-auto rounded border border-gray-200">
                {cities.map((city, index) => (
                  <TouchableOpacity
                    key={`${city}-${index}`}
                    onPress={() => {
                      setSelectedCity(city);
                      setValue('location', city);
                      setValue('query', city); // show chosen city in the input
                      setCities([]); // hide list
                      setSuppressFetch(true); // freeze future fetches until user edits
                    }}
                    className="p-2 border-b border-gray-200"
                  >
                    <SSText>{city}</SSText>
                  </TouchableOpacity>
                ))}
              </View>
            )
          )}
        </Card>

        {/* Dates */}
        <Card className="p-4">
          <View>
            <Label className="text-xl font-bold" htmlFor="trip-dates">
              When do you want to go?
            </Label>
            <View className="flex-row gap-2">
              <View className="flex-1">
                <Label htmlFor="startDate">From...</Label>
                <SSControlledPicker control={control} name="startDate" placeholder="From..." valueAsDate />
              </View>
              <View className="flex-1">
                <Label htmlFor="endDate">To...</Label>
                <SSControlledPicker control={control} name="endDate" placeholder="To..." valueAsDate />
              </View>
            </View>
          </View>
        </Card>

        {/* Budget & Collaborators */}
        <Card className="p-4 gap-4">
          <View>
            <Label className="text-xl font-bold" htmlFor="trip-budget">
              What is your budget?
            </Label>
            <SSControlledInput control={control} name="budget" valueAsNumber />
          </View>

          <View>
            <Label className="text-xl font-bold" htmlFor="trip-collaborator">
              Who is going with you?
            </Label>
            <SSControlledInput
              control={control}
              name="collaborator"
              helperText="Add a collaborator"
              onSubmitEditing={(e) => {
                const v = e.nativeEvent.text?.trim();
                if (v) handleAddCollaborator(v);
              }}
            />
            <View className="flex-row flex-wrap gap-2 mt-2">
              {collaborators.map((collaborator: string, index: number) => (
                <CollaboratorPill
                  key={`${collaborator}-${index}`}
                  collaborator={collaborator}
                  onRemove={() => handleRemoveCollaborator(collaborator)}
                />
              ))}
            </View>
          </View>
        </Card>

        <Button onPress={onCreated}>
          <SSText>Let&apos;s Go!</SSText>
        </Button>
        {/* <ItineraryForm selectedPlaces={selectedPlaces} onCancel={onClose} onCreated={onCreated} /> */}
      </View>
    </Modal>
  );
}