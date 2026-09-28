import React from 'react';
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 shadow-sm border border-rose-100">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-2">
        403 - Access Denied
      </span>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        Unauthorized Area
      </h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        You do not have permission to view this resource. Your role ({user?.role || 'user'}) is restricted
        from accessing administrative configurations.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
        <Button
          size="sm"
          onClick={() => navigate(dashboardPath)}
          className="flex items-center gap-1.5"
        >
          <LayoutDashboard className="w-4 h-4" /> Return to My Dashboard
        </Button>
      </div>
    </div>
  );
}
