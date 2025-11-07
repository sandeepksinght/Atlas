#!/usr/bin/env ts-node
/**
 * Seed script to create initial dStudio Admin user
 *
 * Usage:
 *   npm run seed-admin
 *
 * Or with custom credentials:
 *   ADMIN_EMAIL=admin@company.com ADMIN_PASSWORD=SecurePass123 npm run seed-admin
 */

import { query } from '../config/database';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@dstudio.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
const ADMIN_NAME = process.env.ADMIN_NAME || 'dStudio Administrator';

async function seedAdmin() {
  try {
    console.log('🌱 Seeding dStudio Admin user...\n');

    // Check if admin already exists
    const existingAdmin = await query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('⚠️  Admin user already exists:');
      console.log(`   Email: ${existingAdmin.rows[0].email}`);
      console.log(`   Role: ${existingAdmin.rows[0].role}`);
      console.log(`   Created: ${existingAdmin.rows[0].created_at}\n`);
      console.log('Skipping creation. Use a different email or delete the existing admin first.\n');
      process.exit(0);
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Create admin user
    console.log('👤 Creating admin user...');
    const result = await query(
      `INSERT INTO users (
        email,
        password_hash,
        full_name,
        role,
        is_active,
        organization_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, full_name, role, created_at`,
      [ADMIN_EMAIL, passwordHash, ADMIN_NAME, 'dstudio_admin', true, null]
    );

    const admin = result.rows[0];

    console.log('\n✅ dStudio Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    ', ADMIN_EMAIL);
    console.log('🔑 Password: ', ADMIN_PASSWORD);
    console.log('👤 Name:     ', ADMIN_NAME);
    console.log('🆔 ID:       ', admin.id);
    console.log('📅 Created:  ', admin.created_at);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change this password immediately after first login!\n');
    console.log('You can now login at: http://localhost:3000/login\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error seeding admin user:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the seed function
seedAdmin();
