import { Modal, View } from 'react-native';
import React, { useState } from 'react';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { SSText } from '../ui/SSText';
import ModalHeader from '../ui/ModalHeader';
import { ScrollView } from 'react-native-gesture-handler';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import CollaboratorPill from './CollaboratorPill';
import { AlertDialog } from '../ui/AlertDialog';
import {
  addCollaborator,
  removeCollaborator,
} from '@/api/itineraries/endpoints';
import SSSpinner from '../ui/SSSpinner';
import { Toast } from 'toastify-react-native';
import ToastManager from 'toastify-react-native/components/ToastManager';

interface ShareItineraryModalProps {
  visible: boolean;
  onClose: () => void;
  onFinished?: () => void;
  itinerary: IItinerary;
}

export default function ShareItineraryModal({
  visible,
  onClose,
  itinerary,
  onFinished,
}: ShareItineraryModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [collaborators, setCollaborators] = useState<string[]>(
    itinerary.collaborators || []
  );
  const [newCollaborator, setNewCollaborator] = useState('');
  const [removedCollaborators, setRemovedCollaborators] = useState<string[]>(
    []
  );

  const handleAddCollaborator = async () => {
    if (
      newCollaborator.trim() &&
      !collaborators.includes(newCollaborator.trim())
    ) {
      setIsAdding(true);
      try {
        await addCollaborator({
          itineraryId: itinerary.id,
          userIdentity: newCollaborator.trim(),
        });
        setCollaborators([...collaborators, newCollaborator.trim()]);
        setNewCollaborator('');
        onFinished?.();
      } catch (e) {
        setErrorMessage((e as any).data.message);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [removingCollaborator, setRemovingCollaborator] = useState<
    string | null
  >(null);

  const handleRemoveToggle = (collaborator: string) => {
    setIsRemoveDialogOpen(!isRemoveDialogOpen);
    setRemovingCollaborator(collaborator);
  };
  const handleConfirmRemove = async () => {
    if (removingCollaborator) {
      setIsRemoving(true);
      try {
        await removeCollaborator({
          itineraryId: itinerary.id,
          userIdentity: removingCollaborator,
        });
        setCollaborators(
          collaborators.filter((c) => c !== removingCollaborator)
        );
        setRemovedCollaborators([
          ...removedCollaborators,
          removingCollaborator,
        ]);
        setRemovingCollaborator(null);
        onFinished?.();
      } catch (e) {
        Toast.error((e as any).data.message || 'Failed to remove collaborator');
      } finally {
        setIsRemoving(false);
      }
    }
    setIsRemoveDialogOpen(false);
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <AlertDialog
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${removingCollaborator}?`}
        visible={isRemoveDialogOpen}
        onCancel={() => setIsRemoveDialogOpen(false)}
        onConfirm={handleConfirmRemove}
      />
      <ModalHeader title="Share Itinerary" onClose={onClose} />
      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        <SSText className="mb-2">Collaborators</SSText>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {collaborators.map((collaborator, index) => (
            <CollaboratorPill
              key={index}
              collaborator={collaborator}
              onRemove={() => handleRemoveToggle(collaborator)}
            />
          ))}

          {isAdding && <SSSpinner size="small" />}
        </View>
        <SSText className="mb-2">Invite More</SSText>
        <Input
          placeholder="Enter email or username"
          className="flex-1"
          value={newCollaborator}
          onChangeText={setNewCollaborator}
          onFocus={() => setErrorMessage(null)}
          keyboardType="email-address"
        />
        {errorMessage && (
          <SSText className="text-red-500 mt-2">{errorMessage}</SSText>
        )}
        <Button className="mt-4 w-full" onPress={handleAddCollaborator} disabled={isAdding}>
          <SSText>Add Collaborator</SSText>
        </Button>
      </ScrollView>
    </Modal>
  );
}
