import React from 'react';
import { View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { cn } from '@/lib/utils'; // Utility for class merging
import { SSText } from './SSText';
import { Button } from './button';

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  destructive?: boolean;
  disabled?: boolean;
  disableConfirmButton?: boolean;
  disableCancelButton?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  destructive = false,
  disabled = false,
  disableConfirmButton = false,
  disableCancelButton = false,
}) => {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
    >
      <Pressable className="flex-1 items-center justify-center bg-black/40" onPress={onCancel}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          className="w-[85%] max-w-md bg-white rounded-2xl p-6 shadow-lg"
        >
          <SSText className="text-lg font-bold text-center mb-2">{title}</SSText>
          <SSText className="text-base text-center text-gray-600 mb-6">
            {message}
          </SSText>

          <View className="flex-row justify-end space-x-2">
            <Button
              onPress={onCancel}
              variant='outline'
              disabled={disabled || disableCancelButton}
            >
              <SSText>{cancelText}</SSText>
            </Button>

            <Button
              onPress={onConfirm}
              className={cn(
                destructive
                  ? 'bg-red-500'
                  : 'bg-orange-500'
              )}
              disabled={disabled || disableConfirmButton}
            >
              <SSText>{confirmText}</SSText>
            </Button>
          </View>
        </TouchableOpacity>
      </Pressable>
    </Modal>
  );
};