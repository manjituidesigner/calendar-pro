import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../context/AuthContext'; // API_URL = 'http://localhost:5000/api'

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
  getMonthlyExpenses: async (month: string) => {
    const response = await api.get(`/expenses/monthly?month=${month}`);
    return response.data;
  },
  getDailyExpenses: async (date: string) => {
    const response = await api.get(`/expenses/daily?date=${date}`);
    return response.data;
  },
  updateExpense: async (id: string, data: any) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id: string) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  }
};

export default api;
