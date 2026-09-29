import Loan from '../models/Loan.js';
import Customer from '../models/Customer.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { recordActivity } from '../middleware/auth.js';

export const loanController = {
  // POST /api/loans/calculate
  calculateLoan: async (req, res) => {
    try {
      const {
        principalAmount = 0,
        interestRate = 0,
        duration = 12,
        durationUnit = 'months',
        interestType = 'monthly',
        calculationMethod = 'simple',
        startDate = new Date().toISOString().split('T')[0],
      } = req.body;

      const principal = Number(principalAmount);
      const rate = Number(interestRate);
      const months = durationUnit === 'years' ? Number(duration) * 12 : Number(duration);

      let totalInterest = 0;
      let totalPayable = 0;
      let emi = 0;
      const schedule = [];

      if (calculationMethod === 'simple') {
        const effectiveRatePerMonth = interestType === 'yearly' ? rate / 12 : rate;
        totalInterest = Math.round(principal * (effectiveRatePerMonth / 100) * months);
        totalPayable = principal + totalInterest;
        emi = Math.round(totalPayable / months);

        const principalPerMonth = Math.round(principal / months);
        const interestPerMonth = Math.round(totalInterest / months);

        let curDate = new Date(startDate);
        for (let i = 1; i <= months; i++) {
          curDate.setMonth(curDate.getMonth() + 1);
          const dueDateStr = curDate.toISOString().split('T')[0];

          schedule.push({
            installmentNumber: i,
            dueDate: dueDateStr,
            principalDue: principalPerMonth,
            interestDue: interestPerMonth,
            totalDue: emi,
            paidAmount: 0,
            remainingBalance: emi,
            status: 'pending',
          });
        }
      } else {
        // Reducing balance
        const r = (interestType === 'yearly' ? rate / 12 : rate) / 100;
        if (r === 0) {
          emi = Math.round(principal / months);
          totalPayable = principal;
          totalInterest = 0;
        } else {
          emi = Math.round((principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1));
          totalPayable = emi * months;
          totalInterest = totalPayable - principal;
        }

        let balance = principal;
        let curDate = new Date(startDate);

        for (let i = 1; i <= months; i++) {
          curDate.setMonth(curDate.getMonth() + 1);
          const dueDateStr = curDate.toISOString().split('T')[0];
          const interestPortion = Math.round(balance * r);
          const principalPortion = emi - interestPortion;
          balance = Math.max(0, balance - principalPortion);

          schedule.push({
            installmentNumber: i,
            dueDate: dueDateStr,
            principalDue: principalPortion,
            interestDue: interestPortion,
            totalDue: emi,
            paidAmount: 0,
            remainingBalance: emi,
            status: 'pending',
          });
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          principalAmount: principal,
          interestRate: rate,
          durationMonths: months,
          totalInterest,
          totalPayable,
          installmentAmount: emi,
          schedule,
        },
      });
    } catch (error) {
      console.error('Loan calculation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Loan calculation failed',
      });
    }
  },

  // GET /api/loans
  getAllLoans: async (req, res) => {
    try {
      const { status, customerId, staffId, recoveryStaffId, search, filter, page = 1, limit = 50 } = req.query;
      const query = {};

      // DATA-LEVEL AUTHORIZATION:
      // Staff only sees loans assigned to them, Recovery Staff sees recovery loans assigned to them
      if (req.user.role === 'staff') {
        query.assignedStaff = req.user._id;
      } else if (req.user.role === 'recovery_staff') {
        query.assignedRecoveryStaff = req.user._id;
      } else {
        if (filter === 'my_loans') {
          query.assignedStaff = { $ne: null };
        } else if (filter === 'my_recovery') {
          query.assignedRecoveryStaff = { $ne: null };
        }
        if (staffId) query.assignedStaff = staffId;
        if (recoveryStaffId) query.assignedRecoveryStaff = recoveryStaffId;
      }

      if (status) {
        query.status = status;
      }

      if (customerId) {
        query.customer = customerId;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ loanId: regex }, { customerId: regex }];
      }

      const loans = await Loan.find(query)
        .populate('customer', 'fullName customerId phone email')
        .populate('assignedStaff', 'name email phone')
        .populate('assignedRecoveryStaff', 'name email phone')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Loan.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: loans.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: loans,
      });
    } catch (error) {
      console.error('Error fetching loans:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch loans',
      });
    }
  },

  // GET /api/loans/:id
  getLoanById: async (req, res) => {
    try {
      const { id } = req.params;

      const loan = await Loan.findById(id)
        .populate('customer')
        .populate('assignedStaff', 'name email phone')
        .populate('staffAssignedBy', 'name email')
        .populate('assignedRecoveryStaff', 'name email phone')
        .populate('recoveryAssignedBy', 'name email')
        .populate('approvedBy', 'name email');

      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      // DATA-LEVEL AUTHORIZATION:
      if (
        req.user.role === 'staff' &&
        (!loan.assignedStaff || loan.assignedStaff._id.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this loan record',
        });
      }

      if (
        req.user.role === 'recovery_staff' &&
        (!loan.assignedRecoveryStaff || loan.assignedRecoveryStaff._id.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this recovery loan record',
        });
      }

      const payments = await Payment.find({ loan: loan._id }).sort({ paymentDate: -1 });

      const loanData = loan.toObject();
      loanData.payments = payments;

      return res.status(200).json({
        success: true,
        data: loanData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch loan details',
      });
    }
  },

  // POST /api/loans
  createLoan: async (req, res) => {
    try {
      const loanData = { ...req.body };

      const customer = await Customer.findById(loanData.customer);
      if (!customer) {
        return res.status(400).json({ success: false, message: 'Invalid customer specified' });
      }

      // DATA-LEVEL AUTHORIZATION:
      // If staff creates loan, it must be for their assigned customer or auto-assign to them
      if (req.user.role === 'staff') {
        if (customer.assignedStaff && customer.assignedStaff.toString() !== req.user._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'You cannot create a loan for a customer assigned to another staff member',
          });
        }
        loanData.assignedStaff = req.user._id;
      } else if (!loanData.assignedStaff && customer.assignedStaff) {
        loanData.assignedStaff = customer.assignedStaff;
      }

      if (!loanData.loanId) {
        const count = await Loan.countDocuments();
        loanData.loanId = `LN-${1001 + count}`;
      }

      loanData.customerId = customer.customerId;
      loanData.outstandingAmount = loanData.totalPayable || loanData.principalAmount;
      loanData.totalPaid = 0;

      // Status
      if (!loanData.status) {
        loanData.status = req.user.role === 'admin' ? 'active' : 'pending';
      }

      if (loanData.status === 'active' && req.user.role === 'admin') {
        loanData.approvedBy = req.user._id;
      }

      const loan = await Loan.create(loanData);
      await loan.populate('customer', 'fullName customerId phone');
      await loan.populate('assignedStaff', 'name email phone');

      // Update customer active loans count
      await Customer.findByIdAndUpdate(customer._id, {
        $inc: { activeLoansCount: 1, totalOutstanding: loan.outstandingAmount },
      });

      await recordActivity(
        req,
        `${req.user.role === 'admin' ? 'Admin' : 'Staff'} created loan: ${loan.loanId}`,
        'Loan',
        loan._id.toString(),
        {
          loanId: loan.loanId,
          amount: loan.principalAmount,
          customer: customer.fullName,
        }
      );

      return res.status(201).json({
        success: true,
        message: 'Loan created successfully',
        data: loan,
      });
    } catch (error) {
      console.error('Error creating loan:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create loan',
      });
    }
  },

  // PUT /api/loans/:id
  updateLoan: async (req, res) => {
    try {
      const { id } = req.params;
      const loan = await Loan.findById(id);

      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      // DATA-LEVEL AUTHORIZATION:
      if (
        req.user.role === 'staff' &&
        (!loan.assignedStaff || loan.assignedStaff.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this loan',
        });
      }

      const updates = { ...req.body };

      // Staff cannot change assignment, status, or approval
      if (req.user.role === 'staff') {
        delete updates.assignedStaff;
        delete updates.status;
        delete updates.approvedBy;
      }

      Object.assign(loan, updates);
      await loan.save();
      await loan.populate('customer', 'fullName customerId');
      await loan.populate('assignedStaff', 'name email');

      await recordActivity(
        req,
        `${req.user.role === 'admin' ? 'Admin' : 'Staff'} updated loan: ${loan.loanId}`,
        'Loan',
        loan._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: 'Loan updated successfully',
        data: loan,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update loan',
      });
    }
  },

  // PATCH /api/loans/:id/status (Admin only: Approve/Reject/Status)
  changeLoanStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'active', 'completed', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid loan status' });
      }

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      loan.status = status;
      if (status === 'active') {
        loan.approvedBy = req.user._id;
      }

      await loan.save();
      await loan.populate('customer', 'fullName');

      await recordActivity(
        req,
        `Admin changed loan ${loan.loanId} status to ${status}`,
        'Loan',
        loan._id.toString(),
        { status }
      );

      return res.status(200).json({
        success: true,
        message: `Loan status changed to ${status}`,
        data: loan,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to change loan status',
      });
    }
  },

  // PATCH /api/loans/:id/assign (Admin only)
  assignStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { staffId } = req.body;

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      let staffName = 'Unassigned';
      if (staffId) {
        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'staff') {
          return res.status(400).json({ success: false, message: 'Invalid staff member selected' });
        }
        loan.assignedStaff = staff._id;
        loan.staffAssignedAt = new Date();
        loan.staffAssignedBy = req.user._id;
        staffName = staff.name;
      } else {
        loan.assignedStaff = null;
        loan.staffAssignedAt = null;
        loan.staffAssignedBy = null;
      }

      await loan.save();
      await loan.populate('assignedStaff', 'name email phone');
      await loan.populate('staffAssignedBy', 'name email');

      await recordActivity(
        req,
        `Admin assigned loan ${loan.loanId} to ${staffName}`,
        'Loan',
        loan._id.toString(),
        { staffId, staffName }
      );

      return res.status(200).json({
        success: true,
        message: `Loan assigned to ${staffName}`,
        data: loan,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to assign staff to loan',
      });
    }
  },

  // DELETE /api/loans/:id (Admin only!)
  deleteLoan: async (req, res) => {
    try {
      const { id } = req.params;

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      // Check if any payments are tied to this loan
      const paymentsCount = await Payment.countDocuments({ loan: id });
      if (paymentsCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete loan with recorded payments. Please cancel payments first.',
        });
      }

      // Decrement customer active loans count
      if (loan.customer) {
        await Customer.findByIdAndUpdate(loan.customer, {
          $inc: { activeLoansCount: -1, totalOutstanding: -loan.outstandingAmount },
        });
      }

      await Loan.findByIdAndDelete(id);

      await recordActivity(
        req,
        `Admin deleted loan: ${loan.loanId}`,
        'Loan',
        id,
        { loanId: loan.loanId }
      );

      return res.status(200).json({
        success: true,
        message: 'Loan deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete loan',
      });
    }
  },

  // PATCH /api/loans/:id/assign-recovery (Admin only)
  assignRecoveryStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { recoveryStaffId } = req.body;

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      let staffName = 'Unassigned';
      if (recoveryStaffId) {
        const staff = await User.findById(recoveryStaffId);
        if (!staff || staff.role !== 'recovery_staff') {
          return res.status(400).json({ success: false, message: 'Invalid recovery staff member selected' });
        }
        loan.assignedRecoveryStaff = staff._id;
        loan.recoveryAssignedAt = new Date();
        loan.recoveryAssignedBy = req.user._id;
        if (!loan.recoveryStatus || loan.recoveryStatus === 'none') {
          loan.recoveryStatus = 'pending';
        }
        staffName = staff.name;

        // Also sync to customer
        if (loan.customer) {
          await Customer.findByIdAndUpdate(loan.customer, { assignedRecoveryStaff: staff._id });
        }
      } else {
        loan.assignedRecoveryStaff = null;
        loan.recoveryAssignedAt = null;
        loan.recoveryAssignedBy = null;
      }

      await loan.save();
      await loan.populate('assignedRecoveryStaff', 'name email phone');
      await loan.populate('recoveryAssignedBy', 'name email');

      await recordActivity(
        req,
        `Admin assigned recovery staff ${staffName} to loan ${loan.loanId}`,
        'Loan',
        loan._id.toString(),
        { recoveryStaffId, staffName }
      );

      return res.status(200).json({
        success: true,
        message: `Recovery staff assigned: ${staffName}`,
        data: loan,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to assign recovery staff' });
    }
  },

  // POST /api/loans/:id/recovery-note
  addRecoveryNote: async (req, res) => {
    try {
      const { id } = req.params;
      const { note } = req.body;

      if (!note || !note.trim()) {
        return res.status(400).json({ success: false, message: 'Recovery note content is required' });
      }

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      if (
        req.user.role === 'recovery_staff' &&
        (!loan.assignedRecoveryStaff || loan.assignedRecoveryStaff.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this loan' });
      }

      loan.recoveryNotes.unshift({
        note: note.trim(),
        addedBy: req.user._id,
        addedByName: req.user.name,
        createdAt: new Date(),
      });

      await loan.save();

      await recordActivity(
        req,
        `Recovery note added to loan ${loan.loanId}`,
        'Loan',
        loan._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: 'Recovery note added successfully',
        data: loan.recoveryNotes,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to add recovery note' });
    }
  },

  // PATCH /api/loans/:id/recovery-status
  updateRecoveryStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const validStatuses = [
        'none',
        'pending',
        'contacted',
        'promise_to_pay',
        'partially_paid',
        'paid',
        'overdue',
        'unable_to_contact',
        'follow_up_required',
        'in_progress',
        'recovered',
        'escalated',
        'legal_action',
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid recovery status value' });
      }

      const loan = await Loan.findById(id);
      if (!loan) {
        return res.status(404).json({ success: false, message: 'Loan not found' });
      }

      if (
        req.user.role === 'recovery_staff' &&
        (!loan.assignedRecoveryStaff || loan.assignedRecoveryStaff.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({ success: false, message: 'You are not assigned to this loan' });
      }

      loan.recoveryStatus = status;
      await loan.save();

      await recordActivity(
        req,
        `Recovery status updated to ${status} on loan ${loan.loanId}`,
        'Loan',
        loan._id.toString(),
        { recoveryStatus: status }
      );

      return res.status(200).json({
        success: true,
        message: `Recovery status updated to ${status}`,
        data: loan,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update recovery status' });
    }
  },
};
