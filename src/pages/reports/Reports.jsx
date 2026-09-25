import React, { useState, useEffect } from 'react';
import { reportService } from '../../services/reportService';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { useApp } from '../../context/AppContext';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';

export default function Reports() {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState('loans');
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {
        from: fromDate || undefined,
        to: toDate || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      if (activeTab === 'loans') {
        const res = await reportService.getLoans(params);
        setReportData(res.data || []);
        setSummary(res.summary);
      } else if (activeTab === 'payments') {
        const res = await reportService.getPayments(params);
        setReportData(res.data || []);
        setSummary(res.summary);
      } else if (activeTab === 'interest') {
        const res = await reportService.getInterest(params);
        setReportData(res.data || []);
        setSummary({ totalInterestEarned: res.totalInterestEarned });
      } else if (activeTab === 'customers') {
        const res = await reportService.getCustomers();
        setReportData(res.data || []);
        setSummary(null);
      }
    } catch (err) {
      showToast('Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  // Export Table Data to CSV
  const exportToCSV = () => {
    if (!reportData || reportData.length === 0) {
      showToast('No data to export', 'error');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'loans') {
      csvContent += 'Loan ID,Customer,Principal,Interest,Total Payable,Paid,Outstanding,Start Date,Status\n';
      reportData.forEach((l) => {
        csvContent += `"${l.loanId}","${l.customer?.fullName || ''}",${l.principalAmount},${l.totalInterest},${l.totalPayable},${l.totalPaid},${l.outstandingAmount},"${formatDate(l.startDate)}","${l.status}"\n`;
      });
    } else if (activeTab === 'payments') {
      csvContent += 'Payment ID,Customer,Loan ID,Date,Amount,Principal,Interest,Method,Reference\n';
      reportData.forEach((p) => {
        csvContent += `"${p.paymentId}","${p.customer?.fullName || ''}","${p.loan?.loanId || ''}","${formatDate(p.paymentDate)}",${p.amount},${p.principalAmount},${p.interestAmount},"${p.paymentMethod}","${p.transactionReference || ''}"\n`;
      });
    } else if (activeTab === 'customers') {
      csvContent += 'Customer ID,Full Name,Phone,Total Loans,Active Loans,Borrowed,Paid,Outstanding\n';
      reportData.forEach((c) => {
        csvContent += `"${c.customerId}","${c.fullName}","${c.phone}",${c.totalLoans},${c.activeLoans},${c.totalBorrowed},${c.totalPaid},${c.outstanding}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeTab}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV downloaded successfully!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">Generate financial statements and portfolio reports</p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={exportToCSV}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" variant="secondary" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5 mr-1.5" /> Print
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          {[
            { id: 'loans', label: 'Loan Report' },
            { id: 'payments', label: 'Payment Report' },
            { id: 'interest', label: 'Interest Report' },
            { id: 'customers', label: 'Customer Report' },
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

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 text-slate-500">
            <span>To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          {activeTab === 'loans' && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        <Button size="sm" onClick={fetchReport}>
          Generate Report
        </Button>
      </div>

      {/* Summary KPI Ribbon for Report */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summary.totalPrincipalDisbursed !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Disbursed</span>
              <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(summary.totalPrincipalDisbursed)}</p>
            </div>
          )}
          {summary.totalCollected !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-emerald-600 uppercase">Total Collected</span>
              <p className="text-lg font-bold text-emerald-700 mt-1">{formatCurrency(summary.totalCollected)}</p>
            </div>
          )}
          {summary.totalOutstanding !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-rose-600 uppercase">Total Outstanding</span>
              <p className="text-lg font-bold text-rose-700 mt-1">{formatCurrency(summary.totalOutstanding)}</p>
            </div>
          )}
          {summary.totalInterestEarned !== undefined && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-semibold text-amber-600 uppercase">Interest Income</span>
              <p className="text-lg font-bold text-amber-700 mt-1">{formatCurrency(summary.totalInterestEarned)}</p>
            </div>
          )}
        </div>
      )}

      {/* Report Table View */}
      {loading ? (
        <Loader text="Generating report data..." />
      ) : reportData.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          No records match this report filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                {activeTab === 'loans' && (
                  <tr>
                    <th className="px-4 py-3">Loan ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Total Payable</th>
                    <th className="px-4 py-3">Paid</th>
                    <th className="px-4 py-3">Outstanding</th>
                    <th className="px-4 py-3">Start Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                )}
                {activeTab === 'payments' && (
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Loan ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Principal</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Method</th>
                  </tr>
                )}
                {activeTab === 'interest' && (
                  <tr>
                    <th className="px-4 py-3">Payment ID</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Loan ID</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Calculation</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3 text-right">Interest Collected</th>
                  </tr>
                )}
                {activeTab === 'customers' && (
                  <tr>
                    <th className="px-4 py-3">Customer ID</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 text-center">Total Loans</th>
                    <th className="px-4 py-3 text-center">Active</th>
                    <th className="px-4 py-3">Total Borrowed</th>
                    <th className="px-4 py-3">Total Paid</th>
                    <th className="px-4 py-3">Outstanding</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'loans' &&
                  reportData.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{l.loanId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{l.customer?.fullName}</td>
                      <td className="px-4 py-3">{formatCurrency(l.principalAmount)}</td>
                      <td className="px-4 py-3 text-amber-600">{formatCurrency(l.totalInterest)}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(l.totalPayable)}</td>
                      <td className="px-4 py-3 text-emerald-600">{formatCurrency(l.totalPaid)}</td>
                      <td className="px-4 py-3 text-rose-600 font-bold">{formatCurrency(l.outstandingAmount)}</td>
                      <td className="px-4 py-3">{formatDate(l.startDate)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 capitalize">
                          {l.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {activeTab === 'payments' &&
                  reportData.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.paymentId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.customer?.fullName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.loan?.loanId}</td>
                      <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="px-4 py-3">{formatCurrency(p.principalAmount)}</td>
                      <td className="px-4 py-3 text-amber-600 font-medium">{formatCurrency(p.interestAmount)}</td>
                      <td className="px-4 py-3 capitalize">{p.paymentMethod}</td>
                    </tr>
                  ))}

                {activeTab === 'interest' &&
                  reportData.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{p.paymentId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{p.customer?.fullName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{p.loan?.loanId}</td>
                      <td className="px-4 py-3">{p.loan?.interestRate}%</td>
                      <td className="px-4 py-3 capitalize">{p.loan?.calculationMethod?.replace('_', ' ')}</td>
                      <td className="px-4 py-3">{formatDate(p.paymentDate)}</td>
                      <td className="px-4 py-3 text-right font-bold text-amber-600">
                        {formatCurrency(p.interestAmount)}
                      </td>
                    </tr>
                  ))}

                {activeTab === 'customers' &&
                  reportData.map((c, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">{c.customerId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{c.fullName}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{c.phone}</td>
                      <td className="px-4 py-3 text-center">{c.totalLoans}</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-600">{c.activeLoans}</td>
                      <td className="px-4 py-3">{formatCurrency(c.totalBorrowed)}</td>
                      <td className="px-4 py-3 text-emerald-600">{formatCurrency(c.totalPaid)}</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{formatCurrency(c.outstanding)}</td>
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
