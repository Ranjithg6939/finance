import express from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getMe);
router.put('/profile', requireAuth, authController.updateProfile);
router.post('/change-password', requireAuth, authController.changePassword);

export default router;
