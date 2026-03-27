import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...props }: CardProps) => {
  const { isDark } = useTheme();

  return (
    <View style={[{ width: '100%', marginHorizontal: 0 }, style]} {...props}>
      <BlurView
        intensity={isDark ? 50 : 80}
        tint={isDark ? 'dark' : 'light'}
        style={[
          styles.card,
          isDark ? styles.darkCard : styles.lightCard
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24,
    overflow: 'hidden',
    width: '100%',
  },
  lightCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  darkCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderColor: '#3079E6',
    borderWidth: 1,
  }
});
