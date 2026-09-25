import api from './api';

export const documentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/documents', { params });
    return res.data;
  },
  upload: async (formData) => {
    const res = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/documents/${id}`);
    return res.data;
  },
  getByCustomer: async (customerId) => {
    const res = await api.get(`/documents/customer/${customerId}`);
    return res.data;
  },
  getByLoan: async (loanId) => {
    const res = await api.get(`/documents/loan/${loanId}`);
    return res.data;
  },
};
