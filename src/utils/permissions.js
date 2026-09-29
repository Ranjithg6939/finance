/**
 * Role-Based Access Control (RBAC) Permission Helper
 */

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  RECOVERY_STAFF: 'recovery_staff',
};

export const PERMISSIONS = {
  // Customers
  CUSTOMERS_VIEW: 'customers_view',
  CUSTOMERS_CREATE: 'customers_create',
  CUSTOMERS_EDIT: 'customers_edit',
  CUSTOMERS_DELETE: 'customers_delete',

  // Loans
  LOANS_VIEW: 'loans_view',
  LOANS_CREATE: 'loans_create',
  LOANS_EDIT: 'loans_edit',
  LOANS_DELETE: 'loans_delete',
  LOANS_APPROVE: 'loans_approve',

  // Payments
  PAYMENTS_VIEW: 'payments_view',
  PAYMENTS_COLLECT: 'payments_collect',
  PAYMENTS_CANCEL: 'payments_cancel',

  // Documents
  DOCUMENTS_VIEW: 'documents_view',
  DOCUMENTS_UPLOAD: 'documents_upload',
  DOCUMENTS_DELETE: 'documents_delete',

  // Recovery
  RECOVERY_VIEW_ASSIGNED: 'recovery_view_assigned',
  RECOVERY_ADD_NOTES: 'recovery_add_notes',
  RECOVERY_UPDATE_STATUS: 'recovery_update_status',
  RECOVERY_COLLECT_PAYMENT: 'recovery_collect_payment',

  // Reports & Financials (Admin only)
  REPORTS_VIEW: 'reports_view',
  FINANCIALS_VIEW: 'financials_view',
  PROFIT_VIEW: 'profit_view',

  // Administration (Admin only)
  STAFF_MANAGE: 'staff_manage',
  SETTINGS_MANAGE: 'settings_manage',
};

export const PERMISSION_CATEGORIES = [
  {
    id: 'customers',
    name: 'Customer Management',
    description: 'Permissions for managing borrower records',
    permissions: [
      { key: PERMISSIONS.CUSTOMERS_VIEW, label: 'View Customers', desc: 'Can view customer profiles and directory' },
      { key: PERMISSIONS.CUSTOMERS_CREATE, label: 'Create Customer', desc: 'Can register new borrowers' },
      { key: PERMISSIONS.CUSTOMERS_EDIT, label: 'Edit Customer', desc: 'Can update borrower contact and KYC details' },
      { key: PERMISSIONS.CUSTOMERS_DELETE, label: 'Delete Customer', desc: 'Can permanently remove customer records (Admin only recommended)' },
    ],
  },
  {
    id: 'loans',
    name: 'Loan Management',
    description: 'Permissions for managing loan applications and status',
    permissions: [
      { key: PERMISSIONS.LOANS_VIEW, label: 'View Loans', desc: 'Can view loan accounts and repayment schedules' },
      { key: PERMISSIONS.LOANS_CREATE, label: 'Create Loan', desc: 'Can create new loan disbursements' },
      { key: PERMISSIONS.LOANS_EDIT, label: 'Edit Loan', desc: 'Can edit terms or repayment conditions' },
      { key: PERMISSIONS.LOANS_DELETE, label: 'Delete Loan', desc: 'Can delete loan records' },
      { key: PERMISSIONS.LOANS_APPROVE, label: 'Approve / Reject Loan', desc: 'Can change loan approval status' },
    ],
  },
  {
    id: 'payments',
    name: 'Payments & Collections',
    description: 'Permissions for recording and managing collections',
    permissions: [
      { key: PERMISSIONS.PAYMENTS_VIEW, label: 'View Collections', desc: 'Can view payment receipts and collection history' },
      { key: PERMISSIONS.PAYMENTS_COLLECT, label: 'Record / Collect Payment', desc: 'Can submit installment payments' },
      { key: PERMISSIONS.PAYMENTS_CANCEL, label: 'Cancel / Void Payment', desc: 'Can void erroneous transactions' },
    ],
  },
  {
    id: 'recovery',
    name: 'Recovery & Follow-ups',
    description: 'Permissions for field recovery, remarks, and status tracking',
    permissions: [
      { key: PERMISSIONS.RECOVERY_VIEW_ASSIGNED, label: 'View Assigned Cases', desc: 'Can view assigned overdue loans and customer contacts' },
      { key: PERMISSIONS.RECOVERY_ADD_NOTES, label: 'Add Recovery Remarks', desc: 'Can log borrower call/visit follow-up notes' },
      { key: PERMISSIONS.RECOVERY_UPDATE_STATUS, label: 'Update Recovery Status', desc: 'Can mark status (e.g., Promise to Pay, Legal Action)' },
      { key: PERMISSIONS.RECOVERY_COLLECT_PAYMENT, label: 'Collect Recovery Due', desc: 'Can collect payment directly during recovery visit' },
    ],
  },
  {
    id: 'documents',
    name: 'Documents Management',
    description: 'Permissions for borrower KYC and legal documents',
    permissions: [
      { key: PERMISSIONS.DOCUMENTS_VIEW, label: 'View Documents', desc: 'Can preview uploaded customer proofs' },
      { key: PERMISSIONS.DOCUMENTS_UPLOAD, label: 'Upload Documents', desc: 'Can upload KYC and collateral files' },
      { key: PERMISSIONS.DOCUMENTS_DELETE, label: 'Delete Documents', desc: 'Can delete uploaded records' },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Profit Analytics',
    description: 'Company-level analytics and profitability data',
    permissions: [
      { key: PERMISSIONS.REPORTS_VIEW, label: 'View Operational Reports', desc: 'Can view portfolio summary' },
      { key: PERMISSIONS.FINANCIALS_VIEW, label: 'View Executive Financials', desc: 'Access to revenue, expenses, and cashflow (Admin only)' },
      { key: PERMISSIONS.PROFIT_VIEW, label: 'View Company Profit', desc: 'Restricted net profit & margin reports (Admin only)' },
    ],
  },
];

export const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.STAFF]: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.LOANS_VIEW,
    PERMISSIONS.LOANS_CREATE,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
    PERMISSIONS.DOCUMENTS_VIEW,
    PERMISSIONS.DOCUMENTS_UPLOAD,
  ],
  [ROLES.RECOVERY_STAFF]: [
    PERMISSIONS.RECOVERY_VIEW_ASSIGNED,
    PERMISSIONS.RECOVERY_ADD_NOTES,
    PERMISSIONS.RECOVERY_UPDATE_STATUS,
    PERMISSIONS.RECOVERY_COLLECT_PAYMENT,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_COLLECT,
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
 * Check if user is an Administrator
 */
export const isAdmin = (user) => hasRole(user, ROLES.ADMIN);

/**
 * Check if user is an Operational Staff member
 */
export const isStaff = (user) => hasRole(user, ROLES.STAFF);

/**
 * Check if user is a Recovery Staff member
 */
export const isRecoveryStaff = (user) => hasRole(user, ROLES.RECOVERY_STAFF);

/**
 * Check if a user has a specific permission
 */
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  if (user.role === ROLES.ADMIN) return true; // Admin has full bypass

  // Check custom individual user permissions if set
  if (Array.isArray(user.permissions) && user.permissions.length > 0) {
    return user.permissions.includes(permission);
  }

  // Fallback to default role permissions
  const defaultList = DEFAULT_PERMISSIONS[user.role] || [];
  return defaultList.includes(permission);
};
