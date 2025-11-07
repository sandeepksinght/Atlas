import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import * as UserModel from '../models/User';
import * as OrganizationModel from '../models/Organization';
import * as AuditLogModel from '../models/AuditLog';
import * as BackupModel from '../models/Backup';
import * as ImpersonationModel from '../models/ImpersonationSession';

/**
 * Get organization dashboard data
 */
export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;

    const organization = await OrganizationModel.findOrganizationById(organizationId);
    const stats = await OrganizationModel.getOrganizationStats(organizationId);
    const users = await UserModel.findUsersByOrganization(organizationId);
    const recentLogs = await AuditLogModel.getRecentAuditLogs(organizationId, 10);

    res.json({
      organization,
      stats,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active,
        created_at: u.created_at,
      })),
      recentActivity: recentLogs,
    });
  } catch (error: any) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
};

/**
 * Get all team members
 */
export const getTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const includeInactive = req.query.includeInactive === 'true';

    const users = await UserModel.findUsersByOrganization(organizationId, includeInactive);

    res.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        is_active: u.is_active,
        phone: u.phone,
        created_at: u.created_at,
        updated_at: u.updated_at,
      })),
    });
  } catch (error: any) {
    console.error('Get team members error:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

/**
 * Create a new team member
 */
export const createTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { email, fullName, role } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: 'Email and full name are required' });
    }

    // Check if user already exists
    const existingUser = await UserModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already in use',
        message: 'This email is already registered. Please use a different email.',
      });
    }

    // Check license availability
    const organization = await OrganizationModel.findOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    if (organization.used_licenses >= organization.license_count) {
      return res.status(400).json({ error: 'No available licenses. Please contact administrator.' });
    }

    // Create user with temporary password
    const tempPassword = await UserModel.createEnterpriseUser(
      email,
      'changeme123', // Will be replaced with temporary password
      fullName,
      organizationId,
      role || 'org_member',
      req.user!.userId
    );

    // Generate temporary password
    const { plainPassword } = await UserModel.createTemporaryPassword(
      tempPassword.id,
      req.user!.userId
    );

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'user_created',
      'user',
      tempPassword.id,
      { email, fullName, role },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'Team member created successfully',
      user: {
        id: tempPassword.id,
        email: tempPassword.email,
        full_name: tempPassword.full_name,
        role: tempPassword.role,
        temporaryPassword: plainPassword,
      },
    });
  } catch (error: any) {
    console.error('Create team member error:', error);

    // Handle specific database errors
    if (error.code === '23505') {
      // Unique constraint violation
      if (error.constraint === 'users_email_key') {
        return res.status(400).json({
          error: 'Email already in use',
          message: 'This email is already registered. Please use a different email.',
        });
      }
    }

    res.status(500).json({
      error: 'Failed to create team member',
      message: error.message || 'An unexpected error occurred',
    });
  }
};

/**
 * Update team member
 */
export const updateTeamMember = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { userId } = req.params;
    const { full_name, email, phone, role } = req.body;

    // Verify user belongs to same organization
    const user = await UserModel.findUserById(userId);
    if (!user || user.organization_id !== organizationId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update profile fields
    const updates: any = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;

    let updatedUser = user;
    if (Object.keys(updates).length > 0) {
      updatedUser = await UserModel.updateUserProfile(userId, updates);
    }

    // Update role if provided
    if (role !== undefined && role !== user.role) {
      updatedUser = await UserModel.updateUserRole(userId, role);
    }

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'user_updated',
      'user',
      userId,
      { updates, role },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Team member updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Update team member error:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
};

/**
 * Reset user password (admin only)
 */
export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { userId } = req.params;

    // Verify user belongs to same organization
    const user = await UserModel.findUserById(userId);
    if (!user || user.organization_id !== organizationId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate new temporary password
    const { plainPassword } = await UserModel.createTemporaryPassword(
      userId,
      req.user!.userId
    );

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'password_reset',
      'user',
      userId,
      { targetUser: user.email },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Password reset successfully',
      temporaryPassword: plainPassword,
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

/**
 * Get temporary passwords for a user (admin only)
 */
export const getUserPasswords = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { userId } = req.params;

    // Verify user belongs to same organization
    const user = await UserModel.findUserById(userId);
    if (!user || user.organization_id !== organizationId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const passwords = await UserModel.getTemporaryPasswords(userId, 5);

    res.json({ passwords });
  } catch (error: any) {
    console.error('Get user passwords error:', error);
    res.status(500).json({ error: 'Failed to fetch passwords' });
  }
};

