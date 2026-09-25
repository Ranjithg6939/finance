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
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile');

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

  const handleSaveApp = (e) => {
    e.preventDefault();
    showToast('Application preferences saved', 'success');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
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
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'application', label: 'Application', icon: Sliders },
            { id: 'security', label: 'Security', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 text-xs font-semibold flex items-center gap-2 transition-colors ${
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
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
        <form onSubmit={handleSaveApp} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
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
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      )}

      {/* Tab: Security */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Change Password
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
              />

              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
              />

              <Input
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">Update Password</Button>
            </div>
          </form>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-600" />
              Active Sessions
            </h3>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Chrome on Windows (Current Session)</p>
                  <p className="text-[11px] text-slate-400">Current Device • Online</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active Now
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
