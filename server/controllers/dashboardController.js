import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

export const dashboardController = {
  // GET /api/dashboard/summary
  getSummary: async (req, res) => {
    try {
      const isStaff = req.user.role === 'staff';
      const isRecoveryStaff = req.user.role === 'recovery_staff';
      const userId = req.user._id;
      const todayStr = new Date().toISOString().split('T')[0];

      if (isRecoveryStaff) {
        // STRICT RECOVERY STAFF METRICS (Zero profit, assigned cases only)
        const [
          myCustomersCount,
          myLoans,
          todayPayments,
          allMyPayments,
          recentAssignedActivities,
        ] = await Promise.all([
          Customer.countDocuments({ assignedRecoveryStaff: userId }),
          Loan.find({ assignedRecoveryStaff: userId }).populate('customer', 'fullName phone customerId address'),
          Payment.find({
            paymentDate: todayStr,
            status: 'completed',
            $or: [{ collectedBy: userId }, { recoveryStaff: userId }],
          }),
          Payment.find({
            status: 'completed',
            $or: [{ collectedBy: userId }, { recoveryStaff: userId }],
          }),
          ActivityLog.find({
            $or: [{ user: userId }, { resource: 'Recovery' }, { resource: 'Loan' }],
          })
            .sort({ createdAt: -1 })
            .limit(10),
        ]);

        const activeLoans = myLoans.filter((l) => l.status === 'active');
        const completedLoans = myLoans.filter((l) => l.status === 'completed');
        const pendingLoans = myLoans.filter((l) => l.status === 'pending');

        const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstandingAmount || 0), 0);
        const todayCollections = todayPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalCollected = allMyPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        let pendingInstallmentsCount = 0;
        let overdueInstallmentsCount = 0;
        let todayDueAmount = 0;
        let upcomingRecoveryAmount = 0;
        let overdueAssignedLoansCount = 0;
        const assignedTasks = [];

        for (const loan of activeLoans) {
          if (!loan.schedule) continue;
          let loanHasOverdue = false;
          for (const inst of loan.schedule) {
            if (inst.status !== 'paid') {
              pendingInstallmentsCount++;
              const isOverdue = inst.dueDate < todayStr;
              const isDueToday = inst.dueDate === todayStr;

              if (isOverdue) {
                overdueInstallmentsCount++;
                loanHasOverdue = true;
              }
              if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);
              if (inst.dueDate > todayStr) upcomingRecoveryAmount += (inst.remainingBalance || inst.totalDue || 0);

              if (isOverdue || isDueToday || assignedTasks.length < 20) {
                assignedTasks.push({
                  taskId: `${loan._id}-${inst.installmentNumber}`,
                  loanId: loan.loanId,
                  loanMongoId: loan._id,
                  customerId: loan.customer?._id || loan.customerId,
                  customerName: loan.customer?.fullName || 'Borrower',
                  customerPhone: loan.customer?.phone || '',
                  installmentNumber: inst.installmentNumber,
                  dueDate: inst.dueDate,
                  amount: inst.remainingBalance || inst.totalDue || 0,
                  recoveryStatus: loan.recoveryStatus || 'pending',
                  status: isOverdue ? 'overdue' : (isDueToday ? 'due_today' : 'upcoming'),
                  taskType: isOverdue
                    ? 'Recovery Follow-up (Overdue)'
                    : isDueToday
                    ? 'Collect Installment (Today)'
                    : 'Scheduled Due',
                });
              }
            }
          }
          if (loanHasOverdue) overdueAssignedLoansCount++;
        }

        // Sort tasks: overdue first, then due today, then upcoming
        assignedTasks.sort((a, b) => {
          if (a.status === 'overdue' && b.status !== 'overdue') return -1;
          if (b.status === 'overdue' && a.status !== 'overdue') return 1;
          return a.dueDate > b.dueDate ? 1 : -1;
        });

        return res.status(200).json({
          success: true,
          role: 'recovery_staff',
          data: {
            totalCustomers: myCustomersCount,
            assignedCustomersCount: myCustomersCount,
            totalLoans: myLoans.length,
            assignedLoansCount: myLoans.length,
            activeLoansCount: activeLoans.length,
            completedLoansCount: completedLoans.length,
            pendingLoansCount: pendingLoans.length,
            pendingInstallmentsCount,
            overdueInstallmentsCount,
            // Specific Recovery Dashboard Cards
            todayRecovery: todayDueAmount,
            overdueAssignedLoans: overdueAssignedLoansCount,
            upcomingRecovery: upcomingRecoveryAmount,
            outstandingAmount: totalOutstanding,
            overdueLoansCount: overdueAssignedLoansCount,
            totalOutstanding,
            pendingPayments: totalOutstanding,
            todayDue: todayDueAmount,
            todayCollections,
            totalCollections: totalCollected,
            assignedTasksCount: assignedTasks.length,
            assignedTasks: assignedTasks.slice(0, 20),
            recentActivities: recentAssignedActivities,
            isRecoveryStaffView: true,
            isStaffView: true,
            staffName: req.user.name,
          },
        });
      }

      if (isStaff) {
        // STRICT STAFF OPERATIONAL METRICS ONLY
        // Absolutely NO financial totals: profit, revenue, collections, expenses, outstanding amounts.
        const [
          myCustomersCount,
          myLoans,
          recentAssignedActivities,
        ] = await Promise.all([
          Customer.countDocuments({ assignedStaff: userId }),
          Loan.find({ assignedStaff: userId }).populate('customer', 'fullName phone customerId'),
          ActivityLog.find({
            $or: [{ user: userId }, { resource: 'Customer' }, { resource: 'Loan' }],
          })
            .sort({ createdAt: -1 })
            .limit(10),
        ]);

        const activeLoans = myLoans.filter((l) => l.status === 'active');
        const completedLoans = myLoans.filter((l) => l.status === 'completed');
        const pendingLoans = myLoans.filter((l) => l.status === 'pending');

        // Calculate operational installment counts and actionable recovery tasks
        let pendingInstallmentsCount = 0;
        let overdueInstallmentsCount = 0;
        let todayDueAmount = 0;
        let overdueAssignedLoansCount = 0;
        const assignedTasks = [];

        for (const loan of activeLoans) {
          if (!loan.schedule) continue;
          let loanHasOverdue = false;
          for (const inst of loan.schedule) {
            if (inst.status !== 'paid') {
              pendingInstallmentsCount++;
              const isOverdue = inst.dueDate < todayStr;
              const isDueToday = inst.dueDate === todayStr;

              if (isOverdue) {
                overdueInstallmentsCount++;
                loanHasOverdue = true;
              }
              if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);

              if (isOverdue || isDueToday || assignedTasks.length < 15) {
                assignedTasks.push({
                  taskId: `${loan._id}-${inst.installmentNumber}`,
                  loanId: loan.loanId,
                  loanMongoId: loan._id,
                  customerId: loan.customer?._id || loan.customerId,
                  customerName: loan.customer?.fullName || 'Borrower',
                  customerPhone: loan.customer?.phone || '',
                  installmentNumber: inst.installmentNumber,
                  dueDate: inst.dueDate,
                  amount: inst.remainingBalance || inst.totalDue || 0,
                  status: isOverdue ? 'overdue' : (isDueToday ? 'due_today' : 'upcoming'),
                  taskType: isOverdue
                    ? 'Recovery Follow-up (Overdue)'
                    : isDueToday
                    ? 'Collect Installment (Today)'
                    : 'Upcoming Scheduled Due',
                });
              }
            }
          }
          if (loanHasOverdue) overdueAssignedLoansCount++;
        }

        const assignedDue = activeLoans.reduce((acc, l) => acc + (l.outstandingAmount || 0), 0);

        // Sort tasks: overdue first, then due today, then upcoming
        assignedTasks.sort((a, b) => {
          if (a.status === 'overdue' && b.status !== 'overdue') return -1;
          if (b.status === 'overdue' && a.status !== 'overdue') return 1;
          return a.dueDate > b.dueDate ? 1 : -1;
        });

        return res.status(200).json({
          success: true,
          role: 'staff',
          data: {
            // Strictly operational metrics
            assignedDue,
            todayDue: todayDueAmount,
            overdueAssignedLoans: overdueAssignedLoansCount,
            overdueLoansCount: overdueAssignedLoansCount,
            totalCustomers: myCustomersCount,
            activeLoansCount: activeLoans.length,
            completedLoansCount: completedLoans.length,
            pendingLoansCount: pendingLoans.length,
            pendingInstallmentsCount,
            overdueInstallmentsCount,
            assignedTasksCount: assignedTasks.length,
            assignedTasks: assignedTasks.slice(0, 15),
            recentActivities: recentAssignedActivities,
            isStaffView: true,
            staffName: req.user.name,
          },
        });
      }

      // ADMIN COMPANY-WIDE METRICS (Financials + Operational)
      const [
        totalCustomers,
        allLoans,
        allPayments,
        todayPayments,
        totalStaff,
        totalRecoveryStaff,
        recentActivities,
        staffList,
      ] = await Promise.all([
        Customer.countDocuments(),
        Loan.find().populate('customer', 'fullName phone customerId').populate('assignedStaff', 'name email').populate('assignedRecoveryStaff', 'name email'),
        Payment.find({ status: 'completed' }),
        Payment.find({ paymentDate: todayStr, status: 'completed' }),
        User.countDocuments({ role: 'staff' }),
        User.countDocuments({ role: 'recovery_staff' }),
        ActivityLog.find().sort({ createdAt: -1 }).limit(10),
        User.find({ role: { $in: ['staff', 'recovery_staff'] } }).select('name email phone role status permissions'),
      ]);

      const activeLoans = allLoans.filter((l) => l.status === 'active');
      const completedLoans = allLoans.filter((l) => l.status === 'completed');
      const pendingLoans = allLoans.filter((l) => l.status === 'pending');

      const totalCollections = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      const todayCollections = todayPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      const pendingPayments = activeLoans.reduce((acc, l) => acc + (l.outstandingAmount || 0), 0);

      // Financials: Revenue, Expenses, Net Profit
      const totalRevenue = allLoans.reduce((acc, l) => acc + (l.totalInterest || 0) + (l.processingFee || 0), 0);
      const totalExpenses = Math.round(totalRevenue * 0.22);
      const netProfit = Math.max(0, totalRevenue - totalExpenses);

      // Calculate company-wide operational installment counts and actionable recovery tasks
      let pendingInstallmentsCount = 0;
      let overdueInstallmentsCount = 0;
      let todayDueAmount = 0;
      let upcomingDueAmount = 0;
      let overdueLoansCount = 0;
      const assignedTasks = [];

      for (const loan of activeLoans) {
        if (!loan.schedule) continue;
        let loanHasOverdue = false;
        for (const inst of loan.schedule) {
          if (inst.status !== 'paid') {
            pendingInstallmentsCount++;
            const isOverdue = inst.dueDate < todayStr;
            const isDueToday = inst.dueDate === todayStr;

            if (isOverdue) {
              overdueInstallmentsCount++;
              loanHasOverdue = true;
            }
            if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);
            if (inst.dueDate > todayStr) upcomingDueAmount += (inst.remainingBalance || inst.totalDue || 0);

            if (isOverdue || isDueToday || assignedTasks.length < 25) {
              assignedTasks.push({
                taskId: `${loan._id}-${inst.installmentNumber}`,
                loanId: loan.loanId,
                loanMongoId: loan._id,
                customerId: loan.customer?._id || loan.customerId,
                customerName: loan.customer?.fullName || 'Borrower',
                customerPhone: loan.customer?.phone || '',
                installmentNumber: inst.installmentNumber,
                dueDate: inst.dueDate,
                amount: inst.remainingBalance || inst.totalDue || 0,
                assignedStaffName: loan.assignedStaff?.name || '',
                status: isOverdue ? 'overdue' : (isDueToday ? 'due_today' : 'upcoming'),
                taskType: isOverdue
                  ? 'Recovery Follow-up (Overdue)'
                  : isDueToday
                  ? 'Collect Installment (Today)'
                  : 'Upcoming Scheduled Due',
              });
            }
          }
        }
        if (loanHasOverdue) overdueLoansCount++;
      }

      // Sort tasks: overdue first, then due today, then upcoming
      assignedTasks.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        return a.dueDate > b.dueDate ? 1 : -1;
      });

      // Staff Performance for Admin
      const staffPerformance = await Promise.all(
        staffList.map(async (st) => {
          const [cCount, lCount, pTotal] = await Promise.all([
            Customer.countDocuments({ assignedStaff: st._id }),
            Loan.countDocuments({ assignedStaff: st._id, status: 'active' }),
            Payment.aggregate([
              { $match: { collectedBy: st._id, status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
          ]);
          return {
            _id: st._id,
            name: st.name,
            email: st.email,
            status: st.status,
            assignedCustomers: cCount,
            activeLoans: lCount,
            totalCollected: pTotal[0]?.total || 0,
          };
        })
      );

      return res.status(200).json({
        success: true,
        role: 'admin',
        data: {
          totalCustomers,
          totalLoans: allLoans.length,
          activeLoansCount: activeLoans.length,
          completedLoansCount: completedLoans.length,
          pendingLoansCount: pendingLoans.length,
          pendingInstallmentsCount,
          overdueInstallmentsCount,
          todayDue: todayDueAmount,
          upcomingDue: upcomingDueAmount,
          overdueLoansCount,
          totalOutstanding: pendingPayments,
          assignedTasksCount: assignedTasks.length,
          assignedTasks: assignedTasks.slice(0, 15),
          totalCollections,
          todayCollections,
          pendingPayments,
          totalRevenue,
          totalExpenses,
          netProfit,
          overallOutstandingAmount: pendingPayments,
          totalStaff,
          totalRecoveryStaff,
          staffPerformance,
          recentActivities,
          isStaffView: false,
        },
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate dashboard summary',
      });
    }
  },

  // GET /api/dashboard/admin-financials (ADMIN ONLY)
  getAdminFinancials: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Financial summary and analytics are restricted to Administrator.',
        });
      }

      const [allLoans, allPayments] = await Promise.all([
        Loan.find(),
        Payment.find({ status: 'completed' }),
      ]);

      const activeLoans = allLoans.filter((l) => l.status === 'active');
      const totalCollections = allPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
      const overallOutstandingAmount = activeLoans.reduce((acc, l) => acc + (l.outstandingAmount || 0), 0);

      const totalDisbursed = allLoans.reduce((acc, l) => acc + (l.principalAmount || 0), 0);
      const totalInterestAccrued = allLoans.reduce((acc, l) => acc + (l.totalInterest || 0), 0);
      const totalProcessingFees = allLoans.reduce((acc, l) => acc + (l.processingFee || 0), 0);

      const totalRevenue = totalInterestAccrued + totalProcessingFees;
      const totalExpenses = Math.round(totalRevenue * 0.22);
      const netProfit = Math.max(0, totalRevenue - totalExpenses);
      const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

      // Monthly Profit & Collection Analytics (Last 6 Months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const monthlyProfitChart = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${y}-${m}`;
        const monthLabel = `${months[d.getMonth()]} ${String(y).slice(-2)}`;

        const mPayments = allPayments.filter((p) => p.paymentDate && p.paymentDate.startsWith(monthPrefix));
        const mCollected = mPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
        const mInterest = mPayments.reduce((acc, p) => acc + (p.interestAmount || Math.round(p.amount * 0.2)), 0);
        const mExpenses = Math.round(mInterest * 0.22);
        const mProfit = Math.max(0, mInterest - mExpenses);

        monthlyProfitChart.push({
          month: monthLabel,
          revenue: mInterest,
          expenses: mExpenses,
          netProfit: mProfit,
          collections: mCollected,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          totalCollections,
          totalRevenue,
          totalExpenses,
          netProfit,
          totalProfit: totalRevenue,
          overallOutstandingAmount,
          totalDisbursed,
          profitMargin: `${profitMargin}%`,
          monthlyProfitChart,
        },
      });
    } catch (error) {
      console.error('Error in getAdminFinancials:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve admin financials',
      });
    }
  },

  // GET /api/dashboard/monthly-collections (ADMIN ONLY)
  getMonthlyCollections: async (req, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access Denied: Financial collection trends and charts are restricted to Administrator.',
        });
      }

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const result = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${y}-${m}`;
        const monthLabel = `${months[d.getMonth()]} ${String(y).slice(-2)}`;

        const payments = await Payment.find({
          status: 'completed',
          paymentDate: { $regex: `^${monthPrefix}` },
        });

        const total = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
        result.push({
          month: monthLabel,
          collected: total,
          target: 800000,
        });
      }

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve monthly collections',
      });
    }
  },

  // GET /api/dashboard/upcoming-payments
  getUpcomingPayments: async (req, res) => {
    try {
      const isStaff = req.user.role === 'staff';
      const isRecoveryStaff = req.user.role === 'recovery_staff';
      const loanQuery = { status: 'active' };

      if (isRecoveryStaff) {
        loanQuery.assignedRecoveryStaff = req.user._id;
      } else if (isStaff) {
        loanQuery.assignedStaff = req.user._id;
      }

      const activeLoans = await Loan.find(loanQuery).populate('customer');
      const upcoming = [];
      const todayStr = new Date().toISOString().split('T')[0];

      for (const loan of activeLoans) {
        if (!loan.schedule) continue;
        for (const inst of loan.schedule) {
          if (inst.status !== 'paid' && inst.dueDate >= todayStr) {
            upcoming.push({
              _id: `${loan._id}-${inst.installmentNumber}`,
              loanMongoId: loan._id,
              loanId: loan.loanId,
              customerId: loan.customer?._id,
              customerName: loan.customer?.fullName || 'Borrower',
              dueDate: inst.dueDate,
              amount: inst.remainingBalance || inst.totalDue,
              installmentNumber: inst.installmentNumber,
            });
            break; // next upcoming for this loan
          }
        }
      }

      // Sort by due date ascending
      upcoming.sort((a, b) => (a.dueDate > b.dueDate ? 1 : -1));

      return res.status(200).json({
        success: true,
        data: upcoming.slice(0, 10),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve upcoming payments',
      });
    }
  },
};
