import { cn } from '@/lib/utils';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

function Input({
  className,
  placeholderClassName,
  ...props
}: TextInputProps & {
  ref?: React.RefObject<TextInput>;
}) {
  return (
    <TextInput
      className={cn(
        'web:flex h-10 native:h-12 web:w-full border-input web:py-2 lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
        'bg-white border border-slate-200 rounded-xl px-4 py-3 text-base text-gray-800',
        props.editable === false && 'opacity-50 web:cursor-not-allowed',
        className
      )}
      style={{ fontFamily: 'PlusJakartaSans-Medium' }}
      placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
      {...props}
    />
  );
}

export { Input };
