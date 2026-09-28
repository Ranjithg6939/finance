import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BadgePercent,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  PlusCircle,
  CheckCircle2,
  Clock,
  Landmark,
  X,
  Bell,
  Shield,
  History,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isAdmin, isStaff } from '../../utils/permissions';

export default function Sidebar({ mobileOpen, closeMobileSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loansOpen, setLoansOpen] = useState(true);

  const adminRole = isAdmin(user);
  const prefix = adminRole ? '/admin' : '/staff';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const subNavLinkClasses = ({ isActive }) =>
    `flex items-center gap-2 pl-9 pr-3 py-2 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'text-emerald-700 font-semibold bg-emerald-50'
        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">FinVeda</h1>
            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
              {adminRole ? 'Admin Portal' : 'Staff Suite'}
            </span>
          </div>
        </div>
        {mobileOpen && (
          <button onClick={closeMobileSidebar} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role Pill Indicator */}
      <div className="px-4 pt-3 pb-1">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
            adminRole ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-blue-50 text-blue-800 border border-blue-100'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Signed in as <strong className="capitalize">{adminRole ? 'Administrator' : 'Staff'}</strong></span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {/* Dashboard */}
        <NavLink to={`${prefix}/dashboard`} onClick={closeMobileSidebar} className={navLinkClasses}>
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard</span>
        </NavLink>

        {/* Customers */}
        <NavLink to={`${prefix}/customers`} onClick={closeMobileSidebar} className={navLinkClasses}>
          <Users className="w-4 h-4" />
          <span>Customers</span>
        </NavLink>

        {/* Collapsible Loans Group */}
        <div>
          <button
            onClick={() => setLoansOpen(!loansOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <BadgePercent className="w-4 h-4" />
              <span>Loans</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${loansOpen ? 'rotate-180' : ''}`} />
          </button>

          {loansOpen && (
            <div className="space-y-0.5 mt-1">
              <NavLink to={`${prefix}/loans/new`} onClick={closeMobileSidebar} className={subNavLinkClasses}>
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Loan</span>
              </NavLink>
              <NavLink to={`${prefix}/loans/active`} onClick={closeMobileSidebar} className={subNavLinkClasses}>
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <span>Active Loans</span>
              </NavLink>
              <NavLink to={`${prefix}/loans/completed`} onClick={closeMobileSidebar} className={subNavLinkClasses}>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Completed Loans</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Payments */}
        <NavLink to={`${prefix}/payments`} onClick={closeMobileSidebar} className={navLinkClasses}>
          <Receipt className="w-4 h-4" />
          <span>Payments</span>
        </NavLink>

        {/* Staff Only: My Performance */}
        {!adminRole && (
          <NavLink to="/staff/performance" onClick={closeMobileSidebar} className={navLinkClasses}>
            <Award className="w-4 h-4 text-blue-500" />
            <span>My Performance</span>
          </NavLink>
        )}

        {/* Documents */}
        <NavLink to={`${prefix}/documents`} onClick={closeMobileSidebar} className={navLinkClasses}>
          <FileText className="w-4 h-4" />
          <span>Documents</span>
        </NavLink>

        {/* ADMIN ONLY SECTIONS */}
        {adminRole && (
          <>
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Administration</span>
            </div>

            <NavLink to="/admin/staff" onClick={closeMobileSidebar} className={navLinkClasses}>
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Staff Management</span>
            </NavLink>

            <NavLink to="/admin/reports" onClick={closeMobileSidebar} className={navLinkClasses}>
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </NavLink>

            <NavLink to="/admin/activity-logs" onClick={closeMobileSidebar} className={navLinkClasses}>
              <History className="w-4 h-4 text-blue-500" />
              <span>Audit Logs</span>
            </NavLink>

            <NavLink to="/admin/settings" onClick={closeMobileSidebar} className={navLinkClasses}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </NavLink>
          </>
        )}

        <NavLink to={`${prefix}/notifications`} onClick={closeMobileSidebar} className={navLinkClasses}>
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </NavLink>
      </div>

      {/* Footer / Logout */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeMobileSidebar} />
          <div className="relative w-64 h-full z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
