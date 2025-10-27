import React from 'react';
import SSLinearGradient from './ui/SSLinearGradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SSContainer({
  children,
  disableBottomPadding = false,
  disableGradient = false,
  className,
}: {
  children: React.ReactNode;
  disableBottomPadding?: boolean;
  disableGradient?: boolean;
  className?: string;
}) {
  return (
    <>
      {!disableGradient && <SSLinearGradient />}
      <SafeAreaView className={`flex-1 container mx-auto !px-4 pt-2.5 ${disableBottomPadding ? 'pb-0' : '!pb-20'} ${className}`}>
        {children}
      </SafeAreaView>
    </>
  );
}
