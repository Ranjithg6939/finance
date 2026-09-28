import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

const JWT_SECRET = process.env.JWT_SECRET || 'finveda-secure-jwt-secret-key-2026';

/**
 * Authentication Middleware:
 * Verifies JWT token and checks if user is active.
 * Never allows unauthenticated or deactivated requests through.
 */
export const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or invalid authentication token',
      });
    }

    // Fetch user from database to ensure fresh state and active status
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists',
      });
    }

    // Check account status
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.',
      });
    }

    // Attach authenticated user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('requireAuth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal authorization error',
    });
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware:
 * Validates that the authenticated user possesses one of the allowed roles.
 * Example: requireRole('admin')
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action',
      });
    }

    next();
  };
};

/**
 * Activity Log helper to record user actions into MongoDB
 */
export const recordActivity = async (req, action, resource, resourceId = '', details = {}) => {
  try {
    const user = req.user;
    await ActivityLog.create({
      user: user?._id || null,
      userName: user?.name || 'System',
      role: user?.role || 'system',
      action,
      resource,
      resourceId: String(resourceId || ''),
      details,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
    });
  } catch (err) {
    console.error('Failed to record activity log:', err.message);
  }
};
