import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { Card } from '../components/Card';
import { ChevronRight, ChevronLeft, Wallet, ArrowDown, ArrowUp, Calendar as CalendarIcon, CheckCircle2, Menu, BarChart2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import * as Haptics from 'expo-haptics';
import { useForm } from '../context/FormContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { expenseService } from '../services/api';
import { useEffect } from 'react';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Home = () => {
  const { isDark } = useTheme();
  const { openForm, refreshTrigger } = useForm();
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);

  const fetchExpenses = async () => {
    try {
      const yyyy = currentMonth.getFullYear();
      const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const data = await expenseService.getMonthlyExpenses(`${yyyy}-${mm}`);
      setMonthlyExpenses(data);
    } catch (error) {
      console.log('Failed to fetch monthly expenses', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentMonth, refreshTrigger]);

  useEffect(() => {
    const yyyy = currentMonth.getFullYear();
    const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    let total = 0;
    monthlyExpenses.forEach(exp => {
      if (exp.date === dateStr) {
        total += exp.totalAmount || 0;
      }
    });
    setDailyTotal(total);
  }, [selectedDate, monthlyExpenses, currentMonth]);

  const hasExpenses = (date: number) => {
    const yyyy = currentMonth.getFullYear();
    const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(date).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    return monthlyExpenses.some(exp => exp.date === dateStr);
  };

  const handlePrevMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate days for the calendar view based on currentMonth
  const generateDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dates = [];
    let week = [];
    
    for (let i = 0; i < firstDay; i++) {
      week.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      week.push(i);
      if (week.length === 7) {
        dates.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) {
        week.push(null);
      }
      dates.push(week);
    }
    return dates;
  };
  const calendarWeeks = generateDates();

  const handleDatePress = (dateObj: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(dateObj);
    const newTargetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dateObj);
    openForm(newTargetDate);
  };

  return (
    <BaseLayout>
      <ScrollView className="flex-1 bg-[#E8EDF9] dark:bg-slate-900" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View className="px-6 py-4 mt-6 flex-row justify-between items-center bg-transparent">
          <Pressable onPress={() => (navigation as any).openDrawer?.()} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
            <Menu color={isDark ? '#CBD5E1' : '#475569'} size={24} />
          </Pressable>
          <View className="items-center">
            <Text className="text-[20px] font-interExtraBold text-slate-800 dark:text-white">
              My Calendar
            </Text>
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] tracking-[2px] mt-1">
              DASHBOARD
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('MonthlyReport')} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
            <BarChart2 color={isDark ? '#CBD5E1' : '#475569'} size={24} />
          </Pressable>
        </View>

        {/* Horizontal Calendar Container */}
        <View className="px-6 mt-4">
          <View className="bg-white dark:bg-slate-800 rounded-[32px] pt-6 pb-6 shadow-sm">
            <View className="flex-row items-center justify-between px-6 mb-6">
              <Pressable onPress={handlePrevMonth} className="p-2"><ChevronLeft color="#64748B" size={16} /></Pressable>
              <Text className="text-[14px] font-interExtraBold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <Pressable onPress={handleNextMonth} className="p-2"><ChevronRight color="#64748B" size={16} /></Pressable>
            </View>
            <View className="flex-row justify-between px-6 mb-4">
              {['S','M','T','W','T','F','S'].map((day, ix) => (
                <Text key={`day-${ix}`} className="text-[12px] font-interMedium text-slate-400 w-8 text-center">{day}</Text>
              ))}
            </View>
            {calendarWeeks.map((week, weekIndex) => (
              <View key={`week-${weekIndex}`} className={`flex-row justify-between px-4 ${weekIndex > 0 ? 'mt-4' : ''}`}>
                {week.map((date, dayIndex) => {
                  const isSelected = date === selectedDate;
                  const hasData = date ? hasExpenses(date) : false;
                  const bgColor = isSelected ? 'bg-[#6B4EFF]' : (hasData ? 'bg-[#6B4EFF]' : '');
                  const textColor = !date ? 'text-transparent' : (isSelected ? 'text-white' : (hasData ? 'text-white' : 'text-slate-700 dark:text-slate-200'));

                  return (
                    <Pressable
                      key={`day-${dayIndex}`}
                      onPress={() => date && handleDatePress(date)}
                      className={`items-center justify-center w-10 h-10 rounded-full ${bgColor}`}
                    >
                      <Text className={`text-[14px] font-interExtraBold ${textColor}`}>
                        {date || '0'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>

        {/* Main Metric Cards */}
        <View className="flex-row justify-between px-6 mt-6">
          <View className="w-[48%] bg-[#6B4EFF] rounded-[32px] p-5 shadow-lg shadow-indigo-500/30">
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center mb-6 mt-1">
              <Wallet color="#FFF" size={20} />
            </View>
            <Text className="text-[10px] font-interExtraBold text-white/70 uppercase tracking-widest mb-1">
              Total Expense
            </Text>
            <Text className="text-[22px] font-interExtraBold text-white" adjustsFontSizeToFit numberOfLines={1}>
              $2,840.00
            </Text>
          </View>
          
          <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[32px] p-5 shadow-sm">
            <View className="w-10 h-10 bg-[#6B4EFF]/10 rounded-full items-center justify-center mb-6 mt-1">
              <Wallet color="#6B4EFF" size={20} />
            </View>
            <Text className="text-[10px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
              Monthly Budget
            </Text>
            <Text className="text-[22px] font-interExtraBold text-slate-800 dark:text-white" adjustsFontSizeToFit numberOfLines={1}>
              $4,500.00
            </Text>
          </View>
        </View>

        {/* Financial Status Grid */}
        <View className="px-6 mt-8">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">
              Financial Status
            </Text>
            <View className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full">
              <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-wider">
                Real-Time
              </Text>
            </View>
          </View>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Today's Expense */}
            <Pressable onPress={() => navigation.navigate('DailyExpensesDetail', { date: selectedDate, currentMonth: currentMonth.toISOString() })} className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-full items-center justify-center mb-4">
                <CalendarIcon color="#F97316" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                ${dailyTotal.toFixed(2)}
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400">
                Today's Expense
              </Text>
            </Pressable>

            {/* Remaining */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-full items-center justify-center mb-4">
                <CheckCircle2 color="#22C55E" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                $1,660.00
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400">
                Remaining
              </Text>
            </View>

            {/* Borrowed */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-full items-center justify-center mb-4">
                <ArrowUp color="#EF4444" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                $250.00
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400">
                Borrowed
              </Text>
            </View>

            {/* To Receive */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm">
              <View className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-full items-center justify-center mb-4">
                <ArrowDown color="#3B82F6" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                $120.00
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400">
                To Receive
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Debts Section */}
        <View className="px-6 mt-4 mb-8">
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">
              Recent Debts
            </Text>
            <Pressable>
              <Text className="text-[12px] font-interExtraBold text-[#6B4EFF]">
                See All
              </Text>
            </Pressable>
          </View>
          
          <View className="bg-white dark:bg-slate-800 rounded-[24px] p-4 flex-row items-center shadow-sm">
            <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-4">
              <Text className="text-[14px] font-interExtraBold text-[#6B4EFF]">JD</Text>
            </View>
            <View className="flex-1">
              <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white mb-0.5">
                John Doe
              </Text>
              <Text className="text-[10px] font-interMedium text-slate-400 uppercase tracking-widest">
                Borrowed for coffee
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[15px] font-interExtraBold text-red-500 mb-0.5">
                -$12.00
              </Text>
              <Text className="text-[10px] font-interMedium text-slate-400">
                OCT 05
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </BaseLayout>
  );
};
