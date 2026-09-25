import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { formatCurrency, maskString } from '../../utils/currency';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import {
  Users,
  Search,
  Plus,
  Filter,
  Eye,
  Edit,
  BadgePercent,
  Trash2,
} from 'lucide-react';

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useApp();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getAll({
        search,
        status: statusFilter,
      });
      setCustomers(res.data || []);
    } catch (err) {
      showToast('Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleDeleteCustomer = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete customer ${name}? All associated loans and payments will also be removed.`)) {
      try {
        await customerService.delete(id);
        showToast('Customer deleted successfully', 'success');
        fetchCustomers();
      } catch (err) {
        showToast('Failed to delete customer', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Customers</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage borrower profiles and loan records</p>
        </div>
        <Button onClick={() => navigate('/customers/new')} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Add Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, customer ID, phone..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      {loading ? (
        <Loader text="Loading customer profiles..." />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Try modifying your search or click below to register a new borrower."
          actionLabel="Add Customer"
          onAction={() => navigate('/customers/new')}
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Customer ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3 text-center">Active Loans</th>
                  <th className="px-4 py-3">Outstanding</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {c.customerId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <div>{c.fullName}</div>
                      <div className="text-[10px] text-slate-400">{c.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      {maskString(c.phone, 3)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                        {c.activeLoansCount || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {formatCurrency(c.totalOutstanding || 0)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                          c.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/customers/${c._id}`)}
                          className="p-1 text-slate-500 hover:text-emerald-600 rounded hover:bg-slate-100"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/loans/new?customer=${c._id}`)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Create Loan"
                        >
                          <BadgePercent className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(c._id, c.fullName)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
