import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth, API_URL } from '../../context/AuthContext';
import axios from 'axios';
import { useTheme } from '../../theme/ThemeContext';

const InputField = ({ label, placeholder, value, onChangeText, secure = false, keyboardType = 'default', autoCapitalize = 'none', isDark }) => (
  <View className="mb-4">
    <Text className={`text-sm font-InterMedium mb-2 ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>
      {label}
    </Text>
    <TextInput
      className={`w-full p-4 rounded-xl font-InterMedium ${isDark ? 'bg-zinc-800 text-white' : 'bg-white text-slate-900'} shadow-sm border ${isDark ? 'border-zinc-700' : 'border-slate-200'}`}
      placeholder={placeholder}
      placeholderTextColor={isDark ? '#71717a' : '#94a3b8'}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
);

export default function Signup({ navigation }) {
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { isDark } = useTheme();

  const handleSignup = async () => {
    if (!username || !phone || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        username,
        phone,
        email,
        password,
      });
      Alert.alert('Success', 'Account created successfully! Please login.');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-zinc-900' : 'bg-slate-50'}`}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}>
          <View className="mb-8">
            <Text className={`text-3xl font-InterExtraBold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Create Account
            </Text>
            <Text className={`text-base font-InterLight ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Join us to manage your finances
            </Text>
          </View>

          <View className="space-y-2">
            <InputField label="Username" placeholder="Enter username" value={username} onChangeText={setUsername} isDark={isDark} />
            <InputField label="Phone Number" placeholder="Enter phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" isDark={isDark} />
            <InputField label="Email Address" placeholder="Enter email" value={email} onChangeText={setEmail} keyboardType="email-address" isDark={isDark} />
            <InputField label="Password" placeholder="Create a password" value={password} onChangeText={setPassword} secure isDark={isDark} />

            <TouchableOpacity
              className="w-full bg-[#3b82f6] p-4 rounded-xl items-center mt-6 shadow-md shadow-blue-500/30"
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-InterExtraBold text-lg">Sign Up</Text>
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8">
            <Text className={`font-InterMedium ${isDark ? 'text-zinc-400' : 'text-slate-500'}`}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-[#3b82f6] font-InterExtraBold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
