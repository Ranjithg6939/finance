import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts & Route guards
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';

// Pages
import Login from '../pages/auth/Login';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

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
import Reports from '../pages/reports/Reports';
import Notifications from '../pages/notifications/Notifications';
import Settings from '../pages/settings/Settings';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public / Authentication Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Protected Application Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Customers */}
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/new" element={<AddCustomer />} />
          <Route path="/customers/:customerId" element={<CustomerDetails />} />

          {/* Loans */}
          <Route path="/loans/new" element={<CreateLoan />} />
          <Route path="/loans/active" element={<ActiveLoans />} />
          <Route path="/loans/completed" element={<CompletedLoans />} />
          <Route path="/loans/:loanId" element={<LoanDetails />} />

          {/* Payments, Documents, Reports, Notifications, Settings */}
          <Route path="/payments" element={<Payments />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
