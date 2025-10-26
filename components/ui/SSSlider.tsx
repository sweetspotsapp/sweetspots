import React from 'react';
import Slider, { SliderProps } from '@react-native-community/slider';

export interface SSSliderProps extends SliderProps {}

const SSSlider: React.FC<SSSliderProps> = (props) => {
  const {
    style,
    minimumTrackTintColor = '#f97316',
    maximumTrackTintColor = '#e2e8f0',
    thumbTintColor = '#f97316',
    ...rest
  } = props;

  return (
    <Slider
      style={[{ width: '100%', height: 24, marginTop: 8 }, style]}
      {...rest}
    />
  );
};

export default SSSlider;