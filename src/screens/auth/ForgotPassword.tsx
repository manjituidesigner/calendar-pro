import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      Alert.alert('Success', 'OTP sent to your email');
      navigation.navigate('VerifyOTP', { email });
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 justify-center px-6 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <View className="mb-10">
        <Text className={`text-3xl font-InterExtraBold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Reset Password
        </Text>
        <Text className={`text-base font-InterLight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Enter your email to receive a 4-digit OTP
        </Text>
      </View>

      <View className="mb-6">
        <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
          Email Address
        </Text>
        <TextInput
          className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
          placeholder="Enter your email"
          placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity
        className="w-full bg-[#3b82f6] p-4 rounded-xl items-center shadow-md shadow-blue-500/30 mb-4"
        onPress={handleSendOTP}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-InterExtraBold text-lg">Send OTP</Text>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.goBack()} className="items-center">
        <Text className={`font-InterMedium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>Back to Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
