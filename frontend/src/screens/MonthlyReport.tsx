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
  
  // Real data metrics
  const [totalSpent, setTotalSpent] = useState(0);
  const [categoryTotals, setCategoryTotals] = useState<any>({});
  const [budget, setBudget] = useState(0);
  const [topCategories, setTopCategories] = useState<any[]>([]);
  const [netDebtBalance, setNetDebtBalance] = useState(0);

  const fetchMonthlyData = async () => {
    try {
      setLoading(true);
      const yyyy = currentMonth.getFullYear();
      const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
      const data = await expenseService.getMonthlyExpenses(`${yyyy}-${mm}`);
      setExpenses(data);
      setFilteredExpenses(data);
      processMetrics(data);
    } catch (error) {
      console.log('Failed to fetch monthly report:', error);
      Alert.alert("Error", "Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const processMetrics = (data: any[]) => {
    let spent = 0;
    const catMap: any = {};
    let debt = 0;

    data.forEach(e => {
      if (e.type === 'Buy') {
        const amt = e.totalAmount || 0;
        spent += amt;
        const cat = e.category || 'Other';
        catMap[cat] = (catMap[cat] || 0) + amt;
      } else if (e.type === 'LenDen') {
        if (e.lenDenType === 'I GAVE') debt += e.totalAmount;
        else if (e.lenDenType === 'I TOOK') debt -= e.totalAmount;
      }
    });

    setTotalSpent(spent);
    setCategoryTotals(catMap);
    setNetDebtBalance(debt);

    // Get top 3 categories for the chart
    const sortedCats = Object.keys(catMap)
      .map(name => ({ name: name.substring(0, 3).toUpperCase(), value: catMap[name], originalName: name }))
      .sort((a, b) => b.value - a.value);
    
    setTopCategories(sortedCats.slice(0, 3));
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

  const groupedExpenses = filteredExpenses.reduce((acc: any, exp) => {
    const d = exp.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(exp);
    return acc;
  }, {});

  const dates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const handleShareWhatsApp = () => {
    const message = `Monthly Report for ${currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}\nTotal Spent: ₹${totalSpent.toFixed(2)}`;
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
  };

  const categories = Object.keys(categoryTotals);

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
              Monthly Report
            </Text>
          </View>
          <View className="flex-row items-center gap-x-4">
            <Download color="#6B4EFF" size={20} />
            <Share2 color="#6B4EFF" size={20} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Total Spending & Month Selector */}
          <View className="px-6 mb-6">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-1">Total Spending</Text>
                <Text className="text-[36px] font-interExtraBold text-slate-900 dark:text-white tracking-tight">
                  ₹{totalSpent.toFixed(2)}
                </Text>
              </View>
              <Pressable 
                onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
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
            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-50 dark:border-slate-700/50">
              <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-2">Budget</Text>
              <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white">₹{budget.toFixed(2)}</Text>
            </View>
            <View className="flex-1 bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-50 dark:border-slate-700/50">
              <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-2">Remaining</Text>
              <Text className="text-[18px] font-interExtraBold text-[#6B4EFF]">₹{(budget - totalSpent).toFixed(2)}</Text>
            </View>
          </View>

          {/* Expense Distribution */}
          <Animated.View entering={FadeInUp.delay(100).duration(400)} className="bg-white dark:bg-slate-800 mx-6 p-6 rounded-[32px] shadow-sm mb-8 border border-slate-50 dark:border-slate-700/50">
            <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white mb-8">
              Expense Distribution
            </Text>
            
            {topCategories.length === 0 ? (
               <View className="h-32 items-center justify-center">
                 <Text className="text-slate-400 font-interMedium text-[12px]">No data available for chart.</Text>
               </View>
            ) : (
              <View className="flex-row items-end justify-center h-32 gap-x-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                {topCategories.map((cat, i) => {
                  const maxVal = Math.max(...topCategories.map(c => c.value));
                  const height = (cat.value / maxVal) * 100;
                  return (
                    <View key={i} className="items-center">
                      <View 
                        style={{ height: `${height}%` }} 
                        className={`w-14 rounded-t-lg ${i === 0 ? 'bg-[#6B4EFF] shadow-md shadow-[#6B4EFF]/30' : 'bg-[#C4B5FD]'}`} 
                      />
                      <Text className={`text-[9px] font-interExtraBold mt-2 uppercase tracking-widest ${i === 0 ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>
                        {cat.name}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </Animated.View>

          {/* Detailed List History */}
          <View className="px-6 mb-6">
             <Text className="text-[17px] font-interExtraBold text-slate-800 dark:text-white mb-6">
                Transactions History
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
                        className="bg-white dark:bg-slate-800/80 rounded-[24px] p-5 mb-5 shadow-sm border border-slate-50 dark:border-slate-700/50 overflow-hidden"
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
                            <View className="flex-row flex-wrap gap-2 mb-4">
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

          {/* Debt Balance Badge */}
          <Animated.View entering={FadeInUp.delay(200).duration(400)} className="mx-6 mb-8 mt-4 bg-[#6B4EFF] rounded-[32px] p-6 shadow-xl shadow-[#6B4EFF]/30 flex-row items-center justify-between overflow-hidden relative">
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
            <View>
              <Text className="text-white/70 font-interExtraBold text-[10px] uppercase tracking-widest mb-2">P2P Debt Balance</Text>
              <Text className="text-white font-interExtraBold text-[22px] mb-1">
                {netDebtBalance >= 0 ? `You're owed ₹${netDebtBalance.toFixed(2)}` : `You owe ₹${Math.abs(netDebtBalance).toFixed(2)}`}
              </Text>
              <Text className="text-white/60 font-interMedium text-[10px]">Calculated from all sessions</Text>
            </View>
            <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center">
              <Users color="white" size={20} />
            </View>
          </Animated.View>

          {/* Action Buttons */}
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
