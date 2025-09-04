import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SSLinearBackgroundProps {
    style?: ViewStyle;
    children?: React.ReactNode;
}

const SSLinearBackground: React.FC<SSLinearBackgroundProps> = ({ style, children }) => (
    <View style={[styles.container, style]}>
        <LinearGradient
            colors={['#fff7ed', '#ffffff']}
            style={StyleSheet.absoluteFill}
        />
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
});

export default SSLinearBackground;