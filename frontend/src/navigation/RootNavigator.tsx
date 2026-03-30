import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DrawerNavigator } from './DrawerNavigator';
import { MonthlyReport } from '../screens/MonthlyReport';
import { ManageCalendars } from '../screens/ManageCalendars';
import { CreateCalendar } from '../screens/CreateCalendar';
import { UnlockCalendar } from '../screens/UnlockCalendar';
import { RecoverPin } from '../screens/RecoverPin';
import { DailyExpensesDetail } from '../screens/DailyExpensesDetail';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
      <Stack.Screen name="MonthlyReport" component={MonthlyReport} />
      <Stack.Screen name="ManageCalendars" component={ManageCalendars} />
      <Stack.Screen name="CreateCalendar" component={CreateCalendar} options={{ presentation: 'modal' }} />
      <Stack.Screen name="UnlockCalendar" component={UnlockCalendar} options={{ presentation: 'fullScreenModal', animation: 'fade' }} />
      <Stack.Screen name="RecoverPin" component={RecoverPin} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="DailyExpensesDetail" component={DailyExpensesDetail} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
};
