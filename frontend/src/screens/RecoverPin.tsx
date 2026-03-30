import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Mail, KeyRound, Unlock, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const RecoverPin = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { user } = useAuth(); // to check email match

  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP, 3 = Reset Options
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPin, setNewPin] = useState('');

  const handleSendOtp = () => {
    // Check if email matches
    if (!email) {
      Alert.alert('Error', 'Please enter an email.');
      return;
    }
    // Simplistic check for mock
    if (user?.email && email.toLowerCase() !== user.email.toLowerCase() && email !== 'test@test.com') {
      Alert.alert('Security Error', 'Email does not match your account.');
      return;
    }
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid OTP.');
      return;
    }
    setStep(3);
  };

  const handleSetNewPin = () => {
    if (newPin.length !== 4) {
      Alert.alert('Error', 'PIN must be exactly 4 digits.');
      return;
    }
    Alert.alert('Success', 'Your new PIN has been set!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleRemoveProtection = () => {
    Alert.alert('Security Updated', 'PIN protection has been removed from this calendar.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <BaseLayout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-[#F4F6FB] dark:bg-slate-900 pt-16">
          
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 mb-8">
            <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={24} />
            </Pressable>
            <Text className="text-[10px] font-interExtraBold text-[#4D3EEB] uppercase tracking-widest mr-4">
              Account Recovery
            </Text>
            <View className="w-8" />
          </View>

          <View className="px-8 flex-1">
            {step === 1 && (
              <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
                <View className="w-16 h-16 rounded-full bg-[#4D3EEB]/10 items-center justify-center mb-6 self-center">
                  <Mail color="#4D3EEB" size={28} />
                </View>
                <Text className="text-[28px] font-interExtraBold text-slate-900 dark:text-white mb-3 text-center">Verify Email</Text>
                <Text className="text-[14px] font-interMedium text-slate-500 dark:text-slate-400 text-center leading-6 mb-8 px-2">
                  To recover your calendar, please enter the email address associated with your account.
                </Text>
                
                <TextInput 
                  className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] py-5 px-6 rounded-2xl text-black dark:text-white font-interMedium text-[15px] mb-8 shadow-sm"
                  placeholder="name@example.com"
                  placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
                
                <Pressable onPress={handleSendOtp} className="w-full bg-[#4D3EEB] py-[22px] rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Text className="text-white font-interExtraBold text-[16px]">Send OTP Code</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 2 && (
              <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
                <View className="w-16 h-16 rounded-full bg-[#10B981]/10 items-center justify-center mb-6 self-center">
                  <KeyRound color="#10B981" size={28} />
                </View>
                <Text className="text-[28px] font-interExtraBold text-slate-900 dark:text-white mb-3 text-center">Enter OTP</Text>
                <Text className="text-[14px] font-interMedium text-slate-500 dark:text-slate-400 text-center leading-6 mb-8 px-2">
                  We sent a 4-digit code to <Text className="font-interExtraBold text-slate-800 dark:text-slate-200">{email}</Text>. Please enter it below.
                </Text>
                
                <TextInput 
                  className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] py-5 px-6 rounded-2xl text-black dark:text-white font-interMedium text-[24px] tracking-[1em] text-center mb-8 shadow-sm"
                  placeholder="0000"
                  placeholderTextColor={isDark ? '#334155' : '#CBD5E1'}
                  keyboardType="numeric"
                  maxLength={4}
                  value={otp}
                  onChangeText={setOtp}
                />
                
                <Pressable onPress={handleVerifyOtp} className="w-full bg-[#10B981] py-[22px] rounded-2xl items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Text className="text-white font-interExtraBold text-[16px]">Verify OTP</Text>
                </Pressable>
              </Animated.View>
            )}

            {step === 3 && (
              <Animated.View entering={FadeIn} exiting={FadeOut} className="flex-1">
                <View className="w-16 h-16 rounded-full bg-[#4D3EEB]/10 items-center justify-center mb-6 self-center">
                  <ShieldCheck color="#4D3EEB" size={28} />
                </View>
                <Text className="text-[28px] font-interExtraBold text-slate-900 dark:text-white mb-3 text-center">Security Options</Text>
                <Text className="text-[14px] font-interMedium text-slate-500 dark:text-slate-400 text-center leading-6 mb-10 px-2">
                  Identity verified successfully. What would you like to do with this calendar?
                </Text>
                
                <View className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm mb-6 border border-slate-100 dark:border-slate-700/50">
                  <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3">Set New PIN</Text>
                  <TextInput 
                    className="border border-slate-200 dark:border-slate-700 bg-[#F8F9FA] dark:bg-[#0F172A] py-4 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[18px] tracking-[0.5em] text-center shadow-sm"
                    placeholder="••••"
                    placeholderTextColor={isDark ? '#334155' : '#CBD5E1'}
                    keyboardType="numeric"
                    maxLength={4}
                    value={newPin}
                    onChangeText={setNewPin}
                  />
                  <Pressable onPress={handleSetNewPin} className="w-full bg-[#4D3EEB] py-4 rounded-2xl items-center justify-center shadow-md shadow-indigo-500/20 mt-4">
                    <Text className="text-white font-interExtraBold text-[14px]">Save New PIN</Text>
                  </Pressable>
                </View>

                <View className="flex-row items-center justify-center mb-6">
                  <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                  <Text className="mx-4 text-slate-400 font-interExtraBold text-[10px] uppercase">OR</Text>
                  <View className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-700" />
                </View>

                <Pressable onPress={handleRemoveProtection} className="w-full bg-red-50 dark:bg-red-900/10 py-[22px] rounded-2xl items-center flex-row justify-center border border-red-100 dark:border-red-900/40">
                  <Unlock color="#EF4444" size={18} />
                  <Text className="text-red-500 font-interExtraBold text-[15px] ml-2">Remove PIN Protection</Text>
                </Pressable>

              </Animated.View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
};
