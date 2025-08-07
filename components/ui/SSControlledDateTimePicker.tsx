import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { View } from 'react-native';
import { SSText } from './SSText';
import { cn } from '@/lib/utils';
import { SSDatePicker, SSDateTimePicker, SSTimePicker } from './SSDateTimePicker';

type BaseControlledPickerProps = {
  name: string;
  control: Control<any>;
  helperText?: string;
  error?: string;
  className?: string;
  valueAsDate?: boolean;
};

type PickerType = 'date' | 'time' | 'datetime';

type PickerComponentProps = React.ComponentProps<typeof SSDatePicker>;

type ControlledPickerProps = BaseControlledPickerProps & Omit<PickerComponentProps, 'value' | 'onChange'> & {
  type?: PickerType;
};

export const SSControlledPicker: React.FC<ControlledPickerProps> = ({
  name,
  control,
  helperText,
  error,
  className,
  valueAsDate = false,
  type = 'date',
  ...rest
}) => {
  const PickerComponent = {
    date: SSDatePicker,
    time: SSTimePicker,
    datetime: SSDateTimePicker,
  }[type];

  return (
    <View className={cn('w-full gap-1', className)}>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange, onBlur } }) => (
          <PickerComponent
            value={value}
            onTextChange={(val: string) => {
              onChange(valueAsDate ? new Date(val) : val);
            }}
            onChange={(val: string) => {
              onChange(valueAsDate ? new Date(val) : val);
            }}
            onBlur={onBlur}
            {...rest}
          />
        )}
      />
      {helperText && !error && (
        <SSText className="text-xs text-muted-foreground">{helperText}</SSText>
      )}
      {error && (
        <SSText className="text-xs text-red-500">{error}</SSText>
      )}
    </View>
  );
};