import React from 'react';
import { TouchableOpacity, View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { themeMode, toggleTheme, theme } = useTheme();
  const isDark = themeMode === 'dark';

  // Animation value for the toggle
  const animatedValue = React.useRef(new Animated.Value(isDark ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isDark, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 34],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f1f5f9', '#1e293b'],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      activeOpacity={0.8}
      style={styles.container}
    >
      <Animated.View style={[styles.track, { backgroundColor }]}>
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX }],
              backgroundColor: isDark ? '#334155' : '#ffffff',
            },
          ]}
        >
          <View style={styles.iconContainer}>
            {isDark ? (
              <View style={styles.moonIcon}>
                <View style={styles.moonCrater1} />
                <View style={styles.moonCrater2} />
              </View>
            ) : (
              <View style={styles.sunIcon}>
                <View style={styles.sunCore} />
                <View style={[styles.sunRay, styles.sunRay1]} />
                <View style={[styles.sunRay, styles.sunRay2]} />
                <View style={[styles.sunRay, styles.sunRay3]} />
                <View style={[styles.sunRay, styles.sunRay4]} />
              </View>
            )}
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  track: {
    width: 64,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  iconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Moon Icon
  moonIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  moonCrater1: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#cbd5e1',
    top: 3,
    left: 4,
  },
  moonCrater2: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#cbd5e1',
    bottom: 3,
    right: 3,
  },
  // Sun Icon
  sunIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fbbf24',
  },
  sunRay: {
    position: 'absolute',
    width: 2,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 1,
  },
  sunRay1: {
    top: 0,
    left: 7,
  },
  sunRay2: {
    bottom: 0,
    left: 7,
  },
  sunRay3: {
    left: 0,
    top: 6,
    width: 4,
    height: 2,
  },
  sunRay4: {
    right: 0,
    top: 6,
    width: 4,
    height: 2,
  },
});

