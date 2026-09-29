import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const DEFAULT_PERMISSIONS = {
  admin: [
    'view_customer', 'add_customer', 'edit_customer', 'delete_customer',
    'view_loans', 'add_loan', 'edit_loan', 'delete_loan', 'view_loan_documents',
    'view_payments', 'add_collection', 'edit_collection', 'delete_collection',
    'view_assigned_loans', 'view_outstanding_amount', 'add_recovery_note', 'update_recovery_status', 'record_collection',
    'view_reports', 'view_financial_reports', 'view_profit_reports', 'view_profit_collection',
    'manage_staff', 'manage_recovery_staff', 'manage_users', 'manage_settings',
  ],
  staff: [
    'view_customer', 'add_customer', 'edit_customer',
    'view_loans', 'add_loan', 'edit_loan', 'view_loan_documents',
    'view_payments', 'add_collection',
    'view_reports',
  ],
  recovery_staff: [
    'view_assigned_loans', 'view_outstanding_amount',
    'add_recovery_note', 'update_recovery_status',
    'record_collection', 'view_payments',
  ],
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    mobile: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password hash in queries unless explicitly requested
    },
    role: {
      type: String,
      enum: ['admin', 'staff', 'recovery_staff'],
      default: 'staff',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    permissions: {
      type: [String],
      default: function () {
        return DEFAULT_PERMISSIONS[this.role] || DEFAULT_PERMISSIONS.staff;
      },
    },
    assignedLoans: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Loan',
      },
    ],
    assignedCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Keep phone and mobile synced
userSchema.pre('validate', function (next) {
  if (this.phone && !this.mobile) this.mobile = this.phone;
  if (this.mobile && !this.phone) this.phone = this.mobile;
  next();
});

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password helper
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user has permission
userSchema.methods.hasPermission = function (permissionKey) {
  if (this.role === 'admin') return true;
  if (!this.permissions || !Array.isArray(this.permissions)) return false;
  return this.permissions.includes(permissionKey);
};

// Return safe user object without sensitive fields
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
