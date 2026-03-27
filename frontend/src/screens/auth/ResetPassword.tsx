import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';

export default function ResetPassword({ route, navigation }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { email } = route.params || {};
  const { isDark } = useTheme();

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { email, password });
      Alert.alert('Success', 'successfully created');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 justify-center px-6 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <View className="mb-10">
        <Text className={`text-3xl font-InterExtraBold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          New Password
        </Text>
        <Text className={`text-base font-InterLight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
          Create a new password for your account
        </Text>
      </View>

      <View className="space-y-4 mb-6">
        <View>
          <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            New Password
          </Text>
          <TextInput
            className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
            placeholder="Enter new password"
            placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <View>
          <Text className={`text-sm font-InterMedium mb-2 mt-4 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
            Confirm Password
          </Text>
          <TextInput
            className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
            placeholder="Confirm new password"
            placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
      </View>

      <TouchableOpacity
        className="w-full bg-[#3b82f6] p-4 rounded-xl items-center shadow-md shadow-blue-500/30"
        onPress={handleReset}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-InterExtraBold text-lg">Save Password</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
