import express from 'express';
import { loanController } from '../controllers/loanController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate', requireAuth, loanController.calculateLoan);
router.get('/', requireAuth, loanController.getAllLoans);
router.get('/:id', requireAuth, loanController.getLoanById);
router.post('/', requireAuth, loanController.createLoan);
router.put('/:id', requireAuth, loanController.updateLoan);

// Admin-only operations
router.patch('/:id/status', requireAuth, requireRole('admin'), loanController.changeLoanStatus);
router.patch('/:id/assign', requireAuth, requireRole('admin'), loanController.assignStaff);
router.delete('/:id', requireAuth, requireRole('admin'), loanController.deleteLoan);

export default router;
