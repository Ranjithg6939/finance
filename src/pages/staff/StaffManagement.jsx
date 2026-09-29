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
  Trash2,
  X,
  Lock,
  CheckSquare,
  Square,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { PERMISSION_CATEGORIES, DEFAULT_PERMISSIONS, ROLES } from '../../utils/permissions';

export default function StaffManagement() {
  const { showToast } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleTab, setRoleTab] = useState('all'); // 'all' | 'staff' | 'recovery_staff'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isConfirmStatusModalOpen, setIsConfirmStatusModalOpen] = useState(false);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState(null);

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

  // Permissions state
  const [userPermissions, setUserPermissions] = useState([]);
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = { search, status: statusFilter };
      if (roleTab !== 'all') {
        params.role = roleTab;
      }
      const res = await staffService.getAll(params);
      setStaffList(res.data || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load staff list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, statusFilter, roleTab]);

  // Counts for tabs
  const allCount = staffList.length;
  const staffOnlyCount = staffList.filter((s) => s.role === 'staff').length;
  const recoveryOnlyCount = staffList.filter((s) => s.role === 'recovery_staff').length;

  const handleOpenAdd = (presetRole = 'staff') => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: presetRole,
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

  const handleOpenPermissions = (staff) => {
    setSelectedStaff(staff);
    // Initialize permissions from staff, or fallback to default for their role
    const current = Array.isArray(staff.permissions) && staff.permissions.length > 0
      ? [...staff.permissions]
      : DEFAULT_PERMISSIONS[staff.role] || [];
    setUserPermissions(current);
    setIsPermissionsModalOpen(true);
  };

  const handleOpenStatusConfirm = (staff) => {
    setSelectedStaff(staff);
    setIsConfirmStatusModalOpen(true);
  };

  const handleOpenDeleteConfirm = (staff) => {
    setSelectedStaff(staff);
    setIsConfirmDeleteModalOpen(true);
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

  // Strict Validation:
  // Name letters & spaces only, mobile exactly 10 digits, password 6+ chars
  const validateStaffForm = (isEdit = false) => {
    const errs = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errs.name = 'Full name is required';
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      errs.name = 'Name must contain only letters and spaces';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'A valid email address is required';
    }

    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (!cleanPhone) {
      errs.phone = 'Mobile number is required';
    } else if (cleanPhone.length !== 10) {
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
      await staffService.create({
        ...formData,
        phone: formData.phone.replace(/\D/g, ''),
      });
      showToast(
        `${formData.role === 'recovery_staff' ? 'Recovery Staff' : 'Staff'} account created successfully`,
        'success'
      );
      setIsAddModalOpen(false);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to create staff account', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateStaffForm(true)) return;

    try {
      setFormSubmitting(true);
      await staffService.update(selectedStaff._id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        role: formData.role,
        status: formData.status,
      });
      showToast('Staff member details updated successfully', 'success');
      setIsEditModalOpen(false);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update staff', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatusConfirm = async () => {
    if (!selectedStaff) return;
    const nextStatus = selectedStaff.status === 'active' ? 'inactive' : 'active';
    try {
      await staffService.toggleStatus(selectedStaff._id, nextStatus);
      showToast(`User marked as ${nextStatus}`, 'success');
      setIsConfirmStatusModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;
    try {
      await staffService.delete(selectedStaff._id);
      showToast('User deleted successfully. Assignments have been cleared.', 'success');
      setIsConfirmDeleteModalOpen(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', 'error');
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

  // Permission Checkbox Handlers
  const handleTogglePermission = (permKey) => {
    setUserPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  const handleToggleGroup = (category) => {
    const groupKeys = category.permissions.map((p) => p.key);
    const allSelected = groupKeys.every((k) => userPermissions.includes(k));

    if (allSelected) {
      setUserPermissions((prev) => prev.filter((k) => !groupKeys.includes(k)));
    } else {
      setUserPermissions((prev) => Array.from(new Set([...prev, ...groupKeys])));
    }
  };

  const handleApplyDefaultPermissions = () => {
    if (!selectedStaff) return;
    const defaults = DEFAULT_PERMISSIONS[selectedStaff.role] || [];
    setUserPermissions([...defaults]);
    showToast(`Applied default permissions for ${selectedStaff.role}`, 'info');
  };

  const handleSavePermissions = async () => {
    if (!selectedStaff) return;
    try {
      setPermissionSubmitting(true);
      await staffService.updatePermissions(selectedStaff._id, userPermissions);
      showToast(`Permissions updated for ${selectedStaff.name}`, 'success');
      setIsPermissionsModalOpen(false);
      fetchStaff();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update permissions', 'error');
    } finally {
      setPermissionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Staff & Recovery Management</h2>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Create staff and recovery officers, configure individual permissions, and manage access
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            onClick={() => handleOpenAdd('staff')}
            size="sm"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <UserPlus className="w-3.5 h-3.5" /> + Add Staff
          </Button>

          <Button
            onClick={() => handleOpenAdd('recovery_staff')}
            size="sm"
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
          >
            <Shield className="w-3.5 h-3.5" /> + Add Recovery Staff
          </Button>
        </div>
      </div>

      {/* Role Navigation Tabs */}
      <div className="border-b border-slate-200 bg-white px-3 sm:px-4 pt-2 rounded-t-xl overflow-x-auto scrollbar-none">
        <div className="flex gap-2 whitespace-nowrap min-w-max pb-1">
          <button
            onClick={() => setRoleTab('all')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              roleTab === 'all'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            All Staff ({staffList.length})
          </button>

          <button
            onClick={() => setRoleTab('staff')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              roleTab === 'staff'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Operational Staff ({roleTab === 'all' ? staffOnlyCount : staffList.length})
          </button>

          <button
            onClick={() => setRoleTab('recovery_staff')}
            className={`px-3.5 sm:px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              roleTab === 'recovery_staff'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Recovery Staff ({roleTab === 'all' ? recoveryOnlyCount : staffList.length})
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-b-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none text-slate-700"
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
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No members found</p>
          <p className="text-xs mt-1">Get started by creating your first team member.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-2.5 sm:gap-3 mt-4">
            <Button onClick={() => handleOpenAdd('staff')} size="sm" className="w-full sm:w-auto justify-center">
              <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Staff
            </Button>
            <Button onClick={() => handleOpenAdd('recovery_staff')} size="sm" className="w-full sm:w-auto justify-center bg-amber-600 hover:bg-amber-700">
              <Shield className="w-3.5 h-3.5 mr-1" /> Add Recovery Staff
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto w-full touch-scroll">
            <table className="w-full text-left text-xs min-w-[780px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold whitespace-nowrap">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Mobile Number</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Permissions</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Assigned Cases</th>
                  <th className="px-4 py-3.5">Total Recovered</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.map((st) => {
                  const isRec = st.role === 'recovery_staff';
                  return (
                    <tr key={st._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${
                              isRec ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
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
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isRec
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          <Shield className="w-2.5 h-2.5" />
                          {isRec ? 'Recovery Staff' : 'Staff'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleOpenPermissions(st)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border border-slate-200"
                        >
                          <KeyRound className="w-3 h-3 text-amber-500" />
                          <span>{st.permissions?.length ?? (DEFAULT_PERMISSIONS[st.role]?.length || 0)} Granted</span>
                        </button>
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
                        <span>{st.assignedCustomersCount ?? 0} Borrowers</span>
                        <span className="text-slate-400 mx-1">•</span>
                        <span>{st.assignedActiveLoansCount ?? 0} Loans</span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-700 font-mono">
                        {formatCurrency(st.totalCollections || 0)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDetails(st)}
                            title="View Metrics"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenPermissions(st)}
                            title="Manage Permissions"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenEdit(st)}
                            title="Edit User"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenResetPassword(st)}
                            title="Reset Password"
                            className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenStatusConfirm(st)}
                            title={st.status === 'active' ? 'Deactivate User' : 'Activate User'}
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

                          <button
                            onClick={() => handleOpenDeleteConfirm(st)}
                            title="Delete User"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff / Recovery Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Add New {formData.role === 'recovery_staff' ? 'Recovery Staff' : 'Operational Staff'}
                </h3>
                <p className="text-xs text-slate-500">Provide personal credentials and select system role</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              {/* Role Toggle Selector */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Assign User Role *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'staff' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'staff'
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Staff</span>
                      {formData.role === 'staff' && <CheckCircle className="w-4 h-4 text-blue-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Customer intake, loan creations, collections & documents
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'recovery_staff' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.role === 'recovery_staff'
                        ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Recovery Staff</span>
                      {formData.role === 'recovery_staff' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Field recovery, overdue follow-ups, payment collection & notes
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Full Name (Letters Only) *</label>
                <input
                  type="text"
                  placeholder="e.g. Ravi Shankar"
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
                    placeholder="user@finance.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.email && <p className="text-rose-600 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="9876543299"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.phone && <p className="text-rose-600 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Password (6+ Chars) *</label>
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

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={formSubmitting}
                  className={formData.role === 'recovery_staff' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  {formSubmitting ? 'Creating...' : `Create ${formData.role === 'recovery_staff' ? 'Recovery Staff' : 'Staff'}`}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit User Profile</h3>
                <p className="text-xs text-slate-500">Update contact and operational role</p>
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
                <label className="block font-medium text-slate-700 mb-1">Full Name (Letters Only) *</label>
                <input
                  type="text"
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.email && <p className="text-rose-600 mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Mobile Number (10 Digits) *</label>
                  <input
                    type="text"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                  {formErrors.phone && <p className="text-rose-600 mt-1">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">User Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none capitalize"
                  >
                    <option value="staff">Staff</option>
                    <option value="recovery_staff">Recovery Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Account Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none capitalize"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
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

      {/* MANAGE PERMISSIONS MODAL (Admin Only) */}
      {isPermissionsModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manage Permissions for {selectedStaff.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedStaff.role === 'recovery_staff'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedStaff.role === 'recovery_staff' ? 'Recovery Staff' : 'Operational Staff'}
                    </span>
                    <span className="text-xs text-slate-400">{selectedStaff.email}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPermissionsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">
                {userPermissions.length} active permissions enabled
              </span>
              <button
                type="button"
                onClick={handleApplyDefaultPermissions}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" /> Reset to Role Defaults
              </button>
            </div>

            {/* Grouped Permission Categories */}
            <div className="space-y-4">
              {PERMISSION_CATEGORIES.map((category) => {
                const groupKeys = category.permissions.map((p) => p.key);
                const allChecked = groupKeys.every((k) => userPermissions.includes(k));
                const someChecked = groupKeys.some((k) => userPermissions.includes(k)) && !allChecked;

                // Profit / Financials category is locked / admin only
                const isRestrictedCategory = category.id === 'reports';

                return (
                  <div
                    key={category.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs"
                  >
                    <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-b border-slate-200">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {category.name}
                          {isRestrictedCategory && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              Admin Restricted
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-slate-400">{category.description}</p>
                      </div>

                      {!isRestrictedCategory && (
                        <button
                          type="button"
                          onClick={() => handleToggleGroup(category)}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          {allChecked ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {category.permissions.map((perm) => {
                        const isChecked = userPermissions.includes(perm.key);
                        const isProfitPerm = perm.key === 'profit_view' || perm.key === 'financials_view';

                        return (
                          <label
                            key={perm.key}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border transition-all ${
                              isProfitPerm
                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                : isChecked
                                ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-400/20 cursor-pointer'
                                : 'bg-white border-slate-200 hover:bg-slate-50 cursor-pointer'
                            }`}
                          >
                            <input
                              type="checkbox"
                              disabled={isProfitPerm}
                              checked={isChecked}
                              onChange={() => handleTogglePermission(perm.key)}
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 leading-tight flex items-center gap-1">
                                {perm.label}
                                {isProfitPerm && <Lock className="w-3 h-3 text-slate-400" />}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{perm.desc}</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsPermissionsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSavePermissions}
                disabled={permissionSubmitting}
              >
                {permissionSubmitting ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Deactivate / Activate */}
      {isConfirmStatusModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">
                {selectedStaff.status === 'active' ? 'Deactivate User Account?' : 'Activate User Account?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {selectedStaff.status === 'active'
                  ? `Deactivating ${selectedStaff.name} will immediately block their login sessions. Their assigned customers and loans will remain intact.`
                  : `Are you sure you want to activate ${selectedStaff.name}'s account and allow them to log in?`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2"
                onClick={() => setIsConfirmStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className={`w-1/2 ${
                  selectedStaff.status === 'active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
                onClick={handleToggleStatusConfirm}
              >
                {selectedStaff.status === 'active' ? 'Yes, Deactivate' : 'Yes, Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete User */}
      {isConfirmDeleteModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete User Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong>{selectedStaff.name}</strong>?
                All assigned customers and loan follow-ups will be unassigned automatically. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2"
                onClick={() => setIsConfirmDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleDeleteConfirm}
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {isPasswordModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Reset Password</h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-xs">
              <p className="text-slate-500">
                Enter a new password for <strong>{selectedStaff.name}</strong> ({selectedStaff.email}):
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">New Password (6+ Chars) *</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
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

      {/* Staff Details / Performance Modal */}
      {isDetailsOpen && selectedStaffDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full max-w-[calc(100vw-1.5rem)] p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">User Performance & Portfolio</h3>
                <p className="text-xs text-slate-500">Overview of assigned workload and collections</p>
              </div>
              <button onClick={() => setIsDetailsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Assigned Borrowers</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStaffDetails.stats?.assignedCustomers ?? 0}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Active Loans</p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {selectedStaffDetails.stats?.activeLoans ?? 0}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Total Recovered</p>
                <p className="text-lg font-bold text-emerald-600 mt-1 font-mono">
                  {formatCurrency(selectedStaffDetails.stats?.totalCollected ?? 0)}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[11px] text-slate-400 font-medium">Account Status</p>
                <span
                  className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedStaffDetails.user?.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedStaffDetails.user?.status}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button size="sm" onClick={() => setIsDetailsOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
