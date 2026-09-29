import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finveda';

async function run() {
  await mongoose.connect(MONGODB_URI);

  const schedule1 = [
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
  ];

  const schedule2 = [
    { installmentNumber: 1, dueDate: '2026-03-10', principalDue: 15333, interestDue: 3000, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
    { installmentNumber: 2, dueDate: '2026-04-10', principalDue: 15500, interestDue: 2833, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
    { installmentNumber: 3, dueDate: '2026-05-10', principalDue: 15700, interestDue: 2633, totalDue: 18333, paidAmount: 18333, remainingBalance: 0, status: 'paid' },
    { installmentNumber: 4, dueDate: '2026-06-10', principalDue: 16000, interestDue: 2333, totalDue: 18333, paidAmount: 20001, remainingBalance: 0, status: 'paid' },
    { installmentNumber: 5, dueDate: '2026-07-10', principalDue: 16200, interestDue: 2133, totalDue: 18333, paidAmount: 0, remainingBalance: 18333, status: 'pending' },
    { installmentNumber: 6, dueDate: '2026-08-10', principalDue: 16500, interestDue: 1833, totalDue: 18333, paidAmount: 0, remainingBalance: 18333, status: 'pending' },
  ];

  const schedule3 = [
    { installmentNumber: 1, dueDate: '2026-04-01', principalDue: 7500, interestDue: 1000, totalDue: 8500, paidAmount: 8500, remainingBalance: 0, status: 'paid' },
    { installmentNumber: 2, dueDate: '2026-05-01', principalDue: 7500, interestDue: 1000, totalDue: 8500, paidAmount: 0, remainingBalance: 8500, status: 'pending' },
  ];

  await mongoose.connection.collection('loans').updateOne({ loanId: 'LN-1001' }, { $set: { schedule: schedule1 } });
  await mongoose.connection.collection('loans').updateOne({ loanId: 'LN-1002' }, { $set: { schedule: schedule2 } });
  await mongoose.connection.collection('loans').updateOne({ loanId: 'LN-1003' }, { $set: { schedule: schedule3 } });

  console.log('Successfully updated loan schedules in MongoDB!');
  process.exit(0);
}

run();
