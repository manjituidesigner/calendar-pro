import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const BaseLayout = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={isDark ? ['#0F172A', '#1E1B4B'] : ['#F3E8FF', '#E0F2FE']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </SafeAreaView>
  );
};
