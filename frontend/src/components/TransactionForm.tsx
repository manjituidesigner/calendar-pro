import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { X, Plus, Share2, Download, CheckCircle, Smartphone, Search, Trash2, ChevronDown, UserPlus, Calendar as CalendarIcon, ArrowRight, Save } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api, { expenseService } from '../services/api';
import { useForm } from '../context/FormContext';

interface Item {
  id: string;
  title: string;
  qty: string;
  price: string;
}

export const TransactionForm = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { isDark } = useTheme();
  const { selectedDate, triggerRefresh } = useForm();
  const [activeTab, setActiveTab] = useState<'Buy' | 'LenDen'>('Buy');
  const [showAchievement, setShowAchievement] = useState(false);

  // ---- BUY STATE ----
  const [payee, setPayee] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [items, setItems] = useState<Item[]>([{ id: '1', title: '', qty: '1', price: '' }]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [method, setMethod] = useState<'Online' | 'Cash'>('Online');
  const [dateStr, setDateStr] = useState('');

  // Auto-Fetch Date
  useEffect(() => {
    if (visible) {
      const now = selectedDate || new Date();
      setDateStr(`${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} at ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`);
    }
  }, [visible, selectedDate]);

  // Derived Total
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1), 0);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), title: '', qty: '1', price: '' }]);
  };

  const updateItem = (id: string, field: keyof Item, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  // ---- LENDEN STATE ----
  const [partyName, setPartyName] = useState('');
  const [lenDenType, setLenDenType] = useState<'I GAVE' | 'I TOOK'>('I GAVE');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [notes, setNotes] = useState('');

  // ---- ACTIONS ----
  const handleSave = async () => {
    try {
      const targetDate = selectedDate || new Date();
      // Convert to local YYYY-MM-DD to avoid timezone offset issues
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStrFormat = `${yyyy}-${mm}-${dd}`;

      const payload: any = {
        date: dateStrFormat,
        type: activeTab,
        notes,
      };

      if (activeTab === 'Buy') {
         Object.assign(payload, {
           payeeName: payee,
           category,
           subCategory,
           items,
           paymentStatus,
           paymentMethod: method,
           totalAmount
         });
      } else {
         Object.assign(payload, {
           lenDenType,
           partyName,
           totalAmount: parseFloat(transactionAmount) || 0
         });
      }

      await expenseService.addExpense(payload);
      Alert.alert("Success", `${activeTab} Entry Saved!`);
      triggerRefresh();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || error.message);
    }
  };

  const handleDownload = async () => {
    Alert.alert("Downloading...", "Your receipt is generating.");
  };

  const handleShare = async () => {
    Alert.alert("Sharing...", "Opening share dialog.");
  };

  const renderBuyTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-4">
      {/* Payee, Category, Sub-Category */}
      <View className="bg-[#F8F9FA] dark:bg-slate-800 p-4 rounded-3xl">
        <View className="mb-4">
          <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Payee Name</Text>
          <TextInput className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl text-black dark:text-white font-interMedium shadow-sm border border-slate-100 dark:border-slate-700" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Whole Foods Market" value={payee} onChangeText={setPayee} />
        </View>

        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Category</Text>
            <View className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex-row items-center justify-between">
              <TextInput className="flex-1 text-black dark:text-white font-interMedium p-0" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Groceries" value={category} onChangeText={setCategory} />
              <ChevronDown color={isDark ? '#475569' : '#A0AEC0'} size={16} />
            </View>
          </View>
          <View className="flex-[1.2]">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Sub-Category</Text>
            <View className="bg-white dark:bg-[#0F172A] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <TextInput className="text-black dark:text-white font-interMedium p-0" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Daily Essentials" value={subCategory} onChangeText={setSubCategory} />
            </View>
          </View>
        </View>
      </View>

      {/* Item Details */}
      <View className="bg-[#F8F9FA] dark:bg-slate-800 p-4 py-6 rounded-[28px]">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">Item Details</Text>
          <View className="bg-[#6B4EFF]/10 px-3 py-1 rounded-full">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF]">{items.length} Items Added</Text>
          </View>
        </View>
        
        <View className="flex-row mb-2 px-2 mt-2">
          <Text className="flex-[3] text-[9px] uppercase font-interExtraBold text-slate-400 tracking-wider">Item Name</Text>
          <Text className="flex-1 text-[9px] uppercase font-interExtraBold text-slate-400 text-center tracking-wider">Qty</Text>
          <Text className="flex-[1.5] text-[9px] uppercase font-interExtraBold text-slate-400 text-right tracking-wider ml-6">Price</Text>
        </View>

        {items.map((item, index) => (
          <View key={item.id} className="flex-row items-center gap-x-2 mb-3">
            <View className="flex-[3] bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <TextInput value={item.title} onChangeText={(t) => updateItem(item.id, 'title', t)} className="px-4 py-3.5 text-black dark:text-white font-interMedium" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Organic Avocados" />
            </View>
            <View className="flex-[1] bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <TextInput value={item.qty} onChangeText={(t) => updateItem(item.id, 'qty', t)} className="px-1 py-3.5 text-black dark:text-white font-interMedium text-center" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="1" />
            </View>
            <View className="flex-[1.5] bg-white dark:bg-[#0F172A] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <TextInput value={item.price} onChangeText={(t) => updateItem(item.id, 'price', t)} className="px-4 py-3.5 text-black dark:text-white font-interMedium text-right" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="0.00" />
            </View>
            <Pressable className="p-2" onPress={() => removeItem(item.id)}>
              <Trash2 color={isDark ? '#475569' : '#94A3B8'} size={18} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={handleAddItem} className="flex-row items-center self-start mt-4 mb-2">
          <View className="bg-[#6B4EFF] rounded-full p-0.5 mr-2">
            <Plus color="white" size={14} strokeWidth={4} />
          </View>
          <Text className="text-[#6B4EFF] font-interExtraBold text-[12px]">Add Multiple Items</Text>
        </Pressable>
      </View>

      {/* Status & Method */}
      <View className="bg-[#F8F9FA] dark:bg-slate-800 p-4 rounded-[28px] gap-y-5">
        <View>
          <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Payment Status</Text>
          <View className="flex-row rounded-full overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-700 p-1">
            <Pressable onPress={() => setPaymentStatus('Paid')} className={`flex-1 py-3 rounded-full items-center ${paymentStatus === 'Paid' ? 'bg-white dark:bg-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : ''}`}>
              <Text className={`font-interExtraBold tracking-wide text-[12px] ${paymentStatus === 'Paid' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>Paid</Text>
            </Pressable>
            <Pressable onPress={() => setPaymentStatus('Pending')} className={`flex-1 py-3 rounded-full items-center ${paymentStatus === 'Pending' ? 'bg-white dark:bg-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : ''}`}>
              <Text className={`font-interExtraBold tracking-wide text-[12px] ${paymentStatus === 'Pending' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>Pending</Text>
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Payment Method</Text>
          <View className="flex-row rounded-full overflow-hidden bg-white dark:bg-[#0F172A] border border-slate-100 dark:border-slate-700 p-1">
            <Pressable onPress={() => setMethod('Online')} className={`flex-1 py-3 rounded-full items-center ${method === 'Online' ? 'bg-white dark:bg-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : ''}`}>
              <Text className={`font-interExtraBold tracking-wide text-[12px] ${method === 'Online' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>Online</Text>
            </Pressable>
            <Pressable onPress={() => setMethod('Cash')} className={`flex-1 py-3 rounded-full items-center ${method === 'Cash' ? 'bg-white dark:bg-slate-800 shadow-[0_2px_4px_rgba(0,0,0,0.05)]' : ''}`}>
              <Text className={`font-interExtraBold tracking-wide text-[12px] ${method === 'Cash' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>Cash</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View className="h-44" />
    </Animated.View>
  );

  const renderLenDenTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-6 pt-4">
      {/* Pills */}
      <View className="flex-row bg-[#F8F9FA] dark:bg-slate-800 rounded-full p-1.5 mx-2">
        <Pressable
          onPress={() => setLenDenType('I GAVE')}
          className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I GAVE' ? 'bg-white dark:bg-[#0F172A] shadow-sm' : ''}`}
        >
          <Text className={`font-interExtraBold tracking-wider text-[12px] uppercase ${lenDenType === 'I GAVE' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>
            I GAVE
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setLenDenType('I TOOK')}
          className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I TOOK' ? 'bg-white dark:bg-[#0F172A] shadow-sm' : ''}`}
        >
          <Text className={`font-interExtraBold tracking-wider text-[12px] uppercase ${lenDenType === 'I TOOK' ? 'text-[#6B4EFF]' : 'text-slate-400 dark:text-slate-500'}`}>
            I TOOK
          </Text>
        </Pressable>
      </View>

      {/* Amount Input */}
      <View className="items-center mt-6">
        <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] tracking-widest uppercase mb-4">Transaction Amount</Text>
        <View className="flex-row items-center justify-center">
          <Text className="text-[#6B4EFF] font-interExtraBold text-[36px] mt-1 mr-2">$</Text>
          <TextInput 
            className="text-[64px] font-interMedium text-[#C4D0F2] min-w-[200px]"
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="#C4D0F2"
            value={transactionAmount}
            onChangeText={setTransactionAmount}
          />
        </View>
        <View className="w-[85%] h-px bg-slate-200 dark:bg-slate-700/50 mt-6" />
      </View>

      {/* Form Fields Container */}
      <View className="bg-transparent gap-y-6 mt-4">
        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-3 pl-2">Party Name</Text>
          <View className="flex-row items-center border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-white dark:bg-[#0F172A]">
            <TextInput 
              className="flex-1 px-4 py-3.5 text-black dark:text-white font-interMedium text-[15px]" 
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
              placeholder="Select Party" 
              value={partyName} 
              onChangeText={setPartyName} 
            />
            <View className="p-2 mr-1"><ChevronDown color={isDark ? '#475569' : '#A0AEC0'} size={20} /></View>
            <Pressable className="bg-[#4D3EEB] w-12 h-12 rounded-xl items-center justify-center shadow-md shadow-indigo-500/20">
              <UserPlus color="white" size={20} />
            </Pressable>
          </View>
        </View>

        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-3 pl-2">Date & Time</Text>
          <View className="flex-row items-center border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-white dark:bg-[#0F172A]">
            <TextInput 
              className="flex-1 px-4 py-3.5 text-black dark:text-white font-interMedium text-[15px]" 
              value={dateStr}
              editable={false}
            />
            <View className="p-3">
              <CalendarIcon color={isDark ? '#475569' : '#A0AEC0'} size={20} />
            </View>
          </View>
        </View>

        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-800 dark:text-slate-300 uppercase tracking-widest mb-3 pl-2">Notes (Optional)</Text>
          <TextInput 
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] py-5 px-6 rounded-2xl text-black dark:text-white font-interMedium text-[15px]" 
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
            placeholder="What's this for?" 
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>

      <View className="bg-[#F8F5FF] dark:bg-[#6B4EFF]/10 mx-2 p-4 rounded-xl flex-row items-start mt-4 mb-32 border border-[#6B4EFF]/10">
        <View className="bg-[#6B4EFF] rounded-full w-5 h-5 items-center justify-center mt-0.5">
          <Text className="text-white text-[10px] font-interExtraBold italic">i</Text>
        </View>
        <Text className="flex-1 ml-3 text-slate-600 dark:text-slate-200 font-interMedium text-[12px] leading-5">
          This transaction will be recorded in your LenDen ledger with <Text className="font-interExtraBold text-[#6B4EFF]">{partyName || 'John Doe'}</Text>. You can edit this entry later.
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-slate-900 rounded-t-[32px] h-[95%] shadow-2xl overflow-hidden relative">
          
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 220 }}
            bounces={false}
          >
            {/* Conditional Header based on activeTab */}
            {activeTab === 'Buy' ? (
              <View className="flex-row items-center justify-between px-6 mb-6 mt-6">
                <Pressable onPress={onClose} className="p-2 relative right-2">
                  <X color={isDark ? '#CBD5E1' : '#475569'} size={20} />
                </Pressable>
                <Text className="text-[16px] font-interExtraBold text-black dark:text-white mr-2">
                  Add Expense
                </Text>
                <Pressable className="bg-black dark:bg-white rounded-full w-6 h-6 items-center justify-center">
                  <Text className="text-white dark:text-black text-[12px] font-interExtraBold">?</Text>
                </Pressable>
              </View>
            ) : (
              <View className="flex-row items-center justify-center px-6 mb-6 mt-6 relative">
                <Pressable onPress={onClose} className="absolute left-6 p-2">
                  <Text className="text-[#6B4EFF] font-interExtraBold text-[14px]">Cancel</Text>
                </Pressable>
                <Text className="text-[16px] font-interExtraBold text-black dark:text-white">
                  Add Transaction
                </Text>
              </View>
            )}

            {/* Top Level Transparent Tabs (Like exact Image 1 design) */}
            <View className="flex-row border-b border-slate-100 dark:border-slate-800 mx-8">
              <Pressable
                onPress={() => setActiveTab('Buy')}
                className={`flex-1 py-4 items-center ${activeTab === 'Buy' ? 'border-b-[3px] border-[#6B4EFF]' : ''}`}
              >
                <Text className={`font-interExtraBold tracking-wider text-[12px] uppercase ${activeTab === 'Buy' ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>
                  BUY
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('LenDen')}
                className={`flex-1 py-4 items-center ${activeTab === 'LenDen' ? 'border-b-[3px] border-[#4D3EEB]' : ''}`}
              >
                <Text className={`font-interExtraBold tracking-wider text-[12px] uppercase ${activeTab === 'LenDen' ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>
                  LENDEN
                </Text>
              </Pressable>
            </View>

            {/* Tab Contents */}
            <View className="px-6 mt-6">
              {activeTab === 'Buy' ? renderBuyTab() : renderLenDenTab()}
            </View>
          </ScrollView>

          {/* Absolute Dynamic Bottom Actions */}
          <View className={`absolute bottom-0 left-0 right-0 bg-[#F4F6FB] dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 pb-8 pt-5 ${activeTab === 'Buy' ? '' : 'px-6 gap-y-4'}`}>
            {activeTab === 'Buy' ? (
              <View>
                <View className="px-8 flex-row items-center justify-between mb-6">
                  <View>
                    <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest">Total Amount</Text>
                    <Text className="text-[28px] font-interExtraBold text-[#6B4EFF] mt-0.5">${totalAmount.toFixed(2)}</Text>
                  </View>
                  <View className="flex-row flex-end items-center gap-x-3 mt-4">
                    <Pressable onPress={handleDownload} className="w-12 h-12 bg-white rounded-full items-center justify-center border border-slate-200">
                      <Download color="#64748B" size={20} />
                    </Pressable>
                    <Pressable onPress={handleShare} className="w-12 h-12 bg-[#10B981] rounded-full items-center justify-center">
                      <Share2 color="white" size={20} />
                    </Pressable>
                  </View>
                </View>

                <View className="px-6">
                  <Pressable onPress={handleSave} className="bg-[#4D3EEB] py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#4D3EEB]/30">
                    <Text className="text-white font-interExtraBold text-[16px] mr-2">Save Expense</Text>
                    <ArrowRight color="white" size={20} />
                  </Pressable>
                </View>
              </View>
            ) : (
              // LenDen Bottom Action
              <View className="gap-y-3 pb-2 pt-2 bg-white dark:bg-slate-900">
                <Pressable onPress={handleSave} className="bg-[#4D3EEB] py-[18px] rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#4D3EEB]/30">
                  <Save color="white" size={20} className="mr-3" />
                  <Text className="text-white font-interExtraBold text-[16px]">Save Transaction</Text>
                </Pressable>
                <Pressable onPress={handleDownload} className="bg-[#F8F9FA] dark:bg-slate-800 py-[18px] rounded-2xl items-center flex-row justify-center border border-slate-100 dark:border-slate-700">
                  <Share2 color="#000" size={18} className="mr-3" />
                  <Text className="text-black dark:text-white font-interExtraBold text-[16px]">Save & Share Receipt</Text>
                </Pressable>
              </View>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
