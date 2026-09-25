import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
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
} from 'lucide-react';

export default function ActiveLoans() {
  const navigate = useNavigate();
  const { showToast } = useApp();

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
  }, [interestTypeFilter, frequencyFilter]);

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
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Active Loans</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage and collect installments for ongoing loans</p>
        </div>
        <Button onClick={() => navigate('/loans/new')} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Disburse Loan
        </Button>
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
            <option value="weekly">Weekly</option>
            <option value="fixed">Fixed</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Frequency:</span>
          </div>
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="">All Frequencies</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading active loan portfolio..." />
      ) : loans.length === 0 ? (
        <EmptyState
          title="No active loans"
          description="There are currently no active loans matching your filter criteria."
          actionLabel="Disburse Loan"
          onAction={() => navigate('/loans/new')}
          icon={Coins}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Loan ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Total Payable</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3">Next Due</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loans.map((loan) => (
                  <tr key={loan._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      <button
                        onClick={() => navigate(`/loans/${loan._id}`)}
                        className="hover:text-emerald-600 hover:underline"
                      >
                        {loan.loanId}
                      </button>
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
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(loan.totalPayable)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">
                      {formatCurrency(loan.totalPaid)}
                    </td>
                    <td className="px-4 py-3 font-bold text-rose-600">
                      {formatCurrency(loan.outstandingAmount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(loan.firstDueDate || loan.startDate)}
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
                          onClick={() => navigate(`/loans/${loan._id}`)}
                          className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
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
