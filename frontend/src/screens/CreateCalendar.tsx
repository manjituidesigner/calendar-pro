import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Switch, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, ArrowRight, UserPlus, Trash2, ShieldCheck, Users, ChevronRight, X, KeyRound } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useCalendar } from '../context/CalendarContext';
import { BaseLayout } from '../components/BaseLayout';
import Animated, { FadeIn, FadeOut, SlideInDown } from 'react-native-reanimated';
import { calendarService } from '../services/api';

const CATEGORIES = ['Personal', 'Shared', 'Work', 'Family'];

export const CreateCalendar = () => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const { refreshCalendars } = useCalendar();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Personal');
  const [requirePin, setRequirePin] = useState(false);
  const [pin, setPin] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);

  // Sharing State
  const [shareEmail, setShareEmail] = useState('');
  const [sharedPeople, setSharedPeople] = useState<{ email: string; rights: string }[]>([]);

  const handleAddPerson = () => {
    const emailLower = shareEmail.trim().toLowerCase();
    if (!emailLower.includes('@')) return Alert.alert("Error", "Please enter a valid email");
    if (sharedPeople.some(p => p.email === emailLower)) return Alert.alert("Error", "This person is already added");
    
    setSharedPeople([...sharedPeople, { email: emailLower, rights: 'view' }]);
    setShareEmail('');
  };

  const removePerson = (email: string) => {
    setSharedPeople(sharedPeople.filter(p => p.email !== email));
  };

  const updateRights = (email: string, rights: string) => {
    setSharedPeople(sharedPeople.map(p => p.email === email ? { ...p, rights } : p));
  };

  const handleSave = async () => {
    if (!name.trim()) return Alert.alert("Required", "Please enter a Workspace Name");
    if (requirePin && pin.length < 4) return Alert.alert("Required", "Please set a 4-digit security PIN");
    
    try {
      setLoading(true);
      const payload = {
        name: name.trim(),
        description: description.trim(),
        category,
        pin: requirePin ? pin : null,
        isPrivate,
      };
      
      const newCalendar = await calendarService.create(payload);
      
      // If shared, add permissions
      if (!isPrivate && sharedPeople.length > 0) {
        await Promise.all(
          sharedPeople.map(p => calendarService.share(newCalendar._id, { email: p.email, rights: p.rights }))
        );
      }

      await refreshCalendars();
      Alert.alert("Success", "Calendar Created Successfully! Thanks.", [
        { text: "OK", onPress: () => navigation.navigate('Home') }
      ]);
    } catch (error: any) {
      Alert.alert("Error", "Failed to create. Please try again! Error: " + (error.response?.data?.message || 'Server error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseLayout>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 bg-transparent"
      >
        <View className="flex-1 pt-12">
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 mb-8 mt-4">
            <Pressable onPress={() => navigation.goBack()} className="py-2">
              <Text className="text-[#6B4EFF] font-interExtraBold text-[14px]">Cancel</Text>
            </Pressable>
            <Text className="text-[16px] font-interExtraBold text-slate-800 dark:text-white">
              New Workspace
            </Text>
            <Pressable onPress={handleSave} disabled={loading} className="py-2">
              {loading ? (
                <ActivityIndicator size="small" color="#6B4EFF" />
              ) : (
                <Text className="text-[#6B4EFF] font-interExtraBold text-[14px]">Create</Text>
              )}
            </Pressable>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={{ paddingBottom: 150 }}
            keyboardShouldPersistTaps="handled"
          >
            
            <View className="px-6 mb-8 mt-2 items-center">
              <View className="w-20 h-20 bg-[#6B4EFF]/10 rounded-[30px] items-center justify-center mb-4">
                 <Users color="#6B4EFF" size={32} />
              </View>
              <Text className="text-[24px] font-interExtraBold text-slate-900 dark:text-white mb-2 text-center">Setup Your Ledger</Text>
              <Text className="text-[13px] font-interMedium text-slate-500 dark:text-slate-400 text-center px-4 leading-5">Personal tracking or team collaboration - you choose.</Text>
            </View>

            <View className="bg-white dark:bg-slate-800/80 rounded-[40px] mx-6 p-6 shadow-sm border border-slate-100 dark:border-slate-800 gap-y-6">
              
              {/* Calendar Name */}
              <View>
                <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Workspace Name</Text>
                <TextInput 
                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[15px]" 
                  placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
                  placeholder="e.g., Room Rent Ledger" 
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Category Selector */}
              <View>
                <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Selection Category</Text>
                <View className="flex-row flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <Pressable 
                        key={cat} 
                        onPress={() => setCategory(cat)}
                        className={`px-4 py-2.5 rounded-xl border ${category === cat ? 'bg-[#6B4EFF] border-[#6B4EFF]' : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
                      >
                        <Text className={`text-[12px] font-interExtraBold ${category === cat ? 'text-white' : 'text-slate-500'}`}>{cat}</Text>
                      </Pressable>
                    ))}
                </View>
              </View>

              {/* Privacy Toggle */}
              <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-[#6B4EFF]/10 items-center justify-center mr-4">
                    {isPrivate ? <ShieldCheck color="#6B4EFF" size={20} /> : <Users color="#6B4EFF" size={20} />}
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-[14px] font-interExtraBold text-slate-900 dark:text-white mb-0.5">{isPrivate ? 'Personal Workspace' : 'Shared Shared Ledger'}</Text>
                    <Text className="text-[11px] font-interMedium text-slate-500 dark:text-slate-400 leading-snug">{isPrivate ? 'Only your eyes will see this data' : 'Invite people to view or edit'}</Text>
                  </View>
                </View>
                <Switch 
                  value={!isPrivate}
                  onValueChange={(val) => setIsPrivate(!val)}
                  trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: '#10B981' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {/* Sharing Section */}
              {!isPrivate && (
                <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} className="gap-y-4">
                  <View className="flex-row gap-x-2">
                    <TextInput 
                      className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[14px]" 
                      placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
                      placeholder="Add person by email..." 
                      value={shareEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={setShareEmail}
                    />
                    <Pressable onPress={handleAddPerson} className="w-14 h-14 bg-[#6B4EFF] rounded-2xl items-center justify-center shadow-md">
                       <UserPlus color="white" size={20} />
                    </Pressable>
                  </View>

                  {sharedPeople.length > 0 && (
                    <View className="gap-y-3">
                      <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest pl-2">Added Members ({sharedPeople.length})</Text>
                      {sharedPeople.map((person) => (
                    <View key={person.email} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <View className="flex-row items-center justify-between">
                          <Text className="text-slate-800 dark:text-white font-interExtraBold text-[13px] flex-1 mr-3" numberOfLines={1}>{person.email}</Text>
                          <Pressable onPress={() => removePerson(person.email)} className="bg-red-50 dark:bg-red-900/20 w-8 h-8 rounded-full items-center justify-center">
                            <X color="#EF4444" size={14} />
                          </Pressable>
                        </View>
                        <View className="flex-row gap-x-2 mt-3">
                            {['view', 'edit', 'all'].map(r => (
                              <Pressable key={r} onPress={() => updateRights(person.email, r)} className={`px-3 py-1.5 rounded-xl border ${person.rights === r ? 'bg-[#6B4EFF] border-[#6B4EFF]' : 'border-slate-200 dark:border-slate-700'}`}>
                                  <Text className={`text-[9px] font-interExtraBold uppercase tracking-tighter ${person.rights === r ? 'text-white' : 'text-slate-400'}`}>{r}</Text>
                              </Pressable>
                            ))}
                        </View>
                    </View>
                      ))}
                    </View>
                  )}
                </Animated.View>
              )}

              {/* Description */}
              <View>
                <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest mb-3 pl-2">Workspace Description</Text>
                <TextInput 
                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-5 rounded-2xl text-black dark:text-white font-interMedium text-[14px]" 
                  placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
                  placeholder="Notes about this ledger..." 
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>

              {/* Require PIN Toggle */}
              <View className="flex-row items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                <View className="flex-row items-center flex-1">
                  <View className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 items-center justify-center mr-4">
                    <Lock color="#6B4EFF" size={18} />
                  </View>
                  <View className="flex-1 pr-4">
                    <Text className="text-[14px] font-interExtraBold text-slate-900 dark:text-white mb-0.5">PIN Protection</Text>
                    <Text className="text-[11px] font-interMedium text-slate-500 dark:text-slate-400 leading-snug">Require a code to open this ledger</Text>
                  </View>
                </View>
                <Switch 
                  value={requirePin}
                  onValueChange={setRequirePin}
                  trackColor={{ false: isDark ? '#334155' : '#E2E8F0', true: '#6B4EFF' }}
                  thumbColor="#FFFFFF"
                />
              </View>

              {requirePin && (
                <Animated.View entering={SlideInDown.duration(300)} className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-[28px] border border-slate-100 dark:border-slate-800">
                   <View className="flex-row items-center mb-4">
                      <KeyRound color="#6B4EFF" size={16} className="mr-2" />
                      <Text className="text-[12px] font-interExtraBold text-slate-800 dark:text-white">Setup 4-Digit PIN</Text>
                   </View>
                   <TextInput 
                      className="bg-white dark:bg-slate-800 py-4 px-6 rounded-2xl text-[24px] font-interExtraBold text-center text-[#6B4EFF] tracking-[10px]"
                      placeholder="0000"
                      placeholderTextColor={isDark ? '#1E293B' : '#E2E8F0'}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                      value={pin}
                      onChangeText={setPin}
                   />
                   <Text className="text-[10px] font-interMedium text-slate-400 text-center mt-3 lowercase italic">Share this PIN with other members if shared</Text>
                </Animated.View>
              )}

            </View>

            <View className="px-6 mt-8">
              <Pressable onPress={handleSave} disabled={loading} className="bg-[#6B4EFF] py-[22px] rounded-3xl items-center flex-row justify-center shadow-xl shadow-indigo-500/30 mb-6">
                <Text className="text-white font-interExtraBold text-[16px] mr-2">Create Calendar</Text>
                <ArrowRight color="white" size={20} />
              </Pressable>
            </View>

          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </BaseLayout>
  );
};
