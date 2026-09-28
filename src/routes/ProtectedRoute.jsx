import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import AccessDenied from '../components/common/AccessDenied';

export default function ProtectedRoute({ allowedRoles, fallback = 'access-denied' }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Verifying session..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization if specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'staff';
    if (!allowedRoles.includes(userRole)) {
      if (fallback === 'redirect') {
        const dest = userRole === 'admin' ? '/admin/dashboard' : '/staff/dashboard';
        return <Navigate to={dest} replace />;
      }
      return <AccessDenied />;
    }
  }

  return <Outlet />;
}
