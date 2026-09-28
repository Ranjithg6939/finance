import ActivityLog from '../models/ActivityLog.js';

export const activityLogController = {
  // GET /api/activity-logs (Admin only)
  getActivityLogs: async (req, res) => {
    try {
      const { resource, role, page = 1, limit = 50 } = req.query;
      const query = {};

      if (resource) query.resource = resource;
      if (role) query.role = role;

      const logs = await ActivityLog.find(query)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const total = await ActivityLog.countDocuments(query);

      return res.status(200).json({
        success: true,
        count: logs.length,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        data: logs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch activity logs',
      });
    }
  },
};
