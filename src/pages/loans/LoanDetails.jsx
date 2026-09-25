import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loanService } from '../../services/loanService';
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
} from 'lucide-react';

export default function LoanDetails() {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const fetchLoan = async () => {
    try {
      setLoading(true);
      const res = await loanService.getById(loanId);
      setLoan(res.data);
    } catch (err) {
      showToast('Failed to load loan record', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoan();
  }, [loanId]);

  if (loading) {
    return <Loader text="Loading loan summary & amortization schedule..." />;
  }

  if (!loan) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Loan not found</p>
        <Button onClick={() => navigate('/loans/active')} className="mt-4" size="sm">
          Return to Loans
        </Button>
      </div>
    );
  }

  const percentPaid = Math.min(
    100,
    Math.round(((loan.totalPaid || 0) / (loan.totalPayable || 1)) * 100)
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/loans/active')}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Loans
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-mono">
              Loan #{loan.loanId}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                loan.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {loan.status}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 mt-1.5">
            <span className="font-semibold text-slate-900">
              Borrower:{' '}
              <button
                onClick={() => navigate(`/customers/${loan.customer?._id}`)}
                className="text-emerald-600 hover:underline"
              >
                {loan.customer?.fullName}
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
        <div className="flex items-center gap-2.5">
          {loan.status !== 'completed' && (
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

      {/* Payment History & Documents Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment History */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Payment History</h3>
            <span className="text-xs text-slate-400">{loan.payments?.length || 0} Transactions</span>
          </div>

          {loan.payments?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No payments recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {loan.payments?.map((p) => (
                <div key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-mono font-bold text-slate-800">{p.paymentId}</p>
                    <p className="text-[11px] text-slate-400">{formatDate(p.paymentDate)} • <span className="capitalize">{p.paymentMethod}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-700">{formatCurrency(p.amount)}</p>
                    <p className="text-[10px] text-slate-400">Ref: {p.transactionReference || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents & Files */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Loan Documents</h3>
            <Button size="sm" variant="secondary" onClick={() => setIsDocModalOpen(true)}>
              + Upload
            </Button>
          </div>

          {loan.documents?.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">No documents uploaded for this loan.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {loan.documents?.map((d) => (
                <div key={d._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800 truncate max-w-xs">{d.title}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{d.documentType.replace('_', ' ')} • {formatDate(d.createdAt)}</p>
                    </div>
                  </div>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-600 font-semibold hover:underline shrink-0"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        loan={loan}
        onPaymentSuccess={fetchLoan}
      />

      {/* Upload Document Modal */}
      <DocumentUploader
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        preselectedCustomerId={loan.customer?._id}
        preselectedLoanId={loan._id}
        onUploadSuccess={fetchLoan}
      />
    </div>
  );
}
