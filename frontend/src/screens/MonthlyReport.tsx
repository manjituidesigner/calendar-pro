import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Download, Share2, ChevronDown, Home as HomeIcon, ShoppingCart, Fuel, Users, Tag, Clock, CheckCircle, Smartphone, UserCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import { expenseService } from '../services/api';
import Animated, { FadeInUp } from 'react-native-reanimated';

export const MonthlyReport = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [expenses, setExpenses] = useState<any[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Pending' | 'Paid' | 'Category'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const yyyy = currentMonth.getFullYear();
      const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const data = await expenseService.getMonthlyExpenses(`${yyyy}-${mm}`);
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      console.log('Failed to fetch monthly report:', error);
      Alert.alert("Error", "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth]);

  useEffect(() => {
    let result = [...expenses];
    if (activeFilter === 'Pending') {
      result = result.filter(e => e.paymentStatus === 'Pending');
    } else if (activeFilter === 'Paid') {
      result = result.filter(e => e.paymentStatus === 'Paid');
    } else if (activeFilter === 'Category' && selectedCategory) {
      result = result.filter(e => e.category === selectedCategory);
    }
    setFilteredExpenses(result);
  }, [activeFilter, selectedCategory, expenses]);

  // Group by date
  const groupedExpenses = filteredExpenses.reduce((acc: any, exp) => {
    const d = exp.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(exp);
    return acc;
  }, {});

  const dates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + (e.totalAmount || 0), 0);
  
  const categoryTotals = expenses.reduce((acc: any, e) => {
    const cat = e.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + (e.totalAmount || 0);
    return acc;
  }, {});

  const handleShareWhatsApp = () => {
    const message = `Monthly Report for ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}\nTotal Spent: $${totalSpent.toFixed(2)}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const categories = Object.keys(categoryTotals);

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
                <Text className="text-[36px] font-interExtraBold text-slate-900 dark:text-white tracking-tight">
                  ${totalSpent.toFixed(2)}
                </Text>
              </View>
              <Pressable 
                onPress={() => {
                  // Simplified month picker logic for demo
                  setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
                }}
                className="bg-[#6B4EFF]/10 px-4 py-2 rounded-full flex-row items-center mt-2"
              >
                <Text className="text-[#6B4EFF] font-interExtraBold text-[12px] mr-1">
                  {currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}
                </Text>
                <ChevronDown color="#6B4EFF" size={14} />
              </Pressable>
            </View>
          </View>

          {/* Filters */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-6 gap-x-3 h-12">
            {['All', 'Paid', 'Pending', 'Category'].map((filter: any) => (
              <Pressable
                key={filter}
                onPress={() => setActiveFilter(filter)}
                className={`px-6 h-10 rounded-full items-center justify-center border ${activeFilter === filter ? 'bg-[#6B4EFF] border-[#6B4EFF]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
              >
                <Text className={`font-interExtraBold text-[12px] ${activeFilter === filter ? 'text-white' : 'text-slate-500'}`}>{filter}</Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeFilter === 'Category' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6 mb-6 gap-x-2 h-10">
              {categories.map(cat => (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  className={`px-4 h-8 rounded-xl items-center justify-center border ${selectedCategory === cat ? 'bg-slate-800 dark:bg-white border-slate-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}
                >
                  <Text className={`font-interBold text-[10px] ${selectedCategory === cat ? 'text-white dark:text-slate-900' : 'text-slate-400'}`}>{cat}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

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

          {/* Detailed List Grouped by Date */}
          <View className="px-6 mb-6">
             <Text className="text-[17px] font-interExtraBold text-slate-800 dark:text-white mb-6">
                All Transactions
              </Text>
              
              {loading ? (
                <ActivityIndicator color="#6B4EFF" size="large" className="py-10" />
              ) : dates.length === 0 ? (
                <View className="bg-white dark:bg-slate-800 p-8 rounded-3xl items-center border border-slate-100 dark:border-slate-800">
                   <Clock color="#CBD5E1" size={40} className="mb-3 opacity-50" />
                   <Text className="text-slate-400 font-interMedium text-center">No transactions found for this period.</Text>
                </View>
              ) : (
                dates.map((dateStr) => (
                  <View key={dateStr} className="mb-8">
                    <View className="flex-row items-center mb-4 ml-1">
                       <View className="w-1.5 h-6 bg-[#6B4EFF] rounded-full mr-3" />
                       <Text className="text-[14px] font-interExtraBold text-slate-500 dark:text-slate-400">
                         {new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                       </Text>
                    </View>

                    {groupedExpenses[dateStr].map((exp: any, idx: number) => (
                      <Animated.View 
                        key={exp._id || idx} 
                        entering={FadeInUp.delay(idx * 50).duration(400)}
                        className="bg-white dark:bg-slate-800 rounded-[24px] p-5 mb-5 shadow-sm border border-slate-50 dark:border-slate-700/30 overflow-hidden"
                      >
                         {/* Top Section: Payee, Time & Amount */}
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
                                 ${exp.totalAmount.toFixed(2)}
                               </Text>
                               <Text className="text-[10px] font-interSemiBold text-slate-400 mt-1 uppercase tracking-tighter">{exp.paymentMethod || 'Online'}</Text>
                            </View>
                         </View>

                         {/* Categories Row */}
                         {(exp.category || exp.subCategory) && (
                            <View className="flex-row flex-wrap gap-2 mb-4">
                               {exp.category && (
                                 <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50 flex-row items-center">
                                    <Tag color="#64748B" size={10} className="mr-2" />
                                    <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest">{exp.category}</Text>
                                 </View>
                               )}
                               {exp.subCategory && (
                                 <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest">{exp.subCategory}</Text>
                                 </View>
                               )}
                            </View>
                         )}

                         {/* Itemized List (Premium Style) */}
                         {exp.type === 'Buy' && exp.items && exp.items.length > 0 && (
                            <View className="bg-slate-50/50 dark:bg-slate-900/40 rounded-[20px] p-4 border border-slate-100/50 dark:border-slate-700/30">
                               {exp.items.map((item: any, i: number) => (
                                 <View key={i} className={`flex-row justify-between items-center ${i < exp.items.length - 1 ? 'mb-3 pb-3 border-b border-slate-100/50 dark:border-slate-800/50' : ''}`}>
                                    <View className="flex-1">
                                       <Text className="text-[13px] font-interBold text-slate-700 dark:text-slate-300" numberOfLines={1}>{item.title}</Text>
                                       <Text className="text-[10px] font-interMedium text-slate-400 mt-0.5">Unit Price: ${parseFloat(item.price).toFixed(2)}</Text>
                                    </View>
                                    <View className="items-end">
                                       <Text className="text-[13px] font-interExtraBold text-slate-800 dark:text-white">${(item.price * item.qty).toFixed(2)}</Text>
                                       <Text className="text-[10px] font-interSemiBold text-slate-400 mt-0.5">Qty: {item.qty}</Text>
                                    </View>
                                 </View>
                               ))}
                            </View>
                         )}

                         {/* LenDen Notes */}
                         {exp.type === 'LenDen' && exp.notes && (
                            <View className="bg-slate-50/50 dark:bg-slate-900/40 rounded-2xl p-4 border border-slate-100/50 dark:border-slate-700/30">
                               <Text className="text-[12px] font-interMedium text-slate-600 dark:text-slate-400 italic leading-5">
                                 "{exp.notes}"
                               </Text>
                            </View>
                         )}
                         
                      </Animated.View>
                    ))}
}
                  </View>
                ))
              )}
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
          <View className="px-6 mb-8 gap-y-4">
            <Pressable 
              onPress={handleShareWhatsApp}
              className="w-full bg-[#25D366] py-5 rounded-[20px] items-center flex-row justify-center shadow-lg shadow-green-500/20"
            >
              <Smartphone color="white" size={20} className="mr-3" />
              <Text className="text-white font-interExtraBold text-[16px]">Share on WhatsApp</Text>
            </Pressable>
            
            <Pressable className="w-full bg-[#4D3EEB] py-5 rounded-[20px] items-center flex-row justify-center shadow-lg shadow-indigo-500/20">
              <Download color="white" size={20} className="mr-3" />
              <Text className="text-white font-interExtraBold text-[16px]">Download PDF File</Text>
            </Pressable>
          </View>

        </ScrollView>
      </View>
    </BaseLayout>
  );
};
