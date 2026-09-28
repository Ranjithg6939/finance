import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';
import { recordActivity } from '../middleware/auth.js';

export const customerController = {
  // GET /api/customers
  getAllCustomers: async (req, res) => {
    try {
      const { search, status, staffId, page = 1, limit = 50 } = req.query;
      const query = {};

      // DATA-LEVEL AUTHORIZATION:
      // Staff only sees customers assigned to them!
      if (req.user.role === 'staff') {
        query.assignedStaff = req.user._id;
      } else if (staffId) {
        // Admin filtering by specific staff
        query.assignedStaff = staffId;
      }

      if (status && ['active', 'inactive'].includes(status)) {
        query.status = status;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { fullName: regex },
          { phone: regex },
          { customerId: regex },
          { 'identification.idNumber': regex },
          { 'identification.panNumber': regex },
        ];
      }

      const customers = await Customer.find(query)
        .populate('assignedStaff', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await Customer.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: customers.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: customers,
      });
    } catch (error) {
      console.error('Error in getAllCustomers:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customers',
      });
    }
  },

  // GET /api/customers/:id
  getCustomerById: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await Customer.findById(id).populate('assignedStaff', 'name email phone');
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
        });
      }

      // DATA-LEVEL AUTHORIZATION:
      // Prevent ID-based URL bypass by Staff
      if (
        req.user.role === 'staff' &&
        (!customer.assignedStaff || customer.assignedStaff._id.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this customer record',
        });
      }

      // Fetch customer's loans and payments
      const [loans, payments] = await Promise.all([
        Loan.find({ customer: customer._id }).sort({ createdAt: -1 }),
        Payment.find({ customer: customer._id }).sort({ createdAt: -1 }),
      ]);

      const activeLoansCount = loans.filter((l) => l.status === 'active').length;
      const totalOutstanding = loans.reduce((acc, l) => acc + (l.outstandingAmount || 0), 0);
      const totalPaid = payments.reduce((acc, p) => acc + (p.amount || 0), 0);

      const customerData = customer.toObject();
      customerData.loans = loans;
      customerData.payments = payments;
      customerData.summary = {
        totalLoans: loans.length,
        activeLoansCount,
        totalOutstanding,
        totalPaid,
      };

      return res.status(200).json({
        success: true,
        data: customerData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch customer details',
      });
    }
  },

  // POST /api/customers
  createCustomer: async (req, res) => {
    try {
      const customerData = { ...req.body };

      // Generate customerId if not provided
      if (!customerData.customerId) {
        const count = await Customer.countDocuments();
        customerData.customerId = `CUST-${1001 + count}`;
      }

      // DATA-LEVEL AUTHORIZATION:
      // If Staff creates customer, auto-assign to self! Staff cannot assign to other staff.
      if (req.user.role === 'staff') {
        customerData.assignedStaff = req.user._id;
      }

      const customer = await Customer.create(customerData);
      await customer.populate('assignedStaff', 'name email phone');

      await recordActivity(
        req,
        `${req.user.role === 'admin' ? 'Admin' : 'Staff'} created customer: ${customer.fullName}`,
        'Customer',
        customer._id.toString(),
        { customerId: customer.customerId, assignedStaff: customer.assignedStaff?.name }
      );

      return res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        data: customer,
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create customer',
      });
    }
  },

  // PUT /api/customers/:id
  updateCustomer: async (req, res) => {
    try {
      const { id } = req.params;
      const customer = await Customer.findById(id);

      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      // DATA-LEVEL AUTHORIZATION:
      if (
        req.user.role === 'staff' &&
        (!customer.assignedStaff || customer.assignedStaff.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this customer',
        });
      }

      const updates = { ...req.body };

      // Staff cannot reassign customers
      if (req.user.role === 'staff') {
        delete updates.assignedStaff;
      }

      Object.assign(customer, updates);
      await customer.save();
      await customer.populate('assignedStaff', 'name email phone');

      await recordActivity(
        req,
        `${req.user.role === 'admin' ? 'Admin' : 'Staff'} updated customer: ${customer.fullName}`,
        'Customer',
        customer._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: customer,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update customer',
      });
    }
  },

  // PATCH /api/customers/:id/assign (Admin only)
  assignStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { staffId } = req.body;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      let staffName = 'Unassigned';
      if (staffId) {
        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'staff') {
          return res.status(400).json({ success: false, message: 'Invalid staff member selected' });
        }
        customer.assignedStaff = staff._id;
        staffName = staff.name;
      } else {
        customer.assignedStaff = null;
      }

      await customer.save();
      await customer.populate('assignedStaff', 'name email phone');

      // Also cascade assignment to active loans of this customer
      if (customer.assignedStaff) {
        await Loan.updateMany(
          { customer: customer._id, status: { $ne: 'completed' } },
          { $set: { assignedStaff: customer.assignedStaff } }
        );
      }

      await recordActivity(
        req,
        `Admin assigned customer ${customer.fullName} to ${staffName}`,
        'Customer',
        customer._id.toString(),
        { staffId, staffName }
      );

      return res.status(200).json({
        success: true,
        message: `Customer assigned to ${staffName}`,
        data: customer,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to assign staff to customer',
      });
    }
  },

  // DELETE /api/customers/:id (Admin only!)
  deleteCustomer: async (req, res) => {
    try {
      const { id } = req.params;

      const customer = await Customer.findById(id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }

      // Check for active loans
      const activeLoans = await Loan.countDocuments({
        customer: id,
        status: 'active',
      });

      if (activeLoans > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer with active loans. Please close or settle loans first.',
        });
      }

      await Customer.findByIdAndDelete(id);

      await recordActivity(
        req,
        `Admin deleted customer: ${customer.fullName}`,
        'Customer',
        id,
        { customerId: customer.customerId }
      );

      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete customer',
      });
    }
  },
};
