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

export const loanService = {
  calculate: async (payload) => {
    // Calculation is pure math, execute locally with instantaneous response
    return localStorageDb.calculateLoan(payload);
  },

  create: async (data) => {
    const localRes = localStorageDb.createLoan(data);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.post('/loans', data);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localRes;
    }
  },

  getAll: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getLoans(params);
    }
    try {
      const res = await api.get('/loans', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getLoans(params);
    }
  },

  getById: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getLoanById(id);
    }
    try {
      const res = await api.get(`/loans/${id}`);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getLoanById(id);
    }
  },

  update: async (id, data) => {
    if (isLocalMode()) {
      return { success: true };
    }
    try {
      const res = await api.put(`/loans/${id}`, data);
      return res.data;
    } catch (err) {
      return { success: true };
    }
  },

  delete: async (id) => {
    const localRes = localStorageDb.deleteLoan(id);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.delete(`/loans/${id}`);
      return res.data;
    } catch (err) {
      return localRes;
    }
  },

  getByCustomer: async (customerId) => {
    if (isLocalMode()) {
      return localStorageDb.getLoans({ customerId });
    }
    try {
      const res = await api.get(`/loans/customer/${customerId}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getLoans({ customerId });
    }
  },
};
