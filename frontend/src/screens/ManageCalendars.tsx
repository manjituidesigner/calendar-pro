import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Lock, Unlock, Edit2, Trash2, Calendar as CalendarIcon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const ManageCalendars = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  // Mock Calendars
  const [calendars, setCalendars] = useState([
    {
      id: '1',
      title: 'Shared House Expenses',
      description: 'Tracking monthly utilities, rent splits, and grocery balances with roommates.',
      color: 'bg-[#6B4EFF]',
      protected: true
    },
    {
      id: '2',
      title: 'Personal Debt Tracker',
      description: 'Private log of personal loans, repayments, and recurring subscriptions.',
      color: 'bg-[cyan]', // cyan mapping
      protected: true
    },
    {
      id: '3',
      title: 'Casual IOUs',
      description: 'Small lendings and coffee tabs for friends.',
      color: 'bg-[#F43F5E]', // rose/pink mapping
      protected: false
    }
  ]);

  return (
    <BaseLayout>
      <View className="flex-1 bg-[#F4F6FB] dark:bg-slate-900 pt-12">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-6">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={24} />
            </Pressable>
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white ml-2">
              Manage Calendars
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('CreateCalendar')} className="w-10 h-10 bg-[#4D3EEB] rounded-full items-center justify-center shadow-lg shadow-indigo-500/30">
            <Plus color="white" size={20} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View className="px-6 mb-6">
            <Text className="text-[16px] font-interExtraBold text-slate-900 dark:text-white mb-1">Your Calendars</Text>
            <Text className="text-[12px] font-interMedium text-slate-500 dark:text-slate-400">Organize your debt tracking and shared expenses.</Text>
          </View>

          <View className="px-6 gap-y-6">
            {calendars.map((cal, index) => (
              <Animated.View key={cal.id} entering={FadeInDown.delay(index * 100).duration(400)} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm overflow-hidden">
                {/* Top Color Banner */}
                <View className={`h-32 w-full ${cal.color}`} />
                
                {/* Bottom Content */}
                <View className="p-5">
                  <View className="flex-row items-center mb-1">
                    {cal.protected ? (
                      <Lock color="#4D3EEB" size={10} strokeWidth={3} />
                    ) : (
                      <Unlock color="#94A3B8" size={10} strokeWidth={3} />
                    )}
                    <Text className={`text-[9px] font-interExtraBold uppercase ml-1.5 tracking-wider ${cal.protected ? 'text-[#4D3EEB]' : 'text-slate-400'}`}>
                      {cal.protected ? 'PIN PROTECTED' : 'UNPROTECTED'}
                    </Text>
                  </View>
                  
                  <Text className="text-[16px] font-interExtraBold text-slate-900 dark:text-white mb-2">
                    {cal.title}
                  </Text>
                  
                  <Text className="text-[12px] font-interMedium text-slate-500 dark:text-slate-400 leading-5 mb-5">
                    {cal.description}
                  </Text>
                  
                  <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <View className="flex-row items-center gap-x-4">
                      {cal.protected ? (
                        <Pressable onPress={() => navigation.navigate('UnlockCalendar', { intent: 'remove_pin', calendarId: cal.id })} className="bg-[#4D3EEB]/10 px-4 py-2 rounded-full">
                          <Text className="text-[#4D3EEB] font-interExtraBold text-[10px] uppercase">Edit PIN</Text>
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => navigation.navigate('UnlockCalendar', { intent: 'add_pin', calendarId: cal.id })} className="bg-[#4D3EEB] px-4 py-2 rounded-full shadow-sm shadow-indigo-500/20">
                          <Text className="text-white font-interExtraBold text-[10px] uppercase">Add PIN</Text>
                        </Pressable>
                      )}
                      <Pressable className="p-2 bg-slate-50 dark:bg-slate-700 rounded-full">
                        <Edit2 color={isDark ? '#CBD5E1' : '#475569'} size={14} />
                      </Pressable>
                    </View>
                    
                    <Pressable className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-900/50">
                      <Trash2 color="#EF4444" size={14} />
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          <View className="items-center justify-center mt-10 mb-6">
            <CalendarIcon color="#94A3B8" size={24} className="mb-2 opacity-50" />
            <Text className="text-slate-400 font-interMedium text-[12px]">{calendars.length} Calendars Active</Text>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
