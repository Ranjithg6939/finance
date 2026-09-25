import api from './api';

export const paymentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/payments', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/payments', data);
    return res.data;
  },
  getReceipt: async (id) => {
    const res = await api.get(`/payments/${id}/receipt`);
    return res.data;
  },
  getByLoan: async (loanId) => {
    const res = await api.get(`/payments/loan/${loanId}`);
    return res.data;
  },
  getByCustomer: async (customerId) => {
    const res = await api.get(`/payments/customer/${customerId}`);
    return res.data;
  },
};
