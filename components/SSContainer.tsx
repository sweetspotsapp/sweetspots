import { SafeAreaView } from 'react-native';
import React from 'react';
import SSLinearGradient from './ui/SSLinearGradient';

export default function SSContainer({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SSLinearGradient />
      <SafeAreaView className="flex-1 container mx-auto !px-4 pt-2.5 pb-5">
        {children}
      </SafeAreaView>
    </>
  );
}
