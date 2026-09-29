import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required'],
    },
    loanId: {
      type: String,
      default: '',
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer reference is required'],
    },
    customerName: {
      type: String,
      default: '',
    },
    customerId: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [1, 'Payment amount must be greater than zero'],
    },
    principalComponent: {
      type: Number,
      default: 0,
    },
    interestComponent: {
      type: Number,
      default: 0,
    },
    paymentDate: {
      type: String,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'UPI', 'Cheque', 'Other'],
      default: 'Cash',
    },
    receiptNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    previousOutstanding: {
      type: Number,
      default: 0,
    },
    currentOutstanding: {
      type: Number,
      default: 0,
    },
    customerPhone: {
      type: String,
      default: '',
    },
    referenceNumber: {
      type: String,
      default: '',
    },
    // The staff member or admin who collected the payment
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    collectorName: {
      type: String,
      default: '',
    },
    recoveryStaff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    recoveryStaffName: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['completed', 'cancelled'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ loan: 1 });
paymentSchema.index({ customer: 1 });
paymentSchema.index({ collectedBy: 1 });
paymentSchema.index({ paymentDate: 1 });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
