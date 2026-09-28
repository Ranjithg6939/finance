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

export const documentService = {
  getAll: async (params = {}) => {
    if (isLocalMode()) {
      return localStorageDb.getDocuments(params);
    }
    try {
      const res = await api.get('/documents', { params });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localStorageDb.getDocuments(params);
    }
  },

  upload: async (formData) => {
    // Extract metadata from FormData
    const docData = {
      title: formData.get('documentName') || 'Uploaded Document',
      documentType: formData.get('documentType') || 'id_proof',
      customerId: formData.get('customerId') || '',
      loanId: formData.get('loanId') || '',
      fileName: formData.get('file')?.name || 'document.pdf',
      fileSize: formData.get('file')?.size || 250000,
      fileUrl: '#',
    };

    const file = formData.get('file');
    if (file && typeof window !== 'undefined' && window.URL && window.URL.createObjectURL) {
      try {
        docData.fileUrl = window.URL.createObjectURL(file);
      } catch (e) {
        docData.fileUrl = '#';
      }
    }

    const localRes = localStorageDb.uploadDocument(docData);
    if (isLocalMode()) {
      return localRes;
    }

    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (err) {
      window.__FINVEDA_OFFLINE__ = true;
      return localRes;
    }
  },

  delete: async (id) => {
    const localRes = localStorageDb.deleteDocument(id);
    if (isLocalMode()) {
      return localRes;
    }
    try {
      const res = await api.delete(`/documents/${id}`);
      return res.data;
    } catch (err) {
      return localRes;
    }
  },

  getByCustomer: async (customerId) => {
    if (isLocalMode()) {
      return localStorageDb.getDocuments({ customerId });
    }
    try {
      const res = await api.get(`/documents/customer/${customerId}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getDocuments({ customerId });
    }
  },

  getByLoan: async (loanId) => {
    if (isLocalMode()) {
      return localStorageDb.getDocuments({ loanId });
    }
    try {
      const res = await api.get(`/documents/loan/${loanId}`);
      return res.data;
    } catch (err) {
      return localStorageDb.getDocuments({ loanId });
    }
  },
};
