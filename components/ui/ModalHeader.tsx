import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import { SSText } from './SSText';
import { X } from 'lucide-react-native';

export default function ModalHeader({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <View className="flex-row justify-between items-center  pt-5 pb-4 border-b border-slate-100">
      <SSText variant="bold" className="text-2xl text-gray-800">
        {title}
      </SSText>
      <TouchableOpacity
        onPress={onClose}
        className="w-10 h-10 rounded-full bg-slate-100 justify-center items-center"
      >
        <X size={24} color="#1f2937" />
      </TouchableOpacity>
    </View>
  );
}
