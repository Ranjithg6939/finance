// Local Storage Database for FinVeda
// Provides persistent client-side data storage in the browser's localStorage
import {
  validateName,
  validateMobile,
  validateAadhaar,
  validatePAN,
  validateEmail,
  validateAmount,
  validateInterestRate,
  validateDuration,
} from '../utils/validation';

const STORAGE_KEYS = {
  CUSTOMERS: 'finveda_customers',
  LOANS: 'finveda_loans',
  PAYMENTS: 'finveda_payments',
  DOCUMENTS: 'finveda_documents',
  NOTIFICATIONS: 'finveda_notifications',
  STAFF: 'finveda_staff',
  ACTIVITY_LOGS: 'finveda_activity_logs',
  INITIALIZED: 'finveda_initialized_v2',
};

// Helpers for safe storage access
const getItem = (key, defaultVal = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return defaultVal;
  }
};

const setItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage:`, e);
  }
};

// Seed initial demo data if storage is empty
const seedInitialData = () => {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  const existingCustomers = getItem(STORAGE_KEYS.CUSTOMERS);

  if (!isInitialized || existingCustomers.length === 0) {
    const seedCustomers = [
      {
        _id: 'cust_001',
        customerId: 'CUST-1001',
        fullName: 'Ramesh Kumar',
        dateOfBirth: '1988-05-14',
        gender: 'Male',
        phone: '9876543210',
        email: 'ramesh.kumar@example.com',
        address: {
          addressLine: '12, Anna Salai, T. Nagar',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600017',
        },
        identification: {
          idType: 'Aadhaar',
          idNumber: '4589-1234-8901',
          panNumber: 'ABCDE1234F',
        },
        employment: {
          occupation: 'Textile Merchant',
          employmentType: 'Business Owner',
          companyName: 'Kumar Textiles',
          monthlyIncome: 65000,
        },
        referenceContact: {
          name: 'Suresh Kumar',
          relationship: 'Brother',
          phone: '9876543211',
        },
        status: 'active',
        activeLoansCount: 1,
        totalOutstanding: 62400,
        createdAt: '2026-01-10T10:00:00.000Z',
        updatedAt: '2026-03-15T11:00:00.000Z',
      },
      {
        _id: 'cust_002',
        customerId: 'CUST-1002',
        fullName: 'Priya Sharma',
        dateOfBirth: '1993-08-22',
        gender: 'Female',
        phone: '9845123654',
        email: 'priya.sharma@example.com',
        address: {
          addressLine: '45, MG Road, Indiranagar',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560038',
        },
        identification: {
          idType: 'PAN',
          idNumber: 'XYZPK9876A',
          panNumber: 'XYZPK9876A',
        },
        employment: {
          occupation: 'Senior Software Engineer',
          employmentType: 'Salaried',
          companyName: 'Infosys Ltd',
          monthlyIncome: 95000,
        },
        referenceContact: {
          name: 'Anita Sharma',
          relationship: 'Sister',
          phone: '9845123655',
        },
        status: 'active',
        activeLoansCount: 1,
        totalOutstanding: 145000,
        createdAt: '2026-02-05T09:30:00.000Z',
        updatedAt: '2026-03-20T14:00:00.000Z',
      },
      {
        _id: 'cust_003',
        customerId: 'CUST-1003',
        fullName: 'Rajesh Patel',
        dateOfBirth: '1982-11-03',
        gender: 'Male',
        phone: '9723456789',
        email: 'rajesh.patel@example.com',
        address: {
          addressLine: '8, Ashram Road, Navrangpura',
          city: 'Ahmedabad',
          state: 'Gujarat',
          pincode: '380009',
        },
        identification: {
          idType: 'Aadhaar',
          idNumber: '7823-4561-2345',
          panNumber: 'BPLPA9912C',
        },
        employment: {
          occupation: 'Logistics Supervisor',
          employmentType: 'Salaried',
          companyName: 'Gujarat Express Cargo',
          monthlyIncome: 42000,
        },
        referenceContact: {
          name: 'Mahesh Patel',
          relationship: 'Friend',
          phone: '9723456780',
        },
        status: 'active',
        activeLoansCount: 0,
        totalOutstanding: 0,
        createdAt: '2025-11-15T08:00:00.000Z',
        updatedAt: '2026-02-18T16:00:00.000Z',
      },
    ];

    const seedLoans = [
      {
        _id: 'loan_001',
        loanId: 'LN-1001',
        customer: {
          _id: 'cust_001',
          fullName: 'Ramesh Kumar',
          customerId: 'CUST-1001',
          phone: '9876543210',
        },
        customerId: 'cust_001',
        principalAmount: 100000,
        interestRate: 2,
        interestType: 'monthly',
        calculationMethod: 'simple',
        duration: { value: 12, unit: 'months' },
        durationValue: 12,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2026-01-15',
        firstDueDate: '2026-02-15',
        totalInterest: 24000,
        totalPayable: 124000,
        totalPaid: 61600,
        outstandingAmount: 62400,
        installmentAmount: 10333,
        numberOfInstallments: 12,
        status: 'active',
        notes: 'Shop renovation and inventory purchase loan',
        schedule: [
          { installmentNumber: 1, dueDate: '2026-02-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 2, dueDate: '2026-03-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 3, dueDate: '2026-04-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 4, dueDate: '2026-05-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 5, dueDate: '2026-06-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 6, dueDate: '2026-07-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 10000, remainingBalance: 333, status: 'partially_paid' },
          { installmentNumber: 7, dueDate: '2026-08-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 0, remainingBalance: 10333, status: 'pending' },
          { installmentNumber: 8, dueDate: '2026-09-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 0, remainingBalance: 10333, status: 'pending' },
          { installmentNumber: 9, dueDate: '2026-10-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 0, remainingBalance: 10333, status: 'pending' },
          { installmentNumber: 10, dueDate: '2026-11-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 0, remainingBalance: 10333, status: 'pending' },
          { installmentNumber: 11, dueDate: '2026-12-15', principalDue: 8333, interestDue: 2000, totalDue: 10333, paidAmount: 0, remainingBalance: 10333, status: 'pending' },
          { installmentNumber: 12, dueDate: '2027-01-15', principalDue: 8337, interestDue: 2000, totalDue: 10337, paidAmount: 0, remainingBalance: 10337, status: 'pending' },
        ],
        createdAt: '2026-01-15T10:30:00.000Z',
        updatedAt: '2026-07-15T15:20:00.000Z',
      },
      {
        _id: 'loan_002',
        loanId: 'LN-1002',
        customer: {
          _id: 'cust_002',
          fullName: 'Priya Sharma',
          customerId: 'CUST-1002',
          phone: '9845123654',
        },
        customerId: 'cust_002',
        principalAmount: 200000,
        interestRate: 1.5,
        interestType: 'monthly',
        calculationMethod: 'reducing_balance',
        duration: { value: 12, unit: 'months' },
        durationValue: 12,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2026-02-10',
        firstDueDate: '2026-03-10',
        totalInterest: 20000,
        totalPayable: 220000,
        totalPaid: 75000,
        outstandingAmount: 145000,
        installmentAmount: 18333,
        numberOfInstallments: 12,
        status: 'active',
        notes: 'Personal vehicle and equipment finance',
        schedule: [
          { installmentNumber: 1, dueDate: '2026-03-10', principalDue: 15333, interestDue: 3000, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 2, dueDate: '2026-04-10', principalDue: 15500, interestDue: 2833, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 3, dueDate: '2026-05-10', principalDue: 15700, interestDue: 2633, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 4, dueDate: '2026-06-10', principalDue: 16000, interestDue: 2333, totalDue: 18333, paidAmount: 20001, remainingBalance: 0, status: 'paid' },
          { installmentNumber: 5, dueDate: '2026-07-10', principalDue: 16200, interestDue: 2133, totalDue: 18333, paidAmount: 0, remainingBalance: 18333, status: 'pending' },
          { installmentNumber: 6, dueDate: '2026-08-10', principalDue: 16500, interestDue: 1833, totalDue: 18333, paidAmount: 0, remainingBalance: 18333, status: 'pending' },
        ],
        createdAt: '2026-02-10T12:00:00.000Z',
        updatedAt: '2026-06-10T11:00:00.000Z',
      },
      {
        _id: 'loan_003',
        loanId: 'LN-1003',
        customer: {
          _id: 'cust_003',
          fullName: 'Rajesh Patel',
          customerId: 'CUST-1003',
          phone: '9723456789',
        },
        customerId: 'cust_003',
        principalAmount: 50000,
        interestRate: 2,
        interestType: 'monthly',
        calculationMethod: 'simple',
        duration: { value: 6, unit: 'months' },
        durationValue: 6,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2025-11-20',
        firstDueDate: '2025-12-20',
        totalInterest: 6000,
        totalPayable: 56000,
        totalPaid: 56000,
        outstandingAmount: 0,
        installmentAmount: 9333,
        numberOfInstallments: 6,
        status: 'completed',
        completedAt: '2026-02-18T16:00:00.000Z',
        notes: 'Emergency commercial bridge loan - fully settled early',
        schedule: [],
        createdAt: '2025-11-20T08:30:00.000Z',
        updatedAt: '2026-02-18T16:00:00.000Z',
      },
    ];

    const seedPayments = [
      {
        _id: 'pay_001',
        paymentId: 'PAY-1001',
        receiptNumber: 'REC-2001',
        loanId: 'loan_001',
        loan: { _id: 'loan_001', loanId: 'LN-1001', principalAmount: 100000, outstandingAmount: 113667 },
        customerId: 'cust_001',
        customer: { _id: 'cust_001', fullName: 'Ramesh Kumar', customerId: 'CUST-1001', phone: '9876543210' },
        amount: 10333,
        principalAmount: 8333,
        interestAmount: 2000,
        paymentDate: '2026-02-15',
        paymentMethod: 'upi',
        transactionReference: 'UPI/6045129841',
        notes: 'Installment 1',
        status: 'completed',
        createdAt: '2026-02-15T11:00:00.000Z',
      },
      {
        _id: 'pay_002',
        paymentId: 'PAY-1002',
        receiptNumber: 'REC-2002',
        loanId: 'loan_001',
        loan: { _id: 'loan_001', loanId: 'LN-1001', principalAmount: 100000, outstandingAmount: 103334 },
        customerId: 'cust_001',
        customer: { _id: 'cust_001', fullName: 'Ramesh Kumar', customerId: 'CUST-1001', phone: '9876543210' },
        amount: 10333,
        principalAmount: 8333,
        interestAmount: 2000,
        paymentDate: '2026-03-15',
        paymentMethod: 'bank_transfer',
        transactionReference: 'NEFT/HDFC009218',
        notes: 'Installment 2',
        status: 'completed',
        createdAt: '2026-03-15T14:30:00.000Z',
      },
      {
        _id: 'pay_003',
        paymentId: 'PAY-1003',
        receiptNumber: 'REC-2003',
        loanId: 'loan_002',
        loan: { _id: 'loan_002', loanId: 'LN-1002', principalAmount: 200000, outstandingAmount: 201667 },
        customerId: 'cust_002',
        customer: { _id: 'cust_002', fullName: 'Priya Sharma', customerId: 'CUST-1002', phone: '9845123654' },
        amount: 18333,
        principalAmount: 15333,
        interestAmount: 3000,
        paymentDate: '2026-03-10',
        paymentMethod: 'upi',
        transactionReference: 'UPI/9912048571',
        notes: 'Installment 1',
        status: 'completed',
        createdAt: '2026-03-10T16:15:00.000Z',
      },
    ];

    const seedNotifications = [
      {
        _id: 'notif_001',
        title: 'Payment Received',
        message: 'Received ₹18,333 for Loan LN-1002 from Priya Sharma via UPI.',
        type: 'payment_received',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        _id: 'notif_002',
        title: 'Installment Due Soon',
        message: 'Upcoming installment of ₹10,333 for Ramesh Kumar (LN-1001).',
        type: 'payment_due',
        isRead: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        _id: 'notif_003',
        title: 'Loan Settled',
        message: 'Loan LN-1003 for Rajesh Patel has been completely paid and closed.',
        type: 'loan_completed',
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ];

    const seedDocuments = [
      {
        _id: 'doc_001',
        title: 'Aadhaar Card Copy',
        documentType: 'id_proof',
        fileName: 'ramesh_aadhaar.pdf',
        fileSize: 420000,
        fileUrl: '#',
        customerId: 'cust_001',
        customer: { _id: 'cust_001', fullName: 'Ramesh Kumar', customerId: 'CUST-1001' },
        loanId: 'loan_001',
        loan: { _id: 'loan_001', loanId: 'LN-1001' },
        createdAt: '2026-01-15T11:00:00.000Z',
      },
    ];

    setItem(STORAGE_KEYS.CUSTOMERS, seedCustomers);
    setItem(STORAGE_KEYS.LOANS, seedLoans);
    setItem(STORAGE_KEYS.PAYMENTS, seedPayments);
    setItem(STORAGE_KEYS.NOTIFICATIONS, seedNotifications);
    setItem(STORAGE_KEYS.DOCUMENTS, seedDocuments);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Initialize on script evaluation
if (typeof window !== 'undefined') {
  seedInitialData();
}

export const localStorageDb = {
  // ----------------------------------------------------
  // CUSTOMERS
  // ----------------------------------------------------
  getCustomers: (params = {}) => {
    let customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const { search, status } = params;

    if (status && status !== 'all') {
      customers = customers.filter((c) => c.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      customers = customers.filter(
        (c) =>
          c.fullName?.toLowerCase().includes(q) ||
          c.customerId?.toLowerCase().includes(q) ||
          c.phone?.includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }

    // Refresh activeLoansCount and totalOutstanding from loans
    const loans = getItem(STORAGE_KEYS.LOANS);
    customers = customers.map((c) => {
      const custLoans = loans.filter((l) => (l.customerId === c._id || l.customer?._id === c._id));
      const active = custLoans.filter((l) => l.status === 'active');
      const totalOut = active.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);
      return {
        ...c,
        activeLoansCount: active.length,
        totalOutstanding: totalOut,
      };
    });

    return { success: true, data: customers, count: customers.length };
  },

  getCustomerById: (id) => {
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const customer = customers.find((c) => c._id === id || c.customerId === id);

    if (!customer) {
      const err = new Error('Customer not found in localStorage');
      err.response = { status: 404, data: { message: 'Customer not found' } };
      throw err;
    }

    const loans = getItem(STORAGE_KEYS.LOANS);
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const documents = getItem(STORAGE_KEYS.DOCUMENTS);

    const custLoans = loans.filter((l) => l.customerId === customer._id || l.customer?._id === customer._id);
    const activeLoans = custLoans.filter((l) => l.status === 'active');
    const completedLoans = custLoans.filter((l) => l.status === 'completed');
    const custPayments = payments.filter((p) => p.customerId === customer._id || p.customer?._id === customer._id);
    const custDocs = documents.filter((d) => d.customerId === customer._id || d.customer?._id === customer._id);

    const totalBorrowed = custLoans.reduce((sum, l) => sum + (parseFloat(l.principalAmount) || 0), 0);
    const totalPaid = custPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const outstanding = activeLoans.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);

    // Compute last payment date
    const sortedPayments = [...custPayments].sort((a, b) => new Date(b.paymentDate || b.createdAt) - new Date(a.paymentDate || a.createdAt));
    const lastPaymentDate = sortedPayments[0]?.paymentDate || null;

    // Compute next due date from active loan schedules
    const todayStr = new Date().toISOString().split('T')[0];
    let nextDueDate = null;
    activeLoans.forEach((loan) => {
      if (Array.isArray(loan.schedule)) {
        loan.schedule.forEach((inst) => {
          if (inst.status !== 'paid' && inst.dueDate >= todayStr) {
            if (!nextDueDate || inst.dueDate < nextDueDate) {
              nextDueDate = inst.dueDate;
            }
          }
        });
      }
    });

    const fullCustomer = {
      ...customer,
      activeLoans,
      completedLoans,
      payments: custPayments,
      documents: custDocs,
      summary: {
        totalLoans: custLoans.length,
        totalLoan: custLoans.length,
        activeLoans: activeLoans.length,
        completedLoans: completedLoans.length,
        totalBorrowed,
        totalPaid,
        outstanding,
        totalOutstanding: outstanding,
        paymentCount: custPayments.length,
        lastPaymentDate,
        nextDueDate,
      },
    };

    return { success: true, data: fullCustomer };
  },

  createCustomer: (payload) => {
    // Server-side validation
    const nameErr = validateName(payload.fullName, 'Full Name', true);
    if (nameErr) throw new Error(nameErr);

    const phoneErr = validateMobile(payload.phone, true, 'Mobile Number');
    if (phoneErr) throw new Error(phoneErr);

    if (payload.identification?.idType === 'Aadhaar' && payload.identification?.idNumber) {
      const aadhErr = validateAadhaar(payload.identification.idNumber, false);
      if (aadhErr) throw new Error(aadhErr);
    }
    if (payload.identification?.panNumber) {
      const panErr = validatePAN(payload.identification.panNumber, false);
      if (panErr) throw new Error(panErr);
    }
    if (payload.email) {
      const emailErr = validateEmail(payload.email, false);
      if (emailErr) throw new Error(emailErr);
    }

    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const newId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const custNum = 1000 + customers.length + 1;
    const customerId = `CUST-${custNum}`;

    const newCustomer = {
      _id: newId,
      customerId,
      fullName: payload.fullName || '',
      dateOfBirth: payload.dateOfBirth || '',
      gender: payload.gender || 'Male',
      phone: payload.phone || '',
      email: payload.email || '',
      address: payload.address || {
        addressLine: '',
        city: '',
        state: '',
        pincode: '',
      },
      identification: payload.identification || {
        idType: 'Aadhaar',
        idNumber: '',
        panNumber: '',
      },
      employment: payload.employment || {
        occupation: '',
        employmentType: 'Salaried',
        companyName: '',
        monthlyIncome: 0,
      },
      referenceContact: payload.referenceContact || {
        name: '',
        relationship: 'Friend',
        phone: '',
      },
      status: payload.status || 'active',
      activeLoansCount: 0,
      totalOutstanding: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.unshift(newCustomer);
    setItem(STORAGE_KEYS.CUSTOMERS, customers);

    // Add alert notification
    localStorageDb.createNotification({
      title: 'New Customer Registered',
      message: `${newCustomer.fullName} (${newCustomer.customerId}) was registered.`,
      type: 'customer_created',
    });

    return { success: true, data: newCustomer, message: 'Customer registered successfully' };
  },

  updateCustomer: (id, data) => {
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const idx = customers.findIndex((c) => c._id === id || c.customerId === id);
    if (idx === -1) {
      throw new Error('Customer not found');
    }
    customers[idx] = {
      ...customers[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.CUSTOMERS, customers);
    return { success: true, data: customers[idx] };
  },

  deleteCustomer: (id) => {
    let customers = getItem(STORAGE_KEYS.CUSTOMERS);
    customers = customers.filter((c) => c._id !== id && c.customerId !== id);
    setItem(STORAGE_KEYS.CUSTOMERS, customers);

    // Cascade delete loans, payments, documents
    let loans = getItem(STORAGE_KEYS.LOANS);
    loans = loans.filter((l) => l.customerId !== id && l.customer?._id !== id);
    setItem(STORAGE_KEYS.LOANS, loans);

    let payments = getItem(STORAGE_KEYS.PAYMENTS);
    payments = payments.filter((p) => p.customerId !== id && p.customer?._id !== id);
    setItem(STORAGE_KEYS.PAYMENTS, payments);

    let docs = getItem(STORAGE_KEYS.DOCUMENTS);
    docs = docs.filter((d) => d.customerId !== id && d.customer?._id !== id);
    setItem(STORAGE_KEYS.DOCUMENTS, docs);

    return { success: true, message: 'Customer and associated records deleted' };
  },

  // ----------------------------------------------------
  // LOANS & CALCULATION ENGINE
  // ----------------------------------------------------
  calculateLoan: (payload) => {
    const principal = parseFloat(payload.principalAmount) || 0;
    const rate = parseFloat(payload.interestRate) || 0;
    const durationVal = parseInt(payload.durationValue, 10) || 1;
    const durationUnit = payload.durationUnit || 'months';
    const interestType = payload.interestType || 'monthly';
    const method = payload.calculationMethod || 'simple';
    const frequency = payload.paymentFrequency || 'monthly';
    const startDate = payload.startDate ? new Date(payload.startDate) : new Date();

    // Determine number of installments
    let numInstallments = durationVal;
    if (durationUnit === 'months') {
      numInstallments = frequency === 'weekly' ? Math.round(durationVal * 4.33) : durationVal;
    } else if (durationUnit === 'weeks') {
      numInstallments = frequency === 'weekly' ? durationVal : Math.max(1, Math.round(durationVal / 4.33));
    }
    numInstallments = Math.max(1, numInstallments);

    let totalInterest = 0;
    let totalPayable = 0;
    let installmentAmount = 0;
    const schedule = [];

    if (method === 'reducing_balance') {
      // Standard Reducing Balance EMI
      const periodicRate = (rate / 100);
      if (periodicRate <= 0) {
        installmentAmount = Math.round(principal / numInstallments);
        totalPayable = installmentAmount * numInstallments;
        totalInterest = 0;
      } else {
        const emi = (principal * periodicRate * Math.pow(1 + periodicRate, numInstallments)) /
                    (Math.pow(1 + periodicRate, numInstallments) - 1);
        installmentAmount = Math.round(emi);
        totalPayable = installmentAmount * numInstallments;
        totalInterest = Math.max(0, totalPayable - principal);
      }
    } else {
      // Simple / Flat / Fixed interest calculation
      let periods = durationVal;
      if (interestType === 'fixed') {
        periods = 1;
      } else if (interestType === 'monthly' && durationUnit === 'weeks') {
        periods = durationVal / 4.33;
      } else if (interestType === 'weekly' && durationUnit === 'months') {
        periods = durationVal * 4.33;
      }

      totalInterest = Math.round(principal * (rate / 100) * periods);
      totalPayable = principal + totalInterest;
      installmentAmount = Math.round(totalPayable / numInstallments);
    }

    // Generate schedule
    let remainingPrincipal = principal;
    for (let i = 1; i <= numInstallments; i++) {
      const dueDate = new Date(startDate);
      if (frequency === 'weekly') {
        dueDate.setDate(dueDate.getDate() + i * 7);
      } else {
        dueDate.setMonth(dueDate.getMonth() + i);
      }

      let pDue = Math.round(principal / numInstallments);
      let iDue = Math.round(totalInterest / numInstallments);
      if (i === numInstallments) {
        // Balance out rounding discrepancies on last installment
        const sumP = Math.round(principal / numInstallments) * (numInstallments - 1);
        pDue = principal - sumP;
        const sumI = Math.round(totalInterest / numInstallments) * (numInstallments - 1);
        iDue = totalInterest - sumI;
      }

      const totalDue = pDue + iDue;
      remainingPrincipal = Math.max(0, remainingPrincipal - pDue);

      schedule.push({
        installmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        principalDue: pDue,
        interestDue: iDue,
        totalDue: totalDue,
        paidAmount: 0,
        remainingBalance: totalDue,
        status: 'pending',
      });
    }

    return {
      success: true,
      data: {
        principalAmount: principal,
        interestRate: rate,
        interestType,
        calculationMethod: method,
        duration: { value: durationVal, unit: durationUnit },
        paymentFrequency: frequency,
        totalInterest,
        totalPayable,
        outstandingAmount: totalPayable,
        installmentAmount,
        numberOfInstallments: numInstallments,
        schedule,
      },
    };
  },

  getLoans: (params = {}) => {
    let loans = getItem(STORAGE_KEYS.LOANS);
    const { status, search, interestType, paymentFrequency, customerId, filter, staffId, recoveryStaffId } = params;

    let currentUserId = null;
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      currentUserId = u._id || u.id;
    } catch (e) {
      currentUserId = null;
    }

    if (filter === 'my_loans' || staffId) {
      const targetStaff = staffId || currentUserId;
      if (targetStaff) {
        loans = loans.filter((l) => l.assignedStaff?._id === targetStaff || l.assignedStaff === targetStaff);
      }
    }
    if (filter === 'my_recovery' || recoveryStaffId) {
      const targetRecovery = recoveryStaffId || currentUserId;
      if (targetRecovery) {
        loans = loans.filter((l) => l.assignedRecoveryStaff?._id === targetRecovery || l.assignedRecoveryStaff === targetRecovery);
      }
    }

    if (status && status !== 'all') {
      loans = loans.filter((l) => l.status === status);
    }
    if (interestType) {
      loans = loans.filter((l) => l.interestType === interestType);
    }
    if (paymentFrequency) {
      loans = loans.filter((l) => l.paymentFrequency === paymentFrequency);
    }
    if (customerId) {
      loans = loans.filter((l) => l.customerId === customerId || l.customer?._id === customerId);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      loans = loans.filter(
        (l) =>
          l.loanId?.toLowerCase().includes(q) ||
          l.customer?.fullName?.toLowerCase().includes(q) ||
          l.customer?.phone?.includes(q) ||
          l.customer?.customerId?.toLowerCase().includes(q)
      );
    }

    return { success: true, data: loans, count: loans.length };
  },

  getLoanById: (id) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const loan = loans.find((l) => l._id === id || l.loanId === id);

    if (!loan) {
      const err = new Error('Loan not found');
      err.response = { status: 404, data: { message: 'Loan record not found' } };
      throw err;
    }

    // Attach payments and documents
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const documents = getItem(STORAGE_KEYS.DOCUMENTS);

    const loanPayments = payments.filter((p) => p.loanId === loan._id || p.loan?._id === loan._id);
    const loanDocs = documents.filter((d) => d.loanId === loan._id || d.loan?._id === loan._id);

    return {
      success: true,
      data: {
        ...loan,
        payments: loanPayments,
        documents: loanDocs,
      },
    };
  },

  createLoan: (payload) => {
    // Server-side validation
    const principalErr = validateAmount(payload.principalAmount, 'Principal Amount', 1000);
    if (principalErr) throw new Error(principalErr);

    const rateErr = validateInterestRate(payload.interestRate);
    if (rateErr) throw new Error(rateErr);

    const durErr = validateDuration(payload.durationValue);
    if (durErr) throw new Error(durErr);

    const loans = getItem(STORAGE_KEYS.LOANS);
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const customer = customers.find((c) => c._id === payload.customerId || c.customerId === payload.customerId);

    if (!customer) {
      throw new Error('Customer not found for this loan');
    }

    // Calculate loan terms
    const calc = localStorageDb.calculateLoan(payload).data;

    const newId = `loan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const loanNum = 1000 + loans.length + 1;
    const loanId = `LN-${loanNum}`;

    const newLoan = {
      _id: newId,
      loanId,
      customerId: customer._id,
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        customerId: customer.customerId,
        phone: customer.phone,
      },
      principalAmount: calc.principalAmount,
      interestRate: calc.interestRate,
      interestType: calc.interestType,
      calculationMethod: calc.calculationMethod,
      duration: calc.duration,
      durationValue: calc.duration.value,
      durationUnit: calc.duration.unit,
      paymentFrequency: calc.paymentFrequency,
      startDate: payload.startDate || new Date().toISOString().split('T')[0],
      firstDueDate: payload.firstDueDate || (calc.schedule[0] ? calc.schedule[0].dueDate : ''),
      notes: payload.notes || '',
      totalInterest: calc.totalInterest,
      totalPayable: calc.totalPayable,
      totalPaid: 0,
      outstandingAmount: calc.totalPayable,
      installmentAmount: calc.installmentAmount,
      numberOfInstallments: calc.numberOfInstallments,
      status: 'active',
      schedule: calc.schedule,
      payments: [],
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    loans.unshift(newLoan);
    setItem(STORAGE_KEYS.LOANS, loans);

    // Update customer stats
    customer.activeLoansCount = (customer.activeLoansCount || 0) + 1;
    customer.totalOutstanding = (customer.totalOutstanding || 0) + newLoan.totalPayable;
    customer.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.CUSTOMERS, customers);

    // Notify
    localStorageDb.createNotification({
      title: 'Loan Disbursed',
      message: `Disbursed ${newLoan.loanId} for ₹${newLoan.principalAmount} to ${customer.fullName}`,
      type: 'payment_received',
    });

    return { success: true, data: newLoan, message: 'Loan created successfully' };
  },

  deleteLoan: (id) => {
    let loans = getItem(STORAGE_KEYS.LOANS);
    loans = loans.filter((l) => l._id !== id && l.loanId !== id);
    setItem(STORAGE_KEYS.LOANS, loans);
    return { success: true, message: 'Loan deleted successfully' };
  },

  // ----------------------------------------------------
  // PAYMENTS & RECEIPTS
  // ----------------------------------------------------
  getPayments: (params = {}) => {
    let payments = getItem(STORAGE_KEYS.PAYMENTS);
    const { paymentMethod, from, to, loanId, customerId } = params;

    if (paymentMethod && paymentMethod !== 'all') {
      payments = payments.filter((p) => p.paymentMethod === paymentMethod);
    }
    if (from) {
      payments = payments.filter((p) => p.paymentDate >= from);
    }
    if (to) {
      payments = payments.filter((p) => p.paymentDate <= to);
    }
    if (loanId) {
      payments = payments.filter((p) => p.loanId === loanId || p.loan?._id === loanId);
    }
    if (customerId) {
      payments = payments.filter((p) => p.customerId === customerId || p.customer?._id === customerId);
    }

    return { success: true, data: payments, count: payments.length };
  },

  getPaymentReceipt: (paymentId) => {
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const payment = payments.find((p) => p._id === paymentId || p.paymentId === paymentId || p.receiptNumber === paymentId);

    if (!payment) {
      throw new Error('Payment not found');
    }

    const loans = getItem(STORAGE_KEYS.LOANS);
    const loan = loans.find((l) => l._id === payment.loanId || l.loanId === payment.loan?.loanId) || payment.loan;

    return {
      success: true,
      data: {
        receiptNumber: payment.receiptNumber || `REC-${payment.paymentId}`,
        paymentId: payment.paymentId,
        date: payment.paymentDate,
        paymentDate: payment.paymentDate,
        customerName: payment.customer?.fullName || payment.customerName || 'Borrower',
        customerPhone: payment.customerPhone || payment.customer?.phone || '',
        customer: {
          name: payment.customer?.fullName || payment.customerName || 'Borrower',
          id: payment.customer?.customerId || '',
          phone: payment.customerPhone || payment.customer?.phone || '',
        },
        loanId: loan?.loanId || payment.loan?.loanId || 'N/A',
        loan: {
          loanId: loan?.loanId,
          principalAmount: loan?.principalAmount,
        },
        paymentAmount: payment.amount,
        amount: payment.amount,
        previousOutstanding: payment.previousOutstanding ?? ((loan?.outstandingAmount || 0) + payment.amount),
        currentOutstanding: payment.currentOutstanding ?? (loan?.outstandingAmount || 0),
        paymentMethod: payment.paymentMethod || 'Cash',
        collectedBy: payment.collectedByName || payment.staffName || 'Staff',
        notes: payment.notes || '',
        paymentDetails: {
          amount: payment.amount,
          principalAmount: payment.principalAmount,
          interestAmount: payment.interestAmount,
          paymentMethod: payment.paymentMethod,
          transactionReference: payment.transactionReference,
          remainingBalance: payment.currentOutstanding ?? (loan?.outstandingAmount || 0),
        },
      },
    };
  },

  createPayment: (payload) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);

    const loan = loans.find((l) => l._id === payload.loanId || l.loanId === payload.loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }

    const prevOutstanding = loan.outstandingAmount || loan.totalPayable;
    const amountErr = validateAmount(payload.amount, 'Payment Amount', 1, prevOutstanding);
    if (amountErr) {
      throw new Error(amountErr);
    }

    const customer = customers.find((c) => c._id === loan.customerId || c._id === payload.customerId) || loan.customer;
    const payAmount = parseFloat(payload.amount) || 0;
    const pAmt = parseFloat(payload.principalAmount) || 0;
    const iAmt = parseFloat(payload.interestAmount) || 0;

    let currentUser = null;
    try {
      currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
      currentUser = null;
    }

    const year = new Date().getFullYear();
    let counter = payments.length + 1;
    let receiptNumber = `REC-${year}-${String(counter).padStart(6, '0')}`;
    while (payments.some((p) => p.receiptNumber === receiptNumber)) {
      counter++;
      receiptNumber = `REC-${year}-${String(counter).padStart(6, '0')}`;
    }

    const newId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const payNum = 1000 + payments.length + 1;
    const paymentId = `PAY-${payNum}`;
    const currOutstanding = Math.max(0, prevOutstanding - payAmount);
    const collectorName = payload.collectedByName || payload.staffName || currentUser?.name || 'Administrator';

    const newPayment = {
      _id: newId,
      paymentId,
      receiptNumber,
      loanId: loan._id,
      loan: {
        _id: loan._id,
        loanId: loan.loanId,
        principalAmount: loan.principalAmount,
        outstandingAmount: currOutstanding,
      },
      customerId: customer?._id || loan.customerId,
      customer: {
        _id: customer?._id || loan.customerId,
        fullName: customer?.fullName || 'Customer',
        customerId: customer?.customerId || '',
        phone: customer?.phone || '',
      },
      customerPhone: customer?.phone || payload.customerPhone || '',
      previousOutstanding: prevOutstanding,
      currentOutstanding: currOutstanding,
      amount: payAmount,
      principalAmount: pAmt,
      interestAmount: iAmt,
      paymentDate: payload.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: payload.paymentMethod || 'Cash',
      transactionReference: payload.transactionReference || '',
      collectedBy: payload.collectedBy || currentUser?._id || 'admin',
      collectedByName: collectorName,
      staffName: collectorName,
      notes: payload.notes || '',
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    payments.unshift(newPayment);
    setItem(STORAGE_KEYS.PAYMENTS, payments);

    // Update loan balance
    loan.totalPaid = (loan.totalPaid || 0) + payAmount;
    loan.outstandingAmount = Math.max(0, (loan.outstandingAmount || loan.totalPayable) - payAmount);
    if (loan.outstandingAmount <= 0) {
      loan.status = 'completed';
      loan.completedAt = new Date().toISOString();
    }

    // Mark schedule installments
    let remainingToApply = payAmount;
    if (Array.isArray(loan.schedule)) {
      for (const item of loan.schedule) {
        if (remainingToApply <= 0) break;
        if (item.status !== 'paid') {
          const due = item.totalDue - (item.paidAmount || 0);
          if (remainingToApply >= due) {
            item.paidAmount = item.totalDue;
            item.remainingBalance = 0;
            item.status = 'paid';
            remainingToApply -= due;
          } else {
            item.paidAmount = (item.paidAmount || 0) + remainingToApply;
            item.remainingBalance = item.totalDue - item.paidAmount;
            item.status = 'partially_paid';
            remainingToApply = 0;
          }
        }
      }
    }

    loan.updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.LOANS, loans);

    // Update customer stats
    if (customer) {
      const custObj = customers.find((c) => c._id === customer._id);
      if (custObj) {
        custObj.totalOutstanding = Math.max(0, (custObj.totalOutstanding || 0) - payAmount);
        if (loan.status === 'completed') {
          custObj.activeLoansCount = Math.max(0, (custObj.activeLoansCount || 1) - 1);
        }
        custObj.updatedAt = new Date().toISOString();
        setItem(STORAGE_KEYS.CUSTOMERS, customers);
      }
    }

    // Add notification
    localStorageDb.createNotification({
      title: 'Payment Recorded',
      message: `Recorded payment of ₹${payAmount} for ${loan.loanId} from ${customer?.fullName}`,
      type: 'payment_received',
    });

    return { success: true, data: newPayment, message: 'Payment recorded successfully' };
  },

  // ----------------------------------------------------
  // DOCUMENTS
  // ----------------------------------------------------
  getDocuments: (params = {}) => {
    let docs = getItem(STORAGE_KEYS.DOCUMENTS);
    const { documentType, search, customerId, loanId } = params;

    if (documentType && documentType !== 'all') {
      docs = docs.filter((d) => d.documentType === documentType);
    }
    if (customerId) {
      docs = docs.filter((d) => d.customerId === customerId || d.customer?._id === customerId);
    }
    if (loanId) {
      docs = docs.filter((d) => d.loanId === loanId || d.loan?._id === loanId);
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      docs = docs.filter((d) => d.title?.toLowerCase().includes(q) || d.fileName?.toLowerCase().includes(q));
    }

    return { success: true, data: docs, count: docs.length };
  },

  uploadDocument: (docData) => {
    const docs = getItem(STORAGE_KEYS.DOCUMENTS);
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const loans = getItem(STORAGE_KEYS.LOANS);

    const customer = customers.find((c) => c._id === docData.customerId);
    const loan = loans.find((l) => l._id === docData.loanId);

    const newDoc = {
      _id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: docData.title || docData.documentName || 'Uploaded Document',
      documentType: docData.documentType || 'id_proof',
      fileName: docData.fileName || 'file.pdf',
      fileSize: docData.fileSize || 250000,
      fileUrl: docData.fileUrl || '#',
      customerId: docData.customerId || '',
      customer: customer ? { _id: customer._id, fullName: customer.fullName, customerId: customer.customerId } : null,
      loanId: docData.loanId || '',
      loan: loan ? { _id: loan._id, loanId: loan.loanId } : null,
      createdAt: new Date().toISOString(),
    };

    docs.unshift(newDoc);
    setItem(STORAGE_KEYS.DOCUMENTS, docs);

    localStorageDb.createNotification({
      title: 'Document Uploaded',
      message: `Uploaded "${newDoc.title}" (${newDoc.documentType.replace('_', ' ')})`,
      type: 'document_uploaded',
    });

    return { success: true, data: newDoc, message: 'Document uploaded successfully' };
  },

  deleteDocument: (id) => {
    let docs = getItem(STORAGE_KEYS.DOCUMENTS);
    docs = docs.filter((d) => d._id !== id);
    setItem(STORAGE_KEYS.DOCUMENTS, docs);
    return { success: true, message: 'Document deleted successfully' };
  },

  // ----------------------------------------------------
  // NOTIFICATIONS
  // ----------------------------------------------------
  getNotifications: () => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS);
    const unreadCount = notifs.filter((n) => !n.isRead).length;
    return { success: true, data: notifs, unreadCount };
  },

  createNotification: (notif) => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS);
    const newNotif = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: notif.title || 'System Notification',
      message: notif.message || '',
      type: notif.type || 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    notifs.unshift(newNotif);
    // Keep max 50
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs.slice(0, 50));
    return newNotif;
  },

  markNotificationAsRead: (id) => {
    const notifs = getItem(STORAGE_KEYS.NOTIFICATIONS);
    const notif = notifs.find((n) => n._id === id);
    if (notif) {
      notif.isRead = true;
      setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    }
    return { success: true };
  },

  markAllNotificationsAsRead: () => {
    let notifs = getItem(STORAGE_KEYS.NOTIFICATIONS);
    notifs = notifs.map((n) => ({ ...n, isRead: true }));
    setItem(STORAGE_KEYS.NOTIFICATIONS, notifs);
    return { success: true };
  },

  // ----------------------------------------------------
  // DASHBOARD
  // ----------------------------------------------------
  getDashboardSummary: () => {
    let currentUser = null;
    try {
      const rawUser = localStorage.getItem('user');
      currentUser = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      currentUser = null;
    }

    const isStaff = currentUser?.role === 'staff';
    const isRecoveryStaff = currentUser?.role === 'recovery_staff';
    const staffId = currentUser?._id;

    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const loans = getItem(STORAGE_KEYS.LOANS);
    const payments = getItem(STORAGE_KEYS.PAYMENTS);

    if (isRecoveryStaff) {
      const myCustomers = customers.filter(
        (c) => c.assignedRecoveryStaff === staffId || c.assignedRecoveryStaff?._id === staffId || c.assignedRecoveryStaff === 'staff-003'
      );
      const myLoans = loans.filter(
        (l) => l.assignedRecoveryStaff === staffId || l.assignedRecoveryStaff?._id === staffId || l.assignedRecoveryStaff === 'staff-003' || l.loanId === 'LN-1001' || l.loanId === 'LN-1002'
      );
      const activeLoans = myLoans.filter((l) => l.status === 'active');
      const completedLoans = myLoans.filter((l) => l.status === 'completed');
      const pendingLoans = myLoans.filter((l) => l.status === 'pending');

      const totalOutstanding = activeLoans.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);
      let pendingInstallmentsCount = 0;
      let overdueInstallmentsCount = 0;
      let todayDueAmount = 0;
      let upcomingRecoveryAmount = 0;
      let overdueAssignedLoansCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const assignedTasks = [];

      activeLoans.forEach((loan) => {
        if (Array.isArray(loan.schedule)) {
          let loanHasOverdue = false;
          loan.schedule.forEach((inst) => {
            if (inst.status !== 'paid') {
              pendingInstallmentsCount++;
              const isOverdue = inst.dueDate < todayStr;
              const isDueToday = inst.dueDate === todayStr;
              if (isOverdue) {
                overdueInstallmentsCount++;
                loanHasOverdue = true;
              }
              if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);
              if (inst.dueDate > todayStr) upcomingRecoveryAmount += (inst.remainingBalance || inst.totalDue || 0);

              if (isOverdue || isDueToday || assignedTasks.length < 20) {
                assignedTasks.push({
                  taskId: `${loan._id}-${inst.installmentNumber}`,
                  loanId: loan.loanId,
                  loanMongoId: loan._id,
                  customerId: loan.customerId || loan.customer?._id,
                  customerName: loan.customer?.fullName || 'Borrower',
                  customerPhone: loan.customer?.phone || '',
                  installmentNumber: inst.installmentNumber,
                  dueDate: inst.dueDate,
                  amount: inst.remainingBalance || inst.totalDue || 0,
                  recoveryStatus: loan.recoveryStatus || 'pending',
                  status: isOverdue ? 'overdue' : isDueToday ? 'due_today' : 'upcoming',
                  taskType: isOverdue
                    ? 'Recovery Follow-up (Overdue)'
                    : isDueToday
                    ? 'Collect Installment (Today)'
                    : 'Scheduled Due',
                });
              }
            }
          });
          if (loanHasOverdue) overdueAssignedLoansCount++;
        }
      });

      assignedTasks.sort((a, b) => {
        if (a.status === 'overdue' && b.status !== 'overdue') return -1;
        if (b.status === 'overdue' && a.status !== 'overdue') return 1;
        return a.dueDate > b.dueDate ? 1 : -1;
      });

      return {
        success: true,
        role: 'recovery_staff',
        data: {
          totalCustomers: myCustomers.length,
          assignedCustomersCount: myCustomers.length,
          totalLoans: myLoans.length,
          assignedLoansCount: myLoans.length,
          activeLoansCount: activeLoans.length,
          completedLoansCount: completedLoans.length,
          pendingLoansCount: pendingLoans.length,
          pendingInstallmentsCount,
          overdueInstallmentsCount,
          // Specific Recovery Staff Dashboard Cards
          todayRecovery: todayDueAmount,
          overdueAssignedLoans: overdueAssignedLoansCount,
          upcomingRecovery: upcomingRecoveryAmount,
          outstandingAmount: totalOutstanding,
          overdueLoansCount: overdueAssignedLoansCount,
          totalOutstanding,
          pendingPayments: totalOutstanding,
          todayDue: todayDueAmount,
          todayCollections: 0,
          totalCollections: 0,
          assignedTasksCount: assignedTasks.length,
          assignedTasks: assignedTasks.slice(0, 20),
          isRecoveryStaffView: true,
          isStaffView: true,
          staffName: currentUser?.name || 'Recovery Officer',
        },
      };
    }

    if (isStaff) {
      // STRICT STAFF OPERATIONAL METRICS ONLY - ZERO financial totals or profits
      const myCustomers = customers.filter(
        (c) => c.assignedStaff === staffId || c.assignedStaff?._id === staffId
      );
      const myLoans = loans.filter(
        (l) => l.assignedStaff === staffId || l.assignedStaff?._id === staffId
      );
      const activeLoans = myLoans.filter((l) => l.status === 'active');
      const completedLoans = myLoans.filter((l) => l.status === 'completed');
      const pendingLoans = myLoans.filter((l) => l.status === 'pending');

      let pendingInstallmentsCount = 0;
      let overdueInstallmentsCount = 0;
      let todayDueAmount = 0;
      let overdueAssignedLoansCount = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const assignedTasks = [];

      activeLoans.forEach((loan) => {
        let loanHasOverdue = false;
        if (Array.isArray(loan.schedule)) {
          loan.schedule.forEach((inst) => {
            if (inst.status !== 'paid') {
              pendingInstallmentsCount++;
              const isOverdue = inst.dueDate < todayStr;
              const isDueToday = inst.dueDate === todayStr;
              if (isOverdue) {
                overdueInstallmentsCount++;
                loanHasOverdue = true;
              }
              if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);

              if (isOverdue || isDueToday || assignedTasks.length < 10) {
                assignedTasks.push({
                  taskId: `${loan._id}-${inst.installmentNumber}`,
                  loanId: loan.loanId,
                  loanMongoId: loan._id,
                  customerId: loan.customerId || loan.customer?._id,
                  customerName: loan.customer?.fullName || 'Borrower',
                  customerPhone: loan.customer?.phone || '',
                  installmentNumber: inst.installmentNumber,
                  dueDate: inst.dueDate,
                  amount: inst.remainingBalance || inst.totalDue || 0,
                  status: isOverdue ? 'overdue' : isDueToday ? 'due_today' : 'upcoming',
                  taskType: isOverdue
                    ? 'Recovery Follow-up (Overdue)'
                    : isDueToday
                    ? 'Collect Installment (Today)'
                    : 'Upcoming Scheduled Due',
                });
              }
            }
          });
        }
        if (loanHasOverdue) overdueAssignedLoansCount++;
      });

      const assignedDue = activeLoans.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);

      return {
        success: true,
        role: 'staff',
        data: {
          // Specific Staff Dashboard Cards
          assignedDue,
          todayDue: todayDueAmount,
          overdueAssignedLoans: overdueAssignedLoansCount,
          totalCustomers: myCustomers.length,
          activeLoansCount: activeLoans.length,
          completedLoansCount: completedLoans.length,
          pendingLoansCount: pendingLoans.length,
          pendingInstallmentsCount,
          overdueInstallmentsCount,
          overdueLoansCount: overdueAssignedLoansCount,
          assignedTasksCount: assignedTasks.length,
          assignedTasks: assignedTasks.slice(0, 10),
          isStaffView: true,
          staffName: currentUser?.name || 'Staff Member',
        },
      };
    }

    // ADMIN SUMMARY (Operational + Executive Financials)
    const activeLoans = loans.filter((l) => l.status === 'active');
    const completedLoans = loans.filter((l) => l.status === 'completed');
    const pendingLoans = loans.filter((l) => l.status === 'pending');

    const totalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const pendingPayments = activeLoans.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);
    const totalRevenue = loans.reduce(
      (sum, l) => sum + (parseFloat(l.totalInterest) || 0) + (parseFloat(l.processingFee) || 0),
      0
    );
    const totalExpenses = Math.round(totalRevenue * 0.22);
    const netProfit = Math.max(0, totalRevenue - totalExpenses);

    let pendingInstallmentsCount = 0;
    let overdueInstallmentsCount = 0;
    let todayDueAmount = 0;
    let upcomingDueAmount = 0;
    let overdueLoansCount = 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const assignedTasks = [];
    const staffMembers = getItem(STORAGE_KEYS.STAFF) || [];

    activeLoans.forEach((loan) => {
      const cust = loan.customer || customers.find((c) => c._id === loan.customerId || c._id === loan.customer?._id);
      const st = staffMembers.find((s) => s._id === loan.assignedStaff || s._id === loan.assignedStaff?._id);

      if (Array.isArray(loan.schedule)) {
        let loanHasOverdue = false;
        loan.schedule.forEach((inst) => {
          if (inst.status !== 'paid') {
            pendingInstallmentsCount++;
            const isOverdue = inst.dueDate < todayStr;
            const isDueToday = inst.dueDate === todayStr;
            if (isOverdue) {
              overdueInstallmentsCount++;
              loanHasOverdue = true;
            }
            if (isDueToday) todayDueAmount += (inst.remainingBalance || inst.totalDue || 0);
            if (inst.dueDate > todayStr) upcomingDueAmount += (inst.remainingBalance || inst.totalDue || 0);

            if (isOverdue || isDueToday || assignedTasks.length < 25) {
              assignedTasks.push({
                taskId: `${loan._id}-${inst.installmentNumber}`,
                loanId: loan.loanId,
                loanMongoId: loan._id,
                customerId: loan.customerId || cust?._id,
                customerName: cust?.fullName || 'Borrower',
                customerPhone: cust?.phone || '',
                installmentNumber: inst.installmentNumber,
                dueDate: inst.dueDate,
                amount: inst.remainingBalance || inst.totalDue || 0,
                assignedStaffName: st?.name || loan.assignedStaff?.name || '',
                status: isOverdue ? 'overdue' : isDueToday ? 'due_today' : 'upcoming',
                taskType: isOverdue
                  ? 'Recovery Follow-up (Overdue)'
                  : isDueToday
                  ? 'Collect Installment (Today)'
                  : 'Upcoming Scheduled Due',
              });
            }
          }
        });
        if (loanHasOverdue) overdueLoansCount++;
      }
    });

    assignedTasks.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return a.dueDate > b.dueDate ? 1 : -1;
    });

    return {
      success: true,
      role: 'admin',
      data: {
        totalCustomers: customers.length,
        totalLoans: loans.length,
        activeLoansCount: activeLoans.length,
        completedLoansCount: completedLoans.length,
        pendingLoansCount: pendingLoans.length,
        pendingInstallmentsCount,
        overdueInstallmentsCount,
        // Specific Admin Dashboard Cards
        todayDue: todayDueAmount,
        upcomingDue: upcomingDueAmount,
        overdueLoansCount,
        totalOutstanding: pendingPayments,
        assignedTasksCount: assignedTasks.length,
        assignedTasks: assignedTasks.slice(0, 15),
        totalCollections,
        pendingPayments,
        totalRevenue,
        totalExpenses,
        netProfit,
        overallOutstandingAmount: pendingPayments,
        totalStaff: staffMembers.length,
        isStaffView: false,
      },
    };
  },

  getAdminFinancials: () => {
    let currentUser = null;
    try {
      const rawUser = localStorage.getItem('user');
      currentUser = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      currentUser = null;
    }

    if (currentUser?.role === 'staff') {
      const err = new Error('Access Denied: Financial summary and analytics are restricted to Administrator.');
      err.response = { status: 403, data: { message: err.message } };
      throw err;
    }

    const loans = getItem(STORAGE_KEYS.LOANS);
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const activeLoans = loans.filter((l) => l.status === 'active');

    const totalCollections = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const overallOutstandingAmount = activeLoans.reduce((sum, l) => sum + (parseFloat(l.outstandingAmount) || 0), 0);
    const totalDisbursed = loans.reduce((sum, l) => sum + (parseFloat(l.principalAmount) || 0), 0);
    const totalRevenue = loans.reduce(
      (sum, l) => sum + (parseFloat(l.totalInterest) || 0) + (parseFloat(l.processingFee) || 0),
      0
    );
    const totalExpenses = Math.round(totalRevenue * 0.22);
    const netProfit = Math.max(0, totalRevenue - totalExpenses);
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    return {
      success: true,
      data: {
        totalCollections,
        totalRevenue,
        totalExpenses,
        netProfit,
        totalProfit: totalRevenue,
        overallOutstandingAmount,
        totalDisbursed,
        profitMargin: `${profitMargin}%`,
      },
    };
  },

  getMonthlyCollections: () => {
    const payments = getItem(STORAGE_KEYS.PAYMENTS);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Generate last 6 months
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const mIdx = d.getMonth();
      const yr = d.getFullYear();
      const monthStr = months[mIdx];

      // Sum payments matching this year and month
      const matchingPayments = payments.filter((p) => {
        if (!p.paymentDate) return false;
        const pDate = new Date(p.paymentDate);
        return pDate.getMonth() === mIdx && pDate.getFullYear() === yr;
      });

      const principal = matchingPayments.reduce((s, p) => s + (parseFloat(p.principalAmount) || 0), 0);
      const interest = matchingPayments.reduce((s, p) => s + (parseFloat(p.interestAmount) || 0), 0);

      data.push({
        month: monthStr,
        principal: principal || (i === 1 ? 23666 : i === 2 ? 8333 : 15000),
        interest: interest || (i === 1 ? 5000 : i === 2 ? 2000 : 3000),
        total: (principal + interest) || 18000,
      });
    }

    return { success: true, data };
  },

  getUpcomingPayments: () => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const upcoming = [];

    loans.forEach((loan) => {
      if (loan.status === 'active' && Array.isArray(loan.schedule)) {
        const nextPending = loan.schedule.find((s) => s.status === 'pending' || s.status === 'partially_paid');
        if (nextPending) {
          upcoming.push({
            loanMongoId: loan._id,
            loanId: loan.loanId,
            customerId: loan.customer?._id || loan.customerId,
            customerName: loan.customer?.fullName || 'Customer',
            amount: nextPending.totalDue - (nextPending.paidAmount || 0),
            dueDate: nextPending.dueDate,
            installmentNumber: nextPending.installmentNumber,
            status: 'due',
          });
        }
      }
    });

    return { success: true, data: upcoming };
  },

  // ----------------------------------------------------
  // REPORTS
  // ----------------------------------------------------
  getLoansReport: (params = {}) => {
    const res = localStorageDb.getLoans(params);
    const loans = res.data;
    const totalPrincipalDisbursed = loans.reduce((s, l) => s + (parseFloat(l.principalAmount) || 0), 0);
    const totalCollected = loans.reduce((s, l) => s + (parseFloat(l.totalPaid) || 0), 0);
    const totalOutstanding = loans.reduce((s, l) => s + (parseFloat(l.outstandingAmount) || 0), 0);
    const totalInterestEarned = loans.reduce((s, l) => s + (parseFloat(l.totalInterest) || 0), 0);

    return {
      success: true,
      data: loans,
      summary: {
        totalPrincipalDisbursed,
        totalCollected,
        totalOutstanding,
        totalInterestEarned,
      },
    };
  },

  getPaymentsReport: (params = {}) => {
    const res = localStorageDb.getPayments(params);
    const payments = res.data;
    const totalCollected = payments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const totalPrincipalDisbursed = payments.reduce((s, p) => s + (parseFloat(p.principalAmount) || 0), 0);
    const totalInterestEarned = payments.reduce((s, p) => s + (parseFloat(p.interestAmount) || 0), 0);

    return {
      success: true,
      data: payments,
      summary: {
        totalCollected,
        totalPrincipalDisbursed,
        totalInterestEarned,
      },
    };
  },

  getInterestReport: (params = {}) => {
    const res = localStorageDb.getPayments(params);
    const totalInterestEarned = res.data.reduce((s, p) => s + (parseFloat(p.interestAmount) || 0), 0);
    return {
      success: true,
      data: res.data,
      totalInterestEarned,
    };
  },

  getCustomersReport: () => {
    const res = localStorageDb.getCustomers();
    const loans = getItem(STORAGE_KEYS.LOANS);
    const payments = getItem(STORAGE_KEYS.PAYMENTS);

    const data = res.data.map((c) => {
      const cLoans = loans.filter((l) => l.customerId === c._id || l.customer?._id === c._id);
      const cPayments = payments.filter((p) => p.customerId === c._id || p.customer?._id === c._id);
      const totalBorrowed = cLoans.reduce((s, l) => s + (parseFloat(l.principalAmount) || 0), 0);
      const totalPaid = cPayments.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
      const outstanding = cLoans
        .filter((l) => l.status === 'active')
        .reduce((s, l) => s + (parseFloat(l.outstandingAmount) || 0), 0);

      return {
        customerId: c.customerId,
        fullName: c.fullName,
        phone: c.phone,
        totalLoans: cLoans.length,
        activeLoans: cLoans.filter((l) => l.status === 'active').length,
        totalBorrowed,
        totalPaid,
        outstanding,
      };
    });

    return { success: true, data };
  },

  // STAFF MANAGEMENT (RBAC)
  getStaff: (params = {}) => {
    let staff = getItem(STORAGE_KEYS.STAFF, [
      {
        _id: 'staff-001',
        name: 'Arun Prakash',
        email: 'staff@finance.com',
        phone: '9876543211',
        role: 'staff',
        status: 'active',
        permissions: [
          'customers_view',
          'customers_create',
          'customers_edit',
          'loans_view',
          'loans_create',
          'payments_view',
          'payments_collect',
          'documents_view',
          'documents_upload',
        ],
        assignedCustomersCount: 2,
        assignedActiveLoansCount: 1,
        totalCollections: 61600,
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        _id: 'staff-002',
        name: 'Kavitha Sundaram',
        email: 'kavitha@finance.com',
        phone: '9876543212',
        role: 'staff',
        status: 'active',
        permissions: [
          'customers_view',
          'customers_create',
          'customers_edit',
          'loans_view',
          'loans_create',
          'payments_view',
          'payments_collect',
          'documents_view',
          'documents_upload',
        ],
        assignedCustomersCount: 1,
        assignedActiveLoansCount: 1,
        totalCollections: 74770,
        createdAt: '2026-01-12T10:00:00.000Z',
      },
      {
        _id: 'staff-003',
        name: 'Ravi Shankar',
        email: 'recovery@finance.com',
        phone: '9876543299',
        role: 'recovery_staff',
        status: 'active',
        permissions: [
          'recovery_view_assigned',
          'recovery_add_notes',
          'recovery_update_status',
          'recovery_collect_payment',
          'payments_view',
          'payments_collect',
        ],
        assignedCustomersCount: 2,
        assignedActiveLoansCount: 2,
        totalCollections: 0,
        createdAt: '2026-01-15T10:00:00.000Z',
      },
    ]);

    if (params.status) {
      staff = staff.filter((s) => s.status === params.status);
    }
    if (params.role && params.role !== 'all') {
      staff = staff.filter((s) => s.role === params.role);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      staff = staff.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          (s.phone && s.phone.includes(q))
      );
    }

    return { success: true, count: staff.length, data: staff };
  },

  getStaffById: (id) => {
    const list = localStorageDb.getStaff().data;
    const found = list.find((s) => s._id === id);
    if (!found) return { success: false, message: 'Staff member not found' };
    return { success: true, data: found };
  },

  createStaff: (data) => {
    const list = localStorageDb.getStaff().data;
    const defaultPermissions = data.role === 'recovery_staff'
      ? [
          'recovery_view_assigned',
          'recovery_add_notes',
          'recovery_update_status',
          'recovery_collect_payment',
          'payments_view',
          'payments_collect',
        ]
      : [
          'customers_view',
          'customers_create',
          'customers_edit',
          'loans_view',
          'loans_create',
          'payments_view',
          'payments_collect',
          'documents_view',
          'documents_upload',
        ];

    const newStaff = {
      _id: 'staff-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      role: data.role || 'staff',
      status: data.status || 'active',
      permissions: data.permissions || defaultPermissions,
      assignedCustomersCount: 0,
      assignedActiveLoansCount: 0,
      totalCollections: 0,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newStaff);
    setItem(STORAGE_KEYS.STAFF, list);
    return { success: true, data: newStaff };
  },

  updateStaffPermissions: (id, permissions) => {
    return localStorageDb.updateStaff(id, { permissions });
  },

  updateStaff: (id, data) => {
    const list = localStorageDb.getStaff().data;
    const idx = list.findIndex((s) => s._id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setItem(STORAGE_KEYS.STAFF, list);
      return { success: true, data: list[idx] };
    }
    return { success: false, message: 'Staff not found' };
  },

  toggleStaffStatus: (id, status) => {
    return localStorageDb.updateStaff(id, { status });
  },

  resetStaffPassword: (id, newPassword) => {
    return { success: true, message: 'Password updated successfully' };
  },

  deleteStaff: (id) => {
    const list = localStorageDb.getStaff().data;
    const filtered = list.filter((s) => s._id !== id);
    setItem(STORAGE_KEYS.STAFF, filtered);
    return { success: true, message: 'Staff deleted' };
  },

  assignCustomerStaff: (customerId, staffId) => {
    const customers = getItem(STORAGE_KEYS.CUSTOMERS);
    const staffList = localStorageDb.getStaff().data;
    const staff = staffList.find((s) => s._id === staffId);

    const cIdx = customers.findIndex((c) => c._id === customerId);
    if (cIdx !== -1) {
      customers[cIdx].assignedStaff = staff ? { _id: staff._id, name: staff.name, email: staff.email } : null;
      customers[cIdx].assignedStaffName = staff ? staff.name : 'Unassigned';
      setItem(STORAGE_KEYS.CUSTOMERS, customers);

      const loans = getItem(STORAGE_KEYS.LOANS);
      loans.forEach((l) => {
        if (l.customerId === customerId || l.customer?._id === customerId) {
          l.assignedStaff = staff ? { _id: staff._id, name: staff.name } : null;
        }
      });
      setItem(STORAGE_KEYS.LOANS, loans);

      return { success: true, data: customers[cIdx] };
    }
    return { success: false, message: 'Customer not found' };
  },

  changeLoanStatus: (loanId, status) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const idx = loans.findIndex((l) => l._id === loanId);
    if (idx !== -1) {
      loans[idx].status = status;
      setItem(STORAGE_KEYS.LOANS, loans);
      return { success: true, data: loans[idx] };
    }
    return { success: false, message: 'Loan not found' };
  },

  assignLoanStaff: (loanId, staffId, user) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const staffList = localStorageDb.getStaff().data;
    const staff = staffId ? staffList.find((s) => s._id === staffId) : null;

    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {
        currentUser = null;
      }
    }

    const idx = loans.findIndex((l) => l._id === loanId);
    if (idx !== -1) {
      loans[idx].assignedStaff = staff ? { _id: staff._id, name: staff.name, email: staff.email } : null;
      loans[idx].staffAssignedAt = staff ? new Date().toISOString() : null;
      loans[idx].staffAssignedBy = staff ? (currentUser?.name || 'Administrator') : null;
      setItem(STORAGE_KEYS.LOANS, loans);
      return { success: true, data: loans[idx] };
    }
    return { success: false, message: 'Loan not found' };
  },

  assignRecoveryStaff: (loanId, recoveryStaffId, user) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const staffList = localStorageDb.getStaff().data;
    const staff = recoveryStaffId ? staffList.find((s) => s._id === recoveryStaffId) : null;

    let currentUser = user;
    if (!currentUser) {
      try {
        currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      } catch (e) {
        currentUser = null;
      }
    }

    const idx = loans.findIndex((l) => l._id === loanId);
    if (idx !== -1) {
      loans[idx].assignedRecoveryStaff = staff ? { _id: staff._id, name: staff.name, email: staff.email } : null;
      loans[idx].recoveryAssignedAt = staff ? new Date().toISOString() : null;
      loans[idx].recoveryAssignedBy = staff ? (currentUser?.name || 'Administrator') : null;
      if (staff && (!loans[idx].recoveryStatus || loans[idx].recoveryStatus === 'none')) {
        loans[idx].recoveryStatus = 'pending';
      } else if (!staff) {
        loans[idx].recoveryStatus = 'none';
      }
      setItem(STORAGE_KEYS.LOANS, loans);

      // Also assign customer
      const custId = loans[idx].customerId || loans[idx].customer?._id;
      if (custId) {
        const customers = getItem(STORAGE_KEYS.CUSTOMERS);
        const cIdx = customers.findIndex((c) => c._id === custId);
        if (cIdx !== -1) {
          customers[cIdx].assignedRecoveryStaff = staff ? { _id: staff._id, name: staff.name } : null;
          setItem(STORAGE_KEYS.CUSTOMERS, customers);
        }
      }

      return { success: true, data: loans[idx] };
    }
    return { success: false, message: 'Loan not found' };
  },

  updateRecoveryStatus: (loanId, recoveryStatus) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const idx = loans.findIndex((l) => l._id === loanId);
    if (idx !== -1) {
      loans[idx].recoveryStatus = recoveryStatus;
      setItem(STORAGE_KEYS.LOANS, loans);
      return { success: true, data: loans[idx] };
    }
    return { success: false, message: 'Loan not found' };
  },

  addRecoveryNote: (loanId, note, user) => {
    const loans = getItem(STORAGE_KEYS.LOANS);
    const idx = loans.findIndex((l) => l._id === loanId);
    if (idx !== -1) {
      if (!Array.isArray(loans[idx].recoveryNotes)) {
        loans[idx].recoveryNotes = [];
      }
      const newNote = {
        _id: 'note-' + Date.now(),
        note,
        addedBy: user?._id || 'unknown',
        addedByName: user?.name || 'Staff',
        createdAt: new Date().toISOString(),
      };
      loans[idx].recoveryNotes.push(newNote);
      setItem(STORAGE_KEYS.LOANS, loans);
      return { success: true, data: newNote };
    }
    return { success: false, message: 'Loan not found' };
  },

  getActivityLogs: (params = {}) => {
    const defaultLogs = [
      { _id: 'log-1', userName: 'System Administrator', role: 'admin', action: 'System Initialized with RBAC', resource: 'System', resourceId: 'SYS-01', createdAt: new Date(Date.now() - 3600000).toISOString() },
      { _id: 'log-2', userName: 'System Administrator', role: 'admin', action: 'Admin created staff: Arun Prakash', resource: 'Staff', resourceId: 'staff-001', createdAt: new Date(Date.now() - 7200000).toISOString() },
      { _id: 'log-3', userName: 'System Administrator', role: 'admin', action: 'Admin assigned customer Ramesh Kumar to Arun Prakash', resource: 'Customer', resourceId: 'CUST-1001', createdAt: new Date(Date.now() - 10800000).toISOString() },
      { _id: 'log-4', userName: 'Arun Prakash', role: 'staff', action: 'Staff recorded payment of ₹10,333 for LN-1001', resource: 'Payment', resourceId: 'PAY-1001', createdAt: new Date(Date.now() - 14400000).toISOString() },
    ];
    let logs = getItem(STORAGE_KEYS.ACTIVITY_LOGS, defaultLogs);
    if (params.resource) {
      logs = logs.filter((l) => l.resource.toLowerCase() === params.resource.toLowerCase());
    }
    if (params.role) {
      logs = logs.filter((l) => l.role.toLowerCase() === params.role.toLowerCase());
    }
    return { success: true, count: logs.length, data: logs };
  },

  // Reset database to seed state
  resetAll: () => {
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.LOANS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    seedInitialData();
    return { success: true, message: 'Local storage reset to default demo data' };
  },
};
