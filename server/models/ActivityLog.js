import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userName: {
      type: String,
      default: 'System',
    },
    role: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      required: true,
    },
    resource: {
      type: String,
      required: true,
      enum: ['User', 'Staff', 'Customer', 'Loan', 'Payment', 'Settings', 'Auth', 'Report', 'System'],
    },
    resourceId: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ resource: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
