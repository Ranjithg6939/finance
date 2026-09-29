import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">{title}</p>
        {Icon && (
          <div className={`p-2 sm:p-2.5 rounded-xl border shrink-0 ${colorMap[color] || colorMap.emerald}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
      <div className="mt-2.5 sm:mt-3 min-w-0">
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 break-words">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500 truncate">{subtitle}</p>}
      </div>
    </div>
  );
}
