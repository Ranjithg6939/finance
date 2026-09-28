import { recordActivity } from '../middleware/auth.js';

// In-memory or database persistent system settings
let systemSettings = {
  organizationName: 'FinVeda Lending & Microfinance',
  currency: 'INR',
  currencySymbol: '₹',
  defaultInterestRate: 2.0,
  defaultCalculationMethod: 'simple',
  latePaymentPenaltyPercent: 5.0,
  gracePeriodDays: 5,
  smsNotifications: true,
  emailNotifications: true,
};

export const settingsController = {
  // GET /api/settings (Admin only)
  getSettings: async (req, res) => {
    try {
      return res.status(200).json({
        success: true,
        data: systemSettings,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to fetch settings' });
    }
  },

  // PUT /api/settings (Admin only)
  updateSettings: async (req, res) => {
    try {
      systemSettings = { ...systemSettings, ...req.body };

      await recordActivity(
        req,
        'Admin updated system settings',
        'Settings',
        'system',
        systemSettings
      );

      return res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: systemSettings,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to update settings' });
    }
  },
};
