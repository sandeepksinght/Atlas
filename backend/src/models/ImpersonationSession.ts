import { query } from '../config/database';
import { ImpersonationSession } from '../types/enterprise';

/**
 * Start an impersonation session
 */
export const startImpersonation = async (
  organizationId: string,
  adminId: string,
  targetUserId: string,
  reason: string | null = null
): Promise<ImpersonationSession> => {
  // Verify admin and target user are in the same organization
  const usersResult = await query(
    `SELECT id, organization_id, role FROM users WHERE id IN ($1, $2)`,
    [adminId, targetUserId]
  );

  if (usersResult.rows.length !== 2) {
    throw new Error('Admin or target user not found');
  }

  const admin = usersResult.rows.find((u: any) => u.id === adminId);
  const targetUser = usersResult.rows.find((u: any) => u.id === targetUserId);

  if (!admin || !targetUser) {
    throw new Error('Admin or target user not found');
  }

  if (admin.organization_id !== organizationId || targetUser.organization_id !== organizationId) {
    throw new Error('Users must be in the same organization');
  }

  if (admin.role !== 'org_admin') {
    throw new Error('Only organization admins can impersonate users');
  }

  if (targetUser.role === 'dstudio_admin') {
    throw new Error('Cannot impersonate dStudio admins');
  }

  // Check if there's already an active session
  const existingSession = await query(
    `SELECT * FROM impersonation_sessions
     WHERE admin_id = $1 AND target_user_id = $2 AND ended_at IS NULL`,
    [adminId, targetUserId]
  );

  if (existingSession.rows.length > 0) {
    throw new Error('An active impersonation session already exists');
  }

  // Create new session
  const result = await query(
    `INSERT INTO impersonation_sessions (
      organization_id, admin_id, target_user_id, reason
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [organizationId, adminId, targetUserId, reason]
  );

  return result.rows[0];
};

/**
 * End an impersonation session
 */
export const endImpersonation = async (
  sessionId: string
): Promise<ImpersonationSession> => {
  const result = await query(
    `UPDATE impersonation_sessions
     SET ended_at = NOW()
     WHERE id = $1 AND ended_at IS NULL
     RETURNING *`,
    [sessionId]
  );

  if (result.rows.length === 0) {
    throw new Error('Active impersonation session not found');
  }

  return result.rows[0];
};

/**
 * End all active impersonation sessions for an admin
 */
export const endAllAdminSessions = async (
  adminId: string
): Promise<number> => {
  const result = await query(
    `UPDATE impersonation_sessions
     SET ended_at = NOW()
     WHERE admin_id = $1 AND ended_at IS NULL`,
    [adminId]
  );

  return result.rowCount || 0;
};

/**
 * Get active impersonation session for an admin
 */
export const getActiveSession = async (
  adminId: string
): Promise<ImpersonationSession | null> => {
  const result = await query(
    `SELECT s.*,
            u.email as target_email,
            u.full_name as target_name
     FROM impersonation_sessions s
     LEFT JOIN users u ON s.target_user_id = u.id
     WHERE s.admin_id = $1 AND s.ended_at IS NULL
     ORDER BY s.started_at DESC
     LIMIT 1`,
    [adminId]
  );

  return result.rows[0] || null;
};

/**
 * Get all active impersonation sessions for an organization
 */
export const getActiveOrganizationSessions = async (
  organizationId: string
): Promise<ImpersonationSession[]> => {
  const result = await query(
    `SELECT s.*,
            admin.email as admin_email,
            admin.full_name as admin_name,
            target.email as target_email,
            target.full_name as target_name
     FROM impersonation_sessions s
     LEFT JOIN users admin ON s.admin_id = admin.id
     LEFT JOIN users target ON s.target_user_id = target.id
     WHERE s.organization_id = $1 AND s.ended_at IS NULL
     ORDER BY s.started_at DESC`,
    [organizationId]
  );

  return result.rows;
};

/**
 * Get impersonation session history for an organization
 */
export const getSessionHistory = async (
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ sessions: ImpersonationSession[]; total: number }> => {
  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM impersonation_sessions WHERE organization_id = $1',
    [organizationId]
  );
  const total = parseInt(countResult.rows[0].total);

  // Get sessions
  const result = await query(
    `SELECT s.*,
            admin.email as admin_email,
            admin.full_name as admin_name,
            target.email as target_email,
            target.full_name as target_name,
            EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at)) as duration_seconds
     FROM impersonation_sessions s
     LEFT JOIN users admin ON s.admin_id = admin.id
     LEFT JOIN users target ON s.target_user_id = target.id
     WHERE s.organization_id = $1
     ORDER BY s.started_at DESC
     LIMIT $2 OFFSET $3`,
    [organizationId, limit, offset]
  );

  return {
    sessions: result.rows,
    total,
  };
};

/**
 * Get impersonation history for a specific user (target)
 */
export const getUserImpersonationHistory = async (
  userId: string,
  limit: number = 20
): Promise<ImpersonationSession[]> => {
  const result = await query(
    `SELECT s.*,
            admin.email as admin_email,
            admin.full_name as admin_name,
            EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at)) as duration_seconds
     FROM impersonation_sessions s
     LEFT JOIN users admin ON s.admin_id = admin.id
     WHERE s.target_user_id = $1
     ORDER BY s.started_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
};

