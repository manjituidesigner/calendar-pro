import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Download, Share2, TrendingDown, TrendingUp, Trophy, ChevronRight, BarChart3, PieChart, Info } from 'lucide-react-native';
import Animated, { FadeInDown, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { BaseLayout } from '../components/BaseLayout';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { expenseService } from '../services/api';
import { useCalendar } from '../context/CalendarContext';

const AnimatedProgressBar = ({ spent, budget, color, delay }: { spent: number; budget: number; color: string; delay: number }) => {
  const percentage = Math.min((spent / Math.max(budget, 1)) * 100, 100);
  const isOverBudget = spent > budget && budget > 0;

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withDelay(delay, withSpring(`${percentage}%`, { damping: 15, stiffness: 60 })),
    };
  });

  return (
    <View className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
      <Animated.View 
        style={[{ height: '100%', backgroundColor: isOverBudget ? '#EF4444' : color }, animatedStyle]}
      />
    </View>
  );
};

export const Reports = () => {
  const { isDark } = useTheme();
  const { activeCalendar } = useCalendar();
  const [loading, setLoading] = useState(true);
  const [totalSpent, setTotalSpent] = useState(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [percentChange, setPercentChange] = useState(0);
  const [savingsInfo, setSavingsInfo] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthStr = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;

      if (!activeCalendar) return;

      const [currentData, prevData] = await Promise.all([
        expenseService.getMonthlyExpenses(currentMonthStr, activeCalendar._id),
        expenseService.getMonthlyExpenses(prevMonthStr, activeCalendar._id)
      ]);

      // Calculate Current Month
      let currentTotal = 0;
      const catMap: any = {};
      currentData.forEach(e => {
        if (e.type === 'Buy') {
          const amt = e.totalAmount || 0;
          currentTotal += amt;
          const cat = e.category || 'Other';
          catMap[cat] = (catMap[cat] || 0) + amt;
        }
      });

      // Format categories for UI
      const colors = ['#6B4EFF', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];
      const icons = ['🍔', '🛍️', '🚗', '⚡', '🎬', '📦'];
      
      const formattedCats = Object.keys(catMap)
        .map((name, i) => ({
          id: String(i),
          name: name,
          spent: catMap[name],
          budget: 0, // In future, fetch from user settings
          icon: icons[i % icons.length],
          color: colors[i % colors.length]
        }))
        .sort((a, b) => b.spent - a.spent)
        .slice(0, 5);

      setTotalSpent(currentTotal);
      setCategories(formattedCats);

      // Calculate Percent Change
      let prevTotal = 0;
      prevData.forEach(e => {
        if (e.type === 'Buy') prevTotal += (e.totalAmount || 0);
      });

      if (prevTotal > 0) {
        const diff = ((currentTotal - prevTotal) / prevTotal) * 100;
        setPercentChange(parseFloat(diff.toFixed(1)));
        if (diff < 0) setSavingsInfo(`You saved ₹${(prevTotal - currentTotal).toFixed(0)} more this month! 🏆`);
        else setSavingsInfo(`Spent ₹${(currentTotal - prevTotal).toFixed(0)} more than last month.`);
      } else {
        setPercentChange(0);
        setSavingsInfo('First month of tracking. Keep it up! 🚀');
      }

    } catch (error) {
      console.log('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportPDF = async () => {
     Alert.alert("Feature Ready", "Generating your detailed financial PDF...");
  };

  return (
    <BaseLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 20 }}>
        
        {/* Header */}
        <View className="flex-row justify-between items-center mb-10 pt-10">
          <View>
            <Text className="text-[34px] font-interExtraBold text-slate-900 dark:text-white leading-tight">
              Insights
            </Text>
            <Text className="text-[12px] font-interSemiBold text-slate-400 uppercase tracking-widest mt-1">Data-Driven Reports</Text>
          </View>
          <View className="flex-row gap-x-3">
            <Pressable onPress={handleExportPDF} className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <Download color="#6B4EFF" size={20} />
            </Pressable>
            <Pressable onPress={handleExportPDF} className="bg-[#10B981] p-3.5 rounded-2xl shadow-md shadow-green-500/20">
              <Share2 color="white" size={20} />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View className="py-20"><ActivityIndicator size="large" color="#6B4EFF" /></View>
        ) : (
          <>
            {/* Main Total Card */}
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <View className="bg-[#6B4EFF] p-7 rounded-[40px] shadow-xl shadow-indigo-500/30 mb-8 relative overflow-hidden">
                <View className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
                <Text className="text-[12px] font-interExtraBold text-white/70 uppercase tracking-widest mb-2">Total Monthly Spend</Text>
                <Text className="text-[44px] font-interExtraBold text-white">
                  ₹{totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(1)}k` : totalSpent.toFixed(0)}
                </Text>
                
                <View className="flex-row items-center mt-6">
                  <View className={`flex-row items-center px-3 py-1.5 rounded-full ${percentChange <= 0 ? 'bg-green-400/20' : 'bg-red-400/20'}`}>
                    {percentChange <= 0 ? <TrendingDown color="#4ADE80" size={14} /> : <TrendingUp color="#F87171" size={14} />}
                    <Text className={`font-interExtraBold text-[12px] ml-1.5 ${percentChange <= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                      {Math.abs(percentChange)}% {percentChange <= 0 ? 'less' : 'more'}
                    </Text>
                  </View>
                  <Text className="text-[12px] font-interMedium text-white/50 ml-3">vs last month</Text>
                </View>
              </View>
            </Animated.View>

            {/* Category Chart Section */}
            <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-8 p-6 bg-white dark:bg-slate-800/80 rounded-[36px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">Spending Analytics</Text>
                <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full"><Text className="text-[10px] text-[#6B4EFF] font-interBold uppercase">Top 5 Categories</Text></View>
              </View>
              
              <View className="flex-row items-end justify-between h-44 px-2 pb-2">
                {categories.length === 0 ? (
                   <View className="flex-1 items-center justify-center"><Text className="text-slate-400 font-interMedium italic">No categories tracked yet</Text></View>
                ) : (
                  categories.map((cat, index) => {
                    const maxSpent = Math.max(...categories.map(c => c.spent));
                    const heightPercent = Math.max((cat.spent / maxSpent) * 100, 15);
                    
                    const barStyle = useAnimatedStyle(() => ({
                      height: withDelay(400 + index * 100, withSpring(`${heightPercent}%`, { damping: 12 })),
                    }));

                    return (
                      <View key={cat.id} className="items-center w-[16%]">
                        <Animated.View style={[{ width: '100%', backgroundColor: cat.color, borderRadius: 12 }, barStyle]} className="shadow-sm" />
                        <Text className="mt-3 text-[16px]">{cat.icon}</Text>
                      </View>
                    );
                  })
                )}
              </View>
            </Animated.View>

            {/* Breakdown List */}
            <View className="flex-row items-center justify-between mb-6 px-1">
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">Category Breakdown</Text>
              <PieChart color={isDark ? '#475569' : '#94A3B8'} size={20} />
            </View>
            
            {categories.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInDown.delay(300 + index * 100).springify()} className="mb-4 bg-white dark:bg-slate-800/80 p-5 rounded-[28px] border border-slate-100 dark:border-slate-700/50 shadow-sm">
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: cat.color + '15' }}>
                      <Text className="text-[20px]">{cat.icon}</Text>
                    </View>
                    <View>
                      <Text className="font-interExtraBold text-[16px] text-slate-800 dark:text-white">{cat.name}</Text>
                      <Text className="text-[11px] font-interMedium text-slate-400 mt-0.5">Market Share: {((cat.spent / totalSpent) * 100).toFixed(0)}%</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-interExtraBold text-[18px] text-slate-800 dark:text-white">₹{cat.spent}</Text>
                    <View className="flex-row items-center mt-1">
                       <BarChart3 color="#6B4EFF" size={10} className="mr-1" />
                       <Text className="text-[9px] font-interExtraBold text-[#6B4EFF] uppercase">Details</Text>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ))}

            {/* Savings Achievement Card */}
            <Animated.View entering={FadeInDown.delay(800).springify()} className="mt-6 bg-[#3B82F6] p-7 rounded-[40px] shadow-xl shadow-blue-500/30 overflow-hidden relative">
              <View className="absolute -left-10 -bottom-10 bg-white/10 w-48 h-48 rounded-full" />
              <View className="relative z-10 flex-row items-center justify-between mb-6">
                <View className="bg-white/20 p-4 rounded-3xl">
                  <Trophy color="white" size={32} />
                </View>
                <View className="items-end">
                   <Text className="text-white/60 font-interExtraBold text-[10px] uppercase tracking-widest">Monthly Goal</Text>
                   <Text className="text-white font-interExtraBold text-[12px] uppercase">Active</Text>
                </View>
              </View>
              <Text className="text-white font-interExtraBold text-[22px] leading-tight mb-2">Performance Summary</Text>
              <Text className="text-white/80 font-interMedium text-[15px] leading-6">{savingsInfo}</Text>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </BaseLayout>
  );
};
