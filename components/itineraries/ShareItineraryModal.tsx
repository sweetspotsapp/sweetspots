import { Linking, Modal, Share, TouchableOpacity, View } from 'react-native';
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
} from '@/endpoints/collab-itinerary/endpoints';
import SSSpinner from '../ui/SSSpinner';
import { Toast } from 'toastify-react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Separator } from '../ui/separator';
import {
  Copy,
  EllipsisVertical,
  FacebookIcon,
  Mail,
  TwitterIcon,
} from 'lucide-react-native';
import SSContainer from '../SSContainer';

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

  function handleShareTwitter() {
    const url = `https://sweetspots.app/itineraries/${itinerary.id}`;
    const text = `Check out my itinerary on Sweetspots: ${itinerary.name} - ${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    Linking.openURL(twitterUrl).catch((err) =>
      Toast.error('Failed to open Twitter')
    );
  }

  function handleShareFacebook() {
    const url = `https://sweetspots.app/itineraries/${itinerary.id}`;
    const text = `Check out my itinerary on Sweetspots: ${itinerary.name} - ${url}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}&quote=${encodeURIComponent(text)}`;
    Linking.openURL(facebookUrl).catch((err) =>
      Toast.error('Failed to open Facebook')
    );
  }

  function handleShareEmail() {
    const url = `https://sweetspots.app/itineraries/${itinerary.id}`;
    const subject = `Check out my itinerary: ${itinerary.name}`;
    const body = `I wanted to share my itinerary with you: ${itinerary.name}\n\nYou can view it here: ${url}`;
    const emailUrl = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(emailUrl).catch((err) =>
      Toast.error('Failed to open email client')
    );
  }

  const [copyLinkMessage, setCopyLinkMessage] = useState<string | null>(null);
  function handleShareCopyLink() {
    const url = `https://sweetspots.app/itineraries/${itinerary.id}`;
    Clipboard.setString(url);
    setCopyLinkMessage('Link copied to clipboard!');
    setTimeout(() => setCopyLinkMessage(null), 2000);
  }

  function handleShareOther() {
    const url = `https://sweetspots.app/itineraries/${itinerary.id}`;
    const text = `Check out my itinerary on Sweetspots! It's called ${itinerary.name}. You can view it here: ${url}`;

    Share.share({
      message: text,
      url: url,
      title: itinerary.name + ' - Sweetspots Itinerary',
    });
  }
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
      <SSContainer>
        <ModalHeader title="Share Itinerary" onClose={onClose} />
        <ScrollView
          className="flex-1 pt-5"
          showsVerticalScrollIndicator={false}
        >
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
          <Button
            className="mt-4 w-full"
            onPress={handleAddCollaborator}
            disabled={isAdding}
          >
            <SSText>Add Collaborator</SSText>
          </Button>
          <View className="flex-row items-center justify-between w-full gap-3 my-4">
            <Separator className="flex-1" />
            <SSText className="text-sm text-muted-foreground">
              or share via
            </SSText>
            <Separator className="flex-1" />
          </View>
          <View className="flex-row items-center justify-center gap-4 mb-4">
            <TouchableOpacity onPress={handleShareTwitter}>
              <TwitterIcon size={24} className="text-orange-500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareFacebook}>
              <FacebookIcon size={24} className="text-orange-500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareEmail}>
              <Mail size={24} className="text-orange-500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareCopyLink}>
              <Copy size={24} className="text-orange-500" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShareOther}>
              <EllipsisVertical size={24} className="text-orange-500" />
            </TouchableOpacity>
          </View>
          {copyLinkMessage && (
            <SSText className="text-center text-green-500 text-xs mb-4">
              {copyLinkMessage}
            </SSText>
          )}
        </ScrollView>
      </SSContainer>
    </Modal>
  );
}
