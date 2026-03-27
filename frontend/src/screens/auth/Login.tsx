import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigation } from '@react-native-navigation/native'; // Fallback if necessary
import { useTheme } from '../../theme/ThemeContext';

export default function Login({ navigation }) {
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
      // Main app navigator will automatically switch from AuthNavigator to AppNavigator
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center px-6"
      >
        <View className="mb-10">
          <Text className={`text-4xl font-InterExtraBold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back
          </Text>
          <Text className={`text-base font-InterLight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Sign in to continue
          </Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Email, Phone or Username
            </Text>
            <TextInput
              className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
              placeholder="Enter your credential"
              placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
              Password
            </Text>
            <TextInput
              className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
              placeholder="Enter your password"
              placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="self-end mt-2" 
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text className="text-[#3b82f6] font-InterMedium">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full bg-[#3b82f6] p-4 rounded-xl items-center mt-6 shadow-md shadow-blue-500/30"
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-InterExtraBold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-10">
          <Text className={`font-InterMedium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-[#3b82f6] font-InterExtraBold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
