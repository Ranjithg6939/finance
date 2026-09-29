import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { recordActivity } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'finveda-secure-jwt-secret-key-2026';
const JWT_EXPIRES_IN = '7d';

export const authController = {
  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password',
        });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Find user and explicitly select password hash
      const user = await User.findOne({ email: cleanEmail }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check if password matches
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      // Check status: Deactivated staff cannot login
      if (user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact the administrator.',
        });
      }

      // Sign JWT
      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      user.lastLogin = new Date();
      await user.save();

      // Record Activity
      await recordActivity(
        { user, ip: req.ip },
        'User Logged In',
        'Auth',
        user._id.toString(),
        { email: user.email, role: user.role }
      );

      return res.status(200).json({
        success: true,
        token,
        user: user.toSafeObject(),
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during authentication',
      });
    }
  },

  // GET /api/auth/me
  getMe: async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        user: req.user.toSafeObject(),
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
      });
    }
  },

  // PUT /api/auth/profile
  updateProfile: async (req, res) => {
    try {
      const { name, phone } = req.body;
      const user = req.user;

      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();

      // Explicitly protect against self-escalation
      // req.body.role is ignored for self profile update

      await user.save();

      await recordActivity(req, 'Updated Profile', 'User', user._id.toString(), {
        name: user.name,
      });

      return res.status(200).json({
        success: true,
        user: user.toSafeObject(),
        message: 'Profile updated successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update profile',
      });
    }
  },

  // POST /api/auth/change-password
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Both current and new password are required',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password does not match',
        });
      }

      user.password = newPassword;
      await user.save();

      await recordActivity(req, 'Changed Password', 'User', user._id.toString());

      return res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to change password',
      });
    }
  },
};
