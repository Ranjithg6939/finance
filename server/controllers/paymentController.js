import Payment from '../models/Payment.js';
import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import { recordActivity } from '../middleware/auth.js';

export const paymentController = {
  // GET /api/payments
  getAllPayments: async (req, res) => {
    try {
      const { loanId, customerId, startDate, endDate, page = 1, limit = 50 } = req.query;
      const query = { status: 'completed' };

      // DATA-LEVEL AUTHORIZATION:
      // If staff, only return payments collected by staff or for assigned customers/loans
      if (req.user.role === 'staff') {
        const [assignedCustomerIds, assignedLoanIds] = await Promise.all([
          Customer.find({ assignedStaff: req.user._id }).distinct('_id'),
          Loan.find({ assignedStaff: req.user._id }).distinct('_id'),
        ]);

        query.$or = [
          { collectedBy: req.user._id },
          { customer: { $in: assignedCustomerIds } },
          { loan: { $in: assignedLoanIds } },
        ];
      }

      if (loanId) query.loan = loanId;
      if (customerId) query.customer = customerId;
      if (startDate || endDate) {
        query.paymentDate = {};
        if (startDate) query.paymentDate.$gte = startDate;
        if (endDate) query.paymentDate.$lte = endDate;
      }

      const payments = await Payment.find(query)
        .populate('loan', 'loanId principalAmount outstandingAmount')
        .populate('customer', 'fullName customerId phone')
        .populate('collectedBy', 'name email')
        .sort({ paymentDate: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Payment.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: payments.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: payments,
      });
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payments',
      });
    }
  },

  // GET /api/payments/:id
  getPaymentById: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findById(id)
        .populate('loan')
        .populate('customer')
        .populate('collectedBy', 'name email');

      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }

      // DATA-LEVEL AUTHORIZATION:
      if (req.user.role === 'staff') {
        const isCollector = payment.collectedBy?._id?.toString() === req.user._id.toString();
        const isAssignedStaff =
          payment.customer?.assignedStaff?.toString() === req.user._id.toString() ||
          payment.loan?.assignedStaff?.toString() === req.user._id.toString();

        if (!isCollector && !isAssignedStaff) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to view this payment',
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: payment,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment details',
      });
    }
  },

  // POST /api/payments
  createPayment: async (req, res) => {
    try {
      const {
        loan: loanIdInput,
        loanId,
        amount,
        paymentDate = new Date().toISOString().split('T')[0],
        paymentMethod = 'Cash',
        referenceNumber = '',
        notes = '',
      } = req.body;

      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
      }

      // Find loan
      const loan = await Loan.findOne({
        $or: [{ _id: loanIdInput }, { loanId: loanId || loanIdInput }],
      }).populate('customer');

      if (!loan) {
        return res.status(404).json({ success: false, message: 'Associated loan record not found' });
      }

      // DATA-LEVEL AUTHORIZATION:
      // Staff can only record payments for loans/customers assigned to them
      if (
        req.user.role === 'staff' &&
        (!loan.assignedStaff || loan.assignedStaff.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to record payments for this loan',
        });
      }

      // Generate payment ID
      const count = await Payment.countDocuments();
      const newPaymentId = `PAY-${1001 + count}`;

      // Create payment
      const payment = await Payment.create({
        paymentId: newPaymentId,
        loan: loan._id,
        loanId: loan.loanId,
        customer: loan.customer._id,
        customerName: loan.customer.fullName,
        customerId: loan.customer.customerId,
        amount: numAmount,
        paymentDate,
        paymentMethod,
        referenceNumber,
        collectedBy: req.user._id,
        collectorName: req.user.name,
        notes,
        status: 'completed',
      });

      // Update Loan finances
      loan.totalPaid = (loan.totalPaid || 0) + numAmount;
      loan.outstandingAmount = Math.max(0, (loan.outstandingAmount || loan.totalPayable) - numAmount);

      // Check loan completion
      if (loan.outstandingAmount === 0) {
        loan.status = 'completed';
      }

      // Update installment schedule allocation
      let unallocated = numAmount;
      if (loan.schedule && loan.schedule.length > 0) {
        for (const inst of loan.schedule) {
          if (unallocated <= 0) break;
          const dueLeft = (inst.totalDue || 0) - (inst.paidAmount || 0);
          if (dueLeft > 0) {
            const payThis = Math.min(unallocated, dueLeft);
            inst.paidAmount = (inst.paidAmount || 0) + payThis;
            inst.remainingBalance = Math.max(0, (inst.totalDue || 0) - inst.paidAmount);
            inst.status = inst.remainingBalance === 0 ? 'paid' : 'partially_paid';
            inst.paidDate = paymentDate;
            unallocated -= payThis;
          }
        }
      }

      await loan.save();

      // Update Customer total outstanding and active loans if completed
      const incUpdate = { totalOutstanding: -numAmount };
      if (loan.status === 'completed') {
        incUpdate.activeLoansCount = -1;
      }
      await Customer.findByIdAndUpdate(loan.customer._id, { $inc: incUpdate });

      await recordActivity(
        req,
        `${req.user.role === 'admin' ? 'Admin' : 'Staff'} recorded payment of ₹${numAmount} for ${loan.loanId}`,
        'Payment',
        payment._id.toString(),
        {
          paymentId: payment.paymentId,
          amount: numAmount,
          loanId: loan.loanId,
          customer: loan.customer.fullName,
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Payment recorded successfully',
        data: payment,
      });
    } catch (error) {
      console.error('Error creating payment:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to record payment',
      });
    }
  },

  // DELETE /api/payments/:id (Admin only!)
  deletePayment: async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findById(id);
      if (!payment) {
        return res.status(404).json({ success: false, message: 'Payment record not found' });
      }

      // Revert Loan finances
      const loan = await Loan.findById(payment.loan);
      if (loan) {
        loan.totalPaid = Math.max(0, (loan.totalPaid || 0) - payment.amount);
        loan.outstandingAmount = (loan.outstandingAmount || 0) + payment.amount;
        if (loan.status === 'completed') {
          loan.status = 'active';
        }
        await loan.save();

        await Customer.findByIdAndUpdate(payment.customer, {
          $inc: { totalOutstanding: payment.amount },
        });
      }

      await Payment.findByIdAndDelete(id);

      await recordActivity(
        req,
        `Admin cancelled/deleted payment: ${payment.paymentId}`,
        'Payment',
        id,
        { amount: payment.amount, paymentId: payment.paymentId }
      );

      return res.status(200).json({
        success: true,
        message: 'Payment cancelled and balances reverted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to cancel payment',
      });
    }
  },
};
