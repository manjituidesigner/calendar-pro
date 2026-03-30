import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Download, Share2, ChevronDown, Home as HomeIcon, ShoppingCart, Fuel, Users } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeInUp } from 'react-native-reanimated';

export const MonthlyReport = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();

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
              Monthly Report
            </Text>
          </View>
          <View className="flex-row items-center gap-x-4">
            <Pressable>
              <Download color="#6B4EFF" size={20} />
            </Pressable>
            <Pressable>
              <Share2 color="#6B4EFF" size={20} />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Total Spending & Month Selector */}
          <View className="px-6 mb-6">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-1">Total Spending</Text>
                <Text className="text-[36px] font-interExtraBold text-slate-900 dark:text-white tracking-tight">$3,240.50</Text>
              </View>
              <Pressable className="bg-[#6B4EFF]/10 px-4 py-2 rounded-full flex-row items-center mt-2">
                <Text className="text-[#6B4EFF] font-interExtraBold text-[12px] mr-1">Oct 2023</Text>
                <ChevronDown color="#6B4EFF" size={14} />
              </Pressable>
            </View>
          </View>

          {/* Budget Cards */}
          <View className="flex-row px-6 gap-x-4 mb-6">
            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm">
              <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-2">Budget</Text>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">$4,000.00</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm">
              <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-2">Remaining</Text>
              <Text className="text-[18px] font-interExtraBold text-[#6B4EFF]">$759.50</Text>
            </View>
          </View>

          {/* Expense Distribution Placeholder */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} className="bg-white dark:bg-slate-800 mx-6 p-6 rounded-[32px] shadow-sm mb-8">
            <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white mb-8">
              Expense Distribution
            </Text>
            
            {/* Mock Bar Chart */}
            <View className="flex-row items-end justify-center h-32 gap-x-4 border-b border-slate-100 dark:border-slate-700 pb-4">
              <View className="items-center">
                <View className="w-16 h-12 bg-[#C4B5FD] rounded-t-lg" />
                <Text className="text-[10px] font-interExtraBold text-slate-400 mt-2 uppercase tracking-widest">GRO</Text>
              </View>
              <View className="items-center">
                <View className="w-20 h-28 bg-[#6B4EFF] rounded-t-lg shadow-md shadow-[#6B4EFF]/30" />
                <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] mt-2 uppercase tracking-widest">RENT</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-8 bg-[#DDD6FE] rounded-t-lg" />
                <Text className="text-[10px] font-interExtraBold text-slate-400 mt-2 uppercase tracking-widest">OTH</Text>
              </View>
            </View>
          </Animated.View>

          {/* Category Breakdown */}
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white">
                Category Breakdown
              </Text>
              <Pressable>
                <Text className="text-[12px] font-interExtraBold text-[#6B4EFF]">View All</Text>
              </Pressable>
            </View>

            <View className="gap-y-3">
              {/* Row 1 */}
              <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 items-center justify-center mr-4">
                    <HomeIcon color="#6B4EFF" size={20} />
                  </View>
                  <View>
                    <Text className="font-interExtraBold text-slate-800 dark:text-white text-[14px] mb-1">Rent & Mortgage</Text>
                    <Text className="text-slate-400 font-interMedium text-[10px]">48% of total spend</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-interExtraBold text-slate-800 dark:text-white text-[15px] mb-1">$1,200.00</Text>
                  <Text className="text-green-500 font-interExtraBold text-[10px]">On Budget</Text>
                </View>
              </View>

              {/* Row 2 */}
              <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 items-center justify-center mr-4">
                    <ShoppingCart color="#F97316" size={20} />
                  </View>
                  <View>
                    <Text className="font-interExtraBold text-slate-800 dark:text-white text-[14px] mb-1">Grocery</Text>
                    <Text className="text-slate-400 font-interMedium text-[10px]">15% of total spend</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-interExtraBold text-slate-800 dark:text-white text-[15px] mb-1">$450.00</Text>
                  <Text className="text-red-500 font-interExtraBold text-[10px]">+5% vs last m</Text>
                </View>
              </View>

              {/* Row 3 */}
              <View className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-900/30 items-center justify-center mr-4">
                    <Fuel color="#14B8A6" size={20} />
                  </View>
                  <View>
                    <Text className="font-interExtraBold text-slate-800 dark:text-white text-[14px] mb-1">Petrol & Travel</Text>
                    <Text className="text-slate-400 font-interMedium text-[10px]">4% of total spend</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="font-interExtraBold text-slate-800 dark:text-white text-[15px] mb-1">$120.00</Text>
                  <Text className="text-slate-400 font-interExtraBold text-[10px]">Steady</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Debt Balance Badge */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mx-6 mb-8 mt-4 bg-[#6B4EFF] rounded-[32px] p-6 shadow-xl shadow-[#6B4EFF]/30 flex-row items-center justify-between overflow-hidden relative">
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
            <View>
              <Text className="text-white/70 font-interExtraBold text-[10px] uppercase tracking-widest mb-2">P2P Debt Balance</Text>
              <Text className="text-white font-interExtraBold text-[22px] mb-1">You're owed $320.00</Text>
              <Text className="text-white/60 font-interMedium text-[10px]">Calculated from shared expenses</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Users color="white" size={20} />
            </View>
          </Animated.View>

          {/* Action Button */}
          <View className="px-6 mb-8">
            <Pressable className="w-full bg-[#4D3EEB] py-5 rounded-[20px] items-center mb-6 shadow-lg shadow-indigo-500/20">
              <Text className="text-white font-interExtraBold text-[16px]">View All Transactions</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
