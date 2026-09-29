import express from 'express';
import { staffController } from '../controllers/staffController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// All staff management routes are Admin-only
router.get('/', requireAuth, requireRole('admin'), staffController.getAllStaff);
router.post('/', requireAuth, requireRole('admin'), staffController.createStaff);
router.get('/:id', requireAuth, staffController.getStaffById);
router.put('/:id', requireAuth, requireRole('admin'), staffController.updateStaff);
router.put('/:id/permissions', requireAuth, requireRole('admin'), staffController.updateStaffPermissions);
router.patch('/:id/status', requireAuth, requireRole('admin'), staffController.toggleStaffStatus);
router.post('/:id/reset-password', requireAuth, requireRole('admin'), staffController.resetStaffPassword);
router.delete('/:id', requireAuth, requireRole('admin'), staffController.deleteStaff);

export default router;
