import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { paymentService } from '../../services/paymentService';
import { formatCurrency } from '../../utils/currency';
import { useApp } from '../../context/AppContext';

export default function PaymentModal({ isOpen, onClose, loan, onPaymentSuccess }) {
  const { showToast } = useApp();
  const [amount, setAmount] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [interestAmount, setInterestAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loan) {
      setAmount('');
      setPrincipalAmount('');
      setInterestAmount('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
      setTransactionReference('');
      setNotes('');
    }
  }, [loan, isOpen]);

  // Handle amount change and auto estimate principal vs interest split
  const handleAmountChange = (e) => {
    const val = e.target.value;
    setAmount(val);
    const num = parseFloat(val) || 0;

    if (loan && loan.totalPayable > 0) {
      const interestRatio = (loan.totalInterest || 0) / loan.totalPayable;
      const estimatedInterest = Math.round(num * interestRatio);
      const estimatedPrincipal = Math.max(0, num - estimatedInterest);
      setInterestAmount(estimatedInterest > 0 ? estimatedInterest.toString() : '');
      setPrincipalAmount(estimatedPrincipal > 0 ? estimatedPrincipal.toString() : '');
    }
  };

  if (!loan) return null;

  const prevOutstanding = loan.outstandingAmount || 0;
  const payAmount = parseFloat(amount) || 0;
  const remaining = Math.max(0, prevOutstanding - payAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || payAmount <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await paymentService.create({
        loanId: loan._id,
        customerId: loan.customer?._id || loan.customer,
        amount: payAmount,
        principalAmount: parseFloat(principalAmount) || 0,
        interestAmount: parseFloat(interestAmount) || 0,
        paymentDate,
        paymentMethod,
        transactionReference,
        notes,
      });

      showToast(res.message || 'Payment recorded successfully', 'success');
      if (onPaymentSuccess) onPaymentSuccess(res.data);
      onClose();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Loan & Customer summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-400">Customer:</span>
            <p className="font-semibold text-slate-800">
              {loan.customer?.fullName || 'Selected Customer'}
            </p>
          </div>
          <div>
            <span className="text-slate-400">Loan ID:</span>
            <p className="font-semibold text-slate-800 font-mono">{loan.loanId}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Payment Date"
            type="date"
            name="paymentDate"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />

          <Input
            label="Payment Amount (₹)"
            type="number"
            name="amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="e.g. 10000"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Principal Component (₹)"
            type="number"
            name="principalAmount"
            value={principalAmount}
            onChange={(e) => setPrincipalAmount(e.target.value)}
            placeholder="Auto-calculated"
          />

          <Input
            label="Interest Component (₹)"
            type="number"
            name="interestAmount"
            value={interestAmount}
            onChange={(e) => setInterestAmount(e.target.value)}
            placeholder="Auto-calculated"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs bg-white focus:outline-none focus:border-emerald-500"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            label="Transaction Reference"
            name="transactionReference"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
            placeholder="e.g. UPI / Cheque / UTR #"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
          <textarea
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional payment notes..."
            className="w-full rounded-lg border border-slate-300 py-2 px-3 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Live Calculation Confirmation Box */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-1.5">
          <p className="font-semibold text-emerald-900 text-xs uppercase tracking-wide">Balance Preview</p>
          <div className="flex justify-between text-slate-600">
            <span>Previous Outstanding:</span>
            <span className="font-medium text-slate-900">{formatCurrency(prevOutstanding)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Payment:</span>
            <span className="font-semibold text-emerald-700">- {formatCurrency(payAmount)}</span>
          </div>
          <div className="flex justify-between border-t border-emerald-200 pt-1.5 font-bold text-slate-900">
            <span>Remaining Balance:</span>
            <span className={remaining === 0 ? 'text-emerald-700 font-extrabold' : 'text-slate-900'}>
              {formatCurrency(remaining)} {remaining === 0 && '(Fully Settled)'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
