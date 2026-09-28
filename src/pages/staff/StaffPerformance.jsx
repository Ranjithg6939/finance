import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dashboardService } from '../../services/reportService';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import Loader from '../../components/common/Loader';
import {
  TrendingUp,
  Award,
  Users,
  BadgePercent,
  Receipt,
  CheckCircle2,
  Calendar,
  Target,
} from 'lucide-react';

export default function StaffPerformance() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const [sumRes, payRes] = await Promise.all([
          dashboardService.getSummary(),
          paymentService.getAll({ limit: 10 }),
        ]);
        setSummary(sumRes.data);
        setRecentPayments(payRes.data || []);
      } catch (err) {
        console.error('Failed to load staff performance:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, []);

  if (loading) {
    return <Loader text="Loading your personal performance metrics..." />;
  }

  const monthlyTarget = 150000;
  const currentCollected = summary?.totalCollections || 0;
  const targetPercent = Math.min(100, Math.round((currentCollected / monthlyTarget) * 100));

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">My Recovery Performance</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
              Staff Executive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal collection tracking and loan assignment progress for {user?.name}
          </p>
        </div>
      </div>

      {/* Monthly Recovery Target Progress */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-700/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/20">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-4 h-4" /> Monthly Collection Target
            </div>
            <h3 className="text-2xl font-bold mt-1 font-mono">
              {formatCurrency(currentCollected)}{' '}
              <span className="text-sm font-normal text-emerald-100">
                / {formatCurrency(monthlyTarget)} target
              </span>
            </h3>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-center">
            <span className="text-xs text-emerald-100">Achievement</span>
            <p className="text-xl font-bold font-mono">{targetPercent}%</p>
          </div>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
            <div
              className="bg-white h-3 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-emerald-100">
            <span>Keep up the great work!</span>
            <span>Target ends end of month</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Assigned Customers</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{summary?.totalCustomers || 0}</p>
          <p className="text-[11px] text-slate-400">Borrowers under your portfolio</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Active Loans</span>
            <BadgePercent className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600">{summary?.activeLoansCount || 0}</p>
          <p className="text-[11px] text-slate-400">Loans requiring active follow-up</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Today's Collections</span>
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 font-mono">
            {formatCurrency(summary?.todayCollections || 0)}
          </p>
          <p className="text-[11px] text-slate-400">Recovered today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase">Pending Recovery</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono">
            {formatCurrency(summary?.pendingCollections || 0)}
          </p>
          <p className="text-[11px] text-slate-400">Outstanding balance to recover</p>
        </div>
      </div>

      {/* Recent Collections Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recent Collections Recorded by You</h3>
            <p className="text-[11px] text-slate-400">Receipts logged under your staff ID</p>
          </div>
        </div>

        {recentPayments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No collections logged yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Receipt #</th>
                  <th className="px-4 py-2.5">Customer Name</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Mode</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-2.5 font-mono text-slate-600">{p.paymentId}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{p.customerName || 'Borrower'}</td>
                    <td className="px-4 py-2.5 text-slate-500">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-2.5 text-slate-600">{p.paymentMethod}</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-700 font-mono">
                      {formatCurrency(p.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
