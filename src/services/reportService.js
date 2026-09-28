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

export const dashboardService = {
  getSummary: async () => {
    if (isLocalMode()) {
      return localStorageDb.getDashboardSummary();
    }
    try {
      const res = await api.get('/dashboard/summary');
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getDashboardSummary();
    }
  },

  getMonthlyCollections: async () => {
    if (isLocalMode()) {
      return localStorageDb.getMonthlyCollections();
    }
    try {
      const res = await api.get('/dashboard/monthly-collections');
      return res.data;
    } catch (err) {
      return localStorageDb.getMonthlyCollections();
    }
  },

  getUpcomingPayments: async () => {
    if (isLocalMode()) {
      return localStorageDb.getUpcomingPayments();
    }
    try {
      const res = await api.get('/dashboard/upcoming-payments');
      return res.data;
    } catch (err) {
      return localStorageDb.getUpcomingPayments();
    }
  },
};

export const reportService = {
  getLoans: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getLoansReport(params);
    }
    try {
      const res = await api.get('/reports/loans', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getLoansReport(params);
    }
  },

  getPayments: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getPaymentsReport(params);
    }
    try {
      const res = await api.get('/reports/payments', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getPaymentsReport(params);
    }
  },

  getInterest: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getInterestReport(params);
    }
    try {
      const res = await api.get('/reports/interest', { params });
      return res.data;
    } catch (err) {
      return localStorageDb.getInterestReport(params);
    }
  },

  getCustomers: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getCustomersReport();
    }
    try {
      const res = await api.get('/reports/customers', { params });
      return res.data;
    } catch (err) {
      return localStorageDb.getCustomersReport();
    }
  },
};
