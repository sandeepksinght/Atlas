import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as OrganizationModel from '../models/Organization';
import * as UserModel from '../models/User';
import * as AuditLogModel from '../models/AuditLog';

/**
 * Create a new organization
 */
export const createOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { name, contactEmail, licenseCount, adminEmail, adminName, adminPassword } = req.body;

    if (!name || !adminEmail || !adminName) {
      return res.status(400).json({
        error: 'Missing required fields: name, adminEmail, adminName',
      });
    }

    // Create organization
    const organization = await OrganizationModel.createOrganization(
      name,
      contactEmail || adminEmail,
      licenseCount || 5,
      req.user!.userId
    );

    // Create org admin user
    const admin = await UserModel.createEnterpriseUser(
      adminEmail,
      adminPassword || 'changeme123', // Default password if not provided
      adminName,
      organization.id,
      'org_admin',
      req.user!.userId
    );

    // If no password provided, create a temporary one
    let temporaryPassword = null;
    if (!adminPassword) {
      const tempPass = await UserModel.createTemporaryPassword(admin.id, req.user!.userId);
      temporaryPassword = tempPass.plainPassword;
    }

    // Log the action
    await AuditLogModel.createAuditLog(
      organization.id,
      req.user!.userId,
      'user_created',
      'organization',
      organization.id,
      { organizationName: name, adminEmail },
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({
      message: 'Organization created successfully',
      organization,
      admin: {
        id: admin.id,
        email: admin.email,
        temporaryPassword,
      },
    });
  } catch (error: any) {
    console.error('Create organization error:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
};

/**
 * Get all organizations
 */
export const getAllOrganizations = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await OrganizationModel.findAllOrganizations(limit, offset);

    res.json({
      organizations: result.organizations,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error: any) {
    console.error('Get organizations error:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
};

/**
 * Get organization by ID with detailed stats
 */
export const getOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;

    const organization = await OrganizationModel.findOrganizationById(organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const stats = await OrganizationModel.getOrganizationStats(organizationId);
    const users = await UserModel.findUsersByOrganization(organizationId);

    res.json({
      organization,
      stats,
      users,
    });
  } catch (error: any) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
};

/**
 * Update organization details
 */
export const updateOrganization = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    const updates = req.body;

    const organization = await OrganizationModel.updateOrganization(organizationId, updates);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'settings_updated',
      'organization',
      organizationId,
      { updates },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Organization updated successfully',
      organization,
    });
  } catch (error: any) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
};

/**
 * Update organization subscription
 */
export const updateSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { status, licenseCount, endDate } = req.body;

    const organization = await OrganizationModel.updateSubscriptionStatus(
      organizationId,
      status,
      licenseCount,
      endDate
    );

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      'settings_updated',
      'organization',
      organizationId,
      { status, licenseCount, endDate },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: 'Subscription updated successfully',
      organization,
    });
  } catch (error: any) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
};

/**
 * Activate/deactivate organization
 */
export const toggleOrganizationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { organizationId } = req.params;
    const { isActive } = req.body;

    let organization;
    if (isActive) {
      organization = await OrganizationModel.activateOrganization(organizationId);
    } else {
      organization = await OrganizationModel.deactivateOrganization(organizationId);
    }

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // Log the action
    await AuditLogModel.createAuditLog(
      organizationId,
      req.user!.userId,
      isActive ? 'user_enabled' : 'user_disabled',
      'organization',
      organizationId,
      { isActive },
      req.ip,
      req.get('user-agent')
    );

    res.json({
      message: `Organization ${isActive ? 'activated' : 'deactivated'} successfully`,
      organization,
    });
  } catch (error: any) {
    console.error('Toggle organization status error:', error);
    res.status(500).json({ error: 'Failed to update organization status' });
  }
};

/**
 * Get system-wide statistics
 */
export const getSystemStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const organizations = await OrganizationModel.findAllOrganizations(1000, 0);

    let totalUsers = 0;
    let totalAssessments = 0;
    let totalResponses = 0;

    for (const org of organizations.organizations) {
      const stats = await OrganizationModel.getOrganizationStats(org.id);
      if (stats) {
        totalUsers += stats.total_users || 0;
        totalAssessments += stats.total_assessments || 0;
        totalResponses += stats.total_responses || 0;
      }
    }

    res.json({
      totalOrganizations: organizations.total,
      activeOrganizations: organizations.organizations.filter(o => o.is_active).length,
      totalUsers,
      totalAssessments,
      totalResponses,
    });
  } catch (error: any) {
    console.error('Get system statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
};

/**
 * Get audit logs across all organizations
 */
export const getSystemAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // This would need a new model function to get cross-org audit logs
    // For now, return placeholder
    res.json({
      logs: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    });
  } catch (error: any) {
    console.error('Get system audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};
