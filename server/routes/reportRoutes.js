import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All reports are Admin-only
router.get('/loans', requireAuth, requireRole('admin'), reportController.getLoansReport);
router.get('/payments', requireAuth, requireRole('admin'), reportController.getPaymentsReport);
router.get('/interest', requireAuth, requireRole('admin'), reportController.getInterestReport);
router.get('/customers', requireAuth, requireRole('admin'), reportController.getCustomersReport);
router.get('/staff-performance', requireAuth, requireRole('admin'), reportController.getStaffPerformanceReport);

export default router;
