import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { Card } from '../components/Card';
import { ChevronRight, ChevronLeft, FileText, Wallet, ArrowDownLeft, ArrowUpRight, PiggyBank, Receipt, ShoppingCart, Car, Home as HomeIcon, Pizza } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { BaseLayout } from '../components/BaseLayout';
import * as Haptics from 'expo-haptics';
import { useForm } from '../context/FormContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Home = () => {
  const { isDark } = useTheme();
  const { openForm } = useForm();
  const navigation = useNavigation<NavigationProp<any>>();
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());

  const handleDatePress = (date: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDate(date);
    openForm();
  };

  const renderMetricCard = (title: string, amount: string, icon: React.ReactNode, colorClass: string) => (
    <View className="w-[49%] mb-2">
      <Card style={{ marginHorizontal: 0 }}>
        <View className="flex-row items-center justify-between mb-2">
          {icon}
        </View>
        <Text className="text-[12px] font-interLight text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </Text>
        <Text className={`text-[24px] font-interExtraBold ${colorClass} mt-1`} numberOfLines={1} adjustsFontSizeToFit>
          {amount}
        </Text>
      </Card>
    </View>
  );

  const renderCategoryRow = (name: string, icon: React.ReactNode, progress: number, color: string) => (
    <View className="flex-row items-center mb-4">
      <View className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl mr-4">
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between mb-2">
          <Text className="text-[16px] font-interMedium text-black dark:text-white">{name}</Text>
          <Text className="text-[14px] font-interExtraBold text-slate-600 dark:text-slate-300">{progress}%</Text>
        </View>
        <View className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <View className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );

  return (
    <BaseLayout>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Header & Month Navigation */}
        <View className="px-4 py-2 mt-4">
          <Text className="text-[34px] font-interExtraBold text-black dark:text-white mb-4">
            Personal Expenses
          </Text>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center bg-black/5 dark:bg-white/5 rounded-full px-4 py-2">
              <Pressable className="p-1"><ChevronLeft color={isDark ? '#CBD5E1' : '#475569'} size={20} /></Pressable>
              <Text className="text-[18px] font-interExtraBold text-[#3079E6] mx-4 uppercase tracking-widest">October</Text>
              <Pressable className="p-1"><ChevronRight color={isDark ? '#CBD5E1' : '#475569'} size={20} /></Pressable>
            </View>
            <Pressable onPress={() => navigation.navigate('Reports' as never)} className="p-3 bg-actionBlue/10 rounded-full">
              <FileText color="#3079E6" size={24} />
            </Pressable>
          </View>
        </View>

        {/* Horizontal Calendar */}
        <View className="my-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {[...Array(14)].map((_, i) => {
              const date = i + 10;
              const isSelected = date === selectedDate;
              return (
                <Pressable
                  key={i}
                  onPress={() => handleDatePress(date)}
                  className={`items-center justify-center p-4 rounded-2xl mr-3 border ${
                    isSelected 
                      ? 'bg-[#3079E6] border-[#3079E6] shadow-lg shadow-actionBlue/50' 
                      : 'bg-white/40 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50'
                  }`}
                  style={{ width: 65 }}
                >
                  <Text className={`text-[12px] font-interMedium uppercase ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i % 7]}
                  </Text>
                  <Text className={`text-[24px] font-interExtraBold mt-1 ${isSelected ? 'text-white' : 'text-black dark:text-white'}`}>
                    {date}
                  </Text>
                  {isSelected && (
                    <View className="absolute -bottom-1 w-8 h-1 bg-white rounded-full opacity-50" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Dashboard Grid (Edge-to-Edge concept: px-4 with tightly packed cards) */}
        <View className="flex-row flex-wrap justify-between px-4 mb-6">
          {renderMetricCard('Month Total', '$3,450.00', <Wallet color="#3079E6" size={20} />, 'text-black dark:text-white')}
          {renderMetricCard('Today', '$124.50', <Receipt color="#F59E0B" size={20} />, 'text-black dark:text-white')}
          {renderMetricCard('Budget', '$4,000.00', <PiggyBank color="#10B981" size={20} />, 'text-black dark:text-white')}
          {renderMetricCard('Remaining', '$550.00', <Wallet color="#10B981" size={20} />, 'text-[#10B981]')}
          {renderMetricCard('Borrowed', '$200.00', <ArrowDownLeft color="#EF4444" size={20} />, 'text-[#EF4444]')}
          {renderMetricCard('To Receive', '$150.00', <ArrowUpRight color="#10B981" size={20} />, 'text-[#10B981]')}
        </View>

        {/* Category Breakdown Table */}
        <View className="px-4">
          <Card style={{ marginHorizontal: 0 }}>
            <Text className="text-[18px] font-interExtraBold text-black dark:text-white mb-6">
              Spending Summary
            </Text>
            {renderCategoryRow('Grocery', <ShoppingCart color="#10B981" size={24} />, 65, '#10B981')}
            {renderCategoryRow('Food & Dining', <Pizza color="#F59E0B" size={24} />, 40, '#F59E0B')}
            {renderCategoryRow('Transport', <Car color="#3079E6" size={24} />, 25, '#3079E6')}
            {renderCategoryRow('Rent & Utilities', <HomeIcon color="#8B5CF6" size={24} />, 85, '#8B5CF6')}
          </Card>
        </View>

      </ScrollView>
    </BaseLayout>
  );
};
