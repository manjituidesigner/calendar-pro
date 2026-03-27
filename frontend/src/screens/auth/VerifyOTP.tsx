import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';

export default function VerifyOTP({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { email } = route.params || {};
  const { isDark } = useTheme();

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Error', 'Please enter a valid 4-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-otp`, { email, otp });
      Alert.alert('Success', 'OTP Verified');
      navigation.navigate('ResetPassword', { email });
    } catch (error) {
      Alert.alert('Verification Failed', error.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 justify-center px-6 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <View className="mb-10">
        <Text className={`text-3xl font-InterExtraBold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Verify OTP
        </Text>
        <Text className={`text-base font-InterLight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Enter the 4-digit OTP sent to {email}
        </Text>
      </View>

      <View className="mb-6">
        <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          4-Digit OTP
        </Text>
        <TextInput
          className={`w-full p-4 rounded-xl font-InterMedium text-center text-2xl tracking-[1em] ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
          placeholder="0000"
          placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>

      <TouchableOpacity
        className="w-full bg-[#3b82f6] p-4 rounded-xl items-center shadow-md shadow-blue-500/30"
        onPress={handleVerify}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-InterExtraBold text-lg">Verify & Proceed</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} className="items-center mt-6">
        <Text className={`font-InterMedium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Change Email</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
