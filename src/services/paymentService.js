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

export const paymentService = {
  getAll: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getPayments(params);
    }
    try {
      const res = await api.get('/payments', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getPayments(params);
    }
  },

  getById: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getPaymentReceipt(id);
    }
    try {
      const res = await api.get(`/payments/${id}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getPaymentReceipt(id);
    }
  },

  create: async (data) => {
    const localRes = localStorageDb.createPayment(data);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.post('/payments', data);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localRes;
    }
  },

  getReceipt: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getPaymentReceipt(id);
    }
    try {
      const res = await api.get(`/payments/${id}/receipt`);
      return res.data;
    } catch (err) {
      return localStorageDb.getPaymentReceipt(id);
    }
  },

  getByLoan: async (loanId) => {
    if (isLocalMode()) {
      return localStorageDb.getPayments({ loanId });
    }
    try {
      const res = await api.get(`/payments/loan/${loanId}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getPayments({ loanId });
    }
  },

  getByCustomer: async (customerId) => {
    if (isLocalMode()) {
      return localStorageDb.getPayments({ customerId });
    }
    try {
      const res = await api.get(`/payments/customer/${customerId}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getPayments({ customerId });
    }
  },
};
