import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from '../screens/Home';
import { Reports } from '../screens/Reports';
import { Peoples } from '../screens/Peoples';
import { Settings } from '../screens/Settings';
import { CentralPulseFAB } from '../components/CentralPulseFAB';
import { TransactionForm } from '../components/TransactionForm';
import { useForm } from '../context/FormContext';
import { Calendar, FileText, Users, Settings as SettingsIcon } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';

const Tab = createBottomTabNavigator();

const EmptyScreen = () => <View />;

export const BottomTabNavigator = () => {
  const { isDark } = useTheme();
  const { isFormVisible, openForm, closeForm } = useForm();

  return (
    <>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          backgroundColor: 'transparent',
          height: 90,
        },
        tabBarBackground: () => (
          <BlurView
            intensity={isDark ? 50 : 80}
            tint={isDark ? 'dark' : 'light'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderTopWidth: 1,
              borderTopColor: isDark ? 'rgba(48, 121, 230, 0.3)' : 'rgba(255, 255, 255, 0.5)',
            }}
          />
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#3079E6',
        tabBarInactiveTintColor: isDark ? '#94A3B8' : '#64748B',
      }}
    >
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={Reports}
        options={{
          tabBarIcon: ({ color }) => <FileText color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        options={{
          tabBarButton: (props) => (
            <CentralPulseFAB onPress={openForm} />
          ),
        }}
      />
      <Tab.Screen
        name="Peoples"
        component={Peoples}
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarIcon: ({ color }) => <SettingsIcon color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
      <TransactionForm visible={isFormVisible} onClose={closeForm} />
    </>
  );
};
