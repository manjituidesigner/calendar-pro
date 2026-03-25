import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Download, Share2, TrendingDown, TrendingUp, Trophy } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { BaseLayout } from '../components/BaseLayout';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const CATEGORIES = [
  { id: '1', name: 'Food & Dining', spent: 12500, budget: 15000, icon: '🍔', color: '#3B82F6' },
  { id: '2', name: 'Shopping', spent: 8500, budget: 5000, icon: '🛍️', color: '#8B5CF6' }, // Over budget
  { id: '3', name: 'Transport', spent: 4000, budget: 5000, icon: '🚗', color: '#10B981' },
  { id: '4', name: 'Utilities', spent: 3200, budget: 4000, icon: '⚡', color: '#F59E0B' },
  { id: '5', name: 'Entertainment', spent: 2000, budget: 2000, icon: '🎬', color: '#EC4899' },
];

const TOTAL_SPENT = CATEGORIES.reduce((acc, cat) => acc + cat.spent, 0);
const PERCENTAGE_CHANGE = -12; // 12% drop

const AnimatedProgressBar = ({ spent, budget, color, delay }: { spent: number; budget: number; color: string; delay: number }) => {
  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay, withSpring(`${percentage}%`, { damping: 15, stiffness: 60 })),
    };
  });

  return (
    <View className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
      <Animated.View 
        style={[{ height: '100%', backgroundColor: isOverBudget ? '#EF4444' : color }, animatedStyle]}
        className={isOverBudget ? 'shadow-[0_0_10px_rgba(239,68,68,0.8)]' : ''}
      />
    </View>
  );
};

