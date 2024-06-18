import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

type Props = {
  children: React.ReactNode;
  style?: {};
};

const FadeAnimation = ({children, style}: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{scale: fadeAnim}],
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
};

export default FadeAnimation;
