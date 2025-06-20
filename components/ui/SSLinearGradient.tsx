import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SSLinearGradient: React.FC = () => (
    <LinearGradient
        colors={['#f0fdf4', '#ffffff']}
        style={StyleSheet.absoluteFill}
    />
);

export default SSLinearGradient;
