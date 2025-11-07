import { query } from '../config/database';
import { User } from '../types';
import { UserRole } from '../types/enterprise';
import bcrypt from 'bcryptjs';

// Legacy function - kept for backward compatibility
export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING *',
    [email, passwordHash, name]
  );

  return result.rows[0];
};

/**
 * Create user with organization and role (enterprise)
 */
export const createEnterpriseUser = async (
  email: string,
  password: string,
  fullName: string,
  organizationId: string | null,
  role: UserRole,
  createdBy: string | null = null
): Promise<User> => {
  const passwordHash = await bcrypt.hash(password, 10);

  const result = await query(
    `INSERT INTO users (
      email, password_hash, full_name, organization_id, role, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [email, passwordHash, fullName, organizationId, role, createdBy]
  );

  return result.rows[0];
};

/**
 * Create temporary password for user (viewable by admin)
 */
export const createTemporaryPassword = async (
  userId: string,
  createdBy: string
): Promise<{ plainPassword: string; user: User }> => {
  // Generate random password
  const plainPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // Update user password
  const userResult = await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [passwordHash, userId]
  );

  // Store temporary password record
  await query(
    `INSERT INTO temporary_passwords (user_id, password, created_by)
     VALUES ($1, $2, $3)`,
    [userId, plainPassword, createdBy]
  );

  return {
    plainPassword,
    user: userResult.rows[0],
  };
};

/**
 * Get temporary passwords for a user (admin only)
 */
export const getTemporaryPasswords = async (userId: string, limit: number = 5) => {
  const result = await query(
    `SELECT tp.*, u.email as created_by_email
     FROM temporary_passwords tp
     LEFT JOIN users u ON tp.created_by = u.id
     WHERE tp.user_id = $1
     ORDER BY tp.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0] || null;
};

/**
 * Get all users in an organization
 */
export const findUsersByOrganization = async (
  organizationId: string,
  includeInactive: boolean = false
): Promise<User[]> => {
  const activeFilter = includeInactive ? '' : 'AND is_active = true';

  const result = await query(
    `SELECT * FROM users
     WHERE organization_id = $1 ${activeFilter}
     ORDER BY created_at DESC`,
    [organizationId]
  );
  return result.rows;
};

/**
 * Get users by role
 */
export const findUsersByRole = async (
  organizationId: string | null,
  role: UserRole
): Promise<User[]> => {
  if (organizationId) {
    const result = await query(
      'SELECT * FROM users WHERE organization_id = $1 AND role = $2 AND is_active = true',
      [organizationId, role]
    );
    return result.rows;
  } else {
    // For dStudio admins (no org)
    const result = await query(
      'SELECT * FROM users WHERE role = $1 AND is_active = true',
      [role]
    );
    return result.rows;
  }
};

/**
 * Update user password
 */
export const updatePassword = async (
  userId: string,
  newPassword: string
): Promise<User> => {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  const result = await query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [passwordHash, userId]
  );

  return result.rows[0];
};

/**
 * Update user role
 */
export const updateUserRole = async (
  userId: string,
  role: UserRole
): Promise<User> => {
  const result = await query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [role, userId]
  );
  return result.rows[0];
};

/**
 * Activate/deactivate user
 */
export const setUserActive = async (
  userId: string,
  isActive: boolean
): Promise<User> => {
  const result = await query(
    'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [isActive, userId]
  );
  return result.rows[0];
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: {
    full_name?: string;
    email?: string;
    phone?: string;
  }
): Promise<User> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.full_name !== undefined) {
    fields.push(`full_name = $${paramIndex}`);
    values.push(updates.full_name);
    paramIndex++;
  }

  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex}`);
    values.push(updates.email);
    paramIndex++;
  }

  if (updates.phone !== undefined) {
    fields.push(`phone = $${paramIndex}`);
    values.push(updates.phone);
    paramIndex++;
  }

  if (fields.length === 0) {
    throw new Error('No fields to update');
  }

  fields.push(`updated_at = NOW()`);
  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0];
};

/**
 * Delete user (soft delete - just deactivate)
 */
export const deleteUser = async (userId: string): Promise<boolean> => {
  const result = await query(
    'UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1',
    [userId]
  );
  return (result.rowCount || 0) > 0;
};

/**
 * Hard delete user (only for dStudio admin)
 */
export const hardDeleteUser = async (userId: string): Promise<boolean> => {
  const result = await query(
    'DELETE FROM users WHERE id = $1',
    [userId]
  );
  return (result.rowCount || 0) > 0;
};

/**
 * Check if user has permission
 */
export const hasPermission = async (
  userId: string,
  permission: 'create_org' | 'manage_users' | 'manage_licenses' | 'impersonate' | 'create_assessment' | 'view_reports' | 'backup_restore'
): Promise<boolean> => {
  const user = await findUserById(userId);
  if (!user) return false;

  const role = user.role as UserRole;

  // Define permissions by role
  const rolePermissions: Record<UserRole, string[]> = {
    dstudio_admin: ['create_org', 'manage_users', 'manage_licenses', 'view_reports', 'backup_restore'],
    org_admin: ['manage_users', 'manage_licenses', 'impersonate', 'create_assessment', 'view_reports', 'backup_restore'],
    org_member: ['create_assessment'],
  };

  return rolePermissions[role]?.includes(permission) || false;
};

/**
 * Get user statistics for organization
 */
export const getUserStatistics = async (
  organizationId: string
): Promise<{
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Array<{ role: string; count: number }>;
}> => {
  const totalResult = await query(
    'SELECT COUNT(*) as total FROM users WHERE organization_id = $1',
    [organizationId]
  );

  const activeResult = await query(
    'SELECT COUNT(*) as total FROM users WHERE organization_id = $1 AND is_active = true',
    [organizationId]
  );

  const inactiveResult = await query(
    'SELECT COUNT(*) as total FROM users WHERE organization_id = $1 AND is_active = false',
    [organizationId]
  );

  const roleResult = await query(
    `SELECT role, COUNT(*) as count
     FROM users
     WHERE organization_id = $1 AND is_active = true
     GROUP BY role`,
    [organizationId]
  );

  return {
    totalUsers: parseInt(totalResult.rows[0].total),
    activeUsers: parseInt(activeResult.rows[0].total),
    inactiveUsers: parseInt(inactiveResult.rows[0].total),
    usersByRole: roleResult.rows.map(row => ({
      role: row.role,
      count: parseInt(row.count),
    })),
  };
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
