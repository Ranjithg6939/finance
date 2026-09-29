import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, maskString } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import DocumentUploader from '../../components/documents/DocumentUploader';
import PaymentReceiptModal from '../../components/payments/PaymentReceiptModal';
import {
  ArrowLeft,
  BadgePercent,
  Upload,
  Phone,
  Mail,
  UserCheck,
  Trash2,
  X,
  Receipt,
  Calendar,
  CreditCard,
  Clock,
} from 'lucide-react';

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const prefix = isAdmin ? '/admin' : '/staff';

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Staff Assignment State (Admin Only)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await customerService.getById(customerId);
      setCustomer(res.data);
      if (res.data?.assignedStaff?._id) {
        setSelectedStaffId(res.data.assignedStaff._id);
      } else if (res.data?.assignedStaff) {
        setSelectedStaffId(res.data.assignedStaff);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load customer profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  const handleOpenAssignModal = async () => {
    try {
      const res = await staffService.getAll({ status: 'active' });
      setStaffList(res.data || []);
      setIsAssignModalOpen(true);
    } catch (err) {
      showToast('Failed to load active staff list', 'error');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssignSubmitting(true);
      await customerService.assignStaff(customer._id, selectedStaffId || null);
      showToast('Staff assignment updated successfully', 'success');
      setIsAssignModalOpen(false);
      fetchCustomer();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to assign staff', 'error');
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.fullName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await customerService.delete(customer._id);
      showToast('Customer deleted successfully', 'success');
      navigate(`${prefix}/customers`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete customer', 'error');
    }
  };

  const handleViewReceipt = (p) => {
    setSelectedReceipt({
      ...p,
      receiptNumber: p.receiptNumber || `REC-${p.paymentId || p._id?.substring(0, 8)}`,
      customerName: customer.fullName,
      customerPhone: customer.phone,
      loanId: p.loanId || p.loan?.loanId || 'N/A',
      paymentAmount: p.amount,
      previousOutstanding: p.previousOutstanding ?? 0,
      currentOutstanding: p.currentOutstanding ?? 0,
      paymentMethod: p.paymentMethod || 'Cash',
      collectedBy: p.collectedByName || p.staffName || 'Staff',
      notes: p.notes || '',
    });
    setIsReceiptModalOpen(true);
  };

  if (loading) {
    return <Loader text="Loading customer profile..." />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Customer not found</p>
        <Button onClick={() => navigate(`${prefix}/customers`)} className="mt-4" size="sm">
          Return to Customers
        </Button>
      </div>
    );
  }

  const { summary } = customer;
  const assignedStaffName = customer.assignedStaff?.name || customer.assignedStaffName || 'Unassigned';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(`${prefix}/customers`)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </button>

      {/* Customer Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-emerald-500/20">
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">{customer.fullName}</h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  customer.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {customer.status}
              </span>

              {/* Assigned Staff Tag */}
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                Staff: {assignedStaffName}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="font-mono text-slate-700 font-medium">ID: {customer.customerId}</span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {maskString(customer.phone, 3)}
              </span>
              {customer.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {customer.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Admin Staff Assignment Button */}
          {isAdmin && (
            <Button
              size="sm"
              variant="secondary"
              onClick={handleOpenAssignModal}
              className="flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Assign Staff
            </Button>
          )}

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsDocModalOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
          </Button>

          <Button
            size="sm"
            onClick={() => navigate(`${prefix}/loans/new?customer=${customer._id}`)}
          >
            <BadgePercent className="w-3.5 h-3.5 mr-1.5" /> Create Loan
          </Button>

          {/* Admin Only Delete */}
          {isAdmin && (
            <button
              onClick={handleDeleteCustomer}
              title="Delete Customer"
              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'active_loans', label: `Active Loans (${customer.activeLoans?.length || customer.loans?.filter(l => l.status === 'active')?.length || 0})` },
            { id: 'loan_history', label: `Loan History (${customer.completedLoans?.length || customer.loans?.filter(l => l.status === 'completed')?.length || 0})` },
            { id: 'payments', label: `Payments (${customer.payments?.length || 0})` },
            { id: 'documents', label: `Documents (${customer.documents?.length || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-1 border-b-2 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Metric Cards (Total Loan, Total Paid, Total Outstanding, Payment Count, Last Payment Date, Next Due Date) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Loan</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{summary?.totalLoans || summary?.totalLoan || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Total Paid</span>
              <p className="text-lg font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(summary?.totalPaid || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">Total Outstanding</span>
              <p className="text-lg font-bold text-rose-700 mt-1 font-mono">{formatCurrency(summary?.totalOutstanding || summary?.outstanding || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-indigo-600 uppercase">Payment Count</span>
              <p className="text-lg font-bold text-indigo-700 mt-1">{summary?.paymentCount ?? (customer.payments?.length || 0)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Last Payment Date</span>
              <p className="text-xs font-bold text-slate-800 mt-2">
                {summary?.lastPaymentDate ? formatDate(summary.lastPaymentDate) : 'No payments yet'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-amber-600 uppercase">Next Due Date</span>
              <p className="text-xs font-bold text-amber-800 mt-2">
                {summary?.nextDueDate ? formatDate(summary.nextDueDate) : 'None'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Information</h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="font-medium text-slate-800">{formatDate(customer.dateOfBirth)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Gender:</span>
                  <span className="font-medium text-slate-800">{customer.gender || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Address:</span>
                  <span className="font-medium text-slate-800 text-right">
                    {customer.address?.addressLine || '—'}, {customer.address?.city || ''} {customer.address?.state || ''} {customer.address?.pincode || ''}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Assigned Staff Executive:</span>
                  <span className="font-bold text-emerald-700">{assignedStaffName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">ID ({customer.identification?.idType || 'Aadhaar'}):</span>
                  <span className="font-medium font-mono text-slate-800">{maskString(customer.identification?.idNumber, 4)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">PAN Number:</span>
                  <span className="font-medium font-mono text-slate-800">{maskString(customer.identification?.panNumber, 3)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Employment & References</h3>
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Occupation:</span>
                  <span className="font-medium text-slate-800">{customer.employment?.occupation || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Employment Type:</span>
                  <span className="font-medium text-slate-800">{customer.employment?.employmentType || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Company:</span>
                  <span className="font-medium text-slate-800">{customer.employment?.companyName || '—'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Monthly Income:</span>
                  <span className="font-medium text-slate-800">{formatCurrency(customer.employment?.monthlyIncome)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-medium text-slate-800">
                    {customer.referenceContact?.name || '—'} ({customer.referenceContact?.relationship || '—'}) - {maskString(customer.referenceContact?.phone, 3)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Loans Tab */}
      {activeTab === 'active_loans' && (
        <div className="space-y-4">
          {(!customer.loans || customer.loans.filter(l => l.status === 'active').length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No active loans for this customer.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.loans.filter(l => l.status === 'active').map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigate(`${prefix}/loans/${l._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{l.loanId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 capitalize">
                      {l.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Principal:</span>
                      <p className="font-bold text-slate-800">{formatCurrency(l.principalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Outstanding:</span>
                      <p className="font-bold text-rose-600">{formatCurrency(l.outstandingAmount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loan History Tab */}
      {activeTab === 'loan_history' && (
        <div className="space-y-4">
          {(!customer.loans || customer.loans.filter(l => l.status === 'completed').length === 0) ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No completed loan records.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.loans.filter(l => l.status === 'completed').map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigate(`${prefix}/loans/${l._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-800">{l.loanId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    Total Paid: {formatCurrency(l.totalPaid)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-4 py-2.5">Receipt #</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Collected By</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(!customer.payments || customer.payments.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  customer.payments.map((p) => {
                    const receiptNo = p.receiptNumber || `REC-${p.paymentId || p._id?.substring(0, 8)}`;
                    const collector = p.collectedByName || p.staffName || 'Staff';

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 font-mono font-semibold text-emerald-600">
                          {receiptNo}
                        </td>
                        <td className="px-4 py-2.5 text-slate-500">
                          {formatDate(p.paymentDate || p.createdAt)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 uppercase text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-100">{p.paymentMethod || 'Cash'}</span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-700">
                          {collector}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900 font-mono">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <Button
                            size="xs"
                            variant="secondary"
                            onClick={() => handleViewReceipt(p)}
                            className="inline-flex items-center gap-1 text-[11px]"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            View Receipt
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {isReceiptModalOpen && selectedReceipt && (
        <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          receipt={selectedReceipt}
        />
      )}

      {/* Assign Staff Modal (Admin Only) */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Assign Staff Member</h3>
                <p className="text-xs text-slate-500">For customer: {customer.fullName}</p>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Select Field Executive</label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  {staffList.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Reassigning this customer also updates all associated active loans.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsAssignModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={assignSubmitting}>
                  {assignSubmitting ? 'Saving...' : 'Save Assignment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Uploader Modal */}
      {isDocModalOpen && (
        <DocumentUploader
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          customerId={customer._id}
          onUploadSuccess={() => fetchCustomer()}
        />
      )}
    </div>
  );
}
