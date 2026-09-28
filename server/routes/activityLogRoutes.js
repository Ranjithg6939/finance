import express from 'express';
import { activityLogController } from '../controllers/activityLogController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin'), activityLogController.getActivityLogs);

export default router;
