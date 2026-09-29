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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDueInfo = (item) => {
    const remainingBalance = item.remainingBalance !== undefined ? item.remainingBalance : item.totalDue - (item.paidAmount || 0);

    if (item.status === 'paid' || remainingBalance <= 0) {
      return {
        badge: <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">Paid</span>,
        daysRemaining: '-',
        daysOverdue: '-',
      };
    }

    const dueDate = new Date(item.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const isPartial = item.paidAmount > 0 && remainingBalance > 0;

    if (diffDays < 0) {
      return {
        badge: (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
            {isPartial ? 'Partially Paid (Overdue)' : 'Overdue'}
          </span>
        ),
        daysRemaining: '-',
        daysOverdue: <span className="text-rose-600 font-semibold">{Math.abs(diffDays)} days</span>,
      };
    } else if (diffDays === 0) {
      return {
        badge: (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-white animate-pulse">
            Due Today
          </span>
        ),
        daysRemaining: <span className="text-amber-600 font-bold">Due Today</span>,
        daysOverdue: '-',
      };
    } else {
      return {
        badge: isPartial ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
            Partially Paid
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
            Upcoming
          </span>
        ),
        daysRemaining: <span className="text-blue-600 font-medium">{diffDays} days</span>,
        daysOverdue: '-',
      };
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-xs text-slate-600">
        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
          <tr>
            <th className="px-3.5 py-2.5">#</th>
            <th className="px-3.5 py-2.5">Due Date</th>
            <th className="px-3.5 py-2.5">Due Amount</th>
            <th className="px-3.5 py-2.5">Paid Amount</th>
            <th className="px-3.5 py-2.5">Remaining Balance</th>
            <th className="px-3.5 py-2.5">Days Remaining</th>
            <th className="px-3.5 py-2.5">Days Overdue</th>
            <th className="px-3.5 py-2.5 text-center">Payment Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {schedule.map((item, index) => {
            const dueInfo = getDueInfo(item);
            const remaining = item.remainingBalance !== undefined ? item.remainingBalance : item.totalDue - (item.paidAmount || 0);

            return (
              <tr key={index} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-3.5 py-2.5 font-medium text-slate-500">
                  {item.installmentNumber || index + 1}
                </td>
                <td className="px-3.5 py-2.5 font-medium text-slate-800">
                  {formatDate(item.dueDate)}
                </td>
                <td className="px-3.5 py-2.5 font-semibold text-slate-900">
                  {formatCurrency(item.totalDue)}
                </td>
                <td className="px-3.5 py-2.5 text-emerald-600 font-medium">
                  {formatCurrency(item.paidAmount || 0)}
                </td>
                <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                  {formatCurrency(remaining)}
                </td>
                <td className="px-3.5 py-2.5">
                  {dueInfo.daysRemaining}
                </td>
                <td className="px-3.5 py-2.5">
                  {dueInfo.daysOverdue}
                </td>
                <td className="px-3.5 py-2.5 text-center">
                  {dueInfo.badge}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
