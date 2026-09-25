import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';
import Button from '../common/Button';
import { ArrowRight, CalendarClock } from 'lucide-react';

export default function UpcomingPayments({ payments = [], onRecordPayment }) {
  const navigate = useNavigate();

  if (payments.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center">
        <CalendarClock className="w-8 h-8 mb-2 text-slate-300" />
        No upcoming payments due in the immediate schedule.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Loan ID</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {payments.map((p, index) => (
            <tr key={index} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 font-medium text-slate-900">
                <div>{p.customerName}</div>
                <div className="text-[10px] text-slate-400">{p.customerId}</div>
              </td>
              <td className="px-4 py-3 font-mono font-medium text-slate-700">
                <button
                  onClick={() => navigate(`/loans/${p.loanMongoId}`)}
                  className="hover:text-emerald-600 underline-offset-2 hover:underline"
                >
                  {p.loanId}
                </button>
              </td>
              <td className="px-4 py-3 text-slate-600">{formatDate(p.dueDate)}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">
                {formatCurrency(p.amount)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                    p.status === 'overdue'
                      ? 'bg-rose-100 text-rose-700'
                      : p.status === 'partially_paid'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {p.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onRecordPayment && onRecordPayment(p)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold hover:underline"
                >
                  Collect
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
