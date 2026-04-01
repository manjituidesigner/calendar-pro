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

  // Updated to remove mock calendars and show only the actual primary one
  const [calendars, setCalendars] = useState([
    {
      id: 'primary',
      title: 'Primary Ledger',
      description: 'Your main calendar for tracking all daily expenses and peer-to-peer debts.',
      color: 'bg-[#6B4EFF]',
      protected: false
    }
  ]);

  return (
    <BaseLayout>
      <View className="flex-1 bg-transparent pt-12">
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
          <Pressable onPress={() => navigation.navigate('CreateCalendar')} className="w-10 h-10 bg-[#6B4EFF] rounded-full items-center justify-center shadow-lg shadow-indigo-500/30">
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
              <Animated.View key={cal.id} entering={FadeInDown.delay(index * 100).duration(400)} className="bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700/50">
                {/* Top Color Banner */}
                <View className={`h-24 w-full ${cal.color}`} />
                
                {/* Bottom Content */}
                <View className="p-5">
                  <View className="flex-row items-center mb-1">
                    {cal.protected ? (
                      <Lock color="#6B4EFF" size={10} strokeWidth={3} />
                    ) : (
                      <Unlock color="#94A3B8" size={10} strokeWidth={3} />
                    )}
                    <Text className={`text-[9px] font-interExtraBold uppercase ml-1.5 tracking-wider ${cal.protected ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>
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
                        <Pressable onPress={() => navigation.navigate('UnlockCalendar', { intent: 'remove_pin', calendarId: cal.id })} className="bg-[#6B4EFF]/10 px-4 py-2 rounded-full">
                          <Text className="text-[#6B4EFF] font-interExtraBold text-[10px] uppercase">Edit PIN</Text>
                        </Pressable>
                      ) : (
                        <Pressable onPress={() => navigation.navigate('UnlockCalendar', { intent: 'add_pin', calendarId: cal.id })} className="bg-[#6B4EFF] px-4 py-2 rounded-full shadow-sm shadow-indigo-500/20">
                          <Text className="text-white font-interExtraBold text-[10px] uppercase">Add PIN</Text>
                        </Pressable>
                      )}
                      <Pressable className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-full">
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

          <View className="items-center justify-center mt-12 mb-6">
            <View className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-2">
               <CalendarIcon color={isDark ? '#475569' : '#94A3B8'} size={24} />
            </View>
            <Text className="text-slate-400 font-interMedium text-[12px]">{calendars.length} Calendar Active</Text>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
