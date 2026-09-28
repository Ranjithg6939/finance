import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import Customer from '../models/Customer.js';
import User from '../models/User.js';

export const reportController = {
  // GET /api/reports/loans (Admin only)
  getLoansReport: async (req, res) => {
    try {
      const { status, startDate, endDate } = req.query;
      const query = {};
      if (status) query.status = status;
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = startDate;
        if (endDate) query.startDate.$lte = endDate;
      }

      const loans = await Loan.find(query)
        .populate('customer', 'fullName customerId phone')
        .populate('assignedStaff', 'name email');

      const totalPrincipal = loans.reduce((acc, l) => acc + (l.principalAmount || 0), 0);
      const totalOutstanding = loans.reduce((acc, l) => acc + (l.outstandingAmount || 0), 0);
      const totalCollected = loans.reduce((acc, l) => acc + (l.totalPaid || 0), 0);

      return res.status(200).json({
        success: true,
        data: loans,
        summary: {
          totalCount: loans.length,
          totalPrincipal,
          totalOutstanding,
          totalCollected,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate loans report' });
    }
  },

  // GET /api/reports/payments (Admin only)
  getPaymentsReport: async (req, res) => {
    try {
      const { startDate, endDate, staffId } = req.query;
      const query = { status: 'completed' };

      if (staffId) query.collectedBy = staffId;
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = startDate;
        if (endDate) query.paymentDate.$lte = endDate;
      }

      const payments = await Payment.find(query)
        .populate('loan', 'loanId')
        .populate('customer', 'fullName customerId')
        .populate('collectedBy', 'name');

      const totalAmount = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

      return res.status(200).json({
        success: true,
        data: payments,
        summary: {
          totalPayments: payments.length,
          totalAmount,
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate payments report' });
    }
  },

  // GET /api/reports/interest (Admin only)
  getInterestReport: async (req, res) => {
    try {
      const loans = await Loan.find().populate('customer', 'fullName customerId');
      const totalInterestAccrued = loans.reduce((acc, l) => acc + (l.totalInterest || 0), 0);
      const totalInterestCollected = loans.reduce((acc, l) => {
        const ratio = (l.totalPaid || 0) / (l.totalPayable || 1);
        return acc + Math.round((l.totalInterest || 0) * ratio);
      }, 0);

      return res.status(200).json({
        success: true,
        data: {
          totalInterestAccrued,
          totalInterestCollected,
          pendingInterest: Math.max(0, totalInterestAccrued - totalInterestCollected),
          loansSummary: loans.map((l) => ({
            loanId: l.loanId,
            customerName: l.customer?.fullName,
            principal: l.principalAmount,
            rate: l.interestRate,
            interestType: l.interestType,
            totalInterest: l.totalInterest,
          })),
        },
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate interest report' });
    }
  },

  // GET /api/reports/customers (Admin only)
  getCustomersReport: async (req, res) => {
    try {
      const customers = await Customer.find().populate('assignedStaff', 'name email');
      return res.status(200).json({
        success: true,
        data: customers,
        total: customers.length,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate customers report' });
    }
  },

  // GET /api/reports/staff-performance (Admin only)
  getStaffPerformanceReport: async (req, res) => {
    try {
      const staffList = await User.find({ role: 'staff' }).select('name email phone status createdAt');

      const performance = await Promise.all(
        staffList.map(async (st) => {
          const [customersCount, activeLoansCount, completedLoansCount, paymentsTotal] = await Promise.all([
            Customer.countDocuments({ assignedStaff: st._id }),
            Loan.countDocuments({ assignedStaff: st._id, status: 'active' }),
            Loan.countDocuments({ assignedStaff: st._id, status: 'completed' }),
            Payment.aggregate([
              { $match: { collectedBy: st._id, status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
          ]);

          return {
            _id: st._id,
            name: st.name,
            email: st.email,
            phone: st.phone,
            status: st.status,
            assignedCustomers: customersCount,
            activeLoans: activeLoansCount,
            completedLoans: completedLoansCount,
            totalCollected: paymentsTotal[0]?.total || 0,
            joinedDate: st.createdAt,
          };
        })
      );

      return res.status(200).json({
        success: true,
        data: performance,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to generate staff report' });
    }
  },
};