export const Reports = () => {
  const { isDark } = useTheme();

  const handleExportPDF = async () => {
    const html = `
      <html>
        <body style="font-family: sans-serif; padding: 40px; color: #0f172a; background: #f8fafc;">
          <h1 style="color: #2141a4;">Monthly Report: Oct 2026</h1>
          <h2>Total Spent: ₹${TOTAL_SPENT}</h2>
          <hr/>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background: #2141a4; color: white;">
              <th style="padding: 10px; text-align: left;">Category</th>
              <th style="padding: 10px; text-align: right;">Spent</th>
            </tr>
            ${CATEGORIES.map(c => `
              <tr style="border-bottom: 1px solid #cbd5e1;">
                <td style="padding: 10px;">${c.icon} ${c.name}</td>
                <td style="padding: 10px; text-align: right; color: ${c.spent > c.budget ? '#ef4444' : '#0f172a'}">₹${c.spent}</td>
              </tr>
            `).join('')}
          </table>
          <p style="margin-top: 40px; font-size: 12px; color: #64748b;">Generated via Ledger Pulse</p>
        </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <BaseLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 16 }}>
        
        {/* Header & Export Actions */}
        <View className="flex-row justify-between items-center mb-8">
          <Text className="text-[34px] font-interExtraBold text-black dark:text-white">
            Insights
          </Text>
          <View className="flex-row gap-x-3">
            <Pressable onPress={handleExportPDF} className="bg-slate-200 dark:bg-slate-800 p-3 rounded-full">
              <Download color={isDark ? '#E2E8F0' : '#0F172A'} size={20} />
            </Pressable>
            <Pressable onPress={handleExportPDF} className="bg-[#10B981]/20 border border-[#10B981]/50 p-3 rounded-full">
              <Share2 color="#10B981" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Visual Analytics - Big Total */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <View className="bg-white dark:bg-slate-900/40 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden">
            <View className="absolute -top-10 -right-10 w-40 h-40 bg-actionBlue/10 rounded-full blur-3xl" />
            
            <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Total Spent This Month</Text>
            <Text className="text-[48px] font-interExtraBold text-black dark:text-white">
              ₹{(TOTAL_SPENT / 1000).toFixed(1)}k
            </Text>
            
            <View className="flex-row items-center mt-2">
              <View className={`flex-row items-center px-2 py-1 rounded-full ${PERCENTAGE_CHANGE < 0 ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'}`}>
                {PERCENTAGE_CHANGE < 0 ? <TrendingDown color="#10B981" size={14} /> : <TrendingUp color="#EF4444" size={14} />}
                <Text className={`font-interExtraBold text-[12px] ml-1 ${PERCENTAGE_CHANGE < 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                  {Math.abs(PERCENTAGE_CHANGE)}% {PERCENTAGE_CHANGE < 0 ? 'less' : 'more'}
                </Text>
              </View>
              <Text className="text-[12px] font-interMedium text-slate-400 ml-2">than last month</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bar Chart Section */}
        <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8 p-4 bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
          <Text className="text-[16px] font-interExtraBold text-black dark:text-white mb-4">Top 5 Spending Categories</Text>
          <View className="flex-row items-end justify-between h-40 pt-4 px-2">
            {CATEGORIES.map((cat, index) => {
              const maxSpent = Math.max(...CATEGORIES.map(c => c.spent));
              const heightPercent = Math.max((cat.spent / maxSpent) * 100, 10);
              
              const animatedStyle = useAnimatedStyle(() => {
                return {
                  height: withDelay(300 + index * 100, withSpring(`${heightPercent}%`, { damping: 15 })),
                };
              });

              return (
                <View key={cat.id} className="items-center w-[15%]">
                  <Text className="text-[10px] font-interExtraBold text-slate-500 mb-2 truncate">₹{(cat.spent / 1000).toFixed(1)}k</Text>
                  <Animated.View style={[{ width: '100%', backgroundColor: cat.color, borderTopLeftRadius: 8, borderTopRightRadius: 8 }, animatedStyle]} />
                  <Text className="mt-2 text-[14px]">{cat.icon}</Text>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* Category Breakdown Table */}
        <Text className="text-[18px] font-interExtraBold text-black dark:text-white mb-4">Breakdown & Budgets</Text>
        
        {CATEGORIES.map((cat, index) => {
          const isOverBudget = cat.spent > cat.budget;
          return (
            <Animated.View key={cat.id} entering={FadeInDown.delay(300 + index * 100).springify()} className="mb-4 bg-white dark:bg-slate-900/40 p-4 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="flex-row justify-between items-center mb-1">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: cat.color + '20' }}>
                    <Text className="text-[18px]">{cat.icon}</Text>
                  </View>
                  <View>
                    <Text className="font-interExtraBold text-[16px] text-black dark:text-white">{cat.name}</Text>
                    <Text className="text-[12px] font-interMedium text-slate-500">Budget: ₹{cat.budget}</Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className={`font-interExtraBold text-[18px] ${isOverBudget ? 'text-[#EF4444]' : 'text-black dark:text-white'}`}>
                    ₹{cat.spent}
                  </Text>
                  {isOverBudget && <Text className="text-[10px] font-interExtraBold text-[#EF4444] uppercase tracking-widest">Over Budget</Text>}
                </View>
              </View>
              
              <AnimatedProgressBar spent={cat.spent} budget={cat.budget} color={cat.color} delay={500 + index * 100} />
            </Animated.View>
          );
        })}

        {/* Compare Expense Feature */}
        <Animated.View entering={FadeInDown.delay(800).springify()} className="mt-4 bg-[#3079E6] p-6 rounded-3xl overflow-hidden shadow-lg shadow-actionBlue/40">
          <View className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full blur-2xl z-0" />
          <View className="relative z-10 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-white font-interLight uppercase tracking-widest text-[12px] mb-1">Comparison</Text>
              <Text className="text-white font-interExtraBold text-[20px] leading-tight mb-2">This Month vs. Previous Month</Text>
              <Text className="text-white/80 font-interMedium text-[14px]">You saved ₹3,500 more this month! 🏆</Text>
            </View>
            <View className="bg-white/20 p-4 rounded-full">
              <Trophy color="white" size={32} />
            </View>
          </View>
          
          <View className="relative z-10 flex-row items-end justify-center mt-6 h-24 gap-x-8 border-b border-white/20 pb-4">
            <View className="items-center">
              <Text className="text-white/80 font-interExtraBold text-[12px] mb-2">Last M</Text>
              <View className="w-12 h-[100%] bg-white/40 rounded-t-lg" />
            </View>
            <View className="items-center">
              <Text className="text-white font-interExtraBold text-[12px] mb-2">This M</Text>
              <View className="w-12 h-[75%] bg-[#10B981] rounded-t-lg shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            </View>
          </View>
        </Animated.View>

      </ScrollView>
    </BaseLayout>
  );
};
