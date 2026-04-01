import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Plus, Lock, CheckCircle2, UserCheck, Calendar as CalendarIcon, Edit2, Trash2, X, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useCalendar } from '../context/CalendarContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeInDown, FadeInRight, FadeIn, FadeOut } from 'react-native-reanimated';
import { calendarService } from '../services/api';

export const ManageCalendars = () => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { calendars, activeCalendar, setActiveCalendarById, loading, refreshCalendars } = useCalendar();

  // Security States
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [selectedCal, setSelectedCal] = useState<any>(null);
  const [pendingAction, setPendingAction] = useState<'edit' | 'delete' | null>(null);

  const handleSelect = async (id: string) => {
    await setActiveCalendarById(id);
    navigation.navigate('Home');
  };

  const initiateAction = (cal: any, action: 'edit' | 'delete') => {
    if (cal.pin) {
      setSelectedCal(cal);
      setPendingAction(action);
      setPinInput('');
      setShowPinModal(true);
    } else {
      if (action === 'delete') {
        confirmDelete(cal._id);
      } else {
        // Edit logic - for now we'll just navigate or show alert
        Alert.alert("Info", "Edit feature coming soon!");
      }
    }
  };

  const handlePinVerify = () => {
    if (pinInput === selectedCal.pin) {
      setShowPinModal(false);
      if (pendingAction === 'delete') {
        confirmDelete(selectedCal._id);
      } else {
        Alert.alert("Success", "PIN Verified! Opening Edit...");
      }
    } else {
      Alert.alert("Error", "Incorrect PIN. Please try again!");
      setPinInput('');
    }
  };

  const confirmDelete = (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to permanently delete this calendar? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => executeDelete(id) }
      ]
    );
  };

  const executeDelete = async (id: string) => {
    try {
      await calendarService.delete(id);
      await refreshCalendars();
      Alert.alert("Success", "Calendar deleted successfully! Thanks.");
    } catch (error) {
      Alert.alert("Error", "Failed to delete. Please try again!");
    }
  };

  return (
    <BaseLayout>
      <View className="flex-1 bg-transparent pt-12">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 mb-8 mt-2">
          <View className="flex-row items-center">
            <Pressable onPress={() => navigation.goBack()} className="p-2 -ml-2">
              <ChevronLeft color={isDark ? '#E2E8F0' : '#1E293B'} size={24} />
            </Pressable>
            <Text className="text-[18px] font-interExtraBold text-slate-800 dark:text-white ml-2">
              Calendars
            </Text>
          </View>
          <Pressable onPress={() => navigation.navigate('CreateCalendar')} className="w-10 h-10 bg-[#6B4EFF] rounded-2xl items-center justify-center shadow-lg shadow-indigo-500/30">
            <Plus color="white" size={20} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="px-6 mb-6">
            <Text className="text-[14px] font-interExtraBold text-slate-900 dark:text-white mb-1">Your Workspaces</Text>
            <Text className="text-[12px] font-interMedium text-slate-400">Manage and switch between your ledgers.</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#6B4EFF" className="mt-10" />
          ) : calendars.length === 0 ? (
            <View className="px-6 py-20 items-center justify-center bg-white dark:bg-slate-800/50 mx-6 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700">
               <CalendarIcon color={isDark ? '#334155' : '#E2E8F0'} size={48} strokeWidth={1} />
               <Text className="text-slate-400 font-interMedium mt-4 text-center">You haven't created any calendars yet.</Text>
               <Pressable onPress={() => navigation.navigate('CreateCalendar')} className="mt-6 bg-[#6B4EFF] px-6 py-3 rounded-xl">
                  <Text className="text-white font-interExtraBold text-[12px] uppercase">Create Calendar</Text>
               </Pressable>
            </View>
          ) : (
            <View className="px-6 flex-row flex-wrap justify-between">
              {calendars.map((cal, index) => {
                const isActive = activeCalendar?._id === cal._id;
                return (
                  <Animated.View 
                    key={cal._id} 
                    entering={FadeInDown.delay(index * 100).duration(400)} 
                    className="w-[48%] mb-4"
                  >
                    <View className="relative">
                      <Pressable 
                        onPress={() => handleSelect(cal._id)}
                        className={`h-52 rounded-[32px] p-5 shadow-sm overflow-hidden border-2 flex-col justify-between ${isActive ? 'bg-[#6B4EFF] border-[#6B4EFF]' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700/50'}`}
                      >
                        <View className="flex-row justify-between items-start">
                          <View className={`w-9 h-9 rounded-2xl items-center justify-center ${isActive ? 'bg-white/20' : 'bg-[#6B4EFF]/10'}`}>
                             {cal.isPrivate ? (
                               <Lock color={isActive ? 'white' : '#6B4EFF'} size={16} />
                             ) : (
                               <UserCheck color={isActive ? 'white' : '#6B4EFF'} size={16} />
                             )}
                          </View>
                        </View>

                        <View>
                          <Text className={`text-[15px] font-interExtraBold mb-1 ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`} numberOfLines={2}>
                            {cal.name}
                          </Text>
                          <View className="flex-row items-center">
                             <Text className={`text-[10px] font-interMedium uppercase tracking-widest ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                                {cal.category || 'Personal'}
                             </Text>
                             {isActive && (
                                <View className="ml-2 w-1 h-1 rounded-full bg-white/50" />
                             )}
                             {isActive && (
                                <Text className="ml-2 text-[8px] font-interExtraBold text-white uppercase tracking-tighter">Active</Text>
                             )}
                          </View>
                        </View>
                      </Pressable>

                      {/* Floating Action Buttons moved outside the main card Pressable */}
                      <View className="absolute top-4 right-4 flex-row gap-x-1.5">
                         <Pressable 
                           onPress={() => initiateAction(cal, 'edit')} 
                           className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}
                           hitSlop={8}
                         >
                            <Edit2 color={isActive ? 'white' : '#64748B'} size={12} />
                         </Pressable>
                         <Pressable 
                           onPress={() => initiateAction(cal, 'delete')} 
                           className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-red-50 dark:bg-red-900/10'}`}
                           hitSlop={8}
                         >
                            <Trash2 color={isActive ? 'white' : '#EF4444'} size={12} />
                         </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {!loading && calendars.length > 0 && (
            <Pressable onPress={() => navigation.navigate('CreateCalendar')} className="items-center justify-center mt-8 mb-6">
              <View className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center mb-2">
                 <Plus color={isDark ? '#475569' : '#94A3B8'} size={24} />
              </View>
              <Text className="text-slate-400 font-interMedium text-[11px] uppercase tracking-widest">Add new calendar</Text>
            </Pressable>
          )}

        </ScrollView>
      </View>

      {/* PIN Verification Modal */}
      <Modal visible={showPinModal} transparent animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/60 px-8">
           <Animated.View entering={FadeIn.duration(300)} className="w-full bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl items-center">
              <View className="w-16 h-16 bg-[#6B4EFF]/10 rounded-full items-center justify-center mb-6">
                 <ShieldCheck color="#6B4EFF" size={32} />
              </View>
              
              <Text className="text-[20px] font-interExtraBold text-slate-900 dark:text-white mb-2 text-center">Security PIN Required</Text>
              <Text className="text-[12px] font-interMedium text-slate-500 dark:text-slate-400 text-center mb-8">Enter the 4-digit security code for '{selectedCal?.name}' to unlock this action.</Text>
              
              <TextInput 
                 className="w-full bg-slate-50 dark:bg-slate-800 py-5 px-6 rounded-3xl text-[28px] font-interExtraBold text-center text-[#6B4EFF] tracking-[15px]"
                 placeholder="0000"
                 placeholderTextColor={isDark ? '#334155' : '#CBD5E1'}
                 keyboardType="numeric"
                 maxLength={4}
                 secureTextEntry
                 value={pinInput}
                 onChangeText={setPinInput}
                 autoFocus
              />

              <View className="flex-row gap-x-4 mt-8 w-full">
                 <Pressable onPress={() => setShowPinModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 py-4 rounded-2xl items-center">
                    <Text className="text-slate-500 dark:text-slate-300 font-interExtraBold">Cancel</Text>
                 </Pressable>
                 <Pressable onPress={handlePinVerify} className="flex-1 bg-[#6B4EFF] py-4 rounded-2xl items-center shadow-lg shadow-indigo-500/30">
                    <Text className="text-white font-interExtraBold">Verify</Text>
                 </Pressable>
              </View>
           </Animated.View>
        </View>
      </Modal>
    </BaseLayout>
  );
};
