import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, TextInput, Image } from 'react-native';
import {
  Clock,
  DollarSign,
  ChevronUp,
  ChevronDown,
  MapPin,
  Star,
  EditIcon,
} from 'lucide-react-native';
import Slider from '@react-native-community/slider';
import { ItineraryPlace } from '@/types/Place';
import { SSText } from './ui/SSText';
import { SSDatePicker, SSTimePicker } from './ui/SSDateTimePicker';
import { Card } from './ui/card';
import {
  formatCurrency,
  formatDistance,
  formatDuration,
} from '@/utils/formatter';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { IItineraryPlace } from '@/dto/itinerary-places/itinerary-place.dto';
import moment from 'moment';

interface PlaceScheduleCardProps {
  itineraryPlace: IItineraryPlace;
  onUpdate: (updates: Partial<ItineraryPlace>) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  toNextSegment?: { distance: number; duration: number };
  lockedFields?: Record<string, string>;
  onFieldFocus?: (field: string) => void;
  onFieldBlur?: (field: string, prevValue: any, newValue: any) => void;
  onAcceptSuggestion?: () => void;
  onRejectSuggestion?: () => void;
  index?: number;
}

export function PlaceScheduleCard({
  itineraryPlace,
  onUpdate,
  onMoveUp,
  onMoveDown,
  toNextSegment,
  lockedFields = {},
  onFieldFocus = () => {},
  onFieldBlur = () => {},
  onAcceptSuggestion,
  onRejectSuggestion,
  index,
}: PlaceScheduleCardProps) {
  const { user } = useAuth();
  const userLockedFields = Object.keys(lockedFields).filter(
    (field) => lockedFields[field] !== user?.uid
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const [visitDate, setVisitDate] = useState(itineraryPlace.visitDate || '');
  const [visitTime, setVisitTime] = useState(itineraryPlace.visitTime || '');
  const [visitDuration, setVisitDuration] = useState(
    itineraryPlace.visitDuration || 2
  );
  const [estimatedCost, setEstimatedCost] = useState(
    itineraryPlace.estimatedCost || 0
  );

  const [notes, setNotes] = useState(itineraryPlace.notes || '');

  useEffect(() => {
    setVisitDate(itineraryPlace.visitDate || '');
    setVisitTime(itineraryPlace.visitTime || '');
    setVisitDuration(itineraryPlace.visitDuration || 2);
    setEstimatedCost(itineraryPlace.estimatedCost || 0);
    setNotes(itineraryPlace.notes || '');
  }, [itineraryPlace]);

  const handleFieldFocus = (field: string) => {
    onFieldFocus(`${field}.${itineraryPlace.orderIndex}`);
  };

  const handleFieldBlur = (field: string, prevValue: any, newValue: any) => {
    onUpdate({ [field]: newValue });
    onFieldBlur(`${field}.${itineraryPlace.orderIndex}`, prevValue, newValue);
  };

  return (
    <>
      {toNextSegment && (
        <View className="px-4 py-3 mb-3 bg-slate-50 rounded">
          {/* <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Next Segment
              </SSText> */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {formatDistance(toNextSegment.distance)}
              </SSText>
            </View>
            <View className="flex-row items-center gap-2">
              <Clock size={16} color="#64748b" />
              <SSText variant="medium" className="text-xs text-slate-500">
                {formatDuration({ seconds: toNextSegment.duration })}
              </SSText>
            </View>
          </View>
        </View>
      )}
      <Card className="rounded-2xl mb-4">
        <TouchableOpacity
          className="flex-row items-end gap-4 p-4"
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View className="flex-row flex-1">
            <View className="gap-2">
              {onMoveUp && (
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={onMoveUp}
                >
                  <ChevronUp size={16} color="#64748b" />
                </TouchableOpacity>
              )}
              <View className="w-8 h-8 rounded-full bg-orange-600 justify-center items-center mr-3">
                <SSText variant="bold" className="text-sm text-white">
                  {(index ?? 0) + 1}
                </SSText>
              </View>
              {onMoveDown && (
                <TouchableOpacity
                  className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                  onPress={onMoveDown}
                >
                  <ChevronDown size={16} color="#64748b" />
                </TouchableOpacity>
              )}
            </View>
            {itineraryPlace.place && (
              <>
                {itineraryPlace.imageUrl ? (
                  <Image
                    source={{ uri: itineraryPlace.imageUrl }}
                    className="rounded-xl mr-3"
                    style={{ resizeMode: 'cover', width: 112, height: 112 }}
                  />
                ) : null}
                <View className="flex-1">
                  <SSText
                    variant="semibold"
                    className="text-base text-gray-800 mb-2"
                    numberOfLines={1}
                  >
                    {itineraryPlace.place.name}
                  </SSText>
                  <View className="flex-row gap-3">
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color="#fbbf24" fill="#fbbf24" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {itineraryPlace.place.rating}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MapPin size={12} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {itineraryPlace.place.distance}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Clock size={12} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {formatDuration({
                          hours: itineraryPlace.visitDuration || 2,
                        })}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <DollarSign size={12} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {formatCurrency(itineraryPlace.estimatedCost || 0)}
                      </SSText>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Clock size={12} color="#64748b" />
                      <SSText
                        variant="medium"
                        className="text-xs text-slate-500"
                      >
                        {itineraryPlace.visitDate
                          ? `${moment(itineraryPlace.visitDate).format('LL')}${itineraryPlace.visitTime ? ` - ${itineraryPlace.visitTime}` : ''}`
                          : 'No date'}
                      </SSText>
                    </View>
                  </View>
                </View>
                {
                  onAcceptSuggestion && onRejectSuggestion && (
                  <View className="flex-row justify-between items-center gap-2">
                    <TouchableOpacity
                      className="px-4 py-1 rounded-full bg-green-100"
                      onPress={onAcceptSuggestion}
                    >
                      <SSText
                        variant="medium"
                        className="text-green-800"
                      >
                        Accept
                      </SSText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="px-4 py-1 rounded-full bg-red-100"
                      onPress={onRejectSuggestion}
                    >
                      <SSText
                        variant="medium"
                        className="text-red-800"
                      >
                        Reject
                      </SSText>
                    </TouchableOpacity>
                  </View>
                  )
                }
              </>
            )}
          </View>
          <View className="flex-row items-center gap-2">
            {/* {onMoveUp && (
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                onPress={onMoveUp}
              >
                <ChevronUp size={16} color="#64748b" />
              </TouchableOpacity>
            )}
            {onMoveDown && (
              <TouchableOpacity
                className="w-8 h-8 rounded-full bg-slate-100 justify-center items-center"
                onPress={onMoveDown}
              >
                <ChevronDown size={16} color="#64748b" />
              </TouchableOpacity>
            )} */}
            {/* <TouchableOpacity className="w-8 h-8 rounded-full bg-orange-50 justify-center items-center">
              <EditIcon size={16} className="text-orange-500" />
            </TouchableOpacity> */}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View className="px-4 py-4 border-t border-slate-100">
            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <SSText
                  variant="semibold"
                  className="text-sm text-gray-800 mb-2"
                >
                  Visit Date
                </SSText>
                <SSDatePicker
                  id={`place-${itineraryPlace.id}-date`}
                  value={visitDate}
                  onTextChange={setVisitDate}
                  onFocus={() => {
                    handleFieldFocus('visitDate');
                  }}
                  onBlur={() =>
                    handleFieldBlur(
                      'visitDate',
                      itineraryPlace.visitDate,
                      visitDate
                    )
                  }
                  editable={
                    !userLockedFields.includes(
                      `visitDate.${itineraryPlace.orderIndex}`
                    )
                  }
                />
              </View>
              <View className="flex-1">
                <SSText
                  variant="semibold"
                  className="text-sm text-gray-800 mb-2"
                >
                  Visit Time
                </SSText>
                <SSTimePicker
                  id={`place-${itineraryPlace.id}-time`}
                  value={visitTime}
                  onTextChange={setVisitTime}
                  onFocus={() => handleFieldFocus('visitTime')}
                  onBlur={() =>
                    handleFieldBlur(
                      'visitTime',
                      itineraryPlace.visitTime,
                      visitTime
                    )
                  }
                  editable={
                    !userLockedFields.includes(
                      `visitTime.${itineraryPlace.orderIndex}`
                    )
                  }
                />
              </View>
            </View>

            <View className="mb-4">
              <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Duration:{' '}
                {formatDuration({ hours: itineraryPlace.visitDuration || 2 })}
              </SSText>
              <Slider
                style={{ width: '100%', height: 40, marginTop: 8 }}
                minimumValue={0.5}
                maximumValue={8}
                value={
                  itineraryPlace.visitDuration
                    ? Number(itineraryPlace.visitDuration)
                    : 2
                }
                disabled={userLockedFields.includes(
                  `visitDuration.${itineraryPlace.orderIndex}`
                )}
                onSlidingStart={() => handleFieldFocus('visitDuration')}
                onSlidingComplete={(value) =>
                  handleFieldBlur(
                    'visitDuration',
                    itineraryPlace.visitDuration,
                    value
                  )
                }
                onValueChange={(value) => onUpdate({ visitDuration: value })}
                step={0.5}
                minimumTrackTintColor="#f97316"
                maximumTrackTintColor="#e2e8f0"
              />
              <View className="flex-row justify-between mt-1">
                <SSText className="text-xs text-slate-500">30min</SSText>
                <SSText className="text-xs text-slate-500">8h</SSText>
              </View>
            </View>

            <View className="mb-4">
              <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Estimated Cost:{' '}
                {formatCurrency(
                  itineraryPlace.estimatedCost
                    ? Number(itineraryPlace.estimatedCost)
                    : 0
                )}
              </SSText>
              <Slider
                style={{ width: '100%', height: 40, marginTop: 8 }}
                minimumValue={0}
                maximumValue={500}
                value={
                  itineraryPlace.estimatedCost
                    ? Number(itineraryPlace.estimatedCost)
                    : 0
                }
                disabled={userLockedFields.includes(
                  `estimatedCost.${itineraryPlace.orderIndex}`
                )}
                onSlidingStart={() => handleFieldFocus('estimatedCost')}
                onSlidingComplete={(value) =>
                  handleFieldBlur(
                    'estimatedCost',
                    itineraryPlace.estimatedCost,
                    value
                  )
                }
                onValueChange={(value) => onUpdate({ estimatedCost: value })}
                step={5}
                minimumTrackTintColor="#f97316"
                maximumTrackTintColor="#e2e8f0"
              />
              <View className="flex-row justify-between mt-1">
                <SSText className="text-xs text-slate-500">Free</SSText>
                <SSText className="text-xs text-slate-500">$500+</SSText>
              </View>
            </View>

            <View>
              <SSText variant="semibold" className="text-sm text-gray-800 mb-2">
                Notes (Optional)
              </SSText>
              <Input
                className={cn(
                  'bg-slate-100 border border-slate-200 rounded-xl px-3 py-3 h-20 text-sm text-gray-800 h-30'
                )}
                placeholder="Add any special notes or reminders..."
                value={notes}
                // onChangeText={(text) => onUpdate({ notes: text })}
                onChangeText={setNotes}
                onFocus={() => handleFieldFocus('notes')}
                onBlur={() =>
                  handleFieldBlur('notes', itineraryPlace.notes, notes)
                }
                editable={
                  !userLockedFields.includes(
                    `notes.${itineraryPlace.orderIndex}`
                  )
                }
                // editable={false}
                multiline
                numberOfLines={3}
                placeholderTextColor="#94a3b8"
                style={{
                  fontFamily: 'Poppins-Regular',
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </View>
        )}
      </Card>
    </>
  );
}
