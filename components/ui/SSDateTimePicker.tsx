import React, { useState, createContext, useContext } from 'react';
import { Platform, TouchableOpacity, View, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SSText } from './SSText';

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
  value: string; // ISO date or time string
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SSDatePicker({ id = 'date', value, onChange, placeholder = 'Select date' }: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempDate, setTempDate] = useState(value ? new Date(value) : new Date());

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpenPickerId(id)}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3"
      >
        <SSText className="text-base text-gray-800">
          {value || placeholder}
        </SSText>
      </TouchableOpacity>
      {show && Platform.OS !== 'web' && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => setOpenPickerId(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
              onPress={() => {}}
            >
              <DateTimePicker
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                value={tempDate}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  onChange(tempDate.toISOString().split('T')[0]);
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

export function SSTimePicker({ id = 'time', value, onChange, placeholder = 'Select time' }: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempTime, setTempTime] = useState(value ? new Date(`1970-01-01T${value}`) : new Date());

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpenPickerId(id)}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3"
      >
        <SSText className="text-base text-gray-800">
          {value || placeholder}
        </SSText>
      </TouchableOpacity>
      {show && Platform.OS !== 'web' && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => setOpenPickerId(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
              onPress={() => {}}
            >
              <DateTimePicker
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={tempTime}
                onChange={(event, selectedTime) => {
                  if (selectedTime) {
                    setTempTime(selectedTime);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  const hours = tempTime.getHours().toString().padStart(2, '0');
                  const minutes = tempTime.getMinutes().toString().padStart(2, '0');
                  onChange(`${hours}:${minutes}`);
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

export function SSDateTimePicker({ id = 'datetime', value, onChange, placeholder = 'Select date & time' }: PickerProps) {
  const { openPickerId, setOpenPickerId } = useContext(PickerContext);
  const show = openPickerId === id;
  const [tempValue, setTempValue] = useState(value ? new Date(value) : new Date());

  return (
    <View>
      <TouchableOpacity
        onPress={() => setOpenPickerId(id)}
        className="bg-white border border-slate-200 rounded-xl px-4 py-3"
      >
        <SSText className="text-base text-gray-800">
          {value || placeholder}
        </SSText>
      </TouchableOpacity>
      {show && Platform.OS !== 'web' && (
        <Modal transparent animationType="slide">
          <TouchableOpacity
            className="flex-1 justify-center items-center bg-black/30"
            activeOpacity={1}
            onPress={() => setOpenPickerId(null)}
          >
            <TouchableOpacity
              activeOpacity={1}
              className="bg-white rounded-xl overflow-hidden"
              onPress={() => {}}
            >
              <DateTimePicker
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                value={tempValue}
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempValue(selectedDate);
                  }
                }}
              />
              <TouchableOpacity
                className="p-4 bg-emerald-600 items-center"
                onPress={() => {
                  onChange(tempValue.toISOString());
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
