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
import RecoveryTasks from '../../components/dashboard/RecoveryTasks';
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
  const isRecovery = user?.role === 'recovery_staff';

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
        // Staff or Recovery Staff Dashboard: strictly operational APIs only
        // Zero access to restricted financial/profit analytics
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
      _id: item.loanMongoId || item._id,
      loanId: item.loanId,
      customer: {
        _id: item.customerId,
        fullName: item.customerName,
      },
      outstandingAmount: item.amount || 0,
      totalPayable: item.amount || 0,
      totalInterest: 0,
    });
    setIsPaymentModalOpen(true);
  };

  if (loading) {
    return <Loader text="Loading live dashboard KPIs..." />;
  }

  const prefix = isAdmin ? '/admin' : isRecovery ? '/recovery' : '/staff';

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 break-words">
              {isAdmin
                ? 'Administrator Executive Dashboard'
                : isRecovery
                ? 'Recovery Officer Dashboard'
                : 'Staff Operational Dashboard'}
            </h2>
            <span
              className={`shrink-0 px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider ${
                isAdmin
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : isRecovery
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-blue-100 text-blue-800 border border-blue-200'
              }`}
            >
              {isAdmin ? 'Admin View' : isRecovery ? 'Recovery Suite' : 'Staff Operations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 break-words">
            {isAdmin
              ? 'Executive financial overview, company recovery KPIs, net margins, and staff performance'
              : isRecovery
              ? `Assigned borrower recovery portfolio, overdue follow-up tasks, and field collections for ${user?.name}`
              : `Assigned customer accounts, active loan schedules, and recovery follow-up tasks for ${user?.name}`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0">
          {isRecovery ? (
            <>
              <Link
                to="/recovery/customers"
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center"
              >
                Assigned Borrowers
              </Link>
              <Link
                to="/recovery/payments"
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shadow-sm text-center"
              >
                + Collect Payment
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`${prefix}/customers/new`}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm text-center"
              >
                + New Customer
              </Link>
              <Link
                to={`${prefix}/loans/new`}
                className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm text-center"
              >
                + Create Loan
              </Link>
            </>
          )}
        </div>
      </div>

      {isAdmin ? (
        /* ========================================================================= */
        /*                          ADMIN DASHBOARD VIEW                             */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Executive Due Date & Financial Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                Executive Dues & Financial Performance
              </h3>
              {adminFinancials?.profitMargin && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Net Margin: {adminFinancials.profitMargin}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard
                title="Today's Due"
                value={formatCurrency(summary?.todayDue ?? 0)}
                subtitle="Scheduled for collection today"
                icon={Clock}
                color="amber"
              />

              <StatCard
                title="Upcoming Due"
                value={formatCurrency(summary?.upcomingDue ?? 0)}
                subtitle="Future scheduled installments"
                icon={Calendar}
                color="blue"
              />

              <StatCard
                title="Overdue Loans"
                value={summary?.overdueLoansCount ?? summary?.overdueInstallmentsCount ?? 0}
                subtitle="Loans requiring recovery"
                icon={AlertCircle}
                color="rose"
              />

              <StatCard
                title="Total Outstanding"
                value={formatCurrency(summary?.totalOutstanding ?? adminFinancials?.overallOutstandingAmount ?? summary?.overallOutstandingAmount ?? 0)}
                subtitle="Total principal & interest due"
                icon={DollarSign}
                color="violet"
              />

              <StatCard
                title="Net Profit"
                value={formatCurrency(adminFinancials?.netProfit ?? summary?.netProfit ?? 0)}
                subtitle="Executive net margins"
                icon={Coins}
                color="emerald"
              />

              <StatCard
                title="Total Collections"
                value={formatCurrency(adminFinancials?.totalCollections ?? summary?.totalCollections ?? 0)}
                subtitle="Total recovered to date"
                icon={TrendingUp}
                color="teal"
              />
            </div>
          </div>

          {/* Operational Loan Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <p className="text-xs text-slate-500 font-medium">Action Tasks Due</p>
                <p className="text-2xl font-bold text-rose-600 mt-1">
                  {summary?.overdueInstallmentsCount ?? summary?.assignedTasksCount ?? 0}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
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

          {/* Assigned Tasks & Recovery Follow-ups (Company-wide for Admin) */}
          <RecoveryTasks
            tasks={summary?.assignedTasks || []}
            onRecordPayment={handleRecordPayment}
            isAdmin={true}
          />

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
      ) : isRecovery ? (
        /* ========================================================================= */
        /*                     RECOVERY STAFF DASHBOARD VIEW                         */
        /*      (FIELD RECOVERY METRICS, OVERDUE TASKS - ZERO PROFIT/FINANCIALS)     */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Recovery Operational Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Today's Recovery"
              value={formatCurrency(summary?.todayRecovery ?? summary?.todayDue ?? 0)}
              subtitle="Target due for collection today"
              icon={Clock}
              color="amber"
            />

            <StatCard
              title="Overdue Assigned Loans"
              value={summary?.overdueAssignedLoans ?? summary?.overdueLoansCount ?? 0}
              subtitle="Critical overdue recovery cases"
              icon={AlertCircle}
              color="rose"
            />

            <StatCard
              title="Upcoming Recovery"
              value={formatCurrency(summary?.upcomingRecovery ?? 0)}
              subtitle="Future scheduled recoveries"
              icon={Calendar}
              color="blue"
            />

            <StatCard
              title="Outstanding Amount"
              value={formatCurrency(summary?.outstandingAmount ?? summary?.totalOutstanding ?? 0)}
              subtitle="Total assigned recovery balance"
              icon={DollarSign}
              color="violet"
            />

            <StatCard
              title="Assigned Borrowers"
              value={summary?.assignedCustomersCount ?? summary?.totalCustomers ?? 0}
              subtitle="Borrowers under recovery"
              icon={Users}
              color="emerald"
            />

            <StatCard
              title="Assigned Loans"
              value={summary?.assignedLoansCount ?? summary?.totalLoans ?? 0}
              subtitle="Total recovery accounts"
              icon={Coins}
              color="teal"
            />
          </div>

          {/* Recovery Assigned Action Items & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecoveryTasks
                tasks={summary?.assignedTasks || []}
                onRecordPayment={handleRecordPayment}
                isAdmin={false}
              />
            </div>

            {/* Recovery Portfolio Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Assigned Case Status</h3>
                  <p className="text-[11px] text-slate-400">Distribution of your recovery accounts</p>
                </div>
                <Link
                  to="/recovery/loans"
                  className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1"
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
      ) : (
        /* ========================================================================= */
        /*                          STAFF DASHBOARD VIEW                             */
        /*      (STRICTLY OPERATIONAL ONLY - ZERO FINANCIAL OR PROFIT METRICS)       */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Operational Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Assigned Due"
              value={formatCurrency(summary?.assignedDue ?? 0)}
              subtitle="Active balance assigned to you"
              icon={DollarSign}
              color="blue"
            />

            <StatCard
              title="Today's Due"
              value={formatCurrency(summary?.todayDue ?? 0)}
              subtitle="Installments due today"
              icon={Clock}
              color="amber"
            />

            <StatCard
              title="Overdue Assigned Loans"
              value={summary?.overdueAssignedLoans ?? summary?.overdueLoansCount ?? 0}
              subtitle="Assigned loans past due"
              icon={AlertCircle}
              color="rose"
            />

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
              color="teal"
            />

            <StatCard
              title="Pending Installments"
              value={summary?.pendingInstallmentsCount ?? 0}
              subtitle="Installments due for collection"
              icon={Calendar}
              color="violet"
            />
          </div>

          {/* Staff Assigned Action Items & Tasks */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task list: overdue & today dues */}
            <div className="lg:col-span-2">
              <RecoveryTasks
                tasks={summary?.assignedTasks || []}
                onRecordPayment={handleRecordPayment}
                isAdmin={false}
              />
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
