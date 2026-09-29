import mongoose from 'mongoose';

const installmentSchema = new mongoose.Schema(
  {
    installmentNumber: Number,
    dueDate: String,
    principalDue: Number,
    interestDue: Number,
    totalDue: Number,
    paidAmount: { type: Number, default: 0 },
    remainingBalance: Number,
    status: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid', 'overdue'],
      default: 'pending',
    },
    paidDate: String,
  },
  { _id: false }
);

const loanSchema = new mongoose.Schema(
  {
    loanId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    customerId: {
      type: String,
      default: '',
    },
    principalAmount: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [1, 'Principal must be greater than zero'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
    },
    interestType: {
      type: String,
      enum: ['monthly', 'yearly'],
      default: 'monthly',
    },
    calculationMethod: {
      type: String,
      enum: ['simple', 'reducing_balance'],
      default: 'simple',
    },
    duration: {
      value: { type: Number, default: 12 },
      unit: { type: String, default: 'months' },
    },
    durationValue: {
      type: Number,
      default: 12,
    },
    durationUnit: {
      type: String,
      default: 'months',
    },
    paymentFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'monthly',
    },
    startDate: {
      type: String,
      required: true,
    },
    firstDueDate: {
      type: String,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalPayable: {
      type: Number,
      default: 0,
    },
    totalPaid: {
      type: Number,
      default: 0,
    },
    outstandingAmount: {
      type: Number,
      default: 0,
    },
    installmentAmount: {
      type: Number,
      default: 0,
    },
    numberOfInstallments: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'rejected'],
      default: 'active',
    },
    // Staff RBAC Assignment
    assignedStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    staffAssignedAt: {
      type: Date,
      default: null,
    },
    staffAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Recovery Staff RBAC Assignment
    assignedRecoveryStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveryAssignedAt: {
      type: Date,
      default: null,
    },
    recoveryAssignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveryStatus: {
      type: String,
      enum: [
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
      ],
      default: 'none',
    },
    recoveryNotes: [
      {
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        addedByName: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
    schedule: [installmentSchema],
  },
  {
    timestamps: true,
  }
);

loanSchema.index({ assignedStaff: 1 });
loanSchema.index({ assignedRecoveryStaff: 1 });
loanSchema.index({ customer: 1 });
loanSchema.index({ status: 1 });

const Loan = mongoose.model('Loan', loanSchema);
export default Loan;
