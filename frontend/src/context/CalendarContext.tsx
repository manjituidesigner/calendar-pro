import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calendarService } from '../services/api';

interface Calendar {
  _id: string;
  name: string;
  category: string;
  isPrivate: boolean;
  owner: any;
  permissions: any[];
}

interface CalendarContextType {
  calendars: Calendar[];
  activeCalendar: Calendar | null;
  loading: boolean;
  setActiveCalendarById: (id: string) => Promise<void>;
  refreshCalendars: () => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [activeCalendar, setActiveCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCalendars = async () => {
    try {
      setLoading(true);
      const data = await calendarService.list();
      setCalendars(data);
      
      // Try to restore active calendar from storage or pick first one
      const savedId = await AsyncStorage.getItem('activeCalendarId');
      if (savedId) {
        const found = data.find((c: any) => c._id === savedId);
        if (found) {
          setActiveCalendar(found);
        } else if (data.length > 0) {
          setActiveCalendar(data[0]);
          await AsyncStorage.setItem('activeCalendarId', data[0]._id);
        }
      } else if (data.length > 0) {
        setActiveCalendar(data[0]);
        await AsyncStorage.setItem('activeCalendarId', data[0]._id);
      }
    } catch (error) {
      console.log('Failed to fetch calendars', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveCalendarById = async (id: string) => {
    const found = calendars.find(c => c._id === id);
    if (found) {
      setActiveCalendar(found);
      await AsyncStorage.setItem('activeCalendarId', id);
    }
  };

  useEffect(() => {
    refreshCalendars();
  }, []);

  return (
    <CalendarContext.Provider value={{ calendars, activeCalendar, loading, setActiveCalendarById, refreshCalendars }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
