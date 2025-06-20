import * as React from 'react';
import { Text as RNText, TextProps } from 'react-native';
import * as Slot from '@rn-primitives/slot';
import { cn } from '@/~/lib/utils';

const TextClassContext = React.createContext<string | undefined>(undefined);

interface SSTextProps extends TextProps {
  variant?: 'regular' | 'medium' | 'semibold' | 'bold';
  className?: string;
  asChild?: boolean;
}

function Text({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<typeof RNText> & {
  ref?: React.RefObject<RNText>;
  asChild?: boolean;
}) {
  const textClass = React.useContext(TextClassContext);
  const Component = asChild ? Slot.Text : RNText;
  return (
    <Component
      className={cn('text-foreground web:select-text', textClass, className)}
      {...props}
    />
  );
}

export function SSText({
  variant = 'regular',
  className,
  style,
  asChild = false,
  ...props
}: SSTextProps) {
  const fontFamily = {
    regular: 'PlusJakartaSans-Regular',
    medium: 'PlusJakartaSans-Medium',
    semibold: 'PlusJakartaSans-SemiBold',
    bold: 'PlusJakartaSans-Bold',
  }[variant];

  return (
    <Text
      asChild={asChild}
      className={cn(className)}
      style={[{ fontFamily }, style]}
      {...props}
    />
  );
}

export { Text, TextClassContext };