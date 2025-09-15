import React from 'react';
import { StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SSLinearGradient: React.FC = () => (
    <LinearGradient
        colors={['#ffffff', '#ffffff']}
        // colors={['#fff7ed', '#ffffff', '#ffffff']}
        style={StyleSheet.absoluteFill}
    />
);

export default SSLinearGradient;
