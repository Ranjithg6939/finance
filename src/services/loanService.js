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

  changeStatus: async (id, status) => {
    if (isLocalMode()) {
      return localStorageDb.changeLoanStatus(id, status);
    }
    try {
      const res = await api.patch(`/loans/${id}/status`, { status });
      return res.data;
    } catch (err) {
      return localStorageDb.changeLoanStatus(id, status);
    }
  },

  assignStaff: async (id, staffId) => {
    if (isLocalMode()) {
      return localStorageDb.assignLoanStaff(id, staffId);
    }
    try {
      const res = await api.patch(`/loans/${id}/assign`, { staffId });
      return res.data;
    } catch (err) {
      return localStorageDb.assignLoanStaff(id, staffId);
    }
  },

  assignRecoveryStaff: async (id, recoveryStaffId) => {
    if (isLocalMode()) {
      return localStorageDb.assignRecoveryStaff(id, recoveryStaffId);
    }
    try {
      const res = await api.patch(`/loans/${id}/assign-recovery`, { recoveryStaffId });
      return res.data;
    } catch (err) {
      return localStorageDb.assignRecoveryStaff(id, recoveryStaffId);
    }
  },

  updateRecoveryStatus: async (id, recoveryStatus) => {
    if (isLocalMode()) {
      return localStorageDb.updateRecoveryStatus(id, recoveryStatus);
    }
    try {
      const res = await api.patch(`/loans/${id}/recovery-status`, { recoveryStatus });
      return res.data;
    } catch (err) {
      return localStorageDb.updateRecoveryStatus(id, recoveryStatus);
    }
  },

  addRecoveryNote: async (id, note) => {
    if (isLocalMode()) {
      return localStorageDb.addRecoveryNote(id, note);
    }
    try {
      const res = await api.post(`/loans/${id}/recovery-note`, { note });
      return res.data;
    } catch (err) {
      return localStorageDb.addRecoveryNote(id, note);
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
