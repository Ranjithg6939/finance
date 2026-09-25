import React, { useState, useEffect } from 'react';
import { dashboardService } from '../../services/reportService';
import { formatCurrency } from '../../utils/currency';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  // Quick payment modal state
  const [selectedPaymentLoan, setSelectedPaymentLoan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, monthRes, upRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getMonthlyCollections(),
        dashboardService.getUpcomingPayments(),
      ]);

      setSummary(sumRes.data);
      setMonthlyData(monthRes.data);
      setUpcoming(upRes.data);
    } catch (err) {
      console.error('Failed loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRecordPayment = (item) => {
    // Construct loan stub for payment modal
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

  return (
    <div className="space-y-6">
      {/* Top Banner / Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Portfolio Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time lending metrics and collection monitoring</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/customers/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            + New Customer
          </Link>
          <Link
            to="/loans/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
          >
            + Create Loan
          </Link>
        </div>
      </div>

      {/* Top Cards (6 KPI Cards matching spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Customers"
          value={summary?.totalCustomers ?? 0}
          subtitle="Registered borrowers"
          icon={Users}
          color="emerald"
        />

        <StatCard
          title="Active Loans"
          value={summary?.activeLoans ?? 0}
          subtitle="Ongoing agreements"
          icon={Coins}
          color="blue"
        />

        <StatCard
          title="Total Disbursed"
          value={formatCurrency(summary?.totalLoanAmount)}
          subtitle="Cumulative principal"
          icon={BadgePercent}
          color="amber"
        />

        <StatCard
          title="Outstanding"
          value={formatCurrency(summary?.outstandingAmount)}
          subtitle="Remaining to collect"
          icon={Clock}
          color="rose"
        />

        <StatCard
          title="Interest Earned"
          value={formatCurrency(summary?.interestCollected)}
          subtitle="Collected revenue"
          icon={TrendingUp}
          color="emerald"
        />

        <StatCard
          title="Completed Loans"
          value={summary?.completedLoans ?? 0}
          subtitle="Fully settled"
          icon={CheckCircle}
          color="violet"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collections Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Collections</h3>
              <p className="text-[11px] text-slate-400">Principal vs Interest recovery</p>
            </div>
            <Link to="/reports" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              View Report <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <CollectionChart data={monthlyData} />
        </div>

        {/* Loan Status Breakdown Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Loan Status</h3>
              <p className="text-[11px] text-slate-400">Portfolio distribution</p>
            </div>
            <Link to="/loans/active" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
              Active Loans <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LoanChart
            active={summary?.activeLoans || 0}
            completed={summary?.completedLoans || 0}
            due={summary?.pendingPayments || 0}
          />
        </div>
      </div>

      {/* Upcoming Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Upcoming Payments</h3>
            <p className="text-[11px] text-slate-400">Scheduled dues requiring action</p>
          </div>
          <Link to="/payments" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1">
            All Payments <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <UpcomingPayments
          payments={upcoming}
          onRecordPayment={handleRecordPayment}
        />
      </div>

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
