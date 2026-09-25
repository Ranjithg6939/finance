import api from './api';

export const customerService = {
  getAll: async (params = {}) => {
    const res = await api.get('/customers', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/customers', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/customers/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  },
  getLoans: async (id) => {
    const res = await api.get(`/customers/${id}/loans`);
    return res.data;
  },
  getPayments: async (id) => {
    const res = await api.get(`/customers/${id}/payments`);
    return res.data;
  },
  getDocuments: async (id) => {
    const res = await api.get(`/customers/${id}/documents`);
    return res.data;
  },
};
