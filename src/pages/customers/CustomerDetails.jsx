import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customerService } from '../../services/customerService';
import { formatCurrency, maskString } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import DocumentUploader from '../../components/documents/DocumentUploader';
import {
  User,
  ArrowLeft,
  BadgePercent,
  Upload,
  Coins,
  Receipt,
  FileText,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Shield,
  Calendar,
} from 'lucide-react';

export default function CustomerDetails() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useApp();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await customerService.getById(customerId);
      setCustomer(res.data);
    } catch (err) {
      showToast('Failed to load customer profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return <Loader text="Loading customer profile..." />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4" size="sm">
          Return to Customers
        </Button>
      </div>
    );
  }

  const { summary } = customer;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/customers')}
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsDocModalOpen(true)}
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
          </Button>
          <Button
            size="sm"
            onClick={() => navigate(`/loans/new?customer=${customer._id}`)}
          >
            <BadgePercent className="w-3.5 h-3.5 mr-1.5" /> Create Loan
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'active_loans', label: `Active Loans (${customer.activeLoans?.length || 0})` },
            { id: 'loan_history', label: `Loan History (${customer.completedLoans?.length || 0})` },
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Loans</span>
              <p className="text-xl font-bold text-slate-800 mt-1">{summary?.totalLoans || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-blue-600 uppercase">Active Loans</span>
              <p className="text-xl font-bold text-blue-700 mt-1">{summary?.activeLoans || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Completed</span>
              <p className="text-xl font-bold text-emerald-700 mt-1">{summary?.completedLoans || 0}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Borrowed</span>
              <p className="text-lg font-bold text-slate-800 mt-1">{formatCurrency(summary?.totalBorrowed)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Total Paid</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(summary?.totalPaid)}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">Outstanding</span>
              <p className="text-lg font-bold text-rose-700 mt-1">{formatCurrency(summary?.outstanding)}</p>
            </div>
          </div>

          {/* Personal Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal & Address Details</h3>
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
                  <span className="text-slate-400">Company / Business:</span>
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
          {customer.activeLoans?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No active loans for this customer.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.activeLoans.map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigate(`/loans/${l._id}`)}
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
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, Math.round(((l.totalPaid || 0) / (l.totalPayable || 1)) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Paid: {formatCurrency(l.totalPaid)}</span>
                    <span>Total: {formatCurrency(l.totalPayable)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loan History Tab (Completed Loans) */}
      {activeTab === 'loan_history' && (
        <div className="space-y-4">
          {customer.completedLoans?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-400">
              No completed loan records yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.completedLoans.map((l) => (
                <div
                  key={l._id}
                  onClick={() => navigate(`/loans/${l._id}`)}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:border-emerald-500 cursor-pointer transition-all space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-800">{l.loanId}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Amount Borrowed:</span>
                    <span className="font-semibold text-slate-900">{formatCurrency(l.principalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Repaid:</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(l.totalPaid)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    <span>Started: {formatDate(l.startDate)}</span>
                    <span>Completed: {formatDate(l.completedAt || l.updatedAt)}</span>
                  </div>
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
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Payment ID</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Principal</th>
                  <th className="px-4 py-3">Interest</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.payments?.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-800">{p.paymentId}</td>
                    <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-3">{formatCurrency(p.principalAmount)}</td>
                    <td className="px-4 py-3 text-amber-600">{formatCurrency(p.interestAmount)}</td>
                    <td className="px-4 py-3 capitalize">{p.paymentMethod.replace('_', ' ')}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{p.transactionReference || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setIsDocModalOpen(true)}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {customer.documents?.map((d) => (
              <div key={d._id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-bold text-slate-800 truncate">{d.title}</p>
                </div>
                <p className="text-[11px] text-slate-400 capitalize">{d.documentType.replace('_', ' ')}</p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span className="text-slate-400">{formatDate(d.createdAt)}</span>
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    View File
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      <DocumentUploader
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        preselectedCustomerId={customer._id}
        onUploadSuccess={fetchCustomer}
      />
    </div>
  );
}
