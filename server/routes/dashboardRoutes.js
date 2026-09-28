import express from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/summary', requireAuth, dashboardController.getSummary);
router.get('/admin-financials', requireAuth, requireRole('admin'), dashboardController.getAdminFinancials);
router.get('/monthly-collections', requireAuth, requireRole('admin'), dashboardController.getMonthlyCollections);
router.get('/upcoming-payments', requireAuth, dashboardController.getUpcomingPayments);

export default router;

