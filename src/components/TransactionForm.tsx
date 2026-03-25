import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, Modal, KeyboardAvoidingView, Platform, Share, Alert } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { X, Plus, Share2, Download, CheckCircle, Smartphone, MapPin, Search } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import api from '../services/api';

interface Item {
  id: string;
  title: string;
  qty: string;
  price: string;
}

export const TransactionForm = ({ visible, onClose }: { visible: boolean; onClose: () => void }) => {
  const { isDark } = useTheme();
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
      const now = new Date();
      setDateStr(`${now.getDate()} ${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()} - ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`);
    }
  }, [visible]);

  // Derived Total
  const totalAmount = items.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1), 0);

  const handleAddItem = () => {
    setItems([...items, { id: Date.now().toString(), title: '', qty: '1', price: '' }]);
  };

  const updateItem = (id: string, field: keyof Item, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // ---- LENDEN STATE ----
  const [partyName, setPartyName] = useState('');
  const [lenDenType, setLenDenType] = useState<'I GAVE' | 'I TOOK'>('I GAVE');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [isAddingNewParty, setIsAddingNewParty] = useState(false);
  const [newPartyHeader, setNewPartyHeader] = useState({ name: '', mobile: '', city: '', type: 'Friends' });

  // ---- ACTIONS ----
  const handleSave = async () => {
    try {
      const payload = {
        type: activeTab,
        amount: activeTab === 'Buy' ? totalAmount : parseFloat(transactionAmount || '0'),
        date: new Date(),
        payeeOrParty: activeTab === 'Buy' ? payee : partyName,
        category,
        subCategory,
        items,
        paymentStatus,
        method,
        lenDenType,
        notes
      };

      await api.post('/transactions', payload);
      Alert.alert("Success", `${activeTab} Entry Saved!`);
      // Reset forms could go here
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert("Error", "Failed to save transaction.");
    }
  };

  const handleDownload = async () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Helvetica, sans-serif; padding: 40px; color: #1e293b; background-color: #f8fafc; }
          .container { background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); position: relative; overflow: hidden; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
          .header-left { width: 70%; }
          .header-right { width: 30%; text-align: right; }
          .logo { font-size: 24px; font-weight: 800; color: #2141A4; margin-bottom: 5px; }
          .invoice-title { font-size: 32px; font-weight: 900; color: #0f172a; margin: 0; }
          .tx-id { font-size: 12px; color: #64748b; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th { text-align: left; padding: 12px; background-color: #2141A4; color: white; font-size: 14px; text-transform: uppercase; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 15px; }
          tr:nth-child(even) { background-color: #DEE4EA; }
          .total-box { margin-left: auto; width: 300px; background-color: #f1f5f9; padding: 20px; border-radius: 8px; border-left: 4px solid #2141A4; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 15px; }
          .grand-total { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 12px; padding-top: 12px; border-top: 2px dashed #cbd5e1; }
          .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg); font-size: 120px; font-weight: 900; opacity: 0.05; text-transform: uppercase; z-index: 0; pointer-events: none; }
          .watermark.paid { color: #10B981; }
          .watermark.pending { color: #EF4444; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; color: #64748b; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 10px; }
          .qr { width: 64px; height: 64px; background-color: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 8px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="watermark ${paymentStatus.toLowerCase()}">${paymentStatus}</div>
          <div class="header" style="position: relative; z-index: 1;">
            <div class="header-left">
              <p class="invoice-title">INVOICE</p>
              <p class="tx-id">TXN-ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <div style="margin-top: 20px;">
                <p style="margin: 0; color: #64748b; font-size: 12px; text-transform: uppercase;">Billed To / Payee</p>
                <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700;">${activeTab === 'Buy' ? payee || 'Cash Expense' : partyName || 'P2P Transfer'}</p>
              </div>
            </div>
            <div class="header-right">
              <div class="logo">LEDGER PULSE</div>
              <p style="margin: 0; font-size: 14px; font-weight: 600;">Date: ${dateStr.split(' - ')[0]}</p>
              <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Method: ${method}</p>
            </div>
          </div>
          
          <table style="position: relative; z-index: 1;">
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td><b>${item.title || 'Misc Item'}</b></td>
                  <td style="text-align: center;">${item.qty || 1}</td>
                  <td style="text-align: right;">₹${item.price || 0}</td>
                  <td style="text-align: right;">₹${((parseFloat(item.price) || 0) * (parseFloat(item.qty) || 1)).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-box" style="position: relative; z-index: 1;">
            <div class="total-row"><span>Sub-total:</span> <span>₹${totalAmount.toFixed(2)}</span></div>
            <div class="total-row"><span>Tax (0%):</span> <span>₹0.00</span></div>
            <div class="total-row grand-total"><span>GRAND TOTAL:</span> <span>₹${totalAmount.toFixed(2)}</span></div>
          </div>

          <div class="footer">
            <div class="qr">SCAN ME</div>
            <p>Generated via Ledger Pulse - Your Expense Partner</p>
          </div>
        </div>
      </body>
      </html>
    `;
    try {
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri);
      
      // Trigger Achievement Unlocked Animation
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    } catch (e) {
      console.log(e);
    }
  };

  const handleShare = async () => {
    try {
      if (activeTab === 'LenDen') {
        await Share.share({
          message: `Join me on Ledger Pulse! Download the app and let's track our shared expenses seamlessly.\n\nUse Code: PULSE-${Math.floor(Math.random() * 10000)}`,
        });
      } else {
        await Share.share({
          message: `*Ledger Pulse Invoice*\n\nPayee: ${payee || 'Unknown'}\nTotal Amount: ₹${totalAmount}\nDate: ${dateStr}\nStatus: ${paymentStatus} via ${method}`,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const renderBuyTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-4">
      <View>
        <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Date & Time</Text>
        <TextInput className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-black dark:text-white font-interMedium" value={dateStr} editable={false} />
      </View>

      <View>
        <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Payee</Text>
        <TextInput className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-black dark:text-white font-interMedium" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="e.g. Amazon" value={payee} onChangeText={setPayee} />
      </View>

      <View className="flex-row gap-x-4">
        <View className="flex-1">
          <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Category</Text>
          <TextInput className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-black dark:text-white font-interMedium" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Shopping" value={category} onChangeText={setCategory} />
        </View>
        <View className="flex-1">
          <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-1">Sub-category</Text>
          <TextInput className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-black dark:text-white font-interMedium" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Electronics" value={subCategory} onChangeText={setSubCategory} />
        </View>
      </View>

      {/* Dynamic Items List */}
      <View className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl mt-4 border border-slate-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-[16px] font-interExtraBold text-black dark:text-white tracking-wide">Purchase Items</Text>
        </View>
        
        {items.map((item, index) => (
          <View key={item.id} className="flex-row gap-x-2 mb-3">
            <View className="flex-[3]">
              <Text className="text-[10px] uppercase font-interLight text-slate-500 mb-1">Title</Text>
              <TextInput value={item.title} onChangeText={(t) => updateItem(item.id, 'title', t)} className="bg-white dark:bg-slate-900/50 px-3 py-3 rounded-lg text-black dark:text-white font-interMedium border border-slate-100 dark:border-slate-700/50" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="Cable" />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] uppercase font-interLight text-slate-500 mb-1">Qty</Text>
              <TextInput value={item.qty} onChangeText={(t) => updateItem(item.id, 'qty', t)} className="bg-white dark:bg-slate-900/50 px-3 py-3 rounded-lg text-black dark:text-white font-interMedium text-center border border-slate-100 dark:border-slate-700/50" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="1" />
            </View>
            <View className="flex-[2]">
              <Text className="text-[10px] uppercase font-interLight text-slate-500 mb-1">Price (₹)</Text>
              <TextInput value={item.price} onChangeText={(t) => updateItem(item.id, 'price', t)} className="bg-white dark:bg-slate-900/50 px-3 py-3 rounded-lg text-black dark:text-white font-interMedium text-right border border-slate-100 dark:border-slate-700/50" keyboardType="numeric" placeholderTextColor={isDark ? '#475569' : '#94A3B8'} placeholder="0" />
            </View>
          </View>
        ))}

        <Pressable onPress={handleAddItem} className="flex-row items-center self-start mt-2 bg-actionBlue/10 px-4 py-2 rounded-full">
          <Plus color="#3079E6" size={16} strokeWidth={3} />
          <Text className="text-[#3079E6] font-interExtraBold ml-2 text-[14px]">Add More Items</Text>
        </Pressable>
      </View>

      {/* Status & Method */}
      <View className="flex-row gap-x-4 mt-4">
        <View className="flex-1">
          <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-2">Payment Status</Text>
          <View className="flex-row rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <Pressable onPress={() => setPaymentStatus('Paid')} className={`flex-1 py-3 items-center ${paymentStatus === 'Paid' ? 'bg-[#10B981]' : ''}`}>
              <Text className={`font-interExtraBold text-[14px] ${paymentStatus === 'Paid' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>Paid</Text>
            </Pressable>
            <Pressable onPress={() => setPaymentStatus('Pending')} className={`flex-1 py-3 items-center ${paymentStatus === 'Pending' ? 'bg-[#EF4444]' : ''}`}>
              <Text className={`font-interExtraBold text-[14px] ${paymentStatus === 'Pending' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>Pending</Text>
            </Pressable>
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-[12px] font-interLight text-slate-500 uppercase tracking-widest mb-2">Method</Text>
          <View className="flex-row rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <Pressable onPress={() => setMethod('Online')} className={`flex-1 py-3 items-center ${method === 'Online' ? 'bg-[#3079E6]' : ''}`}>
              <Text className={`font-interExtraBold text-[14px] ${method === 'Online' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>Online</Text>
            </Pressable>
            <Pressable onPress={() => setMethod('Cash')} className={`flex-1 py-3 items-center ${method === 'Cash' ? 'bg-[#F59E0B]' : ''}`}>
              <Text className={`font-interExtraBold text-[14px] ${method === 'Cash' ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>Cash</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Total Amount Footer */}
      <View className="flex-row justify-between items-center py-6 border-t border-slate-200 dark:border-slate-800 mt-4 mb-4">
        <Text className="text-[16px] font-interMedium text-slate-500 dark:text-slate-400">Total Amount</Text>
        <Text className="text-[36px] font-interExtraBold text-black dark:text-white">₹ {totalAmount.toFixed(2)}</Text>
      </View>
    </Animated.View>
  );

  const renderLenDenTab = () => (
    <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} className="gap-y-6">
      <View className="flex-row bg-slate-100 dark:bg-[#1E293B] rounded-full p-1 border border-slate-200 dark:border-slate-700/50 mt-2">
        <Pressable
          onPress={() => setLenDenType('I GAVE')}
          className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I GAVE' ? 'bg-white dark:bg-[#0F172A] shadow-md border-b-[3px] border-[#3079E6]' : ''}`}
        >
          <Text className={`font-interExtraBold tracking-wide text-[14px] ${lenDenType === 'I GAVE' ? 'text-[#3079E6]' : 'text-slate-500 dark:text-slate-400'}`}>
            I GAVE
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setLenDenType('I TOOK')}
          className={`flex-1 py-3 items-center rounded-full ${lenDenType === 'I TOOK' ? 'bg-white dark:bg-[#0F172A] shadow-md border-b-[3px] border-[#3079E6]' : ''}`}
        >
          <Text className={`font-interExtraBold tracking-wide text-[14px] ${lenDenType === 'I TOOK' ? 'text-[#3079E6]' : 'text-slate-500 dark:text-slate-400'}`}>
            I TOOK
          </Text>
        </Pressable>
      </View>

      <View className="items-center my-6">
        <Text className="text-[10px] font-interExtraBold text-[#3079E6] tracking-widest uppercase mb-2">Transaction Amount</Text>
        <View className="flex-row items-center">
          <Text className="text-[#3079E6] font-interExtraBold text-[32px] mr-2">$</Text>
          <TextInput 
            className="text-[48px] font-interExtraBold text-[#3b82f6]/50 min-w-[100px] text-center"
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="rgba(59, 130, 246, 0.3)"
            value={transactionAmount}
            onChangeText={setTransactionAmount}
          />
        </View>
      </View>

      <View className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm gap-y-6 mb-4">
        <View>
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3">Party Name</Text>
          <View className="flex-row items-center bg-white dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <TextInput 
              className="flex-1 px-4 py-3 text-black dark:text-white font-interMedium" 
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
              placeholder="Select Party" 
              value={partyName} 
              onChangeText={setPartyName} 
            />
            <Pressable className="bg-[#3079E6] p-3 rounded-xl ml-2 shadow-lg shadow-[#3079E6]/30">
              <Smartphone color="white" size={20} />
            </Pressable>
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3">Date & Time</Text>
          <View className="flex-row items-center bg-white dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <TextInput 
              className="flex-1 px-4 py-3 text-black dark:text-white font-interMedium" 
              value={dateStr}
              editable={false}
            />
            <View className="p-3">
              <Text className="text-slate-400">📅</Text>
            </View>
          </View>
        </View>

        <View>
          <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-3">Notes (Optional)</Text>
          <TextInput 
            className="bg-white dark:bg-[#0F172A] p-4 py-5 rounded-2xl text-black dark:text-white font-interMedium border border-slate-200 dark:border-slate-700" 
            placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
            placeholder="What's this for?" 
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      </View>

      <View className="bg-[#3079E6]/10 p-4 rounded-2xl flex-row items-start mb-6 border border-[#3079E6]/20">
        <View className="bg-[#3079E6] rounded-full w-5 h-5 items-center justify-center mt-0.5">
          <Text className="text-white text-[10px] font-interExtraBold">i</Text>
        </View>
        <Text className="flex-1 ml-3 text-slate-600 dark:text-slate-300 font-interMedium text-[12px] leading-5">
          This transaction will be recorded in your LenDen ledger with <Text className="font-interExtraBold text-[#3079E6]">{partyName || 'the party'}</Text>. You can edit this entry later.
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      {showAchievement && (
        <Animated.View entering={SlideInDown.springify().damping(15)} exiting={FadeOut} style={{ position: 'absolute', top: 60, left: 20, right: 20, zIndex: 100, backgroundColor: '#3079E6', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#3079E6', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 10 }, shadowRadius: 20, elevation: 15 }}>
          <View style={{ backgroundColor: '#fff', padding: 8, borderRadius: 12 }}>
            <CheckCircle color="#3079E6" size={24} />
          </View>
          <View style={{ marginLeft: 16 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', opacity: 0.8, fontFamily: 'InterLight' }}>Achievement Unlocked</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', fontFamily: 'InterExtraBold' }}>Receipt Downloader!</Text>
          </View>
        </Animated.View>
      )}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/60">
        <View className="bg-white dark:bg-[#0F172A] rounded-t-3xl h-[92%] pt-6 pb-2 shadow-2xl">
          
          <View className="flex-row items-center justify-between px-6 mb-6">
            <Text className="text-[28px] font-interExtraBold text-black dark:text-white tracking-wide">
              {activeTab === 'Buy' ? 'Add Expense' : 'Add Transaction'}
            </Text>
            <Pressable onPress={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <X color={isDark ? '#CBD5E1' : '#475569'} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>

          {/* Dual-Tab Navigation (Pill-shaped with Neon Logic) */}
          <View className="px-6 mb-6">
            <View className="flex-row bg-slate-100 dark:bg-[#1E293B] rounded-full p-1 border border-slate-200 dark:border-slate-700/50">
              <Pressable
                onPress={() => setActiveTab('Buy')}
                className={`flex-1 py-3 items-center rounded-full ${activeTab === 'Buy' ? (isDark ? 'bg-[#0F172A] border border-[#3079E6] shadow-[0_0_12px_rgba(48,121,230,0.6)]' : 'bg-white shadow-md border-b-[3px] border-[#3079E6]') : ''}`}
              >
                <Text className={`font-interExtraBold tracking-wide text-[16px] ${activeTab === 'Buy' ? 'text-[#3079E6]' : 'text-slate-500 dark:text-slate-500'}`}>
                  Buy
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('LenDen')}
                className={`flex-1 py-3 items-center rounded-full ${activeTab === 'LenDen' ? (isDark ? 'bg-[#0F172A] border border-[#3079E6] shadow-[0_0_12px_rgba(48,121,230,0.6)]' : 'bg-white shadow-md border-b-[3px] border-[#3079E6]') : ''}`}
              >
                <Text className={`font-interExtraBold tracking-wide text-[16px] ${activeTab === 'LenDen' ? 'text-[#3079E6]' : 'text-slate-500 dark:text-slate-500'}`}>
                  LenDen
                </Text>
              </Pressable>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}>
            {activeTab === 'Buy' ? renderBuyTab() : renderLenDenTab()}
          </ScrollView>

          {/* Action Bar (Pinned Bottom) */}
          <Animated.View entering={SlideInDown.duration(400).delay(200)} className="absolute bottom-0 left-0 right-0 px-6 pt-4 pb-8 bg-white dark:bg-[#0F172A] border-t border-slate-100 dark:border-slate-800 flex-row gap-x-4 items-center">
            <Pressable onPress={handleSave} className="flex-[3] bg-[#3079E6] py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-[#3079E6]/40">
              <CheckCircle color="white" size={24} />
              <Text className="text-white font-interExtraBold text-[18px] ml-2 tracking-widest">SAVE</Text>
            </Pressable>
            <Pressable onPress={handleDownload} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/50">
              <Download color={isDark ? '#E2E8F0' : '#0F172A'} size={24} />
            </Pressable>
            <Pressable onPress={handleShare} className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-2xl">
              <Share2 color="#10B981" size={24} />
            </Pressable>
          </Animated.View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
