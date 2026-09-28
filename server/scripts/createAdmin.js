import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/finveda';

async function createAdmin() {
  try {
    console.log('[Script] Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);

    // 1. Check whether an Admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log(`[Script] Admin account already exists (${existingAdmin.email}).`);
      console.log('[Script] Initial Admin seed skipped to avoid duplicate administrative accounts.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // 2. Read configuration from environment or secure defaults
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@finance.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '9876543210';

    // 3. Create Admin (password is hashed automatically by User model pre-save hook)
    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: 'admin',
      status: 'active',
    });

    console.log('[Script] ✓ Successfully created initial Admin account!');
    console.log(`[Script] Admin Email: ${admin.email}`);
    console.log(`[Script] Admin Name: ${admin.name}`);
    console.log(`[Script] Role: ${admin.role} | Status: ${admin.status}`);
    console.log('[Script] Security Note: Password securely hashed using bcrypt. Password omitted from logs.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Script] Error creating admin account:', error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

createAdmin();
