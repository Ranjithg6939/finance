import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts & Route guards
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Operational Pages
import Dashboard from '../pages/dashboard/Dashboard';
import Customers from '../pages/customers/Customers';
import AddCustomer from '../pages/customers/AddCustomer';
import CustomerDetails from '../pages/customers/CustomerDetails';

import ActiveLoans from '../pages/loans/ActiveLoans';
import CompletedLoans from '../pages/loans/CompletedLoans';
import CreateLoan from '../pages/loans/CreateLoan';
import LoanDetails from '../pages/loans/LoanDetails';

import Payments from '../pages/payments/Payments';
import Documents from '../pages/documents/Documents';
import Notifications from '../pages/notifications/Notifications';

// Admin Only Pages
import StaffManagement from '../pages/staff/StaffManagement';
import ActivityLogs from '../pages/admin/ActivityLogs';
import Reports from '../pages/reports/Reports';
import Settings from '../pages/settings/Settings';

// Staff Only Pages
import StaffPerformance from '../pages/staff/StaffPerformance';

// Dynamic redirect component based on authenticated user's role
function DynamicRoleRedirect({ subPath }) {
  const { user } = useAuth();
  const location = useLocation();

  const role = user?.role === 'admin' ? 'admin' : 'staff';
  const target = subPath ? `/${role}/${subPath}` : `/${role}/dashboard`;
  return <Navigate to={`${target}${location.search}`} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ADMIN ROUTES (Protected - Admin Only) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} fallback="access-denied" />}>
        <Route element={<MainLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />

          {/* Admin Customers */}
          <Route path="/admin/customers" element={<Customers />} />
          <Route path="/admin/customers/new" element={<AddCustomer />} />
          <Route path="/admin/customers/:customerId" element={<CustomerDetails />} />

          {/* Admin Loans */}
          <Route path="/admin/loans/new" element={<CreateLoan />} />
          <Route path="/admin/loans/active" element={<ActiveLoans />} />
          <Route path="/admin/loans/completed" element={<CompletedLoans />} />
          <Route path="/admin/loans/:loanId" element={<LoanDetails />} />

          {/* Admin Operations */}
          <Route path="/admin/payments" element={<Payments />} />
          <Route path="/admin/documents" element={<Documents />} />

          {/* Admin Exclusive Sections */}
          <Route path="/admin/staff" element={<StaffManagement />} />
          <Route path="/admin/activity-logs" element={<ActivityLogs />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* STAFF ROUTES (Protected - Staff & Admin) */}
      <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} fallback="redirect" />}>
        <Route element={<MainLayout />}>
          <Route path="/staff" element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="/staff/dashboard" element={<Dashboard />} />

          {/* Staff Customers */}
          <Route path="/staff/customers" element={<Customers />} />
          <Route path="/staff/customers/new" element={<AddCustomer />} />
          <Route path="/staff/customers/:customerId" element={<CustomerDetails />} />

          {/* Staff Loans */}
          <Route path="/staff/loans/new" element={<CreateLoan />} />
          <Route path="/staff/loans/active" element={<ActiveLoans />} />
          <Route path="/staff/loans/completed" element={<CompletedLoans />} />
          <Route path="/staff/loans/:loanId" element={<LoanDetails />} />

          {/* Staff Operations */}
          <Route path="/staff/payments" element={<Payments />} />
          <Route path="/staff/documents" element={<Documents />} />
          <Route path="/staff/performance" element={<StaffPerformance />} />
          <Route path="/staff/notifications" element={<Notifications />} />
        </Route>
      </Route>

      {/* Backward-Compatible Route Aliases (seamlessly redirect by role) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DynamicRoleRedirect subPath="dashboard" />} />
        <Route path="/dashboard" element={<DynamicRoleRedirect subPath="dashboard" />} />
        <Route path="/customers" element={<DynamicRoleRedirect subPath="customers" />} />
        <Route path="/customers/new" element={<DynamicRoleRedirect subPath="customers/new" />} />
        <Route path="/loans/new" element={<DynamicRoleRedirect subPath="loans/new" />} />
        <Route path="/loans/active" element={<DynamicRoleRedirect subPath="loans/active" />} />
        <Route path="/loans/completed" element={<DynamicRoleRedirect subPath="loans/completed" />} />
        <Route path="/payments" element={<DynamicRoleRedirect subPath="payments" />} />
        <Route path="/documents" element={<DynamicRoleRedirect subPath="documents" />} />
        <Route path="/notifications" element={<DynamicRoleRedirect subPath="notifications" />} />
      </Route>

      {/* Fallback Catch-All */}
      <Route path="*" element={<DynamicRoleRedirect subPath="dashboard" />} />
    </Routes>
  );
}
