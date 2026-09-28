import express from 'express';
import { customerController } from '../controllers/customerController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, customerController.getAllCustomers);
router.get('/:id', requireAuth, customerController.getCustomerById);
router.post('/', requireAuth, customerController.createCustomer);
router.put('/:id', requireAuth, customerController.updateCustomer);

// Admin-only operations
router.patch('/:id/assign', requireAuth, requireRole('admin'), customerController.assignStaff);
router.delete('/:id', requireAuth, requireRole('admin'), customerController.deleteCustomer);

export default router;
