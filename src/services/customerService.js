import api from './api';
import { localStorageDb } from './localStorageDb';

// Check if we are running in standalone / offline localStorage mode
const isLocalMode = () => {
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo-jwt-')) return true;
  if (!import.meta.env.VITE_API_URL && window.location.hostname === 'localhost') {
    // If backend server is not explicitly running, default to reliable localStorage mode
    return window.__FINVEDA_OFFLINE__ !== false;
  }
  return false;
};

export const customerService = {
  getAll: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getCustomers(params);
    }
    try {
      const res = await api.get('/customers', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getCustomers(params);
    }
  },

  getById: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getCustomerById(id);
    }
    try {
      const res = await api.get(`/customers/${id}`);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getCustomerById(id);
    }
  },

  create: async (data) => {
    // Save to localStorage
    const localRes = localStorageDb.createCustomer(data);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.post('/customers', data);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      // Already saved to localStorage!
      return localRes;
    }
  },

  update: async (id, data) => {
    const localRes = localStorageDb.updateCustomer(id, data);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.put(`/customers/${id}`, data);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localRes;
    }
  },

  delete: async (id) => {
    const localRes = localStorageDb.deleteCustomer(id);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.delete(`/customers/${id}`);
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localRes;
    }
  },

  getLoans: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getLoans({ customerId: id });
    }
    try {
      const res = await api.get(`/customers/${id}/loans`);
      return res.data;
    } catch (err) {
      return localStorageDb.getLoans({ customerId: id });
    }
  },

  getPayments: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getPayments({ customerId: id });
    }
    try {
      const res = await api.get(`/customers/${id}/payments`);
      return res.data;
    } catch (err) {
      return localStorageDb.getPayments({ customerId: id });
    }
  },

  getDocuments: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getDocuments({ customerId: id });
    }
    try {
      const res = await api.get(`/customers/${id}/documents`);
      return res.data;
    } catch (err) {
      return localStorageDb.getDocuments({ customerId: id });
    }
  },
};
