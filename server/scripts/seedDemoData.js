import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Loan from '../models/Loan.js';
import Payment from '../models/Payment.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finveda';

async function seedData() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // 1. Create or ensure Admin
    let admin = await User.findOne({ email: 'admin@finance.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Ranjith Kumar',
        email: 'admin@finance.com',
        phone: '9876543210',
        password: 'password123',
        role: 'admin',
        status: 'active',
      });
      console.log('[Seed] Admin created: admin@finance.com');
    }

    // 2. Create Staff Accounts
    let staff1 = await User.findOne({ email: 'staff@finance.com' });
    if (!staff1) {
      staff1 = await User.create({
        name: 'Arun Prakash',
        email: 'staff@finance.com',
        phone: '9876543211',
        password: 'password123',
        role: 'staff',
        status: 'active',
      });
      console.log('[Seed] Staff 1 created: staff@finance.com');
    }

    let staff2 = await User.findOne({ email: 'kavitha@finance.com' });
    if (!staff2) {
      staff2 = await User.create({
        name: 'Kavitha Sundaram',
        email: 'kavitha@finance.com',
        phone: '9876543212',
        password: 'password123',
        role: 'staff',
        status: 'active',
      });
      console.log('[Seed] Staff 2 created: kavitha@finance.com');
    }

    // Inactive Staff for testing deactivation check
    let inactiveStaff = await User.findOne({ email: 'inactive.staff@finance.com' });
    if (!inactiveStaff) {
      inactiveStaff = await User.create({
        name: 'Suresh Deactivated',
        email: 'inactive.staff@finance.com',
        phone: '9876543213',
        password: 'password123',
        role: 'staff',
        status: 'inactive',
      });
      console.log('[Seed] Inactive Staff created: inactive.staff@finance.com');
    }

    // 2b. Create Demo Recovery Staff
    let recoveryStaff = await User.findOne({ email: 'recovery@finance.com' });
    if (!recoveryStaff) {
      recoveryStaff = await User.create({
        name: 'Ravi Shankar',
        email: 'recovery@finance.com',
        phone: '9876543299',
        password: 'password123',
        role: 'recovery_staff',
        status: 'active',
      });
      console.log('[Seed] Recovery Staff created: recovery@finance.com');
    } else {
      recoveryStaff.role = 'recovery_staff';
      await recoveryStaff.save();
    }

    // 3. Customers
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      const c1 = await Customer.create({
        customerId: 'CUST-1001',
        fullName: 'Ramesh Kumar',
        dateOfBirth: '1988-05-14',
        gender: 'Male',
        phone: '9876543210',
        email: 'ramesh.kumar@example.com',
        address: { addressLine: '12, Anna Salai', city: 'Chennai', state: 'Tamil Nadu', pincode: '600017' },
        identification: { idType: 'Aadhaar', idNumber: '4589-1234-8901', panNumber: 'ABCDE1234F' },
        employment: { occupation: 'Textile Merchant', employmentType: 'Business Owner', monthlyIncome: 65000 },
        referenceContact: { name: 'Suresh Kumar', relationship: 'Brother', phone: '9876543211' },
        status: 'active',
        assignedStaff: staff1._id, // Assigned to Arun
        activeLoansCount: 1,
        totalOutstanding: 62400,
      });

      const c2 = await Customer.create({
        customerId: 'CUST-1002',
        fullName: 'Priya Sharma',
        dateOfBirth: '1993-08-22',
        gender: 'Female',
        phone: '9845123654',
        email: 'priya.sharma@example.com',
        address: { addressLine: '45, MG Road', city: 'Bangalore', state: 'Karnataka', pincode: '560038' },
        identification: { idType: 'PAN', idNumber: 'XYZPK9876A', panNumber: 'XYZPK9876A' },
        employment: { occupation: 'Software Engineer', employmentType: 'Salaried', monthlyIncome: 95000 },
        referenceContact: { name: 'Anita Sharma', relationship: 'Sister', phone: '9845123655' },
        status: 'active',
        assignedStaff: staff1._id, // Assigned to Arun
        activeLoansCount: 1,
        totalOutstanding: 145000,
      });

      const c3 = await Customer.create({
        customerId: 'CUST-1003',
        fullName: 'Rajesh Patel',
        dateOfBirth: '1982-11-03',
        gender: 'Male',
        phone: '9723456789',
        email: 'rajesh.patel@example.com',
        address: { addressLine: '8, Ashram Road', city: 'Ahmedabad', state: 'Gujarat', pincode: '380009' },
        identification: { idType: 'Aadhaar', idNumber: '7823-4561-2345', panNumber: 'BPLPA9912C' },
        employment: { occupation: 'Logistics Supervisor', employmentType: 'Salaried', monthlyIncome: 42000 },
        referenceContact: { name: 'Mahesh Patel', relationship: 'Friend', phone: '9723456780' },
        status: 'active',
        assignedStaff: staff2._id, // Assigned to Kavitha (Not visible to Arun!)
        activeLoansCount: 1,
        totalOutstanding: 45000,
      });

      console.log('[Seed] Customers created');

      // 4. Loans
      const l1 = await Loan.create({
        loanId: 'LN-1001',
        customer: c1._id,
        customerId: c1.customerId,
        principalAmount: 100000,
        interestRate: 2,
        interestType: 'monthly',
        calculationMethod: 'simple',
        durationValue: 12,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2026-01-15',
        totalInterest: 24000,
        totalPayable: 124000,
        totalPaid: 61600,
        outstandingAmount: 62400,
        installmentAmount: 10333,
        numberOfInstallments: 12,
        status: 'active',
        assignedStaff: staff1._id, // Arun
        approvedBy: admin._id,
      });

      const l2 = await Loan.create({
        loanId: 'LN-1002',
        customer: c2._id,
        customerId: c2.customerId,
        principalAmount: 200000,
        interestRate: 1.5,
        interestType: 'monthly',
        calculationMethod: 'reducing_balance',
        durationValue: 12,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2026-02-10',
        totalInterest: 19770,
        totalPayable: 219770,
        totalPaid: 74770,
        outstandingAmount: 145000,
        installmentAmount: 18314,
        numberOfInstallments: 12,
        status: 'active',
        assignedStaff: staff1._id, // Arun
        approvedBy: admin._id,
      });

      const l3 = await Loan.create({
        loanId: 'LN-1003',
        customer: c3._id,
        customerId: c3.customerId,
        principalAmount: 50000,
        interestRate: 2,
        interestType: 'monthly',
        calculationMethod: 'simple',
        durationValue: 6,
        durationUnit: 'months',
        paymentFrequency: 'monthly',
        startDate: '2026-03-01',
        totalInterest: 6000,
        totalPayable: 56000,
        totalPaid: 11000,
        outstandingAmount: 45000,
        installmentAmount: 9333,
        numberOfInstallments: 6,
        status: 'active',
        assignedStaff: staff2._id, // Kavitha (Not visible to Arun!)
        approvedBy: admin._id,
      });

      console.log('[Seed] Loans created');

      // 5. Payments
      await Payment.create({
        paymentId: 'PAY-1001',
        loan: l1._id,
        loanId: l1.loanId,
        customer: c1._id,
        customerName: c1.fullName,
        customerId: c1.customerId,
        amount: 10333,
        paymentDate: '2026-02-15',
        paymentMethod: 'Cash',
        collectedBy: staff1._id,
        collectorName: staff1.name,
        status: 'completed',
      });

      await Payment.create({
        paymentId: 'PAY-1002',
        loan: l2._id,
        loanId: l2.loanId,
        customer: c2._id,
        customerName: c2.fullName,
        customerId: c2.customerId,
        amount: 18314,
        paymentDate: '2026-03-10',
        paymentMethod: 'UPI',
        collectedBy: staff1._id,
        collectorName: staff1.name,
        status: 'completed',
      });

      await Payment.create({
        paymentId: 'PAY-1003',
        loan: l3._id,
        loanId: l3.loanId,
        customer: c3._id,
        customerName: c3.fullName,
        customerId: c3.customerId,
        amount: 9333,
        paymentDate: '2026-03-25',
        paymentMethod: 'Bank Transfer',
        collectedBy: staff2._id,
        collectorName: staff2.name,
        status: 'completed',
      });

      console.log('[Seed] Payments created');

      // 6. Initial Activity Logs
      await ActivityLog.create({
        user: admin._id,
        userName: admin.name,
        role: admin.role,
        action: 'System Initialized with RBAC',
        resource: 'System',
        details: { admin: admin.email, staffCount: 2 },
      });
      console.log('[Seed] ActivityLog created');
    }

    // 7. Ensure Recovery Staff has assigned loans and customers for demo
    if (recoveryStaff) {
      await Loan.updateMany(
        { loanId: { $in: ['LN-1001', 'LN-1002'] } },
        {
          $set: {
            assignedRecoveryStaff: recoveryStaff._id,
            recoveryStatus: 'pending',
          },
        }
      );
      const assignedLoans = await Loan.find({ assignedRecoveryStaff: recoveryStaff._id });
      const customerIds = assignedLoans.map((l) => l.customer);
      await Customer.updateMany(
        { _id: { $in: customerIds } },
        { $set: { assignedRecoveryStaff: recoveryStaff._id } }
      );
      console.log('[Seed] Assigned demo loans & customers to Recovery Staff');
    }

    console.log('[Seed] Database seeding completed successfully!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

seedData();
