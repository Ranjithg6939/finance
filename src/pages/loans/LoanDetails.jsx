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
import PaymentReceiptModal from '../../components/payments/PaymentReceiptModal';
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
  Receipt,
  Printer,
  ShieldCheck,
  UserX,
  PhoneCall,
  MessageSquare,
  History,
  Send,
} from 'lucide-react';

export default function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isRecoveryStaff = user?.role === 'recovery_staff';
  const isNormalStaff = user?.role === 'staff';
  const prefix = isAdmin ? '/admin' : isRecoveryStaff ? '/recovery' : '/staff';

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Staff & Recovery Assignment State (Admin Only)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedRecoveryStaffId, setSelectedRecoveryStaffId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Recovery Status & Notes State
  const [newRecoveryStatus, setNewRecoveryStatus] = useState('');
  const [newRecoveryNote, setNewRecoveryNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await loanService.getById(loanId);
      const data = res.data;
      setLoan(data);
      if (data?.assignedStaff?._id) {
        setSelectedStaffId(data.assignedStaff._id);
      } else if (data?.assignedStaff) {
        setSelectedStaffId(data.assignedStaff);
      } else {
        setSelectedStaffId('');
      }

      if (data?.assignedRecoveryStaff?._id) {
        setSelectedRecoveryStaffId(data.assignedRecoveryStaff._id);
      } else if (data?.assignedRecoveryStaff) {
        setSelectedRecoveryStaffId(data.assignedRecoveryStaff);
      } else {
        setSelectedRecoveryStaffId('');
      }

      setNewRecoveryStatus(data?.recoveryStatus || 'pending');
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
      await loanService.assignRecoveryStaff(loan._id, selectedRecoveryStaffId || null);
      showToast('Loan staff assignments updated successfully', 'success');
      setIsAssignModalOpen(false);
      fetchLoan();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update assignments', 'error');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUpdateRecoveryStatus = async (status) => {
    try {
      setUpdatingStatus(true);
      await loanService.updateRecoveryStatus(loan._id, status);
      setNewRecoveryStatus(status);
      showToast(`Recovery status updated to ${status.replace('_', ' ')}`, 'success');
      fetchLoan();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update recovery status', 'error');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddRecoveryNote = async (e) => {
    e.preventDefault();
    if (!newRecoveryNote.trim()) return;
    try {
      setSubmittingNote(true);
      await loanService.addRecoveryNote(loan._id, newRecoveryNote.trim());
      showToast('Recovery note recorded successfully', 'success');
      setNewRecoveryNote('');
      fetchLoan();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add recovery note', 'error');
    } finally {
      setSubmittingNote(false);
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

  const handleViewReceipt = (payment) => {
    setSelectedReceipt({
      ...payment,
      receiptNumber: payment.receiptNumber || `REC-${payment.paymentId}`,
      customerName: loan.customer?.fullName || loan.customerName,
      customerPhone: payment.customerPhone || loan.customer?.phone,
      loanId: loan.loanId,
      paymentAmount: payment.amount,
      previousOutstanding: payment.previousOutstanding ?? (loan.outstandingAmount + payment.amount),
      currentOutstanding: payment.currentOutstanding ?? loan.outstandingAmount,
      paymentMethod: payment.paymentMethod || 'Cash',
      collectedBy: payment.collectedByName || payment.recoveryStaffName || payment.staffName || 'Staff',
      notes: payment.notes || '',
    });
    setIsReceiptModalOpen(true);
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

      {/* LOAN ASSIGNMENT & AUDIT CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Loan Assignment & Governance
            </h3>
            <p className="text-[11px] text-slate-400">Field staff and recovery officer assignments with admin audit trail</p>
          </div>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenAssignModal}
              className="flex items-center gap-1.5 self-start sm:self-auto"
            >
              <UserCheck className="w-3.5 h-3.5" /> Manage Assignments
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Normal Staff Assignment */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Assigned Staff (Field Officer)
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${loan.assignedStaff ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'}`}>
                {loan.assignedStaff ? 'Assigned' : 'Unassigned'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {loan.assignedStaff?.name || (typeof loan.assignedStaff === 'string' ? loan.assignedStaff : 'None')}
            </p>
            {loan.assignedStaff?.email && (
              <p className="text-[11px] text-slate-500">{loan.assignedStaff.email}</p>
            )}
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-0.5">
              <p>
                <strong className="text-slate-600">Assignment Date: </strong>
                {loan.staffAssignedAt ? formatDate(loan.staffAssignedAt) : 'N/A'}
              </p>
              <p>
                <strong className="text-slate-600">Assigned By: </strong>
                {loan.staffAssignedBy?.name || (typeof loan.staffAssignedBy === 'string' ? loan.staffAssignedBy : 'Administrator')}
              </p>
            </div>
          </div>

          {/* Recovery Staff Assignment */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Assigned Recovery Staff
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${loan.assignedRecoveryStaff ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                {loan.assignedRecoveryStaff ? 'Assigned' : 'Unassigned'}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {loan.assignedRecoveryStaff?.name || (typeof loan.assignedRecoveryStaff === 'string' ? loan.assignedRecoveryStaff : 'None')}
            </p>
            {loan.assignedRecoveryStaff?.email && (
              <p className="text-[11px] text-slate-500">{loan.assignedRecoveryStaff.email}</p>
            )}
            <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-500 space-y-0.5">
              <p>
                <strong className="text-slate-600">Assignment Date: </strong>
                {loan.recoveryAssignedAt ? formatDate(loan.recoveryAssignedAt) : 'N/A'}
              </p>
              <p>
                <strong className="text-slate-600">Assigned By: </strong>
                {loan.recoveryAssignedBy?.name || (typeof loan.recoveryAssignedBy === 'string' ? loan.recoveryAssignedBy : 'Administrator')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RECOVERY STATUS & FOLLOW-UP SYSTEM */}
      {(isAdmin || isRecoveryStaff) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Recovery Follow-up & Status Tracker
              </h3>
              <p className="text-[11px] text-slate-400">Log borrower communications, promise-to-pay updates, and recovery status</p>
            </div>

            {/* Quick Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-600">Status:</span>
              <select
                value={loan.recoveryStatus || 'pending'}
                onChange={(e) => handleUpdateRecoveryStatus(e.target.value)}
                disabled={updatingStatus}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="promise_to_pay">Promise to Pay</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="unable_to_contact">Unable to Contact</option>
                <option value="follow_up_required">Follow-up Required</option>
              </select>
            </div>
          </div>

          {/* Add Recovery Note Form */}
          <form onSubmit={handleAddRecoveryNote} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Add Recovery Note / Interaction Log</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newRecoveryNote}
                onChange={(e) => setNewRecoveryNote(e.target.value)}
                placeholder="E.g., Called borrower Ramesh; promised to pay ₹5,000 on Friday via UPI..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
              <Button type="submit" size="sm" disabled={submittingNote || !newRecoveryNote.trim()} className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                {submittingNote ? 'Saving...' : 'Add Note'}
              </Button>
            </div>
          </form>

          {/* Recovery History Timeline */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              Recovery Interaction History
            </h4>
            {loan.recoveryNotes && loan.recoveryNotes.length > 0 ? (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {loan.recoveryNotes.map((noteItem, idx) => (
                  <div key={noteItem._id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-slate-700">
                        {noteItem.addedByName || noteItem.addedBy || 'Staff'}
                      </span>
                      <span>{noteItem.createdAt ? formatDate(noteItem.createdAt) : ''}</span>
                    </div>
                    <p className="text-slate-700">{noteItem.note}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No recovery interaction notes recorded yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* COMPLETE PAYMENT HISTORY TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Complete Payment History
            </h3>
            <p className="text-[11px] text-slate-400">All recorded payments, verified receipts, and outstanding timelines</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {loan.payments?.length || 0} Payments Recorded
          </span>
        </div>

        {loan.payments && loan.payments.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3.5 py-2.5">Date</th>
                  <th className="px-3.5 py-2.5">Receipt No</th>
                  <th className="px-3.5 py-2.5">Amount</th>
                  <th className="px-3.5 py-2.5">Method</th>
                  <th className="px-3.5 py-2.5">Collected By</th>
                  <th className="px-3.5 py-2.5">Remaining Balance</th>
                  <th className="px-3.5 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {loan.payments.map((p, pIdx) => {
                  const receiptNo = p.receiptNumber || `REC-${p.paymentId || p._id?.substring(0, 8)}`;
                  const collector = p.collectedByName || p.recoveryStaffName || p.staffName || 'Staff';
                  const balance = p.currentOutstanding ?? (p.loan?.outstandingAmount ?? 'N/A');

                  return (
                    <tr key={p._id || pIdx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2.5 font-medium text-slate-800">
                        {formatDate(p.paymentDate || p.createdAt)}
                      </td>
                      <td className="px-3.5 py-2.5 font-mono font-semibold text-emerald-600">
                        {receiptNo}
                      </td>
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-3.5 py-2.5 uppercase text-[11px] font-medium text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100">{p.paymentMethod || 'Cash'}</span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-700">
                        {collector}
                      </td>
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                        {typeof balance === 'number' ? formatCurrency(balance) : balance}
                      </td>
                      <td className="px-3.5 py-2.5 text-center">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => handleViewReceipt(p)}
                          className="inline-flex items-center gap-1 text-[11px]"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No payments have been recorded for this loan yet.
          </div>
        )}
      </div>

      {/* Payment Schedule Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Amortization & Payment Schedule</h3>
            <p className="text-[11px] text-slate-400">Installments with real-time due dates, days remaining, and overdue status</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {loan.schedule?.length || 0} Installments
          </span>
        </div>
        <PaymentSchedule schedule={loan.schedule} />
      </div>

      {/* Assign Staff & Recovery Staff Modal (Admin Only) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Manage Loan Assignments</h3>
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
              {/* Field Staff Assignment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Staff (Normal Staff / Field Officer)
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Remove / No Staff Assigned --</option>
                  {staffList
                    .filter((st) => st.role === 'staff' || !st.role)
                    .map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.email})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Responsible for standard loan operations.</p>
              </div>

              {/* Recovery Staff Assignment */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Assigned Recovery Staff (Collections Officer)
                </label>
                <select
                  value={selectedRecoveryStaffId}
                  onChange={(e) => setSelectedRecoveryStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Remove / No Recovery Staff Assigned --</option>
                  {staffList
                    .filter((st) => st.role === 'recovery_staff')
                    .map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.name} ({st.email})
                      </option>
                    ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Responsible for recovery follow-ups and overdue tracking.</p>
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
                  {assignSubmitting ? 'Saving...' : 'Save Assignments'}
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
          onPaymentSuccess={(newPayment) => {
            fetchLoan();
            if (newPayment) {
              handleViewReceipt(newPayment);
            }
          }}
        />
      )}

      {/* Payment Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
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
