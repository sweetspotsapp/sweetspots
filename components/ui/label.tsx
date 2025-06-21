import { cn } from '@/lib/utils';
import * as LabelPrimitive from '@rn-primitives/label';
import * as React from 'react';

function Label({
  className,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  style = {},
  ...props
}: LabelPrimitive.TextProps & {
  ref?: React.RefObject<LabelPrimitive.TextRef>;
}) {
  const fontFamily = 'PlusJakartaSans-SemiBold'
  return (
    <LabelPrimitive.Root
      className='web:cursor-default mb-2'
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
    >
      <LabelPrimitive.Text
        className={cn(
          'text-sm text-foreground native:text-base font-medium leading-none web:peer-disabled:cursor-not-allowed web:peer-disabled:opacity-70',
          className
        )}
        style={{ fontFamily }}
        {...props}
      />
    </LabelPrimitive.Root>
  );
}

export { Label };
