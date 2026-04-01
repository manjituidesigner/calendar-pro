import React from 'react';
import { View, Text, ScrollView, Pressable, Switch } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { BaseLayout } from '../components/BaseLayout';
import { ChevronRight, Bell, Shield, Wallet, Smartphone, LogOut, Moon, Sun, Info, CircleHelp } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const settingsOptions = [
    { 
      title: 'General', 
      items: [
        { id: '1', label: 'Notifications', icon: <Bell color="#F59E0B" size={20} />, right: <Switch value={true} trackColor={{ false: '#767577', true: '#F59E0B' }} thumbColor="#f4f3f4" /> },
        { id: '2', label: 'Privacy & Security', icon: <Shield color="#10B981" size={20} />, right: <ChevronRight color="#94A3B8" size={20} /> },
        { id: '3', label: 'Dark Mode', icon: isDark ? <Moon color="#6B4EFF" size={20} /> : <Sun color="#F59E0B" size={20} />, right: <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#767577', true: '#6B4EFF' }} thumbColor="#f4f3f4" /> },
      ]
    },
    { 
      title: 'Financial', 
      items: [
        { id: '4', label: 'Budget Limits', icon: <Wallet color="#6B4EFF" size={20} />, right: <ChevronRight color="#94A3B8" size={20} /> },
        { id: '5', label: 'Backup & Sync', icon: <Smartphone color="#3B82F6" size={20} />, right: <Text className="text-slate-400 font-interMedium text-[12px]">Cloud Enabled</Text> },
      ]
    },
    { 
      title: 'Support', 
      items: [
        { id: '6', label: 'Help Center', icon: <CircleHelp color="#64748B" size={20} />, right: <ChevronRight color="#94A3B8" size={20} /> },
        { id: '7', label: 'About Ledger Pulse', icon: <Info color="#64748B" size={20} />, right: <ChevronRight color="#94A3B8" size={20} /> },
      ]
    }
  ];

  return (
    <BaseLayout>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120, paddingTop: 60 }}>
        
        {/* User Profile Summary */}
        <Animated.View entering={FadeInDown.delay(100).springify()} className="mb-10 items-center">
          <View className="w-24 h-24 rounded-full bg-[#6B4EFF]/10 items-center justify-center border-4 border-white dark:border-slate-800 shadow-xl shadow-indigo-500/20 mb-4 relative">
             <Text className="text-[#6B4EFF] font-interExtraBold text-[32px]">{user?.username?.[0]?.toUpperCase() || 'U'}</Text>
             <View className="absolute bottom-0 right-0 w-6 h-6 bg-[#10B981] rounded-full border-4 border-white dark:border-slate-800" />
          </View>
          <Text className="text-[24px] font-interExtraBold text-slate-900 dark:text-white">{user?.username || 'Username'}</Text>
          <Text className="text-[12px] font-interMedium text-slate-400 mt-1 uppercase tracking-widest">{user?.email || 'user@example.com'}</Text>
          <View className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-1.5 rounded-full mt-4">
             <Text className="text-[10px] font-interExtraBold text-[#6B4EFF] uppercase tracking-widest">Premium Member</Text>
          </View>
        </Animated.View>

        {/* Options List */}
        {settingsOptions.map((section, sIdx) => (
          <Animated.View key={section.title} entering={FadeInDown.delay(200 + sIdx * 100).springify()} className="mb-10">
            <Text className="text-[10px] font-interExtraBold text-slate-400 dark:text-slate-500 uppercase tracking-[3px] mb-6 ml-4">
              {section.title}
            </Text>
            
            <View className="bg-white dark:bg-slate-800/80 rounded-[32px] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
              {section.items.map((item, iIdx) => (
                <Pressable 
                  key={item.id}
                  className={`flex-row items-center justify-between p-5 ${iIdx < section.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-700/50' : ''}`}
                >
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900/50 items-center justify-center mr-4">
                      {item.icon}
                    </View>
                    <Text className="text-[15px] font-interExtraBold text-slate-800 dark:text-white">{item.label}</Text>
                  </View>
                  <View>{item.right}</View>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* Logout Section */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="mt-4 gap-y-4">
          <Pressable 
            onPress={() => logout()}
            className="bg-red-50 dark:bg-red-900/20 py-5 rounded-[24px] border border-red-100 dark:border-red-900/50 items-center flex-row justify-center shadow-lg shadow-red-500/10"
          >
            <LogOut color="#EF4444" size={20} />
            <Text className="text-[#EF4444] font-interExtraBold text-[16px] ml-3">Sign Out Account</Text>
          </Pressable>
          
          <View className="items-center mt-4">
            <Text className="text-slate-400 font-interMedium text-[10px] uppercase tracking-widest">Version 1.10.2 (Build 42)</Text>
            <Text className="text-slate-400/50 font-interMedium text-[10px] mt-1">© 2026 Ledger Pulse Financial</Text>
          </View>
        </Animated.View>

      </ScrollView>
    </BaseLayout>
  );
};
