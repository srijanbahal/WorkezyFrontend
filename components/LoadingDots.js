import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const LoadingDots = ({ size = 10, color = '#BE4145', spacing = 8 }) => {
  // Create animated values for each dot
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;
  
  // Create animated values for dot scaling
  const dot1Scale = useRef(new Animated.Value(0.8)).current;
  const dot2Scale = useRef(new Animated.Value(0.8)).current;
  const dot3Scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Function to animate a single dot
    const animateDot = (opacityValue, scaleValue, delay) => {
      return Animated.parallel([
        Animated.sequence([
          Animated.timing(opacityValue, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(opacityValue, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleValue, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleValue, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ]),
      ]);
    };

    // Create an animation sequence
    const loadingAnimation = Animated.loop(
      Animated.stagger(150, [
        animateDot(dot1Opacity, dot1Scale, 0),
        animateDot(dot2Opacity, dot2Scale, 0),
        animateDot(dot3Opacity, dot3Scale, 0),
      ])
    );

    // Start the animation
    loadingAnimation.start();

    // Cleanup animation on unmount
    return () => {
      loadingAnimation.stop();
    };
  }, [dot1Opacity, dot2Opacity, dot3Opacity, dot1Scale, dot2Scale, dot3Scale]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginRight: spacing,
            opacity: dot1Opacity,
            transform: [{ scale: dot1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            marginRight: spacing,
            opacity: dot2Opacity,
            transform: [{ scale: dot2Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: dot3Opacity,
            transform: [{ scale: dot3Scale }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  dot: {
    backgroundColor: '#BE4145',
  },
});

export default LoadingDots; 