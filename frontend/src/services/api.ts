import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_URL } from '../context/AuthContext';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  async (config) => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const expenseService = {
  addExpense: async (data: any) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  getMonthlyExpenses: async (month: string, calendarId: string) => {
    const response = await api.get(`/expenses/monthly?month=${month}&calendarId=${calendarId}`);
    return response.data;
  },
  getDailyExpenses: async (date: string, calendarId: string) => {
    const response = await api.get(`/expenses/daily?date=${date}&calendarId=${calendarId}`);
    return response.data;
  },
  updateExpense: async (id: string, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
  getPeoples: async (calendarId: string) => {
    const response = await api.get(`/expenses/peoples?calendarId=${calendarId}`);
    return response.data;
  },
  getSummary: async (calendarId: string) => {
    const response = await api.get(`/expenses/summary?calendarId=${calendarId}`);
    return response.data;
  }
};

export const calendarService = {
  create: async (data: any) => {
    const response = await api.post('/calendars', data);
    return response.data;
  },
  list: async () => {
    const response = await api.get('/calendars');
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.put(`/calendars/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/calendars/${id}`);
    return response.data;
  },
  share: async (id: string, data: { email: string, rights: string }) => {
    const response = await api.post(`/calendars/${id}/share`, data);
    return response.data;
  }
};

export default api;
