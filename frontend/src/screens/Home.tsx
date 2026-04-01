import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Animated, Modal, Alert } from 'react-native';
import { Card } from '../components/Card';
import { ChevronRight, ChevronLeft, Wallet, ArrowDown, ArrowUp, Calendar as CalendarIcon, CheckCircle2, Menu, BarChart2, X, Moon, Sun, ShoppingCart, UserCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import * as Haptics from 'expo-haptics';
import { useForm } from '../context/FormContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { expenseService } from '../services/api';
import { useCalendar } from '../context/CalendarContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Home = () => {
  const { isDark, toggleTheme } = useTheme();
  const { openForm, refreshTrigger } = useForm();
  const { activeCalendar, loading: calendarLoading } = useCalendar();
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthlyExpenses, setMonthlyExpenses] = useState<any[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [pendingExpenses, setPendingExpenses] = useState<any[]>([]);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);

  // New states for real data
  const [totalMonthExpense, setTotalMonthExpense] = useState(0);
  const [totalBorrowed, setTotalBorrowed] = useState(0);
  const [totalToReceive, setTotalToReceive] = useState(0);
  const [recentDebts, setRecentDebts] = useState<any[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  const fetchExpenses = async () => {
    if (!activeCalendar) return;
    try {
      const yyyy = currentMonth.getFullYear();
      const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const data = await expenseService.getMonthlyExpenses(`${yyyy}-${mm}`, activeCalendar._id);
      setMonthlyExpenses(data);
      calculateTotals(data);
    } catch (error) {
      console.log('Failed to fetch monthly expenses', error);
    }
  };

  const calculateTotals = (data: any[]) => {
    let tExp = 0;
    let bwd = 0;
    let recv = 0;
    const lendenList: any[] = [];

    data.forEach(exp => {
      if (exp.type === 'Buy') {
        tExp += exp.totalAmount || 0;
      } else if (exp.type === 'LenDen') {
        if (exp.lenDenType === 'I TOOK') {
          bwd += exp.totalAmount || 0;
        } else if (exp.lenDenType === 'I GAVE') {
          recv += exp.totalAmount || 0;
        }
        lendenList.push(exp);
      }
    });

    setTotalMonthExpense(tExp);
    setTotalBorrowed(bwd);
    setTotalToReceive(recv);
    
    // Sort debts by date/time (latest first)
    const sortedDebts = lendenList.sort((a, b) => {
      return new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    });
    setRecentDebts(sortedDebts.slice(0, 3));
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentMonth, refreshTrigger, activeCalendar]);

  useEffect(() => {
    const yyyy = currentMonth.getFullYear();
    const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    
    let dayTotal = 0;
    const pendingList: any[] = [];
    let pTotal = 0;

    monthlyExpenses.forEach(exp => {
      if (exp.date === dateStr) {
        dayTotal += exp.totalAmount || 0;
      }
      if (exp.paymentStatus === 'Pending') {
        pendingList.push(exp);
        pTotal += exp.totalAmount || 0;
      }
    });

    setDailyTotal(dayTotal);
    setPendingExpenses(pendingList);
    setPendingTotal(pTotal);
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

  const generateDates = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const dates = [];
    let week = [];
    for (let i = 0; i < firstDay; i++) week.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
      week.push(i);
      if (week.length === 7) { dates.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
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
      <ScrollView className="flex-1 bg-transparent" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View className="px-6 py-4 mt-6 flex-row justify-between items-center bg-transparent">
          <View className="flex-row gap-x-2">
            <Pressable onPress={() => (navigation as any).openDrawer?.()} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
              <Menu color={isDark ? '#CBD5E1' : '#475569'} size={24} />
            </Pressable>
            <Pressable onPress={toggleTheme} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
              {isDark ? <Sun color="#F59E0B" size={24} /> : <Moon color="#6B4EFF" size={24} />}
            </Pressable>
          </View>

          <View className="items-center">
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white" numberOfLines={1}>
              {activeCalendar?.name || 'My Ledger'}
            </Text>
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] tracking-[2px] mt-1">
              {activeCalendar?.category?.toUpperCase() || 'DASHBOARD'}
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('MonthlyReport')} className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full items-center justify-center shadow-sm">
            <BarChart2 color={isDark ? '#CBD5E1' : '#475569'} size={24} />
          </Pressable>
        </View>

        {/* Horizontal Calendar Container */}
        <View className="px-6 mt-4">
          <View className="bg-white dark:bg-slate-800 rounded-[32px] pt-6 pb-6 shadow-sm border border-slate-50 dark:border-slate-700/50">
            <View className="flex-row items-center justify-between px-6 mb-6">
              <Pressable onPress={handlePrevMonth} className="p-2"><ChevronLeft color={isDark ? '#94A3B8' : '#64748B'} size={16} /></Pressable>
              <Text className="text-[14px] font-interExtraBold text-slate-700 dark:text-slate-200 uppercase tracking-widest">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Text>
              <Pressable onPress={handleNextMonth} className="p-2"><ChevronRight color={isDark ? '#94A3B8' : '#64748B'} size={16} /></Pressable>
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
                  
                  const today = new Date();
                  const isToday = date === today.getDate() && 
                                  currentMonth.getMonth() === today.getMonth() && 
                                  currentMonth.getFullYear() === today.getFullYear();

                  const bgColor = isToday ? 'bg-green-500' : (isSelected || hasData ? 'bg-[#6B4EFF]' : '');
                  const textColor = !date ? 'text-transparent' : (isSelected || hasData || isToday ? 'text-white' : 'text-slate-700 dark:text-slate-200');

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
              ₹{totalMonthExpense.toFixed(2)}
            </Text>
          </View>
          
          <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[32px] p-5 shadow-sm border border-slate-50 dark:border-slate-700/50">
            <View className="w-10 h-10 bg-[#6B4EFF]/10 rounded-full items-center justify-center mb-6 mt-1">
              <Wallet color="#6B4EFF" size={20} />
            </View>
            <Text className="text-[10px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
              Monthly Budget
            </Text>
            <Text className="text-[22px] font-interExtraBold text-slate-800 dark:text-white" adjustsFontSizeToFit numberOfLines={1}>
              ₹{monthlyBudget.toFixed(2)}
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
            <Pressable onPress={() => navigation.navigate('DailyExpensesDetail', { date: selectedDate, currentMonth: currentMonth.toISOString() })} className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-700/50">
              <View className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-full items-center justify-center mb-4">
                <CalendarIcon color="#F97316" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                ₹{dailyTotal.toFixed(2)}
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400 dark:text-slate-500">
                Today's Expense
              </Text>
            </Pressable>

            {/* Remaining */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-700/50">
              <View className="w-10 h-10 bg-green-50 dark:bg-green-500/10 rounded-full items-center justify-center mb-4">
                <CheckCircle2 color="#22C55E" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                ₹{(monthlyBudget - totalMonthExpense).toFixed(2)}
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400 dark:text-slate-500">
                Remaining
              </Text>
            </View>

            {/* Borrowed */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-700/50">
              <View className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-full items-center justify-center mb-4">
                <ArrowUp color="#EF4444" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                ₹{totalBorrowed.toFixed(2)}
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400 dark:text-slate-500">
                Borrowed
              </Text>
            </View>

            {/* To Receive */}
            <View className="w-[48%] bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-700/50">
              <View className="w-10 h-10 bg-blue-50 dark:bg-blue-500/10 rounded-full items-center justify-center mb-4">
                <ArrowDown color="#3B82F6" size={18} />
              </View>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white mb-1">
                ₹{totalToReceive.toFixed(2)}
              </Text>
              <Text className="text-[12px] font-interMedium text-slate-400 dark:text-slate-500">
                To Receive
              </Text>
            </View>

            {/* Today's Pending Payment */}
            <Pressable 
              onPress={() => setIsPendingModalVisible(true)}
              className="w-full bg-white dark:bg-slate-800 rounded-[28px] p-5 mb-4 shadow-sm border border-slate-50 dark:border-slate-700/50 flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-yellow-50 dark:bg-yellow-500/10 rounded-full items-center justify-center mr-4">
                  <Wallet color="#EAB308" size={22} />
                </View>
                <View>
                  <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">
                    ₹{pendingTotal.toFixed(2)}
                  </Text>
                  <Text className="text-[12px] font-interMedium text-slate-400 dark:text-slate-500">
                    Today Pending Payment
                  </Text>
                </View>
              </View>
              <View className="bg-yellow-500/10 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-interExtraBold text-yellow-600 uppercase">{pendingExpenses.length} Pending</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Recent Debts Section */}
        <View className="px-6 mt-4 mb-8">
          <View className="flex-row items-center justify-between mb-4 mt-2">
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">
              Recent Transactions
            </Text>
            <Pressable onPress={() => navigation.navigate('MonthlyReport')}>
              <Text className="text-[12px] font-interExtraBold text-[#6B4EFF]">
                See All
              </Text>
            </Pressable>
          </View>
          
          {recentDebts.length === 0 ? (
            <View className="bg-white dark:bg-slate-800 p-8 rounded-[24px] items-center border border-dashed border-slate-200 dark:border-slate-700">
               <Text className="text-slate-400 font-interMedium text-[12px]">No recent transactions found.</Text>
            </View>
          ) : (
            recentDebts.map((item) => (
              <View key={item._id} className="bg-white dark:bg-slate-800 rounded-[24px] p-4 flex-row items-center shadow-sm mb-3 border border-slate-50 dark:border-slate-700/50">
                <View className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-4">
                  <Text className="text-[14px] font-interExtraBold text-[#6B4EFF]">{item.partyName?.[0] || 'T'}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white mb-0.5" numberOfLines={1}>
                    {item.partyName || 'Transaction'}
                  </Text>
                  <Text className="text-[10px] font-interMedium text-slate-400 uppercase tracking-widest">
                    {item.lenDenType} • {item.notes?.substring(0, 20) || 'No notes'}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className={`text-[15px] font-interExtraBold mb-0.5 ${item.lenDenType === 'I TOOK' ? 'text-green-500' : 'text-red-500'}`}>
                    {item.lenDenType === 'I TOOK' ? '+' : '-'}₹{item.totalAmount.toFixed(2)}
                  </Text>
                  <Text className="text-[10px] font-interMedium text-slate-400 uppercase">
                    {item.date.split('-').slice(1).join('/')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>

      {/* Pending Payment Modal */}
      <PendingPaymentModal 
        visible={isPendingModalVisible} 
        onClose={() => {
          setIsPendingModalVisible(false);
          fetchExpenses();
        }}
        expenses={pendingExpenses}
      />
    </BaseLayout>
  );
};

const PendingPaymentModal = ({ visible, onClose, expenses }: { visible: boolean, onClose: () => void, expenses: any[] }) => {
  const { isDark } = useTheme();
  
  const handleClearPayment = async (exp: any) => {
    try {
      await expenseService.updateExpense(exp._id, { ...exp, paymentStatus: 'Paid' });
      Alert.alert("Success", "Payment status updated to Paid.");
    } catch (error) {
      Alert.alert("Error", "Failed to update payment status.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white dark:bg-slate-900 rounded-t-[32px] h-[70%] p-6">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-[20px] font-interExtraBold text-slate-800 dark:text-white">Pending Payments</Text>
            <Pressable onPress={onClose} className="p-2"><X color={isDark ? '#FFF' : '#000'} size={24} /></Pressable>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {expenses.length === 0 ? (
              <View className="items-center justify-center py-12">
                <Text className="text-slate-400 font-interMedium">No pending payments found.</Text>
              </View>
            ) : (
              expenses.map((exp) => (
                <View key={exp._id} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mb-4 border border-slate-100 dark:border-slate-700">
                  <View className="flex-row justify-between items-center mb-3">
                    <View>
                      <Text className="text-[14px] font-interExtraBold text-slate-800 dark:text-white">{exp.payeeName || exp.partyName}</Text>
                      <Text className="text-[10px] text-slate-400 uppercase tracking-widest">{exp.date}</Text>
                    </View>
                    <Text className="text-[16px] font-interExtraBold text-[#6B4EFF]">₹{exp.totalAmount.toFixed(2)}</Text>
                  </View>
                  <Pressable onPress={() => handleClearPayment(exp)} className="bg-[#6B4EFF] py-3 rounded-xl items-center">
                    <Text className="text-white font-interExtraBold text-[12px]">Mark as Paid</Text>
                  </Pressable>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
