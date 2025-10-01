import { ActivityIndicator, ActivityIndicatorProps } from 'react-native';
import React from 'react';

export default function SSSpinner(props: ActivityIndicatorProps) {
  return <ActivityIndicator size="large" color="#f97316" {...props} />;
}
