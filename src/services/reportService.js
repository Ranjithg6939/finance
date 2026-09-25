import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },
  getMonthlyCollections: async () => {
    const res = await api.get('/dashboard/monthly-collections');
    return res.data;
  },
  getUpcomingPayments: async () => {
    const res = await api.get('/dashboard/upcoming-payments');
    return res.data;
  },
};

export const reportService = {
  getLoans: async (params = {}) => {
    const res = await api.get('/reports/loans', { params });
    return res.data;
  },
  getPayments: async (params = {}) => {
    const res = await api.get('/reports/payments', { params });
    return res.data;
  },
  getInterest: async (params = {}) => {
    const res = await api.get('/reports/interest', { params });
    return res.data;
  },
  getCustomers: async (params = {}) => {
    const res = await api.get('/reports/customers', { params });
    return res.data;
  },
};
