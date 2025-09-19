import { SafeAreaView } from 'react-native';
import React from 'react';
import SSLinearGradient from './ui/SSLinearGradient';

export default function SSContainer({
  children,
  disableBottomPadding = false,
}: {
  children: React.ReactNode;
  disableBottomPadding?: boolean;
}) {
  return (
    <>
      <SSLinearGradient />
      <SafeAreaView className={`flex-1 container mx-auto !px-4 pt-2.5 ${disableBottomPadding ? 'pb-0' : 'pb-20'}`}>
        {children}
      </SafeAreaView>
    </>
  );
}