/**
 * Activate/deactivate team member
 */
export const toggleUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { userId } = req.params;
    const { isActive } = req.body;

    // Verify user belongs to same organization
    const user = await UserModel.findUserById(userId);
    if (!user || user.organization_id !== organizationId) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Cannot deactivate yourself
    if (userId === req.user!.userId) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const updatedUser = await UserModel.setUserActive(userId, isActive);

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      isActive ? 'user_enabled' : 'user_disabled',
      'user',
      userId,
      { targetUser: user.email, isActive },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

/**
 * Start impersonating a team member
 */
export const startImpersonation = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { userId } = req.params;
    const { reason } = req.body;

    // Verify permission
    const canImpersonate = await ImpersonationModel.canImpersonate(req.user!.userId, userId);
    if (!canImpersonate.allowed) {
      return res.status(403).json({ error: canImpersonate.reason });
    }

    // Start impersonation
    const session = await ImpersonationModel.startImpersonation(
      organizationId,
      req.user!.userId,
      userId,
      reason
    );

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'user_impersonated',
      'user',
      userId,
      { reason },
      req.ip,
      req.get('user-agent'),
      req.user!.userId
    );

    res.json({
      message: 'Impersonation started',
      session: {
        id: session.id,
        target_user_id: session.target_user_id,
        started_at: session.started_at,
      },
    });
  } catch (error: any) {
    console.error('Start impersonation error:', error);
    res.status(500).json({ error: error.message || 'Failed to start impersonation' });
  }
};

/**
 * End impersonation session
 */
export const endImpersonation = async (req: AuthRequest, res: Response) => {
  try {
    const { sessionId } = req.params;

    const session = await ImpersonationModel.endImpersonation(sessionId);

    res.json({
      message: 'Impersonation ended',
      session,
    });
  } catch (error: any) {
    console.error('End impersonation error:', error);
    res.status(500).json({ error: error.message || 'Failed to end impersonation' });
  }
};

/**
 * Get active impersonation sessions
 */
export const getActiveSessions = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;

    const sessions = await ImpersonationModel.getActiveOrganizationSessions(organizationId);

    res.json({ sessions });
  } catch (error: any) {
    console.error('Get active sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch active sessions' });
  }
};

/**
 * Create backup
 */
export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { description } = req.body;

    const backup = await BackupModel.createBackup(
      organizationId,
      req.user!.userId,
      description
    );

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'backup_created',
      'backup',
      backup.id,
      { description },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'Backup created successfully',
      backup: {
        id: backup.id,
        data_size: backup.data_size,
        description: backup.description,
        created_at: backup.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
};

/**
 * Get all backups
 */
