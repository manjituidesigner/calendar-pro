import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Download, Smartphone, ShoppingCart, UserCheck, Tag, Users, Share2, Calendar as CalendarIcon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useForm } from '../context/FormContext';
import { useCalendar } from '../context/CalendarContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeInUp, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { expenseService } from '../services/api';

export const MonthlyReport = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const { triggerRefresh } = useForm();
  const { activeCalendar } = useCalendar();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [netDebtBalance, setNetDebtBalance] = useState(0);

  const fetchMonthData = async () => {
    if (!activeCalendar) return;
    try {
      setLoading(true);
      const now = new Date();
      const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const data = await expenseService.getMonthlyExpenses(monthStr, activeCalendar._id);
      setExpenses(data);

      // Calculate Net Debt
      let net = 0;
      data.forEach((exp: any) => {
        if (exp.type === 'LenDen') {
          if (exp.lenDenType === 'I GAVE') net += exp.totalAmount;
          else net -= exp.totalAmount;
        }
      });
      setNetDebtBalance(net);
    } catch (error) {
      console.log('Failed to fetch monthly report', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthData();
  }, [activeCalendar]);

  const handleShareWhatsApp = () => {
    const message = `Monthly Report for ${activeCalendar?.name || 'My Ledger'}\nNet Balance: ₹${netDebtBalance.toFixed(2)}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  // Group by Date
  const groupedExpenses: any = {};
  expenses.forEach(exp => {
    const d = new Date(exp.date);
    const dateStr = d.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groupedExpenses[dateStr]) groupedExpenses[dateStr] = [];
    groupedExpenses[dateStr].push(exp);
  });

  const dateKeys = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <BaseLayout>
      <View className="flex-1 bg-transparent dark:bg-slate-900 pt-12">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-8 mt-2">
           <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={24} />
           </Pressable>
           <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">
             {activeCalendar?.name || 'Monthly Report'}
           </Text>
           <View className="flex-row gap-x-4">
              <Download color={isDark ? '#6B4EFF' : '#4D3EEB'} size={20} />
              <Share2 color={isDark ? '#6B4EFF' : '#4D3EEB'} size={20} />
           </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <View className="px-6 mb-8">
             <Text className="text-[20px] font-interExtraBold text-slate-900 dark:text-white mb-1">Transactions History</Text>
             <Text className="text-[12px] font-interMedium text-slate-400">Review your activity for this month</Text>
          </View>

          <View className="px-6">
            {loading ? (
                <ActivityIndicator size="large" color="#6B4EFF" className="mt-10" />
            ) : dateKeys.length === 0 ? (
                <View className="py-20 items-center">
                    <CalendarIcon color={isDark ? '#334155' : '#E2E8F0'} size={60} strokeWidth={1} />
                    <Text className="text-slate-400 font-interMedium mt-4">No transactions found this month</Text>
                </View>
            ) : (
                dateKeys.map((dateStr) => (
                  <View key={dateStr} className="mb-8">
                    <View className="flex-row items-center mb-4 border-l-4 border-[#6B4EFF] pl-3 h-6">
                       <Text className="text-slate-500 font-interExtraBold text-[13px] uppercase tracking-wider">{dateStr}</Text>
                    </View>

                    {groupedExpenses[dateStr].map((exp: any, idx: number) => (
                      <Animated.View 
                        key={exp._id || idx} 
                        entering={FadeInUp.delay(idx * 50).duration(400)}
                        className="bg-white dark:bg-slate-800/80 rounded-[28px] p-5 mb-5 shadow-sm border border-slate-50 dark:border-slate-700/50 overflow-hidden"
                      >
                         <View className="flex-row justify-between items-start mb-4">
                            <View className="flex-row items-center flex-1">
                               <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${exp.type === 'Buy' ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
                                 {exp.type === 'Buy' ? <ShoppingCart color="#6B4EFF" size={22} /> : <UserCheck color="#10B981" size={22} />}
                               </View>
                               <View className="flex-1">
                                  <Text className="font-interExtraBold text-slate-900 dark:text-white text-[16px] mb-0.5" numberOfLines={1}>
                                    {exp.payeeName || exp.partyName}
                                  </Text>
                                  <View className="flex-row items-center">
                                    <View className={`px-2 py-0.5 rounded-md mr-2 ${exp.paymentStatus === 'Paid' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                      <Text className={`text-[8px] font-interExtraBold uppercase ${exp.paymentStatus === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                        {exp.paymentStatus || 'Paid'}
                                      </Text>
                                    </View>
                                    <Text className="text-slate-400 text-[11px] font-interSemiBold">{exp.time || '12:00 PM'}</Text>
                                  </View>
                               </View>
                            </View>
                            <View className="items-end">
                               <Text className="font-interExtraBold text-slate-900 dark:text-white text-[18px]">
                                 ₹{exp.totalAmount.toFixed(2)}
                               </Text>
                               <Text className="text-[10px] font-interSemiBold text-slate-400 mt-1 uppercase tracking-tighter">{exp.paymentMethod || 'Online'}</Text>
                            </View>
                         </View>
                         
                         {(exp.category || exp.subCategory) && (
                            <View className="flex-row flex-wrap gap-2 mb-2">
                               {exp.category && (
                                 <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex-row items-center">
                                    <Tag color="#64748B" size={10} className="mr-2" />
                                    <Text className="text-[10px] font-interExtraBold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{exp.category}</Text>
                                 </View>
                               )}
                               {exp.subCategory && (
                                 <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <Text className="text-[10px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{exp.subCategory}</Text>
                                 </View>
                               )}
                            </View>
                         )}
                      </Animated.View>
                    ))}
                  </View>
                ))
              )}
          </View>

          {/* Debt Balance Badge - Redesigned to fix the "white text" in light mode issue */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mx-6 mb-8 mt-4 bg-white dark:bg-slate-800 rounded-[32px] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex-row items-center justify-between overflow-hidden relative">
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/5 rounded-full" />
            <View className="flex-1">
              <Text className="text-slate-400 dark:text-slate-500 font-interExtraBold text-[10px] uppercase tracking-widest mb-2">Net Debt Balance</Text>
              <Text className={`font-interExtraBold text-[22px] mb-1 ${netDebtBalance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {netDebtBalance >= 0 ? `You're owed ₹${netDebtBalance.toFixed(2)}` : `You owe ₹${Math.abs(netDebtBalance).toFixed(2)}`}
              </Text>
              <Text className="text-slate-400 font-interMedium text-[10px]">Calculated from active calendar</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-[#6B4EFF]/10 items-center justify-center">
              <Users color="#6B4EFF" size={22} />
            </View>
          </Animated.View>

          {/* Action Buttons */}
          <View className="px-6 mb-8 gap-y-4">
            <Pressable 
              onPress={handleShareWhatsApp}
              className="w-full bg-[#10B981] py-[22px] rounded-3xl items-center flex-row justify-center shadow-lg shadow-green-500/20"
            >
              <Smartphone color="white" size={20} className="mr-3" />
              <Text className="text-white font-interExtraBold text-[16px]">Share on WhatsApp</Text>
            </Pressable>
            
            <Pressable className="w-full bg-[#6B4EFF] py-[22px] rounded-3xl items-center flex-row justify-center shadow-lg shadow-indigo-500/20">
              <Download color="white" size={20} className="mr-3" />
              <Text className="text-white font-interExtraBold text-[16px]">Download PDF File</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
