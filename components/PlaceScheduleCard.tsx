import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Clock, DollarSign, Calendar, ChevronUp, ChevronDown, MapPin, Star, CreditCard as Edit3 } from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { ItineraryPlace } from '@/types/Place';
import { SSText } from './ui/SSText';

interface PlaceScheduleCardProps {
  place: ItineraryPlace;
  onUpdate: (updates: Partial<ItineraryPlace>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function PlaceScheduleCard({ 
  place, 
  onUpdate, 
  onMoveUp, 
  onMoveDown 
}: PlaceScheduleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(0)}`;
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours}h`;
    }
    return `${wholeHours}h ${minutes}min`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    return timeString;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS !== 'web') {
      setShowDatePicker(false);
    }
    
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      onUpdate({ visitDate: dateString });
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    if (Platform.OS !== 'web') {
      setShowTimePicker(false);
    }
    
    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5);
      onUpdate({ visitTime: timeString });
    }
  };

  const renderDateInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-3 gap-2 min-h-12">
          <Calendar size={16} color="#64748b" />
          <input
            type="date"
            value={place.visitDate || ''}
            onChange={(e) => onUpdate({ visitDate: e.target.value })}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontFamily: 'PlusJakartaSans-Regular',
              color: '#1f2937',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      );
    }

    const DateTimePicker = require('@react-native-community/datetimepicker').default;
    
    return (
      <>
        <TouchableOpacity
          className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-3 gap-2 min-h-12"
          onPress={() => setShowDatePicker(true)}>
          <Calendar size={16} color="#64748b" />
          <SSText className="flex-1 py-3 text-sm text-gray-800">
            {place.visitDate ? formatDate(place.visitDate) : 'Select date'}
          </SSText>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={place.visitDate ? new Date(place.visitDate) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </>
    );
  };

  const renderTimeInput = () => {
    if (Platform.OS === 'web') {
      return (
        <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-3 gap-2 min-h-12">
          <Clock size={16} color="#64748b" />
          <input
            type="time"
            value={place.visitTime || ''}
            onChange={(e) => onUpdate({ visitTime: e.target.value })}
            style={{
              flex: 1,
              padding: 12,
              fontSize: 14,
              fontFamily: 'PlusJakartaSans-Regular',
              color: '#1f2937',
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
            }}
          />
        </View>
      );
    }

    const DateTimePicker = require('@react-native-community/datetimepicker').default;
    
    return (
      <>
        <TouchableOpacity
          className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-3 gap-2 min-h-12"
          onPress={() => setShowTimePicker(true)}>
          <Clock size={16} color="#64748b" />
          <SSText className="flex-1 py-3 text-sm text-gray-800">
            {place.visitTime ? formatTime(place.visitTime) : 'Select time'}
          </SSText>
        </TouchableOpacity>
        
        {showTimePicker && (
          <DateTimePicker
            value={place.visitTime ? new Date(`2000-01-01T${place.visitTime}`) : new Date()}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )}
      </>
    );
  };

  return (
    <View className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden">
      {/* Header */}
      <TouchableOpacity 
        className="flex-row items-center p-4"
        onPress={() => setIsExpanded(!isExpanded)}>
        <View className="w-8 h-8 rounded-full bg-emerald-600 justify-center items-center mr-3">
          <SSText variant="bold" className="text-sm text-white">
            {place.order}
          </SSText>
        </View>
        
        <Image source={{ uri: place.images[0] }} className="w-15 h-15 rounded-xl mr-3" style={{ resizeMode: 'cover' }} />
        
        <View className="flex-1">
          <SSText variant="semibold" className="text-base text-gray-800 mb-2" numberOfLines={1}>
            {place.name}
          </SSText>
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Star size={12} color="#fbbf24" fill="#fbbf24" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {place.rating}
              </SSText>
            </View>
            <View className="flex-row items-center gap-1">
              <MapPin size={12} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {place.distance}
              </SSText>
            </View>
            <View className="flex-row items-center gap-1">
              <Clock size={12} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {formatDuration(place.visitDuration || 2)}
              </SSText>
            </View>
            <View className="flex-row items-center gap-1">
              <DollarSign size={12} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {formatCurrency(place.estimatedCost || 0)}
              </SSText>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {onMoveUp && (
            <TouchableOpacity className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center" onPress={onMoveUp}>
              <ChevronUp size={16} color="#64748b" />
            </TouchableOpacity>
          )}
          {onMoveDown && (
            <TouchableOpacity className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center" onPress={onMoveDown}>
              <ChevronDown size={16} color="#64748b" />
            </TouchableOpacity>
          )}
          <TouchableOpacity className="w-8 h-8 rounded-full bg-emerald-50 justify-center items-center">
            <Edit3 size={16} color="#10b981" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded Content */}
      {isExpanded && (
        <View className="px-4 pb-4 border-t border-slate-100">
          {/* Date and Time */}
          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Visit Date
              </SSText>
              {renderDateInput()}
            </View>
            
            <View className="flex-1">
              <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Visit Time
              </SSText>
              {renderTimeInput()}
            </View>
          </View>

          {/* Duration Slider */}
          <View className="mb-4">
            <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
              Duration: {formatDuration(place.visitDuration || 2)}
            </SSText>
            <Slider
              style={{ width: '100%', height: 40, marginTop: 8 }}
              minimumValue={0.5}
              maximumValue={8}
              value={place.visitDuration || 2}
              onValueChange={(value) => onUpdate({ visitDuration: value })}
              step={0.5}
              minimumTrackTintColor="#10b981"
              maximumTrackTintColor="#e2e8f0"
              thumbStyle={{ backgroundColor: '#10b981', width: 20, height: 20 }}
            />
            <View className="flex-row justify-between mt-1">
              <SSText className="text-xs text-slate-500">30min</SSText>
              <SSText className="text-xs text-slate-500">8h</SSText>
            </View>
          </View>

          {/* Cost Slider */}
          <View className="mb-4">
            <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
              Estimated Cost: {formatCurrency(place.estimatedCost || 0)}
            </SSText>
            <Slider
              style={{ width: '100%', height: 40, marginTop: 8 }}
              minimumValue={0}
              maximumValue={500}
              value={place.estimatedCost || 0}
              onValueChange={(value) => onUpdate({ estimatedCost: value })}
              step={5}
              minimumTrackTintColor="#10b981"
              maximumTrackTintColor="#e2e8f0"
              thumbStyle={{ backgroundColor: '#10b981', width: 20, height: 20 }}
            />
            <View className="flex-row justify-between mt-1">
              <SSText className="text-xs text-slate-500">Free</SSText>
              <SSText className="text-xs text-slate-500">$500+</SSText>
            </View>
          </View>

          {/* Notes */}
          <View>
            <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
              Notes (Optional)
            </SSText>
            <TextInput
              className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 h-20 text-sm text-gray-800"
              placeholder="Add any special notes or reminders..."
              value={place.notes || ''}
              onChangeText={(text) => onUpdate({ notes: text })}
              multiline
              numberOfLines={3}
              placeholderTextColor="#94a3b8"
              style={{ 
                fontFamily: 'PlusJakartaSans-Regular',
                textAlignVertical: 'top'
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}