import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Share, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { X, Plus, Share2, Download, CheckCircle, Smartphone, Search, Trash2, ChevronDown, UserPlus, Calendar as CalendarIcon, ArrowRight, Save } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import api, { expenseService } from '../services/api';
import { useForm } from '../context/FormContext';
import { useCalendar } from '../context/CalendarContext';

interface Item {
  id: string;
  title: string;
  qty: string;
  price: string;
}

export const TransactionForm = ({ visible, onClose, editData }: { visible: boolean; onClose: () => void; editData?: any }) => {
  const { isDark } = useTheme();
  const { selectedDate, triggerRefresh } = useForm();
  const { activeCalendar } = useCalendar();
  const [activeTab, setActiveTab] = useState<'Buy' | 'LenDen'>('Buy');
  const [loading, setLoading] = useState(false);

  // ---- BUY STATE ----
  const [payee, setPayee] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [items, setItems] = useState<Item[]>([{ id: '1', title: '', qty: '1', price: '' }]);
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending'>('Paid');
  const [method, setMethod] = useState<'Online' | 'Cash'>('Online');
  const [dateStr, setDateStr] = useState('');
  const [time, setTime] = useState('');

  // ---- LENDEN STATE ----
  const [partyName, setPartyName] = useState('');
  const [lenDenType, setLenDenType] = useState<'I GAVE' | 'I TOOK'>('I GAVE');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Auto-Fetch Date & Populate Edit Data
  useEffect(() => {
    if (visible) {
      if (editData) {
        setActiveTab(editData.type);
        if (editData.type === 'Buy') {
          setPayee(editData.payeeName || '');
          setCategory(editData.category || '');
          setSubCategory(editData.subCategory || '');
          setItems(editData.items && editData.items.length > 0 ? editData.items.map((item: any) => ({
            id: item._id || Date.now().toString() + Math.random(),
            title: item.title,
            qty: String(item.qty),
            price: String(item.price)
          })) : [{ id: '1', title: '', qty: '1', price: '' }]);
          setPaymentStatus(editData.paymentStatus || 'Paid');
          setMethod(editData.paymentMethod || 'Online');
        } else {
          setPartyName(editData.partyName || '');
          setLenDenType(editData.lenDenType || 'I GAVE');
          setTransactionAmount(String(editData.totalAmount || ''));
          setNotes(editData.notes || '');
        }
        setTime(editData.time || '');
      } else {
        // Reset for new entry
        setPayee('');
        setCategory('');
        setSubCategory('');
        setItems([{ id: '1', title: '', qty: '1', price: '' }]);
        setPaymentStatus('Paid');
        setMethod('Online');
        setPartyName('');
        setLenDenType('I GAVE');
        setTransactionAmount('');
        setNotes('');
        
        const now = selectedDate || new Date();
        const currentHr = now.getHours();
        const ampm = currentHr >= 12 ? 'PM' : 'AM';
        const hr12 = currentHr % 12 || 12;
        const timeStr = `${hr12}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
        setTime(timeStr);
      }

      const now = selectedDate || new Date();
      const currentHr = now.getHours();
      const ampm = currentHr >= 12 ? 'PM' : 'AM';
      const hr12 = currentHr % 12 || 12;
      const timeStr = editData ? editData.time : `${hr12}:${String(now.getMinutes()).padStart(2, '0')} ${ampm}`;
      setDateStr(`${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} at ${timeStr}`);
    }
  }, [visible, selectedDate, editData]);

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

  const handleSave = async () => {
    if (activeTab === 'Buy' && !payee) return Alert.alert("Required", "Please enter payee name");
    if (activeTab === 'LenDen' && (!partyName || !transactionAmount)) return Alert.alert("Required", "Please enter party name and amount");

    if (!activeCalendar) return Alert.alert("Required", "Please select a calendar first.");

    try {
      setLoading(true);
      const targetDate = selectedDate || new Date();
      const yyyy = targetDate.getFullYear();
      const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
      const dd = String(targetDate.getDate()).padStart(2, '0');
      const dateStrFormat = `${yyyy}-${mm}-${dd}`;

      const payload: any = {
        calendarId: activeCalendar._id,
        date: dateStrFormat,
        time: time,
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

      if (editData && editData._id) {
        await expenseService.updateExpense(editData._id, payload);
        Alert.alert("Success", `${activeTab} Entry Updated!`);
      } else {
        await expenseService.addExpense(payload);
        Alert.alert("Success", `${activeTab} Entry Saved!`);
      }
      triggerRefresh();
      onClose();
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderBuyTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-4">
      <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
        <View className="mb-4">
          <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Payee Name</Text>
          <TextInput className="bg-white dark:bg-slate-900 p-4 rounded-2xl text-black dark:text-white font-interMedium shadow-sm border border-slate-100 dark:border-slate-800" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Whole Foods Market" value={payee} onChangeText={setPayee} />
        </View>

        <View className="flex-row gap-x-3">
          <View className="flex-1">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Category</Text>
            <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex-row items-center justify-between">
              <TextInput className="flex-1 text-black dark:text-white font-interMedium p-0" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Groceries" value={category} onChangeText={setCategory} />
              <ChevronDown color={isDark ? '#475569' : '#A0AEC0'} size={16} />
            </View>
          </View>
          <View className="flex-[1.2]">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-2 pl-2">Sub-Category</Text>
            <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <TextInput className="text-black dark:text-white font-interMedium p-0" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Daily Essentials" value={subCategory} onChangeText={setSubCategory} />
            </View>
          </View>
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800/50 p-4 py-6 rounded-[28px] border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">Item Details</Text>
          <View className="bg-[#6B4EFF]/10 px-3 py-1 rounded-full">
            <Text className="text-[10px] font-interExtraBold text-[#6B4EFF]">{items.length} Items</Text>
          </View>
        </View>
        
        <View className="flex-row mb-2 px-2">
          <Text className="flex-[3] text-[9px] uppercase font-interExtraBold text-slate-400 tracking-wider">Item Name</Text>
          <Text className="flex-1 text-[9px] uppercase font-interExtraBold text-slate-400 text-center tracking-wider">Qty</Text>
          <Text className="flex-[1.5] text-[9px] uppercase font-interExtraBold text-slate-400 text-right tracking-wider ml-6">Price</Text>
        </View>

        {items.map((item, index) => (
          <View key={item.id} className="flex-row items-center gap-x-2 mb-3">
            <View className="flex-[3] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <TextInput value={item.title} onChangeText={(t) => updateItem(item.id, 'title', t)} className="px-4 py-3.5 text-black dark:text-white font-interMedium" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Item..." />
            </View>
            <View className="flex-[1] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <TextInput value={item.qty} onChangeText={(t) => updateItem(item.id, 'qty', t)} className="px-1 py-3.5 text-black dark:text-white font-interMedium text-center" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="1" />
            </View>
            <View className="flex-[1.5] bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <TextInput value={item.price} onChangeText={(t) => updateItem(item.id, 'price', t)} className="px-4 py-3.5 text-black dark:text-white font-interMedium text-right" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="0" />
            </View>
            <Pressable className="p-2" onPress={() => removeItem(item.id)}>
              <Trash2 color={isDark ? '#EF4444' : '#94A3B8'} size={18} />
            </Pressable>
          </View>
        ))}

        <Pressable onPress={handleAddItem} className="flex-row items-center self-start mt-4">
          <View className="bg-[#6B4EFF] rounded-full p-0.5 mr-2">
            <Plus color="white" size={14} strokeWidth={4} />
          </View>
          <Text className="text-[#6B4EFF] font-interExtraBold text-[12px]">Add More Items</Text>
        </Pressable>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800">
        <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Payment Status</Text>
        <View className="flex-row rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1">
          <Pressable onPress={() => setPaymentStatus('Paid')} className={`flex-1 py-3 rounded-full items-center ${paymentStatus === 'Paid' ? 'bg-[#6B4EFF] shadow-sm' : ''}`}>
            <Text className={`font-interExtraBold text-[12px] ${paymentStatus === 'Paid' ? 'text-white' : 'text-slate-400'}`}>Paid</Text>
          </Pressable>
          <Pressable onPress={() => setPaymentStatus('Pending')} className={`flex-1 py-3 rounded-full items-center ${paymentStatus === 'Pending' ? 'bg-[#6B4EFF] shadow-sm' : ''}`}>
            <Text className={`font-interExtraBold text-[12px] ${paymentStatus === 'Pending' ? 'text-white' : 'text-slate-400'}`}>Pending</Text>
          </Pressable>
        </View>
      </View>

      {paymentStatus === 'Paid' && (
        <Animated.View entering={FadeIn.duration(200)} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[28px] border border-slate-100 dark:border-slate-800">
          <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Payment Method</Text>
          <View className="flex-row rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-1">
            <Pressable onPress={() => setMethod('Online')} className={`flex-1 py-3 rounded-full items-center ${method === 'Online' ? 'bg-[#10B981] shadow-sm' : ''}`}>
              <Text className={`font-interExtraBold text-[12px] ${method === 'Online' ? 'text-white' : 'text-slate-400'}`}>Online</Text>
            </Pressable>
            <Pressable onPress={() => setMethod('Cash')} className={`flex-1 py-3 rounded-full items-center ${method === 'Cash' ? 'bg-[#F59E0B] shadow-sm' : ''}`}>
              <Text className={`font-interExtraBold text-[12px] ${method === 'Cash' ? 'text-white' : 'text-slate-400'}`}>Cash</Text>
            </Pressable>
          </View>
        </Animated.View>
      )}
      <View className="h-44" />
    </Animated.View>
  );

  const renderLenDenTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-6 pt-4">
      <View className="flex-row bg-slate-50 dark:bg-slate-800 rounded-full p-1.5 mx-2 border border-slate-100 dark:border-slate-800">
        <Pressable onPress={() => setLenDenType('I GAVE')} className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I GAVE' ? 'bg-[#6B4EFF] shadow-sm' : ''}`}>
          <Text className={`font-interExtraBold text-[12px] ${lenDenType === 'I GAVE' ? 'text-white' : 'text-slate-400'}`}>I GAVE</Text>
        </Pressable>
        <Pressable onPress={() => setLenDenType('I TOOK')} className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I TOOK' ? 'bg-[#EF4444] shadow-sm' : ''}`}>
          <Text className={`font-interExtraBold text-[12px] ${lenDenType === 'I TOOK' ? 'text-white' : 'text-slate-400'}`}>I TOOK</Text>
        </Pressable>
      </View>

      <View className="items-center mt-6">
        <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] tracking-widest uppercase mb-4">Transaction Amount</Text>
        <View className="flex-row items-center">
          <Text className="text-[#6B4EFF] font-interExtraBold text-[36px] mt-1 mr-2">₹</Text>
          <TextInput 
            className="text-[64px] font-interMedium text-slate-800 dark:text-white min-w-[200px] text-center"
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={isDark ? '#1E293B' : '#E2E8F0'}
            value={transactionAmount}
            onChangeText={setTransactionAmount}
          />
        </View>
        <View className="w-[85%] h-px bg-slate-100 dark:bg-slate-800 mt-6" />
      </View>

      <View className="gap-y-6 mt-4">
        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3 pl-2">Party Name</Text>
          <View className="flex-row items-center border border-slate-200 dark:border-slate-800 rounded-2xl p-2 bg-white dark:bg-slate-900 shadow-sm">
            <TextInput className="flex-1 px-4 py-3.5 text-black dark:text-white font-interMedium text-[16px]" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Enter Party Name" value={partyName} onChangeText={setPartyName} />
            <Pressable className="bg-[#6B4EFF] w-12 h-12 rounded-xl items-center justify-center shadow-md">
              <UserPlus color="white" size={20} />
            </Pressable>
          </View>
        </View>

        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3 pl-2">Date & Time</Text>
          <View className="flex-row items-center border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 shadow-sm">
            <Text className="flex-1 text-black dark:text-white font-interMedium text-[16px]">{dateStr}</Text>
            <CalendarIcon color={isDark ? '#475569' : '#A0AEC0'} size={20} />
          </View>
        </View>

        <View className="px-2">
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3 pl-2">Notes (Optional)</Text>
          <TextInput className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 rounded-2xl text-black dark:text-white font-interMedium text-[16px]" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="What's this for?" value={notes} onChangeText={setNotes} multiline />
        </View>
      </View>
      <View className="h-44" />
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-slate-900 rounded-t-[32px] h-[95%] shadow-2xl relative">
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 220 }}>
            <View className="flex-row items-center justify-between px-6 mb-6 mt-6">
              <Pressable onPress={onClose} className="p-2"><X color={isDark ? '#FFF' : '#475569'} size={24} /></Pressable>
              <Text className="text-[18px] font-interExtraBold text-black dark:text-white">{editData ? 'Edit Entry' : 'New Entry'}</Text>
              <View className="w-10" />
            </View>

            <View className="flex-row border-b border-slate-100 dark:border-slate-800 mx-8 mb-6">
              <Pressable onPress={() => setActiveTab('Buy')} className={`flex-1 py-4 items-center ${activeTab === 'Buy' ? 'border-b-2 border-[#6B4EFF]' : ''}`}>
                <Text className={`font-interExtraBold text-[12px] uppercase ${activeTab === 'Buy' ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>BUY</Text>
              </Pressable>
              <Pressable onPress={() => setActiveTab('LenDen')} className={`flex-1 py-4 items-center ${activeTab === 'LenDen' ? 'border-b-2 border-[#6B4EFF]' : ''}`}>
                <Text className={`font-interExtraBold text-[12px] uppercase ${activeTab === 'LenDen' ? 'text-[#6B4EFF]' : 'text-slate-400'}`}>LENDEN</Text>
              </Pressable>
            </View>

            <View className="px-6">
              {activeTab === 'Buy' ? renderBuyTab() : renderLenDenTab()}
            </View>
          </ScrollView>

          <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-6 pt-4">
            {activeTab === 'Buy' && (
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-slate-500 font-interBold text-[12px] uppercase">Total Amount</Text>
                <Text className="text-[28px] font-interExtraBold text-[#6B4EFF]">₹{totalAmount.toFixed(2)}</Text>
              </View>
            )}
            <Pressable onPress={handleSave} disabled={loading} className="bg-[#6B4EFF] py-5 rounded-2xl items-center shadow-lg shadow-[#6B4EFF]/30 flex-row justify-center">
              {loading ? <ActivityIndicator color="white" /> : (
                <>
                  <Text className="text-white font-interExtraBold text-[16px] mr-2">{editData ? 'Update Entry' : 'Save Entry'}</Text>
                  <ArrowRight color="white" size={18} />
                </>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
