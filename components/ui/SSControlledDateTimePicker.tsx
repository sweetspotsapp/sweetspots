import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { View } from 'react-native';
import { SSText } from './SSText';
import { cn } from '@/lib/utils';
import {
  SSDatePicker,
  SSDateTimePicker,
  SSTimePicker,
} from './SSDateTimePicker';

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

type ControlledPickerProps = BaseControlledPickerProps &
  Omit<PickerComponentProps, 'value' | 'onChange'> & {
    type?: PickerType;
  };

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

export function formatLocalStringFromDate(d: Date, type: PickerType): string {
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());

  if (type === 'date') return `${yyyy}-${mm}-${dd}`;
  if (type === 'time') return `${HH}:${MM}`;
  return `${yyyy}-${mm}-${dd}T${HH}:${MM}`;
}

function parseLocalDateFromString(value: string, type: PickerType): Date | null {
  if (!value) return null;

  try {
    if (type === 'date') {
      const [y, m, d] = value.split('-').map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }

    if (type === 'time') {
      const [hms, maybeSec] = value.split('.');
      const [hStr, mStr, sStr] = (hms ?? value).split(':');
      const h = Number(hStr);
      const m = Number(mStr);
      const s = sStr ? Number(sStr) : 0;
      if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(s)) return null;

      return new Date(1970, 0, 1, h, m, s, 0);
    }

    const [datePart, timePartRaw] = value.split('T');
    if (!datePart || !timePartRaw) return null;

    const [y, m, d] = datePart.split('-').map(Number);
    const [timePart] = timePartRaw.split('Z');
    const [hStr, minStr, sStr] = timePart.split(':');
    const h = Number(hStr);
    const min = Number(minStr);
    const s = sStr ? Number(sStr) : 0;

    if ([y, m, d, h, min, s].some((n) => Number.isNaN(n))) return null;

    return new Date(y, m - 1, d, h, min, s, 0);
  } catch {
    return null;
  }
}

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
        render={({ field: { value, onChange, onBlur }, fieldState: { error } }) => {
          const stringValue =
            value instanceof Date
              ? formatLocalStringFromDate(value, type)
              : (value ?? '');

          const handleChange = (val: string) => {
            if (valueAsDate) {
              const d = parseLocalDateFromString(val, type);
            } else {
              onChange(val);
            }
          };

          return (
            <>
              <PickerComponent
                value={stringValue}
                onTextChange={handleChange}
                onChange={handleChange}
                onBlur={onBlur}
                {...rest}
              />
              {helperText && !error && (
                <SSText className="text-xs text-muted-foreground">
                  {helperText}
                </SSText>
              )}
              {error && (
                <SSText className="text-xs text-red-500">
                  {error?.message}
                </SSText>
              )}
            </>
          );
        }}
      />
    </View>
  );
};