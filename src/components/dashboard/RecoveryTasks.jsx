import React from 'react';
import { ListTodo, CheckCircle, PhoneCall } from 'lucide-react';

export default function RecoveryTasks({ tasks = [], onRecordPayment, isAdmin = false }) {
  const taskList = Array.isArray(tasks) ? tasks : [];

  return (
    <div id="tasks" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4 scroll-mt-20 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ListTodo className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-slate-800 break-words">Assigned Tasks & Recovery Follow-ups</h3>
            <p className="text-[11px] text-slate-400">Scheduled dues and borrower contacts requiring immediate attention</p>
          </div>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
          {taskList.length} Priority Tasks
        </span>
      </div>

      {taskList.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {taskList.map((task) => (
            <div key={task.taskId} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900 break-words">{task.customerName}</p>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                      task.status === 'overdue'
                        ? 'bg-rose-100 text-rose-800'
                        : task.status === 'due_today'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {task.status === 'overdue' ? 'Overdue' : task.status === 'due_today' ? 'Due Today' : 'Scheduled'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 break-words">
                  Loan #{task.loanId} • Installment #{task.installmentNumber} • Due Date:{' '}
                  <span className="font-semibold text-slate-700">{task.dueDate}</span>
                  {isAdmin && task.assignedStaffName && (
                    <span className="inline-block sm:inline ml-0 sm:ml-2 text-slate-400">
                      • Staff: <span className="font-semibold text-slate-600">{task.assignedStaffName}</span>
                    </span>
                  )}
                </p>
                {task.customerPhone && (
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-slate-400 shrink-0" /> {task.customerPhone}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
                {task.customerPhone && (
                  <a
                    href={`tel:${task.customerPhone}`}
                    className="flex-1 sm:flex-none justify-center px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                  >
                    <PhoneCall className="w-3 h-3" /> Call
                  </a>
                )}
                <button
                  onClick={() => onRecordPayment(task)}
                  className="flex-1 sm:flex-none justify-center px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-slate-400 text-xs">
          <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          No urgent pending recovery tasks. All assigned installment schedules are up to date!
        </div>
      )}
    </div>
  );
}
