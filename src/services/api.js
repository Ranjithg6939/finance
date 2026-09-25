import axios from 'axios';

// Compute API base URL:
// - If VITE_API_URL is configured (Production), use `${VITE_API_URL}/api`
// - If empty / unset (Local dev or same-origin), use `/api` which Vite proxies to localhost:5000
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl || envUrl.trim() === '') {
    return '/api';
  }
  const cleanUrl = envUrl.trim().replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    // If the server returned HTML instead of JSON for an API request (e.g. Vercel SPA rewrite returning index.html)
    const contentType = response.headers?.['content-type'] || '';
    const isHtml =
      contentType.includes('text/html') ||
      (typeof response.data === 'string' && /^\s*<(!doctype|html)/i.test(response.data));

    if (isHtml) {
      const error = new Error('Backend API not reachable (received HTML SPA fallback).');
      error.isHtmlFallback = true;
      error.response = {
        status: 503,
        statusText: 'Service Unavailable',
        data: { message: 'Backend server is not connected or unreachable' },
      };
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401 && !error.isHtmlFallback) {
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
