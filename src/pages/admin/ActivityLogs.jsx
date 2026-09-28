import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { formatDateTime } from '../../utils/date';
import Loader from '../../components/common/Loader';
import { History, Shield, Filter, Search, User, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await staffService.getActivityLogs({
        resource: resourceFilter,
        role: roleFilter,
      });
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resourceFilter, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Audit & Activity Logs</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable system audit trail tracking administrative and field staff operations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
          <Filter className="w-4 h-4" /> Filter Trail
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={resourceFilter}
            onChange={(e) => setResourceFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="">All Resources</option>
            <option value="Staff">Staff</option>
            <option value="Customer">Customer</option>
            <option value="Loan">Loan</option>
            <option value="Payment">Payment</option>
            <option value="Auth">Auth</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin Actions</option>
            <option value="staff">Staff Actions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <Loader text="Loading audit events..." />
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <History className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No activity logs found</p>
          <p className="text-xs mt-1">Actions performed by staff and admin will be recorded here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">User & Role</th>
                  <th className="px-4 py-3.5">Action Performed</th>
                  <th className="px-4 py-3.5">Resource Affected</th>
                  <th className="px-4 py-3.5">Resource ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{log.userName || 'System'}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            log.role === 'admin'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      {log.action}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                        <FileText className="w-3 h-3 text-slate-400" /> {log.resource}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-500 text-[11px]">
                      {log.resourceId || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
