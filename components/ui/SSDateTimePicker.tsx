import React, { useState, createContext, useContext } from 'react';
import { Platform, TouchableOpacity, View, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SSText } from './SSText';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PickerContextType {
  openPickerId: string | null;
  setOpenPickerId: (id: string | null) => void;
}

const PickerContext = createContext<PickerContextType>({
  openPickerId: null,
  setOpenPickerId: () => {},
});

export const PickerProvider = ({ children }: { children: React.ReactNode }) => {
  const [openPickerId, setOpenPickerId] = useState<string | null>(null);
  return (
    <PickerContext.Provider value={{ openPickerId, setOpenPickerId }}>
      {children}
    </PickerContext.Provider>
  );
};

interface PickerProps {
  id?: string;
  value: string;
  onChange?: (val: string) => void;
  onTextChange?: (val: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  editable?: boolean;
}

export function SSDatePicker({
  id = 'date',
  value,
  onChange = () => {},
  placeholder = 'Select date',
  onBlur,
  onFocus,
  editable = true,
  onTextChange = () => {},
}: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempDate, setTempDate] = useState(
    value ? new Date(value) : new Date()
  );

  if (Platform.OS === 'web') {
    return (
      <input
        className={cn(
          'web:flex h-10 native:h-12 web:w-full border-input web:py-2 lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          'bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-gray-800'
        )}
        value={value}
        placeholder={placeholder}
        // @ts-ignore - only valid on web
        type="date"
        onChange={(e) => onTextChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!editable}
      />
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          onFocus?.();
          setOpenPickerId(id);
        }}
        activeOpacity={0.9}
        disabled={!editable}
      >
        <Input
          value={value}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {show && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => {
              onBlur?.();
              setOpenPickerId(null);
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
            >
              <DateTimePicker
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                value={tempDate}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    onTextChange(selectedDate.toISOString().split('T')[0]);
                    setTempDate(selectedDate);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  onChange(tempDate.toISOString().split('T')[0]);
                  onBlur?.();
                  setOpenPickerId(null);
                }}
              >
                <SSText className="text-white font-semibold">Confirm</SSText>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export function SSTimePicker({
  id = 'time',
  value,
  onChange = () => {},
  placeholder = 'Select time',
  onBlur,
  onFocus,
  editable = true,
  onTextChange = () => {},
}: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempTime, setTempTime] = useState(
    value ? new Date(`1970-01-01T${value}`) : new Date()
  );
  const [tempTimeString, setTempTimeString] = useState(value ? value : '00:00');

  if (Platform.OS === 'web') {
    return (
      <input
        className={cn(
          'web:flex h-10 native:h-12 web:w-full border-input web:py-2 lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          'bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-gray-800'
        )}
        value={value}
        placeholder={placeholder}
        // @ts-ignore - only valid on web
        type="time"
        onChange={(e) => onTextChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!editable}
      />
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          onFocus?.();
          setOpenPickerId(id);
        }}
        activeOpacity={0.9}
        disabled={!editable}
      >
        <Input
          value={value}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {show && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => {
              setOpenPickerId(null);
              onBlur?.();
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
            >
              <DateTimePicker
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={tempTime}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setTempTime(selectedTime);
                    const hours = selectedTime
                      .getHours()
                      .toString()
                      .padStart(2, '0');
                    const minutes = selectedTime
                      .getMinutes()
                      .toString()
                      .padStart(2, '0');
                    onTextChange(`${hours}:${minutes}`);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  const hours = tempTime.getHours().toString().padStart(2, '0');
                  const minutes = tempTime
                    .getMinutes()
                    .toString()
                    .padStart(2, '0');
                  onChange(`${hours}:${minutes}`);
                  onBlur?.();
                  setOpenPickerId(null);
                }}
              >
                <SSText className="text-white font-semibold">Confirm</SSText>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}

export function SSDateTimePicker({
  id = 'datetime',
  value,
  onChange = () => {},
  placeholder = 'Select date & time',
  onBlur,
  onFocus,
  editable = true,
  onTextChange = () => {},
}: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempValue, setTempValue] = useState(
    value ? new Date(value) : new Date()
  );

  if (Platform.OS === 'web') {
    return (
      <input
        className={cn(
          'web:flex h-10 native:h-12 web:w-full border-input web:py-2 lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
          'bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-gray-800'
        )}
        value={value}
        placeholder={placeholder}
        // @ts-ignore - only valid on web
        type="datetime-local"
        onChange={(e) => onTextChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={!editable}
      />
    );
  }

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          onFocus?.();
          setOpenPickerId(id);
        }}
        activeOpacity={0.9}
        disabled={!editable}
      >
        <Input
          value={value}
          placeholder={placeholder}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
      {show && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => {
              setOpenPickerId(null);
              onBlur?.();
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
            >
              <DateTimePicker
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                value={tempValue}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempValue(selectedDate);
                    onTextChange(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  onChange(tempValue.toISOString());
                  setOpenPickerId(null);
                  onBlur?.();
                }}
              >
                <SSText className="text-white font-semibold">Confirm</SSText>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
}
