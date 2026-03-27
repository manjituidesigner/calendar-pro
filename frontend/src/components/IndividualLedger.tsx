import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ArrowLeft, BellRing, CheckCircle2, MessageCircle } from 'lucide-react-native';
import Animated, { FadeInUp, SlideInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface Person {
  id: string;
  name: string;
  type: string;
  balance: number;
  synced: boolean;
  mobile: string;
  city: string;
}

const DUMMY_TRANSACTIONS = [
  { id: '1', date: 'Oct 12, 2026', amount: 500, type: 'Borrowed', status: 'Pending' },
  { id: '2', date: 'Oct 05, 2026', amount: 300, type: 'Paid', status: 'Settled' },
  { id: '3', date: 'Sep 28, 2026', amount: 150, type: 'Borrowed', status: 'Settled' },
];

export const IndividualLedger = ({ person, onBack }: { person: Person; onBack: () => void }) => {
  const { isDark } = useTheme();

  const handleReminder = async () => {
    try {
      await Share.share({
        message: `Hey ${person.name}, just a quick reminder about our pending balance of ₹${Math.abs(person.balance)} on Ledger Pulse!`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleSettle = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Settled', `Marked latest transaction with ${person.name} as Settled!`);
  };

  return (
    <Animated.View entering={SlideInRight.duration(300)} className="flex-1 w-full bg-[#f8fafc] dark:bg-[#020617] absolute inset-0 z-50 pt-12 px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable onPress={onBack} className="p-2 bg-slate-200 dark:bg-slate-800 rounded-full">
          <ArrowLeft color={isDark ? '#E2E8F0' : '#0F172A'} size={24} />
        </Pressable>
        <View className="flex-row gap-x-2">
          <Pressable onPress={handleReminder} className="flex-row items-center bg-[#F59E0B]/20 border border-[#F59E0B] px-4 py-2 rounded-full">
            <BellRing color="#F59E0B" size={16} />
            <Text className="text-[#F59E0B] font-interExtraBold ml-2 text-[14px]">Remind</Text>
          </Pressable>
          {!person.synced && (
            <Pressable className="flex-row items-center bg-[#3079E6] px-4 py-2 rounded-full">
              <Text className="text-white font-interExtraBold text-[14px]">Invite to Sync</Text>
            </Pressable>
          )}
        </View>
      </View>

      <View className="items-center mb-8">
        <View className="bg-actionBlue w-24 h-24 rounded-full items-center justify-center shadow-lg shadow-actionBlue/40 mb-4 border-4 border-white dark:border-[#0F172A]">
          <Text className="text-white text-[36px] font-interExtraBold uppercase">{person.name.substring(0, 2)}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-[28px] font-interExtraBold text-black dark:text-white">{person.name}</Text>
          {person.synced && <CheckCircle2 color="#10B981" size={24} fill="#10B981" className="ml-2 bg-white rounded-full" />}
        </View>
        <Text className="text-[14px] font-interMedium text-slate-500 mt-1">{person.mobile} • {person.city}</Text>
        
        <View className="mt-6 bg-white dark:bg-slate-900 px-8 py-4 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 items-center w-full">
          <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Net Balance</Text>
          <Text className={`text-[36px] font-interExtraBold tracking-wider ${person.balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {person.balance >= 0 ? '+' : '-'}₹{Math.abs(person.balance)}
          </Text>
          <Text className={`text-[14px] font-interMedium ${person.balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {person.balance >= 0 ? 'You will receive' : 'You need to pay'}
          </Text>
        </View>
      </View>

      <Text className="text-[18px] font-interExtraBold text-black dark:text-white mb-4">Transaction Timeline</Text>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {DUMMY_TRANSACTIONS.map((tx, index) => (
          <Animated.View key={tx.id} entering={FadeInUp.delay(index * 150).springify().damping(12)} className="flex-row mb-6 mt-2">
            {/* Timeline Line & Dot */}
            <View className="items-center mr-4">
              <View className={`w-4 h-4 rounded-full border-2 border-white dark:border-[#020617] ${tx.type === 'Borrowed' ? 'bg-[#EF4444]' : 'bg-[#10B981]'} shadow-sm z-10`} />
              {index !== DUMMY_TRANSACTIONS.length - 1 && <View className="w-[2px] h-full bg-slate-200 dark:bg-slate-800 absolute top-4 z-0" />}
            </View>
            
            {/* Chat Bubble */}
            <View className={`flex-1 p-4 rounded-2xl ${tx.type === 'Borrowed' ? 'bg-[#EF4444]/10 rounded-tl-sm border border-[#EF4444]/20' : 'bg-[#10B981]/10 rounded-tl-sm border border-[#10B981]/20'}`}>
              <View className="flex-row justify-between mb-1">
                <Text className={`text-[12px] font-interMedium ${tx.type === 'Borrowed' ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{tx.type}</Text>
                <Text className="text-[12px] font-interLight text-slate-500">{tx.date}</Text>
              </View>
              <Text className="text-[20px] font-interExtraBold text-black dark:text-white mb-2">₹{tx.amount}</Text>
              <View className="flex-row justify-between items-center">
                <Text className="text-[12px] font-interMedium text-slate-500 uppercase tracking-widest">{tx.status}</Text>
                {tx.status === 'Pending' && (
                  <Pressable onPress={handleSettle} className="bg-black dark:bg-white px-3 py-1 rounded-full">
                    <Text className="text-white dark:text-black font-interExtraBold text-[10px] uppercase">Mark Settled</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};
