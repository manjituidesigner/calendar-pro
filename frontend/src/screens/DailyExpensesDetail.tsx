import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ShoppingCart, UserCheck, Tag, Box, Edit2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import { expenseService } from '../services/api';
import { TransactionForm } from '../components/TransactionForm';
import { Alert } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export const DailyExpensesDetail = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { isDark } = useTheme();

  const { date, currentMonth } = route.params as any; // date is number (1-31)
  
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStr, setDateStr] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  const fetchDaily = async () => {
    try {
      setLoading(true);
      const d = new Date(currentMonth);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(date).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd}`;
      
      const displayDate = new Date(yyyy, d.getMonth(), date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
      setDateStr(displayDate);
      
      const data = await expenseService.getDailyExpenses(formattedDate);
      setExpenses(data);
    } catch (error) {
      console.log('Failed to fetch daily expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaily();
  }, [date, currentMonth]);

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              await expenseService.deleteExpense(id);
              fetchDaily();
            } catch (error) {
              Alert.alert("Error", "Failed to delete expense");
            }
          } 
        }
      ]
    );
  };

  const handleEdit = (expense: any) => {
    setSelectedExpense(expense);
    setIsEditModalVisible(true);
  };

  const total = expenses.reduce((sum, exp) => sum + exp.totalAmount, 0);

  return (
    <BaseLayout>
      <View className="flex-1 bg-transparent pt-12">
        
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-6 mt-2">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2 mr-1">
              <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={26} />
            </Pressable>
            <View>
              <Text className="text-[22px] font-interExtraBold text-slate-800 dark:text-white leading-tight">
                Daily Ledger
              </Text>
              <Text className="text-[12px] font-interSemiBold text-slate-500 dark:text-slate-400 mt-0.5">
                {dateStr}
              </Text>
            </View>
          </View>
          
          <View className="items-end bg-white dark:bg-slate-800 px-4 py-2.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 w-28">
            <Text className="text-[9px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-0.5 text-right w-full">Total</Text>
            <Text className="text-[16px] font-interExtraBold text-[#6B4EFF]" numberOfLines={1} adjustsFontSizeToFit>
              ₹{total.toFixed(2)}
            </Text>
          </View>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#6B4EFF" />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="px-6">
              
              {/* Empty State */}
              {expenses.length === 0 && (
                <View className="py-12 mt-10 items-center justify-center bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
                  <Box color={isDark ? '#475569' : '#CBD5E1'} size={48} className="mb-4 opacity-50" />
                  <Text className="font-interSemiBold text-[14px] text-slate-400 dark:text-slate-500 text-center px-4">No expenses recorded for this day.</Text>
                </View>
              )}

              {/* Cards List */}
              {expenses.map((exp, i) => (
                <Animated.View key={exp._id} entering={FadeInUp.delay(i * 100).duration(400)} className="bg-white dark:bg-slate-800/80 rounded-3xl p-5 mb-5 shadow-sm border border-slate-100 dark:border-slate-700/50">
                  
                  {/* Top Header: Payee & Status */}
                  <View className="flex-row items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-4">
                    <View className="flex-row items-center flex-1 pr-4">
                      <View className="w-12 h-12 bg-[#6B4EFF]/10 rounded-full items-center justify-center mr-3">
                        {exp.type === 'Buy' ? <ShoppingCart color="#6B4EFF" size={20} /> : <UserCheck color="#6B4EFF" size={20} />}
                      </View>
                      <View>
                        <Text className="font-interExtraBold text-[16px] text-slate-800 dark:text-white" numberOfLines={1}>
                          {exp.type === 'Buy' ? exp.payeeName || 'Purchase' : exp.partyName || 'LenDen Record'}
                        </Text>
                        <Text className="font-interSemiBold text-[10px] text-slate-400 uppercase tracking-widest mt-1">
                          {exp.type === 'Buy' ? `${exp.paymentMethod || 'Cash'} • ${exp.paymentStatus || 'Paid'}` : exp.lenDenType} • {exp.time || 'N/A'}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className={`font-interExtraBold text-[18px] ${exp.lenDenType === 'I TOOK' ? 'text-green-500' : 'text-red-500'}`}>
                        {exp.lenDenType === 'I TOOK' ? '+' : '-'}₹{exp.totalAmount.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Categories */}
                  {exp.type === 'Buy' && (exp.category || exp.subCategory) && (
                    <View className="flex-row flex-wrap gap-2 mb-4">
                      {exp.category && (
                        <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg flex-row items-center border border-slate-100 dark:border-slate-800">
                          <Tag color={isDark ? '#94A3B8' : '#64748B'} size={12} className="mr-1.5" />
                          <Text className="font-interExtraBold text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-wider">{exp.category}</Text>
                        </View>
                      )}
                      {exp.subCategory && (
                        <View className="bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg flex-row items-center border border-slate-100 dark:border-slate-800">
                          <Text className="font-interExtraBold text-[10px] text-slate-600 dark:text-slate-300 uppercase tracking-wider">{exp.subCategory}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Items List */}
                  {exp.type === 'Buy' && exp.items && exp.items.length > 0 && (
                    <View className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4">
                      <Text className="font-interExtraBold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Items Breakdown</Text>
                      {exp.items.map((item: any, idx: number) => (
                        <View key={idx} className={`flex-row justify-between items-center ${idx < exp.items.length - 1 ? 'mb-2' : ''}`}>
                          <Text className="font-interSemiBold text-[13px] text-slate-700 dark:text-slate-300 flex-1 pr-2" numberOfLines={1}>{item.title}</Text>
                          <Text className="font-interSemiBold text-[12px] text-slate-400 dark:text-slate-500 w-12 text-center">x{item.qty}</Text>
                          <Text className="font-interExtraBold text-[13px] text-slate-800 dark:text-white w-20 text-right">₹{(item.price * item.qty).toFixed(2)}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Notes */}
                  {exp.type === 'LenDen' && exp.notes && (
                    <View className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-4">
                      <Text className="font-interExtraBold text-[11px] text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Description / Notes</Text>
                      <Text className="font-interMedium text-[13px] text-slate-700 dark:text-slate-300 leading-5 italic">
                        "{exp.notes}"
                      </Text>
                    </View>
                  )}

                  {/* Actions */}
                  <View className="flex-row justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50 gap-x-3">
                    <Pressable 
                      onPress={() => handleEdit(exp)}
                      className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl"
                    >
                      <Edit2 color="#3B82F6" size={14} className="mr-2" />
                      <Text className="font-interExtraBold text-[12px] text-blue-600 dark:text-blue-400">Edit</Text>
                    </Pressable>
                    <Pressable 
                      onPress={() => handleDelete(exp._id)}
                      className="flex-row items-center bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl"
                    >
                      <Trash2 color="#EF4444" size={14} className="mr-2" />
                      <Text className="font-interExtraBold text-[12px] text-red-600 dark:text-red-400">Delete</Text>
                    </Pressable>
                  </View>

                </Animated.View>
              ))}
            </View>
          </ScrollView>
        )}

        <TransactionForm 
          visible={isEditModalVisible} 
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedExpense(null);
            fetchDaily();
          }} 
          editData={selectedExpense}
        />
      </View>
    </BaseLayout>
  );
};
