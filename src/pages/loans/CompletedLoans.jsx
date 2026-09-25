import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import { CheckCircle2, Eye, Search } from 'lucide-react';

export default function CompletedLoans() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompletedLoans = async () => {
    try {
      setLoading(true);
      const res = await loanService.getAll({
        status: 'completed',
        search,
      });
      setLoans(res.data || []);
    } catch (err) {
      showToast('Failed to load completed loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedLoans();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCompletedLoans();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Completed Loans</h2>
          <p className="text-xs text-slate-500 mt-0.5">Historical ledger of fully paid and settled agreements</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed loans by ID, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading completed loans ledger..." />
      ) : loans.length === 0 ? (
        <EmptyState
          title="No completed loans yet"
          description="Loans will appear here once all installments and outstanding balances are settled."
          icon={CheckCircle2}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Loan ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Original Principal</th>
                  <th className="px-4 py-3">Total Interest</th>
                  <th className="px-4 py-3">Total Paid</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">Completed Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {loan.loanId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{loan.customer?.fullName || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{loan.customer?.customerId}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {formatCurrency(loan.principalAmount)}
                    </td>
                    <td className="px-4 py-3 text-amber-600 font-medium">
                      {formatCurrency(loan.totalInterest)}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      {formatCurrency(loan.totalPaid)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(loan.startDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(loan.completedAt || loan.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Completed
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => navigate(`/loans/${loan._id}`)}
                        className="p-1 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100"
                        title="View Full Ledger"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
