import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { SSText } from './SSText';
import { Input, InputProps } from './input';
import { View } from 'react-native';

interface SSControlledInputProps extends InputProps {
  name: string;
  control: Control<any>;
  helperText?: string;
  error?: string;
}

export const SSControlledInput: React.FC<SSControlledInputProps> = ({
  name,
  control,
  helperText,
  error,
  ...rest
}) => {
  return (
    <View className="w-full gap-1">
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            value={value}
            onChangeText={onChange}
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