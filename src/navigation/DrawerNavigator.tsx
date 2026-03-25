import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { BottomTabNavigator } from './BottomTabNavigator';
import { Peoples } from '../screens/Peoples';
import { View, Text, Pressable, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Calendar as CalendarIcon, Users, Bell, TrendingUp, Settings, Gift, LogOut, FileText, ChevronRight } from 'lucide-react-native';

const Drawer = createDrawerNavigator();

const CustomDrawerContent = (props: any) => {
  const { isDark } = useTheme();
  const { user, logout } = useAuth();
  
  return (
    <View style={{ flex: 1 }} className={`${isDark ? 'bg-[#0F172A]' : 'bg-[#F8FAFC]'}`}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 40 }} showsVerticalScrollIndicator={false}>
        <View className="px-6 mb-6 mt-4">
          <View className="flex-row items-center mb-6">
            <View className="w-14 h-14 rounded-full bg-orange-100 items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm relative">
              <Text className="text-orange-600 font-interExtraBold text-lg">{user?.username?.[0]?.toUpperCase() || 'A'}</Text>
              <View className="absolute bottom-0 right-0 w-4 h-4 bg-[#10B981] rounded-full border-2 border-white dark:border-slate-800" />
            </View>
            <View className="ml-4">
              <Text className="text-black dark:text-white font-interExtraBold text-[18px]">
                {user?.username || 'Alex Johnson'}
              </Text>
              <View className="flex-row items-center mt-1">
                <View className="w-3 h-3 rounded-full bg-[#3079E6] items-center justify-center mr-1">
                  <Text className="text-white text-[8px] font-interExtraBold">✓</Text>
                </View>
                <Text className="text-[#3079E6] font-interExtraBold tracking-wider text-[10px] uppercase">
                  Pro Member
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <View className="flex-1 items-center border-r border-slate-100 dark:border-slate-700">
              <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-1">Total Credit</Text>
              <Text className="text-[#3079E6] font-interExtraBold text-[16px]">$2,450.00</Text>
            </View>
            <View className="flex-1 items-center">
              <Text className="text-[10px] font-interExtraBold text-slate-500 uppercase tracking-widest mb-1">To Pay</Text>
              <Text className="text-[#EF4444] font-interExtraBold text-[16px]">$120.50</Text>
            </View>
          </View>
        </View>

        <View className="px-6 mb-2">
          <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-4 ml-2">Overview</Text>
          <View className="flex-row gap-x-4 mb-4">
            <Pressable onPress={() => props.navigation.navigate('CalendarTab')} className="flex-1 bg-white dark:bg-[#1E293B] p-4 rounded-2xl items-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 items-center justify-center mb-3">
                <CalendarIcon color="#8B5CF6" size={20} />
              </View>
              <Text className="text-black dark:text-white font-interExtraBold text-[20px] mb-1">3</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[12px] font-interMedium">Calendars</Text>
            </Pressable>
            <Pressable onPress={() => props.navigation.navigate('PeoplesDrawer')} className="flex-1 bg-white dark:bg-[#1E293B] p-4 rounded-2xl items-center border border-slate-100 dark:border-slate-800 shadow-sm">
              <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center mb-3">
                <Users color="#3079E6" size={20} />
              </View>
              <Text className="text-black dark:text-white font-interExtraBold text-[20px] mb-1">12</Text>
              <Text className="text-slate-500 dark:text-slate-400 text-[12px] font-interMedium">People</Text>
            </Pressable>
          </View>
          
          <View className="bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center mr-3 border border-red-100 dark:border-red-900/50">
                <Bell color="#EF4444" size={18} />
              </View>
              <View>
                <Text className="text-black dark:text-white font-interExtraBold text-[16px] mb-0.5">5 Active</Text>
                <Text className="text-slate-500 dark:text-slate-400 text-[11px] font-interMedium">Reminders pending</Text>
              </View>
            </View>
            <ChevronRight color={isDark ? '#475569' : '#CBD5E1'} size={20} />
          </View>

          <Text className="text-[10px] font-interExtraBold text-slate-400 uppercase tracking-widest mb-4 ml-2">Management</Text>
          <View className="gap-y-6 px-2">
            <Pressable className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Bell color={isDark ? '#E2E8F0' : '#334155'} size={20} />
                <Text className="ml-4 text-slate-800 dark:text-slate-200 font-interExtraBold text-[15px]">Reminders</Text>
              </View>
              <ChevronRight color={isDark ? '#475569' : '#CBD5E1'} size={18} />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <FileText color={isDark ? '#E2E8F0' : '#334155'} size={20} />
                <Text className="ml-4 text-slate-800 dark:text-slate-200 font-interExtraBold text-[15px]">Monthly Reports</Text>
              </View>
              <ChevronRight color={isDark ? '#475569' : '#CBD5E1'} size={18} />
            </Pressable>
            
            <Pressable className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Gift color={isDark ? '#E2E8F0' : '#334155'} size={20} />
                <Text className="ml-4 text-slate-800 dark:text-slate-200 font-interExtraBold text-[15px]">Referral Network</Text>
              </View>
              <ChevronRight color={isDark ? '#475569' : '#CBD5E1'} size={18} />
            </Pressable>
          </View>
        </View>
      </DrawerContentScrollView>

      <View className="p-6 border-t border-slate-200 dark:border-slate-800 flex-row items-center justify-between bg-white dark:bg-[#0F172A]">
        <Pressable onPress={() => logout()} className="bg-red-50 dark:bg-red-900/20 py-3 px-5 rounded-xl border border-red-100 dark:border-red-900/50 flex-row items-center shadow-sm shadow-red-500/10">
          <LogOut color="#EF4444" size={18} />
          <Text className="text-[#EF4444] font-interExtraBold ml-2 text-[14px]">Sign Out</Text>
        </Pressable>
        <Text className="text-slate-400 font-interMedium text-[11px]">v1.10.2</Text>
      </View>
    </View>
  );
};

export const DrawerNavigator = () => {
  const { isDark } = useTheme();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: isDark ? '#0F172A' : '#F3E8FF',
          width: 280,
        },
        drawerActiveBackgroundColor: isDark ? 'rgba(48, 121, 230, 0.2)' : 'rgba(48, 121, 230, 0.1)',
        drawerActiveTintColor: '#3079E6',
        drawerInactiveTintColor: isDark ? '#CBD5E1' : '#475569',
        drawerLabelStyle: {
          fontFamily: 'InterMedium',
          fontSize: 16,
        }
      }}
    >
      <Drawer.Screen 
        name="CalendarTab" 
        component={BottomTabNavigator} 
        options={{
          title: 'Calendar',
          drawerIcon: ({ color }) => <CalendarIcon color={color} size={24} />
        }}
      />
      <Drawer.Screen 
        name="PeoplesDrawer" 
        component={Peoples} 
        options={{
          title: 'Peoples',
          drawerIcon: ({ color }) => <Users color={color} size={24} />
        }}
      />
    </Drawer.Navigator>
  );
};
