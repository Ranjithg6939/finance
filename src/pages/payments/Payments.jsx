import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Calendar,
  Printer,
  FileCheck,
} from 'lucide-react';

export default function Payments() {
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [methodFilter, setMethodFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await paymentService.getAll({
        paymentMethod: methodFilter !== 'all' ? methodFilter : undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setPayments(res.data || []);
    } catch (err) {
      showToast('Failed to load payments ledger', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, fromDate, toDate]);

  const viewReceipt = async (paymentId) => {
    try {
      const res = await paymentService.getReceipt(paymentId);
      setSelectedReceipt(res.data);
      setIsReceiptModalOpen(true);
    } catch (err) {
      showToast('Failed to retrieve receipt', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Payments Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track all collected installments and transaction receipts</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Method:</span>
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">From:</span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
          <span className="text-slate-400">To:</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Loader text="Loading payments ledger..." />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="There are no payment records matching your filter criteria."
          icon={Receipt}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Loan ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {p.paymentId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{p.customer?.fullName || '—'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{p.customer?.customerId}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      <button
                        onClick={() => navigate(`/loans/${p.loan?._id || p.loan}`)}
                        className="hover:text-emerald-600 hover:underline"
                      >
                        {p.loan?.loanId || 'Loan'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatCurrency(p.principalAmount)}
                    </td>
                    <td className="px-4 py-3 text-amber-600 font-medium">
                      {formatCurrency(p.interestAmount)}
                    </td>
                    <td className="px-4 py-3 capitalize text-slate-700">
                      {p.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => viewReceipt(p._id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] inline-flex items-center gap-1"
                        title="View Official Receipt"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedReceipt && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Payment Acknowledgement Receipt"
        >
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">FinVeda Lending Corp</h4>
                <p className="text-[11px] text-slate-400">Official Payment Voucher</p>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-700">{selectedReceipt.receiptNumber}</span>
                <p className="text-[10px] text-slate-400">{formatDate(selectedReceipt.date)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-slate-400">Borrower:</p>
                <p className="font-bold text-slate-900">{selectedReceipt.customer?.name}</p>
                <p className="text-slate-500 font-mono text-[11px]">{selectedReceipt.customer?.id}</p>
              </div>
              <div>
                <p className="text-slate-400">Loan Reference:</p>
                <p className="font-bold text-slate-900 font-mono">{selectedReceipt.loan?.loanId}</p>
                <p className="text-slate-500 text-[11px]">Principal: {formatCurrency(selectedReceipt.loan?.principalAmount)}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-1.5">
              <div className="flex justify-between font-bold text-sm text-emerald-800">
                <span>Amount Paid:</span>
                <span>{formatCurrency(selectedReceipt.paymentDetails?.amount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Principal Applied:</span>
                <span>{formatCurrency(selectedReceipt.paymentDetails?.principalAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Interest Applied:</span>
                <span>{formatCurrency(selectedReceipt.paymentDetails?.interestAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px] border-t border-slate-100 pt-1">
                <span>Payment Mode:</span>
                <span className="capitalize">{selectedReceipt.paymentDetails?.paymentMethod?.replace('_', ' ')}</span>
              </div>
              {selectedReceipt.paymentDetails?.transactionReference && (
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Reference #:</span>
                  <span className="font-mono">{selectedReceipt.paymentDetails.transactionReference}</span>
                </div>
              )}
            </div>

            <div className="bg-slate-100 p-2.5 rounded-lg flex justify-between text-[11px] text-slate-600 font-medium">
              <span>Remaining Loan Balance:</span>
              <span className="font-bold text-slate-900">
                {formatCurrency(selectedReceipt.paymentDetails?.remainingBalance)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={handlePrint}>
                <Printer className="w-3.5 h-3.5 mr-1" /> Print Voucher
              </Button>
              <Button size="sm" onClick={() => setIsReceiptModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
