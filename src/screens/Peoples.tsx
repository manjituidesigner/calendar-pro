import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Search, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { IndividualLedger, Person } from '../components/IndividualLedger';
import { BaseLayout } from '../components/BaseLayout';

const DUMMY_PEOPLE: Person[] = [
  { id: '1', name: 'Rahul Sharma', type: 'Friends', balance: 1500, synced: true, mobile: '+91 9876543210', city: 'Mumbai' },
  { id: '2', name: 'HDFC Bank', type: 'Banks', balance: -5000, synced: false, mobile: '1800 202 6161', city: 'National' },
  { id: '3', name: 'Amit Desai', type: 'Office', balance: 350, synced: true, mobile: '+91 9123456789', city: 'Pune' },
  { id: '4', name: 'Sanjay Uncle', type: 'Relatives', balance: -1200, synced: false, mobile: '+91 9988776655', city: 'Delhi' },
  { id: '5', name: 'Priya Patel', type: 'Friends', balance: 0, synced: true, mobile: '+91 9876500000', city: 'Mumbai' },
];

const FILTERS = ['All', 'Friends', 'Office', 'Relatives', 'Banks'];

export const Peoples = () => {
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);

  const filteredPeople = DUMMY_PEOPLE.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || p.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <BaseLayout>
      {selectedPerson ? (
        <IndividualLedger person={selectedPerson} onBack={() => setSelectedPerson(null)} />
      ) : (
        <View className="flex-1 px-4 pt-4">
          <Text className="text-[34px] font-interExtraBold text-black dark:text-white mb-6">
            Peoples
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-black/5 dark:bg-white/5 p-3 rounded-2xl mb-4 border border-slate-200 dark:border-slate-800">
            <Search color={isDark ? '#94A3B8' : '#64748B'} size={20} className="ml-2" />
            <TextInput 
              className="flex-1 px-3 text-black dark:text-white font-interMedium text-[16px]" 
              placeholderTextColor={isDark ? '#475569' : '#94A3B8'} 
              placeholder="Search party by name..." 
              value={search} 
              onChangeText={setSearch} 
            />
          </View>

          {/* Filter Chips */}
          <View className="mb-6 h-[40px]">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTERS.map((f) => (
                <Pressable 
                  key={f} 
                  onPress={() => setActiveFilter(f)}
                  className={`px-6 py-2 h-full justify-center rounded-full mr-3 ${activeFilter === f ? 'bg-[#3079E6]' : 'bg-slate-200 dark:bg-slate-800'}`}
                >
                  <Text className={`font-interExtraBold text-[14px] ${activeFilter === f ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                    {f}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Peoples List */}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            {filteredPeople.map((person, index) => (
              <Animated.View key={person.id} entering={FadeInLeft.delay(index * 100).springify()}>
                <Pressable 
                  onPress={() => setSelectedPerson(person)}
                  className="flex-row items-center bg-white dark:bg-slate-900/50 p-4 rounded-3xl mb-3 shadow-sm border border-slate-100 dark:border-slate-800"
                >
                  {/* Avatar */}
                  <View className="w-14 h-14 rounded-full items-center justify-center bg-actionBlue/10 border border-actionBlue/20">
                    <Text className="text-[#3079E6] font-interExtraBold text-[20px] uppercase">
                      {person.name.substring(0, 2)}
                    </Text>
                    {person.synced && (
                      <View className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-full p-[2px]">
                        <CheckCircle2 color="#10B981" size={16} fill="#10B981" />
                      </View>
                    )}
                  </View>

                  {/* Center Info */}
                  <View className="flex-1 ml-4 justify-center">
                    <Text className="text-[18px] font-interExtraBold text-black dark:text-white" numberOfLines={1}>{person.name}</Text>
                    <Text className="text-[12px] font-interMedium text-slate-500 uppercase tracking-widest mt-1">{person.type}</Text>
                  </View>

                  {/* Right Balance */}
                  <View className="items-end justify-center">
                    <Text className={`text-[20px] font-interExtraBold tracking-wide ${person.balance >= 0 ? (person.balance === 0 ? 'text-slate-400' : 'text-[#10B981]') : 'text-[#EF4444]'}`}>
                      {person.balance > 0 ? '+' : (person.balance < 0 ? '-' : '')}₹{Math.abs(person.balance)}
                    </Text>
                    <Text className="text-[10px] font-interMedium text-slate-500 uppercase tracking-widest mt-1">
                      {person.balance > 0 ? 'Receive' : (person.balance < 0 ? 'Pay' : 'Settled')}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}
            
            {filteredPeople.length === 0 && (
              <View className="items-center mt-10">
                <Text className="font-interMedium text-slate-500">No parties found.</Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </BaseLayout>
  );
};
