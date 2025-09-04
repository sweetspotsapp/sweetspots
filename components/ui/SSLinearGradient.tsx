import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SSLinearGradient: React.FC = () => (
    <LinearGradient
        colors={['#fff7ed', '#ffffff']}
        style={StyleSheet.absoluteFill}
    />
);

export default SSLinearGradient;
