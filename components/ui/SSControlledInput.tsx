import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { SSText } from './SSText';
import { Input, InputProps } from './input';
import { View } from 'react-native';
import { cn } from '@/lib/utils';

interface SSControlledInputProps extends InputProps {
  name: string;
  control: Control<any>;
  helperText?: string;
  error?: string;
  valueAsNumber?: boolean;
}

export const SSControlledInput: React.FC<SSControlledInputProps> = ({
  name,
  control,
  helperText,
  error,
  className,
  valueAsNumber = false,
  ...rest
}) => {
  return (
    <View className={cn('w-full gap-1', className)}>
      <Controller
        control={control}
        name={name}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <>
            <Input
              value={value}
              onChangeText={(text) =>
                onChange(valueAsNumber ? Number(text) : text)
              }
              onBlur={onBlur}
              {...rest}
              keyboardType={valueAsNumber ? 'numeric' : rest.keyboardType}
            />
            {helperText && !error && (
              <SSText className="text-xs text-muted-foreground">
                {helperText}
              </SSText>
            )}
            {error && (
              <SSText className="text-xs text-red-500">{error?.message}</SSText>
            )}
          </>
        )}
      />
    </View>
  );
};
