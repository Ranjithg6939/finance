import React from 'react';
import { formatDate } from '../../utils/date';
import { formatCurrency } from '../../utils/currency';

export default function PaymentSchedule({ schedule = [] }) {
  if (!schedule || schedule.length === 0) {
    return (
      <div className="py-8 text-center text-slate-400 text-xs">
        No payment schedule generated yet.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Paid</span>;
      case 'partially_paid':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Partially Paid</span>;
      case 'overdue':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">Overdue</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">Pending</span>;
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-3.5 py-2.5">#</th>
            <th className="px-3.5 py-2.5">Due Date</th>
            <th className="px-3.5 py-2.5">Principal</th>
            <th className="px-3.5 py-2.5">Interest</th>
            <th className="px-3.5 py-2.5">Total</th>
            <th className="px-3.5 py-2.5">Paid</th>
            <th className="px-3.5 py-2.5">Balance</th>
            <th className="px-3.5 py-2.5 text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {schedule.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50/70 transition-colors">
              <td className="px-3.5 py-2.5 font-medium text-slate-500">
                {item.installmentNumber || index + 1}
              </td>
              <td className="px-3.5 py-2.5 font-medium text-slate-800">
                {formatDate(item.dueDate)}
              </td>
              <td className="px-3.5 py-2.5 text-slate-600">
                {formatCurrency(item.principalDue)}
              </td>
              <td className="px-3.5 py-2.5 text-amber-600 font-medium">
                {formatCurrency(item.interestDue)}
              </td>
              <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                {formatCurrency(item.totalDue)}
              </td>
              <td className="px-3.5 py-2.5 text-emerald-600 font-medium">
                {formatCurrency(item.paidAmount || 0)}
              </td>
              <td className="px-3.5 py-2.5 text-slate-700">
                {formatCurrency(item.remainingBalance !== undefined ? item.remainingBalance : item.totalDue - (item.paidAmount || 0))}
              </td>
              <td className="px-3.5 py-2.5 text-center">
                {getStatusBadge(item.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
