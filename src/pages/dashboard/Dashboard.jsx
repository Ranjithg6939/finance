import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/reportService';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import StatCard from '../../components/dashboard/StatCard';
import CollectionChart from '../../components/dashboard/CollectionChart';
import LoanChart from '../../components/dashboard/LoanChart';
import UpcomingPayments from '../../components/dashboard/UpcomingPayments';
import PaymentModal from '../../components/payments/PaymentModal';
import Loader from '../../components/common/Loader';
import {
  Users,
  Coins,
  BadgePercent,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Shield,
  UserCheck,
  Calendar,
  AlertCircle,
  Activity,
  PhoneCall,
  ListTodo,
  DollarSign,
  Briefcase,
  AlertTriangle,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [summary, setSummary] = useState(null);
  const [adminFinancials, setAdminFinancials] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick payment modal state
  const [selectedPaymentLoan, setSelectedPaymentLoan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        const [sumRes, finRes, monthRes, upRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getAdminFinancials().catch(() => null),
          dashboardService.getMonthlyCollections().catch(() => ({ data: [] })),
          dashboardService.getUpcomingPayments().catch(() => ({ data: [] })),
        ]);

        setSummary(sumRes?.data || null);
        setAdminFinancials(finRes?.data || null);
        setMonthlyData(monthRes?.data || []);
        setUpcoming(upRes?.data || []);
      } else {
        // Staff Dashboard: strictly operational APIs only
        // Do NOT call restricted financial APIs (monthly collections or admin financials)
        const [sumRes, upRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getUpcomingPayments().catch(() => ({ data: [] })),
        ]);

        setSummary(sumRes?.data || null);
        setUpcoming(upRes?.data || []);
      }
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleRecordPayment = (item) => {
    setSelectedPaymentLoan({
      _id: item.loanMongoId,
      loanId: item.loanId,
      customer: {
        _id: item.customerId,
        fullName: item.customerName,
      },
      outstandingAmount: item.amount,
      totalPayable: item.amount,
      totalInterest: 0,
    });
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return <Loader text="Loading live dashboard KPIs..." />;
  }

  const prefix = isAdmin ? '/admin' : '/staff';

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              {isAdmin ? 'Administrator Executive Dashboard' : 'Staff Operational Dashboard'}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                isAdmin ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isAdmin ? 'Admin View' : 'Staff Operations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isAdmin
              ? 'Executive financial overview, company recovery KPIs, net margins, and staff performance'
              : `Assigned customer accounts, active loan schedules, and recovery follow-up tasks for ${user?.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to={`${prefix}/customers/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            + New Customer
          </Link>
          <Link
            to={`${prefix}/loans/new`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            + Create Loan
          </Link>
        </div>
      </div>

      {isAdmin ? (
        /* ========================================================================= */
        /*                          ADMIN DASHBOARD VIEW                             */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Executive Financial Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                Executive Financial Summary
              </h3>
              {adminFinancials?.profitMargin && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Net Margin: {adminFinancials.profitMargin}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                title="Total Collections"
                value={formatCurrency(adminFinancials?.totalCollections ?? summary?.totalCollections ?? 0)}
                subtitle="Company-wide recovered"
                icon={TrendingUp}
                color="emerald"
              />

              <StatCard
                title="Total Revenue"
                value={formatCurrency(adminFinancials?.totalRevenue ?? summary?.totalRevenue ?? 0)}
                subtitle="Accrued interest & fees"
                icon={BadgePercent}
                color="teal"
              />

              <StatCard
                title="Total Expenses"
                value={formatCurrency(adminFinancials?.totalExpenses ?? summary?.totalExpenses ?? 0)}
                subtitle="Operations & overhead"
                icon={Clock}
                color="amber"
              />

              <StatCard
                title="Net Profit"
                value={formatCurrency(adminFinancials?.netProfit ?? summary?.netProfit ?? 0)}
                subtitle="Net operating earnings"
                icon={Coins}
                color="emerald"
              />

              <StatCard
                title="Overall Outstanding"
                value={formatCurrency(adminFinancials?.overallOutstandingAmount ?? summary?.overallOutstandingAmount ?? 0)}
                subtitle="Remaining portfolio due"
                icon={AlertCircle}
                color="rose"
              />

              <StatCard
                title="Active Staff"
                value={summary?.totalStaff ?? 0}
                subtitle="Registered field officers"
                icon={Shield}
                color="violet"
              />
            </div>
          </div>

          {/* Operational Loan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Registered Borrowers</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.totalCustomers ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-500 font-medium">Active Agreements</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.activeLoansCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-500 font-medium">Pending Loan Approvals</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.pendingLoansCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-xs text-slate-500 font-medium">Completed / Settled Loans</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{summary?.completedLoansCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Admin Staff Performance Section */}
          {summary?.staffPerformance && summary.staffPerformance.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Staff Recovery Performance</h3>
                  <p className="text-[11px] text-slate-400">Assigned customer load and recovered amounts by executive</p>
                </div>
                <Link
                  to="/admin/staff"
                  className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Manage Staff <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Staff Executive</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Assigned Customers</th>
                      <th className="px-4 py-2.5">Active Loans</th>
                      <th className="px-4 py-2.5 text-right">Total Recovered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.staffPerformance.map((st) => (
                      <tr key={st._id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-2.5 font-medium text-slate-800">
                          <div>
                            <p className="font-semibold text-slate-900">{st.name}</p>
                            <p className="text-[10px] text-slate-400">{st.email}</p>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              st.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-slate-600">{st.assignedCustomers}</td>
                        <td className="px-4 py-2.5 text-slate-600">{st.activeLoans}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-700 font-mono">
                          {formatCurrency(st.totalCollected)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admin Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Monthly Collections (Company-wide)</h3>
                  <p className="text-[11px] text-slate-400">Recovery performance over the last 6 months vs target</p>
                </div>
                <Link
                  to="/admin/reports"
                  className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Financial Reports <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <CollectionChart data={monthlyData} />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Company Portfolio Distribution</h3>
                  <p className="text-[11px] text-slate-400">All loans categorized by operational lifecycle</p>
                </div>
                <Link
                  to="/admin/loans/active"
                  className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
                >
                  Active Loans <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <LoanChart
                active={summary?.activeLoansCount || 0}
                completed={summary?.completedLoansCount || 0}
                due={summary?.pendingLoansCount || 0}
              />
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /*                          STAFF DASHBOARD VIEW                             */
        /*      (STRICTLY OPERATIONAL ONLY - ZERO FINANCIAL OR PROFIT METRICS)       */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Operational Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="My Assigned Customers"
              value={summary?.totalCustomers ?? 0}
              subtitle="Borrowers assigned to you"
              icon={Users}
              color="emerald"
            />

            <StatCard
              title="My Active Loans"
              value={summary?.activeLoansCount ?? 0}
              subtitle="Ongoing customer agreements"
              icon={Coins}
              color="blue"
            />

            <StatCard
              title="Pending Installments"
              value={summary?.pendingInstallmentsCount ?? 0}
              subtitle="Installments due for collection"
              icon={Clock}
              color="amber"
            />

            <StatCard
              title="Action Tasks Due"
              value={summary?.overdueInstallmentsCount ?? summary?.assignedTasksCount ?? 0}
              subtitle="Overdue recovery follow-ups"
              icon={AlertCircle}
              color="rose"
            />

            <StatCard
              title="Completed Loans"
              value={summary?.completedLoansCount ?? 0}
              subtitle="Successfully settled loans"
              icon={CheckCircle}
              color="teal"
            />

            <StatCard
              title="Pending Approvals"
              value={summary?.pendingLoansCount ?? 0}
              subtitle="Submitted awaiting review"
              icon={UserCheck}
              color="violet"
            />
          </div>

          {/* Staff Assigned Action Items & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task list: overdue & today dues */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <ListTodo className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Assigned Tasks & Recovery Follow-ups</h3>
                    <p className="text-[11px] text-slate-400">Scheduled dues and borrower contacts requiring immediate attention</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  {summary?.assignedTasks?.length || 0} Priority Tasks
                </span>
              </div>

              {summary?.assignedTasks && summary.assignedTasks.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {summary.assignedTasks.map((task) => (
                    <div key={task.taskId} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900">{task.customerName}</p>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
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
                        <p className="text-[11px] text-slate-500">
                          Loan #{task.loanId} • Installment #{task.installmentNumber} • Due Date:{' '}
                          <span className="font-semibold text-slate-700">{task.dueDate}</span>
                        </p>
                        {task.customerPhone && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 text-slate-400" /> {task.customerPhone}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {task.customerPhone && (
                          <a
                            href={`tel:${task.customerPhone}`}
                            className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Call
                          </a>
                        )}
                        <button
                          onClick={() => {
                            setSelectedPaymentLoan({
                              _id: task.loanMongoId,
                              loanId: task.loanId,
                              customer: {
                                _id: task.customerId,
                                fullName: task.customerName,
                              },
                              outstandingAmount: 0,
                              totalPayable: 0,
                              totalInterest: 0,
                            });
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
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

            {/* Staff Loan Portfolio Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">My Loan Distribution</h3>
                  <p className="text-[11px] text-slate-400">Status of agreements assigned to you</p>
                </div>
                <Link
                  to="/staff/loans"
                  className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1"
                >
                  My Loans <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <LoanChart
                active={summary?.activeLoansCount || 0}
                completed={summary?.completedLoansCount || 0}
                due={summary?.pendingLoansCount || 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Payments Table (Filtered to assigned loans for staff, company for admin) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              {isAdmin ? 'All Upcoming Installments' : 'My Upcoming Customer Installments'}
            </h3>
            <p className="text-[11px] text-slate-400">Scheduled dues requiring collection follow-up</p>
          </div>
          <Link
            to={`${prefix}/payments`}
            className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
          >
            All Payments <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <UpcomingPayments payments={upcoming} onRecordPayment={handleRecordPayment} />
      </div>

      {/* Recent Activities Section (Audit Logs) */}
      {summary?.recentActivities && summary.recentActivities.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Recent Operational Activities</h3>
              <p className="text-[11px] text-slate-400">
                {isAdmin ? 'Latest actions logged across the company' : 'Your recent operational actions and assigned updates'}
              </p>
            </div>
            {isAdmin && (
              <Link
                to="/admin/activity-logs"
                className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                View Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {summary.recentActivities.map((act) => (
              <div key={act._id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">{act.action}</span>
                    <span className="text-slate-400 text-[11px] ml-2 font-mono">({act.resource})</span>
                  </div>
                </div>
                <span className="text-slate-400 text-[11px] whitespace-nowrap">
                  {formatDateTime(act.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Record Payment Modal */}
      {selectedPaymentLoan && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          loan={selectedPaymentLoan}
          onPaymentSuccess={() => {
            fetchDashboardData();
          }}
        />
      )}
    </div>
  );
}
