import {
  Linking,
  Modal,
  ScrollView,
  Share,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { IItinerary } from '@/dto/itineraries/itinerary.dto';
import { SSText } from '../ui/SSText';
import ModalHeader from '../ui/ModalHeader';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import CollaboratorPill from './CollaboratorPill';
import { AlertDialog } from '../ui/AlertDialog';
import {
  addCollaborator,
  getItineraryCollaborators,
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
import { IUserProfile } from '@/dto/users/user-profile.dto';
import { getUserProfiles } from '@/endpoints/users/endpoints';
import { useDebounce } from 'use-debounce';
import ShareItineraryUserCard from './ShareItineraryUserCard';
import { CollabItineraryRoomDto } from '@/dto/collab-itineraries/collab-itinerary-room.dto';
import { IItineraryUser } from '@/dto/itinerary-users/itinerary-user.dto';

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
  const [collaborators, setCollaborators] = useState<IItineraryUser[]>([]);

  const [showUsersList, setShowUsersList] = useState(true);
  const [usersQuery, setUsersQuery] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [users, setUsers] = useState<IUserProfile[]>([]);
  const [query] = useDebounce(usersQuery, 500);
  const [newCollaborators, setNewCollaborators] = useState<IUserProfile[]>([]);
  const [removedCollaboratorUserIds, setRemovedCollaboratorUserIds] = useState<
    string[]
  >([]);

  useEffect(() => {
    if (itinerary.id) {
      getItineraryCollaborators(itinerary.id)
        .then((res) => {
          console.log('collaborators', res);
          setCollaborators(res.data || []);
        })
        .catch((e) => {
          console.error('Failed to fetch collaborators', e);
        });
    }
  }, [itinerary]);

  useEffect(() => {
    setShowUsersList(true);
  }, [usersQuery]);

  useEffect(() => {
    if (query.trim().length === 0) {
      setUsers([]);
      return;
    }
    setIsLoadingUsers(true);
    getUserProfiles({
      query,
    })
      .then((res) => {
        if (res.data) {
          setUsers(res.data.data);
        }
      })
      .finally(() => {
        setIsLoadingUsers(false);
      });
  }, [query]);

  const handleSaveCollaborators = async () => {
    setIsAdding(true);
    try {
      Promise.all(
        newCollaborators.map((user) =>
          addCollaborator({
            itineraryId: itinerary.id,
            userId: user.id,
          })
        )
      );
      const collaboratorsRes = await getItineraryCollaborators(itinerary?.id);
      console.log('collaboratorsRes', collaboratorsRes);
      const itineraryCollaborators = collaboratorsRes.data || [];
      setCollaborators(itineraryCollaborators);
      setNewCollaborators([]);
      setUsersQuery('');
      onFinished?.();
    } catch (e) {
      setErrorMessage((e as any).data.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveExistingCollaborator = async (userId: string) => {
    setRemovedCollaboratorUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  const handleConfirmRemove = async () => {
    if (!removedCollaboratorUserIds.length) return;
    setIsRemoving(true);
    try {
      await Promise.all(
        removedCollaboratorUserIds.map((userId) =>
          removeCollaborator({
            itineraryId: itinerary.id,
            userId,
          })
        )
      );
      const collaboratorsRes = await getItineraryCollaborators(itinerary?.id);
      const itineraryCollaborators = collaboratorsRes.data || [];
      setCollaborators(itineraryCollaborators);
      setRemovedCollaboratorUserIds([]);
      onFinished?.();
    } catch (e) {
      Toast.error('Failed to remove collaborator');
    } finally {
      setIsRemoving(false);
      setIsRemoveDialogOpen(false);
    }
  };

  const handleRemoveNewCollaborator = async (collaboratorIdx: number) => {
    const collaborator = newCollaborators[collaboratorIdx];
    if (collaborator) {
      setNewCollaborators((prev) =>
        prev.filter((_, index) => index !== collaboratorIdx)
      );
    }
  };

  const handlePressNewUser = (user: IUserProfile) => {
    setNewCollaborators((prev) => [...prev, user]);
    setShowUsersList(false);
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
        message={`Are you sure you want to remove ${removedCollaboratorUserIds.length} collaborator(s)?`}
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
            {collaborators.map((collaborator) => {
              const isBeingRemoved = removedCollaboratorUserIds.includes(
                collaborator.userId
              );
              if (collaborator.user) {
                return (
                  <ShareItineraryUserCard
                    key={collaborator.userId}
                    user={collaborator.user}
                    onRemove={() =>
                      handleRemoveExistingCollaborator(collaborator.userId)
                    }
                    className={isBeingRemoved ? 'opacity-50' : ''}
                    isRestore={isBeingRemoved}
                  />
                );
              }
              return null;
            })}
          </View>
          {removedCollaboratorUserIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onPress={() => setIsRemoveDialogOpen(true)}
              disabled={isRemoving}
            >
              <SSText>
                {isRemoving
                  ? 'Removing...'
                  : `Remove ${removedCollaboratorUserIds.length} Collaborator(s)`}
              </SSText>
            </Button>
          )}
          <SSText className="mb-2">Invite More</SSText>
          <Input
            placeholder="Enter email or username"
            className="flex-1"
            value={usersQuery}
            onChangeText={setUsersQuery}
            onFocus={() => setErrorMessage(null)}
            keyboardType="email-address"
            onBlur={() => {
              setTimeout(() => {
                setShowUsersList(false);
              }, 200);
            }}
          />
          {errorMessage && (
            <SSText className="text-red-500 mt-2">{errorMessage}</SSText>
          )}
          {showUsersList && (
            <>
              {isLoadingUsers ? (
                <SSSpinner />
              ) : users.length > 0 ? (
                <View className="max-h-68 mt-2 border border-gray-300 rounded-md">
                  <ScrollView className="p-2">
                    <View className="gap-2">
                      {users.map((user) => {
                        const isAlreadyCollaborator =
                          collaborators.some((c) => c.userId === user.id) ||
                          newCollaborators.some(
                            (c) =>
                              (c.email || c.username) ===
                              (user.email || user.username)
                          );
                        return (
                          <TouchableOpacity
                            key={user.id}
                            // className="p-2 border-b border-gray-200"
                            onPress={() => {
                              handlePressNewUser(user);
                            }}
                          >
                            <ShareItineraryUserCard
                              user={user}
                              checked={isAlreadyCollaborator}
                            />
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </ScrollView>
                </View>
              ) : query.length > 0 ? (
                <SSText className="mt-2 text-sm text-muted-foreground">
                  No users found.
                </SSText>
              ) : null}
            </>
          )}
          {newCollaborators.map((user, uIdx) => (
            <View key={user.id} className="mt-2">
              <ShareItineraryUserCard
                user={user}
                onRemove={() => handleRemoveNewCollaborator(uIdx)}
              />
            </View>
          ))}
          <Button
            className="mt-4 w-full"
            onPress={handleSaveCollaborators}
            disabled={isAdding}
          >
            <SSText>Send Invitation</SSText>
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
