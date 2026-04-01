import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';
import { BaseLayout } from '../../components/BaseLayout';

export default function Login({ navigation }: any) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isDark } = useTheme();

  const handleLogin = async () => {
    if (!identifier || !password) {
      Alert.alert('Error', 'Please enter all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password,
      });
      await login(response.data);
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseLayout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-8"
      >
        <View className="mb-10">
          <Text className="text-[40px] font-interExtraBold text-slate-900 dark:text-white leading-tight">
            Welcome{"\n"}Back
          </Text>
          <View className="w-12 h-1.5 bg-[#6B4EFF] rounded-full mt-4" />
          <Text className="text-[16px] font-interMedium text-slate-500 dark:text-slate-400 mt-4">
            Sign in to access your ledger
          </Text>
        </View>

        <View className="gap-y-5">
          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Credential
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="Email, Phone or Username"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className="text-[12px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-2">
              Password
            </Text>
            <TextInput
              className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl text-slate-900 dark:text-white font-interMedium shadow-sm border border-slate-200 dark:border-slate-800"
              placeholder="Your secure password"
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="self-end mr-2" 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text className="text-[#6B4EFF] font-interExtraBold text-[13px]">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-[#6B4EFF] p-5 rounded-2xl items-center mt-6 shadow-xl shadow-indigo-500/30"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-interExtraBold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-12">
          <Text className="font-interMedium text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-[#6B4EFF] font-interExtraBold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
}
