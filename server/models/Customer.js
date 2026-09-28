import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Customer full name is required'],
      trim: true,
    },
    dateOfBirth: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', ''],
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      addressLine: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    identification: {
      idType: { type: String, default: 'Aadhaar' },
      idNumber: { type: String, default: '' },
      panNumber: { type: String, default: '' },
    },
    employment: {
      occupation: { type: String, default: '' },
      employmentType: { type: String, default: '' },
      companyName: { type: String, default: '' },
      monthlyIncome: { type: Number, default: 0 },
    },
    referenceContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // Staff RBAC Assignment
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    activeLoansCount: {
      type: Number,
      default: 0,
    },
    totalOutstanding: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

customerSchema.index({ fullName: 'text', phone: 'text', customerId: 'text' });
customerSchema.index({ assignedStaff: 1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;
