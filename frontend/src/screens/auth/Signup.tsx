import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';
import { BaseLayout } from '../../components/BaseLayout';

export default function Signup({ navigation }: any) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSignup = async () => {
    if (!username || !email || !phoneNumber || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        phoneNumber,
        password,
      });
      Alert.alert('Success', 'Registration successful! Please login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <ScrollView showsVerticalScrollIndicator={false}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8 pt-20 pb-20"
      >
        <View className="mb-10">
          <Text className="text-[40px] font-interExtraBold text-slate-900 dark:text-white leading-tight">
            Join the{"\n"}Ledger
          </Text>
          <View className="w-12 h-1.5 bg-[#10B981] rounded-full mt-4" />
          <Text className="text-[16px] font-interMedium text-slate-500 dark:text-slate-400 mt-4">
            Manage your finances like a pro
          </Text>
        </View>

        <View className="gap-y-5">
          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Full Name
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="e.g. John Doe"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Email Address
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="john@example.com"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Phone Number
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="+91 99999 99999"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Password
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="Create a strong password"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-[#10B981] p-5 rounded-2xl items-center mt-6 shadow-xl shadow-green-500/30"
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-interExtraBold text-lg">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-12 mb-10">
          <Text className="font-interMedium text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text className="text-[#10B981] font-interExtraBold">Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      </ScrollView>
    </BaseLayout>
  );
}
