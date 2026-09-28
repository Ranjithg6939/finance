import express from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, paymentController.getAllPayments);
router.get('/:id', requireAuth, paymentController.getPaymentById);
router.post('/', requireAuth, paymentController.createPayment);

// Admin-only operations
router.delete('/:id', requireAuth, requireRole('admin'), paymentController.deletePayment);

export default router;
