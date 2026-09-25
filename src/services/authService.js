import api from './api';

export const authService = {
  login: async (credentials) => {
    const id = (credentials.email || '').trim().toLowerCase();
    const pwd = (credentials.password || '').trim();

    try {
      const res = await api.post('/auth/login', credentials);
      if (res && res.data && typeof res.data === 'object' && res.data.token && res.data.user) {
        return res.data;
      }
      throw new Error('Invalid authentication response from server');
    } catch (err) {
      // If the backend actually responded with 400 or 401 with a real error message, rethrow
      if (
        err.response &&
        (err.response.status === 400 || err.response.status === 401) &&
        !err.isHtmlFallback &&
        err.response.data &&
        typeof err.response.data === 'object' &&
        err.response.data.message
      ) {
        throw err;
      }

      // Offline / Demo account fallback for preview deployments without a live backend:
      if ((id === 'admin@finance.com' || id === 'admin') && pwd === 'password123') {
        return {
          success: true,
          token: 'demo-jwt-admin-token',
          user: {
            id: 'admin-001',
            name: 'Admin User',
            email: 'admin@finance.com',
            phone: '9876543210',
            role: 'admin',
          },
        };
      }

      if ((id === 'staff@finance.com' || id === 'staff') && pwd === 'password123') {
        return {
          success: true,
          token: 'demo-jwt-staff-token',
          user: {
            id: 'staff-001',
            name: 'Finance Executive',
            email: 'staff@finance.com',
            phone: '9876543211',
            role: 'staff',
          },
        };
      }

      throw err;
    }
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && token.startsWith('demo-jwt-')) {
        const savedUser = localStorage.getItem('user');
        if (savedUser && savedUser !== 'undefined') {
          return { success: true, user: JSON.parse(savedUser) };
        }
      }

      const res = await api.get('/auth/me');
      if (res && res.data && typeof res.data === 'object' && res.data.user) {
        return res.data;
      }
      throw new Error('Invalid user response');
    } catch (err) {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        try {
          return { success: true, user: JSON.parse(savedUser) };
        } catch (e) {
          // ignore
        }
      }
      throw err;
    }
  },
  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (data) => {
    const res = await api.post('/auth/reset-password', data);
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
