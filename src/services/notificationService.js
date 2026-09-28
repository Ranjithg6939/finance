import api from './api';
import { localStorageDb } from './localStorageDb';

const isLocalMode = () => {
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo-jwt-')) return true;
  if (!import.meta.env.VITE_API_URL && window.location.hostname === 'localhost') {
    return window.__FINVEDA_OFFLINE__ !== false;
  }
  return false;
};

export const notificationService = {
  getAll: async () => {
    if (isLocalMode()) {
      return localStorageDb.getNotifications();
    }
    try {
      const res = await api.get('/notifications');
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getNotifications();
    }
  },

  markAsRead: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.markNotificationAsRead(id);
    }
    try {
      const res = await api.put(`/notifications/${id}/read`);
      return res.data;
    } catch (err) {
      return localStorageDb.markNotificationAsRead(id);
    }
  },

  markAllAsRead: async () => {
    if (isLocalMode()) {
      return localStorageDb.markAllNotificationsAsRead();
    }
    try {
      const res = await api.put('/notifications/read-all');
      return res.data;
    } catch (err) {
      return localStorageDb.markAllNotificationsAsRead();
    }
  },
};
