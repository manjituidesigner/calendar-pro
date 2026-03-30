import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export const CreateCalendar = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirePin, setRequirePin] = useState(false);
  const [pin, setPin] = useState(''); // Just for visual in this form. Actual pin is inputted via UnlockCalendar intent

  return (
    <BaseLayout>
      <View className="flex-1 bg-[#F4F6FB] dark:bg-slate-900 pt-12">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-8 mt-4">
          <Pressable onPress={() => navigation.goBack()} className="py-2">
            <Text className="text-[#4D3EEB] font-interExtraBold text-[14px]">Cancel</Text>
          </Pressable>
          <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">
            New Calendar
          </Text>
          <Pressable onPress={() => navigation.goBack()} className="py-2">
            <Text className="text-[#4D3EEB] font-interExtraBold text-[14px]">Save</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View className="px-6 mb-8 mt-2 items-center">
            <Text className="text-[24px] font-interExtraBold text-slate-900 dark:text-white mb-2 text-center">Create New Calendar</Text>
            <Text className="text-[13px] font-interMedium text-slate-500 dark:text-slate-400 text-center px-4 leading-5">Organize your peer-to-peer debts and group expenses in one place.</Text>
          </View>

          <View className="bg-white dark:bg-slate-800 rounded-[32px] mx-6 p-6 shadow-sm border border-slate-100 dark:border-slate-800 gap-y-6">
            
            {/* Calendar Name */}
            <View>
              <Text className="text-[10px] font-interExtraBold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-3 pl-2">Calendar Name</Text>
              <TextInput 
                className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] py-4 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[15px]" 
                placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
                placeholder="e.g., Roommate Debts" 
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-[10px] font-interExtraBold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-3 pl-2">Description (Optional)</Text>
              <TextInput 
                className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] py-4 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[15px] min-h-[100px]" 
                placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
                placeholder="What is this calendar for?" 
                value={description}
                onChangeText={setDescription}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Require PIN Toggle */}
            <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-6 mt-2">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-full bg-[#4D3EEB]/10 items-center justify-center mr-4">
                  <Lock color="#4D3EEB" size={18} />
                </View>
                <View className="flex-1 pr-4">
                  <Text className="text-[14px] font-interExtraBold text-slate-900 dark:text-white mb-0.5">Require 4-digit PIN</Text>
                  <Text className="text-[12px] font-interMedium text-slate-500 dark:text-slate-400 leading-snug">Adds an extra layer of privacy</Text>
                </View>
              </View>
              <Switch 
                value={requirePin}
                onValueChange={setRequirePin}
                trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: '#4D3EEB' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Simulated PIN Display */}
            {requirePin && (
              <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="items-center justify-center pt-2">
                <Pressable onPress={() => navigation.navigate('UnlockCalendar', { intent: 'setup' })} className="flex-row items-center justify-center gap-x-4 mb-3 bg-[#F8F9FA] dark:bg-slate-900 w-full py-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"><Text className="text-slate-500 font-interExtraBold mt-1 text-[24px]">·</Text></View>
                  <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"><Text className="text-slate-500 font-interExtraBold mt-1 text-[24px]">·</Text></View>
                  <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"><Text className="text-slate-500 font-interExtraBold mt-1 text-[24px]">·</Text></View>
                  <View className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 items-center justify-center"><Text className="text-slate-400 font-interMedium text-[20px]">-</Text></View>
                </Pressable>
                <Text className="text-[#4D3EEB] font-interExtraBold text-[10px] uppercase tracking-widest text-center">Set a security code for this calendar</Text>
              </Animated.View>
            )}

          </View>

          <View className="px-6 mt-8">
            <Pressable className="bg-[#4D3EEB] py-[22px] rounded-3xl items-center flex-row justify-center shadow-lg shadow-indigo-500/30 mb-6 w-full ml-auto mr-auto max-w-[90%]">
              <Text className="text-white font-interExtraBold text-[16px] mr-2">Create Calendar</Text>
              <ArrowRight color="white" size={20} />
            </Pressable>
            
            <Pressable onPress={() => navigation.goBack()} className="items-center py-2">
              <Text className="text-slate-500 dark:text-slate-400 font-interExtraBold text-[14px]">Cancel & Go Back</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