/**
 * Get impersonation sessions by admin
 */
export const getAdminImpersonationHistory = async (
  adminId: string,
  limit: number = 50
): Promise<ImpersonationSession[]> => {
  const result = await query(
    `SELECT s.*,
            target.email as target_email,
            target.full_name as target_name,
            EXTRACT(EPOCH FROM (COALESCE(s.ended_at, NOW()) - s.started_at)) as duration_seconds
     FROM impersonation_sessions s
     LEFT JOIN users target ON s.target_user_id = target.id
     WHERE s.admin_id = $1
     ORDER BY s.started_at DESC
     LIMIT $2`,
    [adminId, limit]
  );

  return result.rows;
};

/**
 * Check if a user is currently being impersonated
 */
export const isUserBeingImpersonated = async (
  userId: string
): Promise<boolean> => {
  const result = await query(
    `SELECT COUNT(*) as count
     FROM impersonation_sessions
     WHERE target_user_id = $1 AND ended_at IS NULL`,
    [userId]
  );

  return parseInt(result.rows[0].count) > 0;
};

/**
 * Get impersonation statistics for an organization
 */
export const getImpersonationStatistics = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalSessions: number;
  activeSessions: number;
  uniqueAdmins: number;
  uniqueTargets: number;
  averageDurationSeconds: number;
}> => {
  const dateFilter = startDate && endDate
    ? `AND started_at >= $2 AND started_at <= $3`
    : '';
  const params = startDate && endDate
    ? [organizationId, startDate, endDate]
    : [organizationId];

  const result = await query(
    `SELECT
       COUNT(*) as total_sessions,
       COUNT(CASE WHEN ended_at IS NULL THEN 1 END) as active_sessions,
       COUNT(DISTINCT admin_id) as unique_admins,
       COUNT(DISTINCT target_user_id) as unique_targets,
       AVG(EXTRACT(EPOCH FROM (COALESCE(ended_at, NOW()) - started_at))) as avg_duration
     FROM impersonation_sessions
     WHERE organization_id = $1 ${dateFilter}`,
    params
  );

  const row = result.rows[0];
  return {
    totalSessions: parseInt(row.total_sessions) || 0,
    activeSessions: parseInt(row.active_sessions) || 0,
    uniqueAdmins: parseInt(row.unique_admins) || 0,
    uniqueTargets: parseInt(row.unique_targets) || 0,
    averageDurationSeconds: parseFloat(row.avg_duration) || 0,
  };
};

/**
 * Validate if impersonation is allowed
 */
export const canImpersonate = async (
  adminId: string,
  targetUserId: string
): Promise<{ allowed: boolean; reason?: string }> => {
  // Get both users
  const usersResult = await query(
    `SELECT id, organization_id, role, is_active FROM users WHERE id IN ($1, $2)`,
    [adminId, targetUserId]
  );

  if (usersResult.rows.length !== 2) {
    return { allowed: false, reason: 'One or both users not found' };
  }

  const admin = usersResult.rows.find((u: any) => u.id === adminId);
  const targetUser = usersResult.rows.find((u: any) => u.id === targetUserId);

  if (!admin || !targetUser) {
    return { allowed: false, reason: 'User not found' };
  }

  if (admin.role !== 'org_admin') {
    return { allowed: false, reason: 'Only organization admins can impersonate users' };
  }

  if (admin.organization_id !== targetUser.organization_id) {
    return { allowed: false, reason: 'Users must be in the same organization' };
  }

  if (targetUser.role === 'dstudio_admin') {
    return { allowed: false, reason: 'Cannot impersonate dStudio admins' };
  }

  if (!targetUser.is_active) {
    return { allowed: false, reason: 'Cannot impersonate inactive users' };
  }

  if (adminId === targetUserId) {
    return { allowed: false, reason: 'Cannot impersonate yourself' };
  }

  return { allowed: true };
};
