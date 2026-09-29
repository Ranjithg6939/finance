import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import {
  User,
  Sliders,
  Shield,
  KeyRound,
  CheckCircle2,
  Laptop,
  Database,
  RefreshCw,
  HardDrive,
} from 'lucide-react';
import { localStorageDb } from '../../services/localStorageDb';

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [storageStats, setStorageStats] = useState(() => {
    try {
      const c = localStorageDb.getCustomers().count;
      const l = localStorageDb.getLoans().count;
      const p = localStorageDb.getPayments().count;
      const d = localStorageDb.getDocuments().count;
      return { customers: c, loans: l, payments: p, documents: d };
    } catch (e) {
      return { customers: 0, loans: 0, payments: 0, documents: 0 };
    }
  });

  const handleResetData = () => {
    if (window.confirm('Reset all customers, loans, and payments to default demo records? Your custom changes will be reset.')) {
      localStorageDb.resetAll();
      const c = localStorageDb.getCustomers().count;
      const l = localStorageDb.getLoans().count;
      const p = localStorageDb.getPayments().count;
      const d = localStorageDb.getDocuments().count;
      setStorageStats({ customers: c, loans: l, payments: p, documents: d });
      showToast('Database reset to clean demo records', 'success');
    }
  };

  // Application settings state
  const [appSettings, setAppSettings] = useState({
    currency: 'INR (₹)',
    dateFormat: 'DD/MM/YYYY',
    defaultCalculation: 'simple',
    defaultFrequency: 'monthly',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const handleSaveApp = (e) => {
    e.preventDefault();
    showToast('Application preferences saved', 'success');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    const errs = {};
    if (!passwordData.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!passwordData.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }
    if (!passwordData.confirmPassword) {
      errs.confirmPassword = 'Confirm password is required';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      showToast(Object.values(errs)[0], 'error');
      return;
    }

    setPasswordErrors({});
    showToast('Password updated successfully', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">System Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">Manage preferences, lending configurations, and account security</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-4 sm:space-x-6 whitespace-nowrap min-w-max pb-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'application', label: 'Application', icon: Sliders },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'storage', label: 'Local Storage', icon: Database },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 sm:py-3 px-1 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-xl font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                {user?.role || 'Staff'} Account
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <Input label="Full Name" value={user?.name || ''} disabled />
            <Input label="Email Address" value={user?.email || ''} disabled />
            <Input label="Phone" value={user?.phone || '9876543210'} disabled />
            <Input label="Role" value={user?.role?.toUpperCase() || 'ADMIN'} disabled />
          </div>
        </div>
      )}

      {/* Tab: Application */}
      {activeTab === 'application' && (
        <form onSubmit={handleSaveApp} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-5">
          <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Lending Defaults & Formatting
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Currency</label>
              <select
                value={appSettings.currency}
                onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="INR (₹)">INR (₹) — Indian Rupee</option>
                <option value="USD ($)">USD ($) — US Dollar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date Format</label>
              <select
                value={appSettings.dateFormat}
                onChange={(e) => setAppSettings({ ...appSettings, dateFormat: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 25/09/2026)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-25)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Interest Calculation
              </label>
              <select
                value={appSettings.defaultCalculation}
                onChange={(e) => setAppSettings({ ...appSettings, defaultCalculation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="simple">Simple Interest</option>
                <option value="flat">Flat Interest</option>
                <option value="reducing_balance">Reducing-Balance (EMI)</option>
                <option value="fixed">Fixed Interest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Default Payment Frequency
              </label>
              <select
                value={appSettings.defaultFrequency}
                onChange={(e) => setAppSettings({ ...appSettings, defaultFrequency: e.target.value })}
                className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
              >
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" className="w-full sm:w-auto">Save Changes</Button>
          </div>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, currentPassword: e.target.value });
                  if (passwordErrors.currentPassword) setPasswordErrors((prev) => ({ ...prev, currentPassword: null }));
                }}
                required
                error={passwordErrors.currentPassword}
              />

              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, newPassword: e.target.value });
                  if (passwordErrors.newPassword) setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
                }}
                required
                error={passwordErrors.newPassword}
                helperText="Minimum 6 characters"
              />

              <Input
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => {
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value });
                  if (passwordErrors.confirmPassword) setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                required
                error={passwordErrors.confirmPassword}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="w-full sm:w-auto">Update Password</Button>
            </div>
          </form>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              Active Sessions
            </h3>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600 shrink-0">
                  <Laptop className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">Chrome on Windows (Current Session)</p>
                  <p className="text-[11px] text-slate-400">Current Device • Online</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                Active Now
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Local Storage */}
      {activeTab === 'storage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shrink-0">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Local Browser Storage (Offline Engine)</h3>
                <p className="text-xs text-slate-500">All customer registrations, loans, and payments persist in your browser's localStorage</p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              Active & Saved
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Customers</span>
              <p className="text-xl font-bold text-slate-900 mt-1">{storageStats.customers}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Key: finveda_customers</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-blue-600 uppercase">Loans</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{storageStats.loans}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Key: finveda_loans</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Payments</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{storageStats.payments}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Key: finveda_payments</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <span className="text-[11px] font-semibold text-amber-600 uppercase">Documents</span>
              <p className="text-xl font-bold text-amber-700 mt-1">{storageStats.documents}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Key: finveda_documents</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Database className="w-4 h-4 text-amber-600 shrink-0" />
              <span>How your data is stored</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              When adding new customers, creating loans, or recording payments, all records are immediately saved to your browser's persistent <strong>localStorage</strong>. Your changes will remain even if you refresh or reopen your browser.
            </p>
            <div className="pt-2 border-t border-amber-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <span className="text-slate-500 text-[11px]">Need to reset to default sample data?</span>
              <Button size="sm" variant="secondary" onClick={handleResetData} className="w-full sm:w-auto text-rose-600 hover:text-rose-700 border-rose-200 justify-center">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset Demo Records
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
