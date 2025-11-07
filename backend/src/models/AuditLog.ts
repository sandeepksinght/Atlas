import { query } from '../config/database';
import { AuditLog, AuditAction } from '../types/enterprise';

/**
 * Create an audit log entry
 */
export const createAuditLog = async (
  organizationId: string,
  userId: string | null,
  action: AuditAction,
  resourceType: string | null,
  resourceId: string | null,
  details: Record<string, any>,
  ipAddress: string | null = null,
  userAgent: string | null = null,
  impersonatedBy: string | null = null
): Promise<AuditLog> => {
  const result = await query(
    `INSERT INTO audit_logs (
      organization_id, user_id, action, resource_type, resource_id,
      details, ip_address, user_agent, impersonated_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      organizationId,
      userId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(details),
      ipAddress,
      userAgent,
      impersonatedBy,
    ]
  );
  return result.rows[0];
};

/**
 * Get audit logs for an organization with filters
 */
export const getAuditLogs = async (
  organizationId: string,
  filters: {
    userId?: string;
    action?: AuditAction;
    resourceType?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ logs: AuditLog[]; total: number }> => {
  const conditions: string[] = ['organization_id = $1'];
  const params: any[] = [organizationId];
  let paramIndex = 2;

  if (filters.userId) {
    conditions.push(`user_id = $${paramIndex}`);
    params.push(filters.userId);
    paramIndex++;
  }

  if (filters.action) {
    conditions.push(`action = $${paramIndex}`);
    params.push(filters.action);
    paramIndex++;
  }

  if (filters.resourceType) {
    conditions.push(`resource_type = $${paramIndex}`);
    params.push(filters.resourceType);
    paramIndex++;
  }

  if (filters.startDate) {
    conditions.push(`created_at >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`created_at <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  const whereClause = conditions.join(' AND ');

  // Get total count
  const countResult = await query(
    `SELECT COUNT(*) as total FROM audit_logs WHERE ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].total);

  // Get logs with pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const logsResult = await query(
    `SELECT * FROM audit_logs
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return {
    logs: logsResult.rows,
    total,
  };
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (
  organizationId: string,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> => {
  const result = await query(
    `SELECT * FROM audit_logs
     WHERE organization_id = $1 AND user_id = $2
     ORDER BY created_at DESC
     LIMIT $3 OFFSET $4`,
    [organizationId, userId, limit, offset]
  );
  return result.rows;
};

/**
 * Get recent audit logs for dashboard
 */
export const getRecentAuditLogs = async (
  organizationId: string,
  limit: number = 20
): Promise<AuditLog[]> => {
  const result = await query(
    `SELECT al.*, u.email as user_email, u.full_name as user_name
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.organization_id = $1
     ORDER BY al.created_at DESC
     LIMIT $2`,
    [organizationId, limit]
  );
  return result.rows;
};

/**
 * Get audit statistics for an organization
 */
export const getAuditStatistics = async (
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{
  totalActions: number;
  actionsByType: Array<{ action: string; count: number }>;
  activeUsers: number;
  topUsers: Array<{ user_id: string; email: string; action_count: number }>;
}> => {
  const dateFilter = startDate && endDate
    ? `AND created_at >= $2 AND created_at <= $3`
    : '';
  const params = startDate && endDate
    ? [organizationId, startDate, endDate]
    : [organizationId];

  // Total actions
  const totalResult = await query(
    `SELECT COUNT(*) as total FROM audit_logs WHERE organization_id = $1 ${dateFilter}`,
    params
  );
  const totalActions = parseInt(totalResult.rows[0].total);

  // Actions by type
  const actionsByTypeResult = await query(
    `SELECT action, COUNT(*) as count
     FROM audit_logs
     WHERE organization_id = $1 ${dateFilter}
     GROUP BY action
     ORDER BY count DESC`,
    params
  );
  const actionsByType = actionsByTypeResult.rows.map(row => ({
    action: row.action,
    count: parseInt(row.count),
  }));

  // Active users
  const activeUsersResult = await query(
    `SELECT COUNT(DISTINCT user_id) as count
     FROM audit_logs
     WHERE organization_id = $1 AND user_id IS NOT NULL ${dateFilter}`,
    params
  );
  const activeUsers = parseInt(activeUsersResult.rows[0].count);

  // Top users by activity
  const topUsersResult = await query(
    `SELECT al.user_id, u.email, COUNT(*) as action_count
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     WHERE al.organization_id = $1 AND al.user_id IS NOT NULL ${dateFilter}
     GROUP BY al.user_id, u.email
     ORDER BY action_count DESC
     LIMIT 10`,
    params
  );
  const topUsers = topUsersResult.rows.map(row => ({
    user_id: row.user_id,
    email: row.email,
    action_count: parseInt(row.action_count),
  }));

  return {
    totalActions,
    actionsByType,
    activeUsers,
    topUsers,
  };
};

/**
 * Delete old audit logs (for cleanup/retention policy)
 */
export const deleteOldAuditLogs = async (
  organizationId: string,
  beforeDate: Date
): Promise<number> => {
  const result = await query(
    `DELETE FROM audit_logs
     WHERE organization_id = $1 AND created_at < $2`,
    [organizationId, beforeDate]
  );
  return result.rowCount || 0;
};

/**
 * Get impersonation audit trail
 */
export const getImpersonationLogs = async (
  organizationId: string,
  limit: number = 50
): Promise<AuditLog[]> => {
  const result = await query(
    `SELECT al.*,
            u.email as user_email,
            admin.email as admin_email
     FROM audit_logs al
     LEFT JOIN users u ON al.user_id = u.id
     LEFT JOIN users admin ON al.impersonated_by = admin.id
     WHERE al.organization_id = $1 AND al.impersonated_by IS NOT NULL
     ORDER BY al.created_at DESC
     LIMIT $2`,
    [organizationId, limit]
  );
  return result.rows;
};
