import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import PaymentSchedule from '../../components/loans/PaymentSchedule';
import PaymentModal from '../../components/payments/PaymentModal';
import DocumentUploader from '../../components/documents/DocumentUploader';
import {
  ArrowLeft,
  CreditCard,
  Upload,
  Clock,
  CheckCircle2,
  FileText,
  Calendar,
  Layers,
  Activity,
  UserCheck,
  Check,
  X,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/staff';

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Staff Assignment State (Admin Only)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await loanService.getById(loanId);
      setLoan(res.data);
      if (res.data?.assignedStaff?._id) {
        setSelectedStaffId(res.data.assignedStaff._id);
      } else if (res.data?.assignedStaff) {
        setSelectedStaffId(res.data.assignedStaff);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load loan record', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  const handleOpenAssignModal = async () => {
    try {
      const res = await staffService.getAll({ status: 'active' });
      setStaffList(res.data || []);
      setIsAssignModalOpen(true);
    } catch (err) {
      showToast('Failed to load active staff list', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssignSubmitting(true);
      await loanService.assignStaff(loan._id, selectedStaffId || null);
      showToast('Loan staff assignment updated successfully', 'success');
      setIsAssignModalOpen(false);
      fetchLoan();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign staff', 'error');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    try {
      await loanService.changeStatus(loan._id, newStatus);
      showToast(`Loan status updated to ${newStatus}`, 'success');
      fetchLoan();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update loan status', 'error');
    }
  };

  const handleDeleteLoan = async () => {
    if (!window.confirm(`Are you sure you want to delete Loan #${loan.loanId}? This will remove the agreement.`)) {
      return;
    }

    try {
      await loanService.delete(loan._id);
      showToast('Loan deleted successfully', 'success');
      navigate(`${prefix}/loans/active`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete loan', 'error');
    }
  };

  if (loading) {
    return <Loader text="Loading loan summary & amortization schedule..." />;
  }

  if (!loan) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Loan not found</p>
        <Button onClick={() => navigate(`${prefix}/loans/active`)} className="mt-4" size="sm">
          Return to Loans
        </Button>
      </div>
    );
  }

  const percentPaid = Math.min(
    100,
    Math.round(((loan.totalPaid || 0) / (loan.totalPayable || 1)) * 100)
  );

  const assignedStaffName = loan.assignedStaff?.name || 'Unassigned';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`${prefix}/loans/active`)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Loans
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              Loan #{loan.loanId}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                loan.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : loan.status === 'pending'
                  ? 'bg-amber-100 text-amber-800'
                  : loan.status === 'rejected'
                  ? 'bg-rose-100 text-rose-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {loan.status}
            </span>

            {/* Assigned Staff Tag */}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              Staff: {assignedStaffName}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
            <span className="font-semibold text-slate-900">
              Borrower:{' '}
              <button
                onClick={() => navigate(`${prefix}/customers/${loan.customer?._id || loan.customerId}`)}
                className="text-emerald-600 hover:underline"
              >
                {loan.customer?.fullName || loan.customerName}
              </button>
            </span>
            <span>•</span>
            <span>
              Principal: <strong className="text-slate-900">{formatCurrency(loan.principalAmount)}</strong>
            </span>
            <span>•</span>
            <span className="capitalize">
              {loan.interestRate}% {loan.interestType} ({loan.calculationMethod?.replace('_', ' ')})
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Approval / Rejection Actions for Pending Loans */}
          {isAdmin && loan.status === 'pending' && (
            <>
              <button
                onClick={() => handleChangeStatus('active')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> Approve Loan
              </button>
              <button
                onClick={() => handleChangeStatus('rejected')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
              >
                <X className="w-3.5 h-3.5" /> Reject Loan
              </button>
            </>
          )}

          {/* Admin Staff Assignment Button */}
          {isAdmin && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleOpenAssignModal}
              className="flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Assign Staff
            </Button>
          )}

          {loan.status !== 'completed' && loan.status !== 'rejected' && (
            <Button size="sm" onClick={() => setIsPaymentModalOpen(true)}>
              <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Record Payment
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsDocModalOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
          </Button>

          {/* Admin Only Delete */}
          {isAdmin && (
            <button
              onClick={handleDeleteLoan}
              title="Delete Loan"
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Principal</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(loan.principalAmount)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-amber-600 uppercase">Total Interest</span>
          <p className="text-lg font-bold text-amber-700 mt-1">{formatCurrency(loan.totalInterest)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Payable</span>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(loan.totalPayable)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-emerald-600 uppercase">Paid So Far</span>
          <p className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(loan.totalPaid)}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-semibold text-rose-600 uppercase">Outstanding</span>
          <p className="text-lg font-bold text-rose-700 mt-1">{formatCurrency(loan.outstandingAmount)}</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Repayment Progress</span>
          <span className="text-emerald-600 font-bold">{percentPaid}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentPaid}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{formatCurrency(loan.totalPaid)} collected</span>
          <span>{formatCurrency(loan.totalPayable)} total</span>
        </div>
      </div>

      {/* Payment Schedule Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Amortization & Payment Schedule</h3>
            <p className="text-[11px] text-slate-400">Installments generated by calculation engine</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {loan.schedule?.length || 0} Installments
          </span>
        </div>
        <PaymentSchedule schedule={loan.schedule} />
      </div>

      {/* Assign Staff Modal (Admin Only) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Staff to Loan</h3>
                <p className="text-xs text-slate-500">Loan #{loan.loanId}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Field Executive</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={assignSubmitting}>
                  {assignSubmitting ? 'Saving...' : 'Save Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Record Payment Modal */}
      {isPaymentModalOpen && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          loan={loan}
          onPaymentSuccess={() => {
            fetchLoan();
          }}
        />
      )}

      {/* Document Uploader Modal */}
      {isDocModalOpen && (
        <DocumentUploader
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          loanId={loan._id}
          customerId={loan.customer?._id || loan.customerId}
          onUploadSuccess={() => fetchLoan()}
        />
      )}
    </div>
  );
}