export const getBackups = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await BackupModel.getOrganizationBackups(organizationId, limit, offset);

    res.json({
      backups: result.backups,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get backups error:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
};

/**
 * Restore from backup
 */
export const restoreBackup = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { backupId } = req.params;

    // Verify backup belongs to organization
    const backup = await BackupModel.getBackupById(backupId);
    if (!backup || backup.organization_id !== organizationId) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    const result = await BackupModel.restoreBackup(backupId, req.user!.userId);

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'backup_restored',
      'backup',
      backupId,
      result.details,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: result.message,
      details: result.details,
    });
  } catch (error: any) {
    console.error('Restore backup error:', error);
    res.status(500).json({ error: error.message || 'Failed to restore backup' });
  }
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const filters: any = {
      limit,
      offset,
    };

    if (req.query.userId) filters.userId = req.query.userId as string;
    if (req.query.action) filters.action = req.query.action as string;
    if (req.query.resourceType) filters.resourceType = req.query.resourceType as string;

    const result = await AuditLogModel.getAuditLogs(organizationId, filters);

    res.json({
      logs: result.logs,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

/**
 * Get organization reports/analytics
 */
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const dateRange = parseInt(req.query.dateRange as string) || 30;

    // Calculate date ranges
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get user statistics
    const userStats = await UserModel.getUserStatistics(organizationId);
    const usersResult = await query(
      `SELECT COUNT(*) FILTER (WHERE created_at >= $1) as recent_count
       FROM users WHERE organization_id = $2`,
      [startDate, organizationId]
    );

    // Get role breakdown
    const roleStats = userStats.usersByRole.reduce((acc: any, r: any) => {
      acc[r.role] = parseInt(r.count);
      return acc;
    }, {});

    // Get assessment statistics
    const assessmentStats = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'published') as published,
        COUNT(*) FILTER (WHERE status = 'draft') as draft,
        COUNT(*) FILTER (WHERE created_at >= $1) as recent_count
       FROM assessments WHERE organization_id = $2`,
      [startDate, organizationId]
    );

    // Get response statistics
    const responseStats = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', CURRENT_DATE)) as this_month,
        COUNT(*) FILTER (WHERE DATE_TRUNC('month', r.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')) as last_month
       FROM responses r
       JOIN assessments a ON r.assessment_id = a.id
       WHERE a.organization_id = $1`,
      [organizationId]
    );

    // Calculate average responses per assessment
    const avgResponses = parseInt(assessmentStats.rows[0].total) > 0
      ? parseInt(responseStats.rows[0].total) / parseInt(assessmentStats.rows[0].total)
      : 0;

    // Get activity statistics
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const activityStats = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= $1) as this_week,
        COUNT(*) FILTER (WHERE created_at >= $2 AND created_at < $1) as last_week
       FROM audit_logs WHERE organization_id = $3`,
      [weekAgo, twoWeeksAgo, organizationId]
    );

    // Get most active users
    const mostActiveUsers = await query(
      `SELECT u.email, u.full_name, COUNT(al.id) as action_count
       FROM users u
       JOIN audit_logs al ON al.user_id = u.id
       WHERE u.organization_id = $1 AND al.created_at >= $2
       GROUP BY u.id, u.email, u.full_name
       ORDER BY action_count DESC
       LIMIT 10`,
      [organizationId, startDate]
    );

    // Get backup statistics
    const backupStats = await query(
      `SELECT
        COUNT(*) as total,
        COALESCE(SUM(data_size), 0) as total_size,
        MAX(created_at) as last_backup
       FROM backups WHERE organization_id = $1`,
      [organizationId]
    );

    res.json({
      users: {
        total: userStats.totalUsers,
        active: userStats.activeUsers,
        inactive: userStats.inactiveUsers,
        byRole: {
          org_admin: roleStats.org_admin || 0,
          org_member: roleStats.org_member || 0,
        },
        recentlyCreated: parseInt(usersResult.rows[0].recent_count) || 0,
      },
      assessments: {
        total: parseInt(assessmentStats.rows[0].total) || 0,
        byType: {
          survey: 0, // TODO: Add type tracking to assessments
          quiz: 0,
          poll: 0,
        },
        published: parseInt(assessmentStats.rows[0].published) || 0,
        draft: parseInt(assessmentStats.rows[0].draft) || 0,
        recentlyCreated: parseInt(assessmentStats.rows[0].recent_count) || 0,
      },
      responses: {
        total: parseInt(responseStats.rows[0].total) || 0,
        thisMonth: parseInt(responseStats.rows[0].this_month) || 0,
        lastMonth: parseInt(responseStats.rows[0].last_month) || 0,
        averagePerAssessment: avgResponses,
      },
      activity: {
        totalActions: parseInt(activityStats.rows[0].total) || 0,
        thisWeek: parseInt(activityStats.rows[0].this_week) || 0,
        lastWeek: parseInt(activityStats.rows[0].last_week) || 0,
        mostActiveUsers: mostActiveUsers.rows.map((u: any) => ({
          email: u.email,
          full_name: u.full_name || u.email,
          actionCount: parseInt(u.action_count),
        })),
      },
      storage: {
        totalBackups: parseInt(backupStats.rows[0].total) || 0,
        totalBackupSize: parseInt(backupStats.rows[0].total_size) || 0,
        lastBackupDate: backupStats.rows[0].last_backup,
      },
    });
  } catch (error: any) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
};
