import api from './api';
import { localStorageDb } from './localStorageDb';

const isLocalMode = () => {
  if (typeof window === 'undefined') return true;
  const token = localStorage.getItem('token');
  if (token && token.startsWith('demo-jwt-')) return true;
  return false;
};

export const staffService = {
  // GET /api/staff
  getAll: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getStaff(params);
    }
    try {
      const res = await api.get('/staff', { params });
      return res.data;
    } catch (err) {
      return localStorageDb.getStaff(params);
    }
  },

  // GET /api/staff/:id
  getById: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.getStaffById(id);
    }
    try {
      const res = await api.get(`/staff/${id}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getStaffById(id);
    }
  },

  // POST /api/staff
  create: async (data) => {
    if (isLocalMode()) {
      return localStorageDb.createStaff(data);
    }
    try {
      const res = await api.post('/staff', data);
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw err;
      }
      return localStorageDb.createStaff(data);
    }
  },

  // PUT /api/staff/:id
  update: async (id, data) => {
    if (isLocalMode()) {
      return localStorageDb.updateStaff(id, data);
    }
    try {
      const res = await api.put(`/staff/${id}`, data);
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw err;
      }
      return localStorageDb.updateStaff(id, data);
    }
  },

  // PATCH /api/staff/:id/status
  toggleStatus: async (id, status) => {
    if (isLocalMode()) {
      return localStorageDb.toggleStaffStatus(id, status);
    }
    try {
      const res = await api.patch(`/staff/${id}/status`, { status });
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw err;
      }
      return localStorageDb.toggleStaffStatus(id, status);
    }
  },

  // POST /api/staff/:id/reset-password
  resetPassword: async (id, newPassword) => {
    if (isLocalMode()) {
      return localStorageDb.resetStaffPassword(id, newPassword);
    }
    try {
      const res = await api.post(`/staff/${id}/reset-password`, { newPassword });
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw err;
      }
      return localStorageDb.resetStaffPassword(id, newPassword);
    }
  },

  // DELETE /api/staff/:id
  delete: async (id) => {
    if (isLocalMode()) {
      return localStorageDb.deleteStaff(id);
    }
    try {
      const res = await api.delete(`/staff/${id}`);
      return res.data;
    } catch (err) {
      if (err.response && err.response.data?.message) {
        throw err;
      }
      return localStorageDb.deleteStaff(id);
    }
  },

  // GET /api/activity-logs
  getActivityLogs: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getActivityLogs(params);
    }
    try {
      const res = await api.get('/activity-logs', { params });
      return res.data;
    } catch (err) {
      return localStorageDb.getActivityLogs(params);
    }
  },
};
