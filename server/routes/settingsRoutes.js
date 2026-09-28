import express from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', requireAuth, requireRole('admin'), settingsController.getSettings);
router.put('/', requireAuth, requireRole('admin'), settingsController.updateSettings);

export default router;
