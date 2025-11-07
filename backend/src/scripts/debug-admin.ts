#!/usr/bin/env ts-node
/**
 * Debug script to check admin user and test login
 */

import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

async function debugAdmin() {
  try {
    console.log('🔍 Checking admin user in database...\n');

    // Check if admin exists
    const result = await query(
      'SELECT id, email, full_name, role, is_active, created_at FROM users WHERE email = $1',
      ['admin@dstudio.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ Admin user does NOT exist in database');
      console.log('   Run: npm run seed-admin\n');
      process.exit(1);
    }

    const admin = result.rows[0];
    console.log('✅ Admin user found:');
    console.log('   ID:         ', admin.id);
    console.log('   Email:      ', admin.email);
    console.log('   Full Name:  ', admin.full_name);
    console.log('   Role:       ', admin.role);
    console.log('   Active:     ', admin.is_active);
    console.log('   Created:    ', admin.created_at);
    console.log('');

    // Get password hash
    const passResult = await query(
      'SELECT password_hash FROM users WHERE email = $1',
      ['admin@dstudio.com']
    );
    const storedHash = passResult.rows[0].password_hash;

    // Test password
    console.log('🔐 Testing password "Admin@123"...');
    const isValid = await bcrypt.compare('Admin@123', storedHash);

    if (isValid) {
      console.log('✅ Password is CORRECT\n');
    } else {
      console.log('❌ Password is INCORRECT\n');
      console.log('The stored hash does not match "Admin@123"');
      console.log('You may need to reset the password or recreate the admin user.\n');
    }

    // Check is_active issue
    if (admin.is_active === null) {
      console.log('⚠️  WARNING: is_active is NULL (should be true or false)');
      console.log('   Fixing this now...');
      await query(
        'UPDATE users SET is_active = true WHERE email = $1',
        ['admin@dstudio.com']
      );
      console.log('   ✅ Fixed! is_active is now true\n');
    } else if (admin.is_active === false) {
      console.log('⚠️  WARNING: Account is DISABLED');
      console.log('   Enabling account now...');
      await query(
        'UPDATE users SET is_active = true WHERE email = $1',
        ['admin@dstudio.com']
      );
      console.log('   ✅ Fixed! Account is now enabled\n');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Login credentials:');
    console.log('URL:      http://localhost:3000/login');
    console.log('Email:    admin@dstudio.com');
    console.log('Password: Admin@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugAdmin();
