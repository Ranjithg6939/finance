import User, { DEFAULT_PERMISSIONS } from '../models/User.js';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';
import { recordActivity } from '../middleware/auth.js';

export const staffController = {
  // GET /api/staff (Admin only)
  getAllStaff: async (req, res) => {
    try {
      const { search, status, role } = req.query;
      const query = {};

      if (role && ['staff', 'recovery_staff'].includes(role)) {
        query.role = role;
      } else {
        query.role = { $in: ['staff', 'recovery_staff'] };
      }

      if (status && ['active', 'inactive'].includes(status)) {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } },
        ];
      }

      const staffMembers = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 });

      // Enrich with assigned customer and loan counts
      const enrichedStaff = await Promise.all(
        staffMembers.map(async (member) => {
          const isRecovery = member.role === 'recovery_staff';
          const [customerCount, activeLoanCount, totalCollectionsResult] = await Promise.all([
            Customer.countDocuments(
              isRecovery ? { assignedRecoveryStaff: member._id } : { assignedStaff: member._id }
            ),
            Loan.countDocuments(
              isRecovery
                ? { assignedRecoveryStaff: member._id, status: 'active' }
                : { assignedStaff: member._id, status: 'active' }
            ),
            Payment.aggregate([
              { $match: { collectedBy: member._id, status: 'completed' } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
          ]);

          const totalCollected = totalCollectionsResult[0]?.total || 0;

          return {
            ...member.toObject(),
            assignedCustomersCount: customerCount,
            assignedActiveLoansCount: activeLoanCount,
            totalCollections: totalCollected,
          };
        })
      );

      return res.status(200).json({
        success: true,
        count: enrichedStaff.length,
        data: enrichedStaff,
      });
    } catch (error) {
      console.error('Error fetching staff list:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch staff members',
      });
    }
  },

  // GET /api/staff/:id
  getStaffById: async (req, res) => {
    try {
      const { id } = req.params;

      // Staff or recovery staff can only view their own profile
      if (
        (req.user.role === 'staff' || req.user.role === 'recovery_staff') &&
        req.user._id.toString() !== id
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this staff member',
        });
      }

      const staff = await User.findById(id).select('-password');
      if (!staff) {
        return res.status(404).json({
          success: false,
          message: 'Staff member not found',
        });
      }

      const isRecovery = staff.role === 'recovery_staff';
      const custQuery = isRecovery ? { assignedRecoveryStaff: staff._id } : { assignedStaff: staff._id };
      const loanQuery = isRecovery ? { assignedRecoveryStaff: staff._id } : { assignedStaff: staff._id };

      const [assignedCustomers, assignedLoans, recentPayments, recentActivities] = await Promise.all([
        Customer.find(custQuery).sort({ createdAt: -1 }).limit(10),
        Loan.find(loanQuery)
          .populate('customer', 'fullName customerId phone')
          .sort({ createdAt: -1 })
          .limit(10),
        Payment.find({ collectedBy: staff._id, status: 'completed' }).sort({ createdAt: -1 }).limit(10),
        ActivityLog.find({ user: staff._id }).sort({ createdAt: -1 }).limit(10),
      ]);

      const [activeLoanCount, totalCollectionsResult] = await Promise.all([
        Loan.countDocuments({ ...loanQuery, status: 'active' }),
        Payment.aggregate([
          { $match: { collectedBy: staff._id, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          ...staff.toObject(),
          metrics: {
            assignedCustomersCount: assignedCustomers.length,
            assignedActiveLoansCount: activeLoanCount,
            totalCollections: totalCollectionsResult[0]?.total || 0,
          },
          assignedCustomers,
          assignedLoans,
          recentPayments,
          recentActivities,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch staff details',
      });
    }
  },

  // POST /api/staff (Admin only)
  createStaff: async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        mobile,
        password,
        role = 'staff',
        status = 'active',
        permissions,
      } = req.body;

      // Validation
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Full name is required' });
      }
      if (!/^[A-Za-z\s]+$/.test(name.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Full name must contain letters and spaces only',
        });
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Valid email address is required' });
      }

      const rawPhone = mobile || phone || '';
      const cleanPhone = rawPhone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: 'Mobile number must be exactly 10 digits',
        });
      }

      if (!password || password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters',
        });
      }

      const assignedRole = role === 'recovery_staff' ? 'recovery_staff' : 'staff';

      // Check duplicate email
      const existing = await User.findOne({ email: email.trim().toLowerCase() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists',
        });
      }

      const initialPermissions = Array.isArray(permissions) && permissions.length > 0
        ? permissions
        : DEFAULT_PERMISSIONS[assignedRole];

      const newStaff = await User.create({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: cleanPhone,
        mobile: cleanPhone,
        password,
        role: assignedRole,
        status: status === 'inactive' ? 'inactive' : 'active',
        permissions: initialPermissions,
      });

      await recordActivity(
        req,
        `Admin created ${assignedRole === 'recovery_staff' ? 'Recovery Staff' : 'Staff'}: ${newStaff.name}`,
        'Staff',
        newStaff._id.toString(),
        { email: newStaff.email, role: assignedRole }
      );

      return res.status(201).json({
        success: true,
        message: `${assignedRole === 'recovery_staff' ? 'Recovery Staff' : 'Staff'} account created successfully`,
        data: newStaff.toSafeObject(),
      });
    } catch (error) {
      console.error('Create staff error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create staff account',
      });
    }
  },

  // PUT /api/staff/:id (Admin only)
  updateStaff: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, phone, mobile, role, status, permissions } = req.body;

      const staff = await User.findById(id);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      if (name) {
        if (!/^[A-Za-z\s]+$/.test(name.trim())) {
          return res.status(400).json({
            success: false,
            message: 'Full name must contain letters and spaces only',
          });
        }
        staff.name = name.trim();
      }

      const rawPhone = mobile !== undefined ? mobile : phone;
      if (rawPhone !== undefined) {
        const cleanPhone = rawPhone.replace(/\D/g, '');
        if (cleanPhone && cleanPhone.length !== 10) {
          return res.status(400).json({
            success: false,
            message: 'Mobile number must be exactly 10 digits',
          });
        }
        staff.phone = cleanPhone;
        staff.mobile = cleanPhone;
      }

      if (email && email.trim().toLowerCase() !== staff.email) {
        const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken by another user',
          });
        }
        staff.email = email.trim().toLowerCase();
      }

      if (role && ['admin', 'staff', 'recovery_staff'].includes(role)) {
        staff.role = role;
      }

      if (status && ['active', 'inactive'].includes(status)) {
        staff.status = status;
      }

      if (Array.isArray(permissions)) {
        staff.permissions = permissions;
      }

      await staff.save();

      await recordActivity(
        req,
        `Admin updated staff: ${staff.name}`,
        'Staff',
        staff._id.toString(),
        { status: staff.status, role: staff.role }
      );

      return res.status(200).json({
        success: true,
        message: 'Staff updated successfully',
        data: staff.toSafeObject(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update staff member',
      });
    }
  },

  // PUT /api/staff/:id/permissions (Admin only)
  updateStaffPermissions: async (req, res) => {
    try {
      const { id } = req.params;
      const { permissions } = req.body;

      if (!Array.isArray(permissions)) {
        return res.status(400).json({
          success: false,
          message: 'Permissions must be provided as an array of permission keys',
        });
      }

      const staff = await User.findById(id);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      staff.permissions = permissions;
      await staff.save();

      await recordActivity(
        req,
        `Admin updated permissions for ${staff.name} (${staff.role})`,
        'Staff',
        staff._id.toString(),
        { permissionsCount: permissions.length }
      );

      return res.status(200).json({
        success: true,
        message: `Permissions updated successfully for ${staff.name}`,
        data: staff.toSafeObject(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update staff permissions',
      });
    }
  },

  // PATCH /api/staff/:id/status (Admin only)
  toggleStaffStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const staff = await User.findById(id);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      // Prevent deactivating own admin account accidentally
      if (req.user._id.toString() === id && status === 'inactive') {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own administrative account',
        });
      }

      staff.status = status;
      await staff.save();

      const action = status === 'active' ? 'Admin activated staff' : 'Admin deactivated staff';
      await recordActivity(req, `${action}: ${staff.name}`, 'Staff', staff._id.toString(), {
        status,
      });

      return res.status(200).json({
        success: true,
        message: `Staff account has been ${status === 'active' ? 'activated' : 'deactivated'}`,
        data: staff.toSafeObject(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update staff status',
      });
    }
  },

  // POST /api/staff/:id/reset-password (Admin only)
  resetStaffPassword: async (req, res) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      const staff = await User.findById(id).select('+password');
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      staff.password = newPassword;
      await staff.save();

      await recordActivity(
        req,
        `Admin reset password for staff: ${staff.name}`,
        'Staff',
        staff._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: `Password reset successfully for ${staff.name}`,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reset staff password',
      });
    }
  },

  // DELETE /api/staff/:id (Admin only)
  deleteStaff: async (req, res) => {
    try {
      const { id } = req.params;

      if (req.user._id.toString() === id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account',
        });
      }

      const staff = await User.findById(id);
      if (!staff) {
        return res.status(404).json({ success: false, message: 'Staff member not found' });
      }

      // Unassign customers and loans from this staff/recovery staff
      await Promise.all([
        Customer.updateMany({ assignedStaff: id }, { $set: { assignedStaff: null } }),
        Customer.updateMany({ assignedRecoveryStaff: id }, { $set: { assignedRecoveryStaff: null } }),
        Loan.updateMany({ assignedStaff: id }, { $set: { assignedStaff: null } }),
        Loan.updateMany({ assignedRecoveryStaff: id }, { $set: { assignedRecoveryStaff: null } }),
      ]);

      await User.findByIdAndDelete(id);

      await recordActivity(
        req,
        `Admin deleted staff: ${staff.name}`,
        'Staff',
        id,
        { email: staff.email, role: staff.role }
      );

      return res.status(200).json({
        success: true,
        message: 'Staff member removed and records unassigned successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete staff member',
      });
    }
  },
};
