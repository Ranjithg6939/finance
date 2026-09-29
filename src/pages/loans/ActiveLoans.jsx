import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import PaymentModal from '../../components/payments/PaymentModal';
import {
  Coins,
  Search,
  Plus,
  Filter,
  Eye,
  CreditCard,
  Clock,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export default function ActiveLoans() {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isRecoveryStaff = user?.role === 'recovery_staff';
  const isStaff = user?.role === 'staff';
  const prefix = isAdmin ? '/admin' : isRecoveryStaff ? '/recovery' : '/staff';

  const defaultScope = isRecoveryStaff ? 'my_recovery' : isStaff ? 'my_loans' : 'all';
  const [scopeFilter, setScopeFilter] = useState(defaultScope);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [interestTypeFilter, setInterestTypeFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');

  // Payment modal state
  const [selectedLoanForPayment, setSelectedLoanForPayment] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const res = await loanService.getAll({
        status: 'active',
        search,
        interestType: interestTypeFilter || undefined,
        paymentFrequency: frequencyFilter || undefined,
        filter: scopeFilter !== 'all' ? scopeFilter : undefined,
      });
      setLoans(res.data || []);
    } catch (err) {
      showToast('Failed to load active loans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [interestTypeFilter, frequencyFilter, scopeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLoans();
  };

  const openPaymentModal = (loan) => {
    setSelectedLoanForPayment(loan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {scopeFilter === 'my_loans'
                ? 'My Loans'
                : scopeFilter === 'my_recovery'
                ? 'My Assigned Recovery Loans'
                : 'All Active Loans'}
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                isAdmin ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}
            >
              {isAdmin ? 'Admin View' : isRecoveryStaff ? 'Recovery Portal' : 'Staff Portal'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track active installments, assigned borrowers, and recovery follow-ups
          </p>
        </div>
        <Button onClick={() => navigate(`${prefix}/loans/new`)} size="sm" className="w-full sm:w-auto justify-center">
          <Plus className="w-4 h-4 mr-1.5" /> Disburse Loan
        </Button>
      </div>

      {/* Scope Navigation Tabs: All Loans, My Loans, My Assigned Recovery Loans */}
      <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
        <nav className="flex space-x-2 whitespace-nowrap min-w-max pb-1">
          {isAdmin && (
            <button
              onClick={() => setScopeFilter('all')}
              className={`py-2 px-3.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
                scopeFilter === 'all'
                  ? 'border-emerald-600 text-emerald-600 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              All Loans
            </button>
          )}
          <button
            onClick={() => setScopeFilter('my_loans')}
            className={`py-2 px-3.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              scopeFilter === 'my_loans'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Loans
          </button>
          <button
            onClick={() => setScopeFilter('my_recovery')}
            className={`py-2 px-3.5 text-xs font-semibold rounded-t-lg border-b-2 transition-colors ${
              scopeFilter === 'my_recovery'
                ? 'border-emerald-600 text-emerald-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            My Assigned Recovery Loans
          </button>
        </nav>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by loan ID, borrower name, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Interest:</span>
          </div>
          <select
            value={interestTypeFilter}
            onChange={(e) => setInterestTypeFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Types</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Loans Table */}
      {loading ? (
        <Loader text="Loading active loans..." />
      ) : loans.length === 0 ? (
        <EmptyState
          title="No active loans found"
          description="There are currently no active loans matching your filter criteria."
          actionLabel="Disburse Loan"
          onAction={() => navigate(`${prefix}/loans/new`)}
          icon={Coins}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full touch-scroll">
            <table className="w-full text-left text-xs text-slate-600 min-w-[760px]">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px] whitespace-nowrap">
                <tr>
                  <th className="px-4 py-3">Loan ID</th>
                  <th className="px-4 py-3">Customer</th>
                  {isAdmin && <th className="px-4 py-3">Assigned Staff</th>}
                  {(isAdmin || scopeFilter === 'my_recovery') && <th className="px-4 py-3">Recovery Officer</th>}
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Total Payable</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => {
                  const staffName = loan.assignedStaff?.name || (typeof loan.assignedStaff === 'string' ? loan.assignedStaff : 'Unassigned');
                  const recoveryStaffName = loan.assignedRecoveryStaff?.name || (typeof loan.assignedRecoveryStaff === 'string' ? loan.assignedRecoveryStaff : 'Unassigned');

                  return (
                    <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        <button
                          onClick={() => navigate(`${prefix}/loans/${loan._id}`)}
                          className="hover:text-emerald-600 hover:underline"
                        >
                          {loan.loanId}
                        </button>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        <div>{loan.customer?.fullName || loan.customerName || '—'}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {loan.customer?.phone || loan.customer?.customerId || loan.customerId}
                        </div>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            {staffName}
                          </span>
                        </td>
                      )}
                      {(isAdmin || scopeFilter === 'my_recovery') && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded ${loan.assignedRecoveryStaff ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-400'}`}>
                            {recoveryStaffName}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {formatCurrency(loan.principalAmount)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {formatCurrency(loan.totalPayable)}
                      </td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">
                        {formatCurrency(loan.totalPaid)}
                      </td>
                      <td className="px-4 py-3 font-bold text-rose-600">
                        {formatCurrency(loan.outstandingAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 capitalize">
                          {loan.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPaymentModal(loan)}
                            className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] flex items-center gap-1"
                            title="Record Payment"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay
                          </button>
                          <button
                            onClick={() => navigate(`${prefix}/loans/${loan._id}`)}
                            className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
                            title="View Amortization Schedule"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedLoanForPayment && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          loan={selectedLoanForPayment}
          onPaymentSuccess={() => {
            fetchLoans();
          }}
        />
      )}
    </div>
  );
}
