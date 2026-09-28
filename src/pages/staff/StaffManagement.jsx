import React, { useState, useEffect } from 'react';
import { staffService } from '../../services/staffService';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle,
  XCircle,
  KeyRound,
  Edit2,
  UserCheck,
  UserX,
  Eye,
  X,
} from 'lucide-react';

export default function StaffManagement() {
  const { showToast } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff',
    status: 'active',
  });
  const [formErrors, setFormErrors] = useState({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffService.getAll({ search, status: statusFilter });
      setStaffList(res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'staff',
      status: 'active',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (staff) => {
    setSelectedStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      phone: staff.phone || '',
      role: staff.role || 'staff',
      status: staff.status || 'active',
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleOpenResetPassword = (staff) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleViewDetails = async (staff) => {
    setSelectedStaff(staff);
    try {
      const res = await staffService.getById(staff._id);
      setSelectedStaffDetails(res.data);
      setIsDetailsOpen(true);
    } catch (err) {
      showToast('Failed to load detailed staff metrics', 'error');
    }
  };

  const validateStaffForm = (isEdit = false) => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Valid email is required';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone && cleanPhone.length !== 10) {
      errs.phone = 'Mobile number must be exactly 10 digits';
    }

    if (!isEdit) {
      if (!formData.password || formData.password.length < 6) {
        errs.password = 'Password must be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        errs.confirmPassword = 'Passwords do not match';
      }
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateStaffForm(false)) return;

    try {
      setFormSubmitting(true);
      await staffService.create(formData);
      showToast('Staff account created successfully', 'success');
      setIsAddModalOpen(false);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to create staff', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateStaffForm(true)) return;

    try {
      setFormSubmitting(true);
      await staffService.update(selectedStaff._id, formData);
      showToast('Staff member updated successfully', 'success');
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update staff', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'active' ? 'inactive' : 'active';
    const confirmMsg =
      nextStatus === 'inactive'
        ? `Are you sure you want to deactivate ${staff.name}? They will immediately be denied login access.`
        : `Activate ${staff.name}'s account?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await staffService.toggleStatus(staff._id, nextStatus);
      showToast(`Staff member marked as ${nextStatus}`, 'success');
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    try {
      await staffService.resetPassword(selectedStaff._id, newPassword);
      showToast(`Password successfully reset for ${selectedStaff.name}`, 'success');
      setIsPasswordModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reset password', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Staff Management</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage field executives, activate/deactivate accounts, and monitor recovery performance
          </p>
        </div>

        <Button onClick={handleOpenAdd} size="sm" className="flex items-center gap-1.5 self-start sm:self-auto">
          <UserPlus className="w-4 h-4" /> Add New Staff
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-700"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <Loader text="Loading staff records..." />
      ) : staffList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No staff members found</p>
          <p className="text-xs mt-1">Get started by creating your first field staff account.</p>
          <Button onClick={handleOpenAdd} size="sm" className="mt-4">
            <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Staff Member
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Staff Executive</th>
                  <th className="px-4 py-3.5">Mobile Number</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned Customers</th>
                  <th className="px-4 py-3.5">Active Loans</th>
                  <th className="px-4 py-3.5">Total Recovered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                          {st.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{st.name}</p>
                          <p className="text-[11px] text-slate-400">{st.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{st.phone || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 font-semibold capitalize text-slate-700">
                        <Shield className="w-3 h-3 text-slate-400" /> {st.role}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          st.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {st.status === 'active' ? (
                          <CheckCircle className="w-2.5 h-2.5" />
                        ) : (
                          <XCircle className="w-2.5 h-2.5" />
                        )}
                        {st.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {st.assignedCustomersCount ?? 0}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {st.assignedActiveLoansCount ?? 0}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-emerald-700 font-mono">
                      {formatCurrency(st.totalCollections || 0)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(st)}
                          title="View Staff Details"
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(st)}
                          title="Edit Staff"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenResetPassword(st)}
                          title="Reset Password"
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(st)}
                          title={st.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            st.status === 'active'
                              ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                              : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {st.status === 'active' ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Staff Account</h3>
                <p className="text-xs text-slate-500">Provide staff login details and permissions</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Arun Prakash"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
                {formErrors.name && <p className="text-rose-600 mt-1">{formErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="staff@finance.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.email && <p className="text-rose-600 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number (10 Digits)</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="9876543211"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.phone && <p className="text-rose-600 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.password && <p className="text-rose-600 mt-1">{formErrors.password}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    placeholder="Repeat password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.confirmPassword && (
                    <p className="text-rose-600 mt-1">{formErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="staff">Staff Executive</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={formSubmitting}>
                  {formSubmitting ? 'Creating...' : 'Create Staff Account'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Staff Member</h3>
                <p className="text-xs text-slate-500">Update profile and permissions</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="staff">Staff Executive</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={formSubmitting}>
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isPasswordModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-500">For {selectedStaff.name}</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">New Password *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff Details Drawer */}
      {isDetailsOpen && selectedStaffDetails && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStaffDetails.name}</h3>
                <p className="text-xs text-slate-500">{selectedStaffDetails.email}</p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Customers</span>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {selectedStaffDetails.metrics?.assignedCustomersCount || 0}
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Loans</span>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  {selectedStaffDetails.metrics?.assignedActiveLoansCount || 0}
                </p>
              </div>
              <div className="col-span-2 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Total Collected</span>
                <p className="text-xl font-bold text-emerald-900 mt-1 font-mono">
                  {formatCurrency(selectedStaffDetails.metrics?.totalCollections || 0)}
                </p>
              </div>
            </div>

            {/* Assigned Customers */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Assigned Customers
              </h4>
              {selectedStaffDetails.assignedCustomers?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No assigned customers</p>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {selectedStaffDetails.assignedCustomers?.map((c) => (
                    <div key={c._id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{c.fullName}</p>
                        <p className="text-[11px] text-slate-400">{c.phone}</p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 font-medium">{c.customerId}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Payments Collected */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Recent Collections
              </h4>
              {selectedStaffDetails.recentPayments?.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recent collections</p>
              ) : (
                <div className="space-y-1.5 text-xs">
                  {selectedStaffDetails.recentPayments?.map((p) => (
                    <div key={p._id} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{p.customerName || 'Borrower'}</p>
                        <p className="text-[11px] text-slate-400">{formatDate(p.paymentDate)} • {p.paymentMethod}</p>
                      </div>
                      <span className="font-bold text-emerald-700 font-mono">
                        {formatCurrency(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
