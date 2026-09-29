import React, { useRef } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/currency';
import { Printer, Download, CheckCircle, ShieldCheck, Landmark } from 'lucide-react';

export default function PaymentReceiptModal({ isOpen, onClose, receipt }) {
  const receiptRef = useRef();

  if (!receipt) return null;

  const receiptNumber = receipt.receiptNumber || `REC-${receipt.paymentId || '000000'}`;
  const customerName = receipt.customerName || receipt.customer?.fullName || receipt.customer?.name || 'Valued Customer';
  const customerPhone = receipt.customerPhone || receipt.customer?.phone || 'N/A';
  const loanId = receipt.loanId || receipt.loan?.loanId || 'N/A';
  const paymentDate = receipt.paymentDate || receipt.date || new Date().toISOString().split('T')[0];
  const amount = parseFloat(receipt.paymentAmount ?? receipt.amount ?? 0);
  const previousOutstanding = parseFloat(receipt.previousOutstanding ?? 0);
  const currentOutstanding = parseFloat(receipt.currentOutstanding ?? 0);
  const paymentMethod = receipt.paymentMethod || 'Cash';
  const collectedBy = receipt.collectedByName || receipt.collectedBy || receipt.staffName || 'Authorized Staff';
  const notes = receipt.notes || '';
  const transactionRef = receipt.transactionReference || receipt.paymentDetails?.transactionReference;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate text/html printable view or print dialog
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" maxWidth="max-w-lg">
      <div className="space-y-5">
        {/* Printable Receipt Container */}
        <div
          ref={receiptRef}
          id="finveda-receipt-print-area"
          className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-white shadow-sm relative overflow-hidden text-slate-800"
        >
          {/* Watermark / Background stamp */}
          <div className="absolute right-4 bottom-12 opacity-[0.04] pointer-events-none select-none">
            <Landmark className="w-56 h-56" />
          </div>

          {/* Header & FinVeda Branding */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-4 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shrink-0">
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">FinVeda</h2>
                <p className="text-[11px] text-slate-500 font-medium">Finance & Micro-Lending Management</p>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle className="w-3 h-3" /> Paid & Verified
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 mt-1">{receiptNumber}</p>
            </div>
          </div>

          {/* Customer & Loan Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs mb-4">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Customer Name</p>
              <p className="font-semibold text-slate-800 mt-0.5 break-words">{customerName}</p>
              <p className="text-[11px] text-slate-500">{customerPhone}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[11px] font-medium text-slate-400">Loan Account</p>
              <p className="font-semibold font-mono text-slate-800 mt-0.5">{loanId}</p>
              <p className="text-[11px] text-slate-500">Date: {paymentDate}</p>
            </div>
          </div>

          {/* Payment Amount Display */}
          <div className="text-center py-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 rounded-xl border border-emerald-100/80 mb-4">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">Amount Received</p>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5 break-words">{formatCurrency(amount)}</p>
          </div>

          {/* Details Table */}
          <div className="space-y-2 text-xs border-b border-slate-200 pb-4 mb-4">
            <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
              <span className="text-slate-500">Previous Outstanding</span>
              <span className="font-medium text-slate-700 text-right">{formatCurrency(previousOutstanding)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
              <span className="text-slate-500">Payment Deducted</span>
              <span className="font-bold text-emerald-600 text-right">- {formatCurrency(amount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
              <span className="font-semibold text-slate-700">Current Outstanding Balance</span>
              <span className="font-bold text-slate-900 text-right">{formatCurrency(currentOutstanding)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-medium text-slate-800 uppercase tracking-wide text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                {paymentMethod}
              </span>
            </div>
            {transactionRef && (
              <div className="flex justify-between py-1 border-b border-slate-100 gap-2">
                <span className="text-slate-500">Ref / Transaction ID</span>
                <span className="font-mono text-slate-700 break-all text-right">{transactionRef}</span>
              </div>
            )}
            <div className="flex justify-between py-1 gap-2">
              <span className="text-slate-500">Collected By</span>
              <span className="font-medium text-slate-800 text-right">{collectedBy}</span>
            </div>
            {notes && (
              <div className="pt-1 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-600">Notes: </span>
                <span className="break-words">{notes}</span>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 text-center sm:text-left">
            <div className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Digital Receipt</span>
            </div>
            <p>FinVeda System Generated</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto justify-center">
            Close
          </Button>
          <Button variant="secondary" onClick={handleDownload} className="w-full sm:w-auto justify-center flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download
          </Button>
          <Button onClick={handlePrint} className="w-full sm:w-auto justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Printer className="w-4 h-4" />
            Print Receipt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
