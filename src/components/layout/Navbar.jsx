import React, { useState } from 'react';
import { Search, User, Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from '../notifications/NotificationDropdown';

export default function Navbar({ toggleMobileSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/staff';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`${prefix}/customers?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur px-3 sm:px-6 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          className="lg:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-72 md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, loans, phone numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 border border-transparent rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors"
          />
        </form>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <NotificationDropdown />

        <div className="h-6 w-px bg-slate-200 mx-0.5 sm:mx-1" />

        {/* Profile Card with Clear Role Display */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div
            className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 ${
              isAdmin ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {user?.name || (isAdmin ? 'Administrator' : 'Staff Executive')}
            </span>
            <span
              className={`text-[10px] font-semibold capitalize flex items-center gap-1 ${
                isAdmin ? 'text-emerald-700' : 'text-blue-700'
              }`}
            >
              <Shield className="w-2.5 h-2.5 inline" />
              {isAdmin ? 'Administrator' : 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
