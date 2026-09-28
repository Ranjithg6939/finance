/**
 * Role-Based Access Control (RBAC) Permission Helper
 */

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
};

export const PERMISSIONS = {
  // Dashboard
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  VIEW_STAFF_DASHBOARD: 'view_staff_dashboard',

  // Customer Management
  VIEW_ALL_CUSTOMERS: 'view_all_customers',
  VIEW_ASSIGNED_CUSTOMERS: 'view_assigned_customers',
  CREATE_CUSTOMER: 'create_customer',
  EDIT_CUSTOMER: 'edit_customer',
  DELETE_CUSTOMER: 'delete_customer',
  ASSIGN_CUSTOMER: 'assign_customer',

  // Loan Management
  VIEW_ALL_LOANS: 'view_all_loans',
  VIEW_ASSIGNED_LOANS: 'view_assigned_loans',
  CREATE_LOAN: 'create_loan',
  EDIT_LOAN: 'edit_loan',
  DELETE_LOAN: 'delete_loan',
  APPROVE_LOAN: 'approve_loan',
  REJECT_LOAN: 'reject_loan',
  ASSIGN_LOAN: 'assign_loan',

  // Payments
  VIEW_ALL_PAYMENTS: 'view_all_payments',
  VIEW_ASSIGNED_PAYMENTS: 'view_assigned_payments',
  RECORD_PAYMENT: 'record_payment',
  CANCEL_PAYMENT: 'cancel_payment',

  // Staff Management (Admin only)
  MANAGE_STAFF: 'manage_staff',
  VIEW_STAFF_PERFORMANCE: 'view_staff_performance',

  // Reports (Admin only)
  VIEW_ADMIN_REPORTS: 'view_admin_reports',

  // Activity Log (Admin only)
  VIEW_ACTIVITY_LOGS: 'view_activity_logs',

  // Settings (Admin only)
  MANAGE_SETTINGS: 'manage_settings',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_ADMIN_DASHBOARD,
    PERMISSIONS.VIEW_ALL_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.DELETE_CUSTOMER,
    PERMISSIONS.ASSIGN_CUSTOMER,
    PERMISSIONS.VIEW_ALL_LOANS,
    PERMISSIONS.CREATE_LOAN,
    PERMISSIONS.EDIT_LOAN,
    PERMISSIONS.DELETE_LOAN,
    PERMISSIONS.APPROVE_LOAN,
    PERMISSIONS.REJECT_LOAN,
    PERMISSIONS.ASSIGN_LOAN,
    PERMISSIONS.VIEW_ALL_PAYMENTS,
    PERMISSIONS.RECORD_PAYMENT,
    PERMISSIONS.CANCEL_PAYMENT,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.VIEW_STAFF_PERFORMANCE,
    PERMISSIONS.VIEW_ADMIN_REPORTS,
    PERMISSIONS.VIEW_ACTIVITY_LOGS,
    PERMISSIONS.MANAGE_SETTINGS,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_STAFF_DASHBOARD,
    PERMISSIONS.VIEW_ASSIGNED_CUSTOMERS,
    PERMISSIONS.CREATE_CUSTOMER,
    PERMISSIONS.EDIT_CUSTOMER,
    PERMISSIONS.VIEW_ASSIGNED_LOANS,
    PERMISSIONS.CREATE_LOAN,
    PERMISSIONS.EDIT_LOAN,
    PERMISSIONS.VIEW_ASSIGNED_PAYMENTS,
    PERMISSIONS.RECORD_PAYMENT,
  ],
};

/**
 * Check if a user possesses a specific role
 */
export const hasRole = (user, role) => {
  if (!user || !user.role) return false;
  return user.role === role;
};

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

/**
 * Check if user is an Administrator
 */
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);

/**
 * Check if user is a Staff member
 */
export const isStaff = (user) => hasRole(user, ROLES.STAFF);
