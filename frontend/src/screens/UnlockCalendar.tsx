import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Lock, Delete } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';

export const UnlockCalendar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark } = useTheme();
  
  // Example intents: 'unlock', 'setup', 'add_pin', 'remove_pin'
  const intent = (route.params as any)?.intent || 'unlock';
  
  const [pin, setPin] = useState('');
  const shakeOffset = useSharedValue(0);

  const handlePressNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const verifyPin = (enteredPin: string) => {
    // Mock verification
    if (intent === 'setup' || intent === 'add_pin') {
       navigation.goBack();
    } else {
       if (enteredPin === '1234') { // Correct mock
         navigation.goBack();
       } else {
         // Shake animation for error
         shakeOffset.value = withSequence(
           withSpring(10), withSpring(-10), withSpring(10), withSpring(0)
         );
         setTimeout(() => setPin(''), 500);
       }
    }
  };

  const shakeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }]
    };
  });

  const renderDots = () => {
    return (
      <Animated.View style={shakeStyle} className="flex-row items-center justify-center gap-x-4 mb-10 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <View 
            key={i} 
            className={`w-3 h-3 rounded-full border-2 ${
              i < pin.length 
                ? 'bg-[#4D3EEB] border-[#4D3EEB]' 
                : 'bg-transparent border-[#CBD5E1] dark:border-[#475569]'
            }`}
          />
        ))}
      </Animated.View>
    );
  };

  const NumberButton = ({ num, onPress }: { num: string | React.ReactNode, onPress: () => void }) => (
    <Pressable 
      onPress={onPress} 
      className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full items-center justify-center m-2 shadow-sm border border-slate-50 dark:border-slate-700/50 active:bg-slate-100 dark:active:bg-slate-700"
    >
      <Text className="text-[28px] font-interMedium text-slate-800 dark:text-white">
        {num}
      </Text>
    </Pressable>
  );

  return (
    <BaseLayout>
      <View className="flex-1 bg-[#F4F6FB] dark:bg-slate-900 pt-16">
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-12">
          <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
            <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={24} />
          </Pressable>
          <Text className="text-[10px] font-interExtraBold text-[#4D3EEB] uppercase tracking-widest mr-4">
            Secure Access
          </Text>
          <View className="w-8" />
        </View>

        <Animated.View entering={FadeInUp.duration(400)} className="items-center px-8">
          <View className="w-20 h-20 rounded-full bg-[#4D3EEB]/10 items-center justify-center mb-6">
            <Lock color="#4D3EEB" size={32} />
          </View>
          
          <Text className="text-[28px] font-interExtraBold text-slate-900 dark:text-white mb-3 text-center">
            {intent === 'unlock' ? 'Unlock Calendar' : 'Set PIN Code'}
          </Text>
          <Text className="text-[14px] font-interMedium text-slate-500 dark:text-slate-400 text-center leading-6 px-4">
            {intent === 'unlock' 
              ? 'Please enter your 4-digit security code to access your debt tracking.'
              : 'Create a new 4-digit security code for this calendar.'}
          </Text>

          {renderDots()}

          {/* Number Pad Grid */}
          <View className="flex-row flex-wrap justify-center w-full max-w-[320px] gap-y-2 mt-2">
            <NumberButton num="1" onPress={() => handlePressNumber('1')} />
            <NumberButton num="2" onPress={() => handlePressNumber('2')} />
            <NumberButton num="3" onPress={() => handlePressNumber('3')} />
            
            <NumberButton num="4" onPress={() => handlePressNumber('4')} />
            <NumberButton num="5" onPress={() => handlePressNumber('5')} />
            <NumberButton num="6" onPress={() => handlePressNumber('6')} />
            
            <NumberButton num="7" onPress={() => handlePressNumber('7')} />
            <NumberButton num="8" onPress={() => handlePressNumber('8')} />
            <NumberButton num="9" onPress={() => handlePressNumber('9')} />
            
            <View className="w-20 h-20 items-center justify-center m-2">
              <Text className="text-[24px]">🤖</Text>
            </View>
            <NumberButton num="0" onPress={() => handlePressNumber('0')} />
            <Pressable onPress={handleBackspace} className="w-20 h-20 items-center justify-center m-2 active:opacity-50">
              <Delete color={isDark ? '#CBD5E1' : '#1E293B'} size={28} />
            </Pressable>
          </View>

          {intent === 'unlock' && (
            <Pressable onPress={() => navigation.navigate('RecoverPin')} className="mt-12 py-4">
              <Text className="text-[#4D3EEB] font-interExtraBold text-[14px]">Forgot PIN?</Text>
              <View className="h-[2px] w-8 bg-slate-200 dark:bg-slate-700 mx-auto mt-4" />
            </Pressable>
          )}

        </Animated.View>
      </View>
    </BaseLayout>
  );
};
