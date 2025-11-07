import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types';
import { UserRole } from '../types/enterprise';
import * as UserModel from '../models/User';
import * as ImpersonationModel from '../models/ImpersonationSession';

export interface AuthRequest extends Request {
  user?: JWTPayload & {
    organizationId?: string;
    role?: UserRole;
    impersonatedBy?: string;
    impersonationSessionId?: string;
  };
}

/**
 * Basic authentication middleware - verifies JWT token
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'default_secret';

    const decoded = jwt.verify(token, secret) as JWTPayload & {
      organizationId?: string;
      role?: UserRole;
      impersonatedBy?: string;
      impersonationSessionId?: string;
    };

    // Get fresh user data to ensure they're still active
    const user = await UserModel.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: 'User account is disabled' });
    }

    // Add full user context to request
    req.user = {
      ...decoded,
      organizationId: user.organization_id || undefined,
      role: user.role as UserRole,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

/**
 * Role-based authorization middleware
 * Usage: requireRole('org_admin', 'dstudio_admin')
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Permission-based authorization middleware
 * Usage: requirePermission('manage_users')
 */
export const requirePermission = (permission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const hasPermission = await UserModel.hasPermission(
      req.user.userId,
      permission as any
    );

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Access denied',
        message: `This action requires the '${permission}' permission`,
      });
    }

    next();
  };
};

/**
 * Organization context middleware - ensures user belongs to org
 */
export const requireOrganization = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.user.organizationId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'This action requires an organization context',
    });
  }

  next();
};

/**
 * Same organization check - ensures accessed resource belongs to user's org
 */
export const requireSameOrganization = (resourceOrgIdParam: string = 'organizationId') => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const resourceOrgId = req.params[resourceOrgIdParam] || req.body[resourceOrgIdParam];

    if (!resourceOrgId) {
      return res.status(400).json({ error: 'Organization ID not provided' });
    }

    if (req.user.role === 'dstudio_admin') {
      // dStudio admins can access any organization
      return next();
    }

    if (req.user.organizationId !== resourceOrgId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only access resources from your own organization',
      });
    }

    next();
  };
};

/**
 * Impersonation middleware - handles impersonation context
 */
export const handleImpersonation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Check if this is an impersonation session
    const impersonationHeader = req.headers['x-impersonation-session'] as string;

    if (impersonationHeader) {
      // Verify impersonation session
      const activeSession = await ImpersonationModel.getActiveSession(req.user.userId);

      if (!activeSession || activeSession.id !== impersonationHeader) {
        return res.status(401).json({
          error: 'Invalid impersonation session',
        });
      }

      // Add impersonation context
      req.user.impersonatedBy = activeSession.admin_id;
      req.user.impersonationSessionId = activeSession.id;

      // Update user to be the target user
      const targetUser = await UserModel.findUserById(activeSession.target_user_id);
      if (!targetUser) {
        return res.status(401).json({ error: 'Impersonated user not found' });
      }

      req.user.userId = targetUser.id;
      req.user.organizationId = targetUser.organization_id || undefined;
      req.user.role = targetUser.role as UserRole;
    }

    next();
  } catch (error: any) {
    console.error('Impersonation middleware error:', error);
    return res.status(500).json({ error: 'Failed to handle impersonation' });
  }
};

/**
 * Combined middleware for authentication with impersonation support
 */
export const authenticateWithImpersonation = [authenticate, handleImpersonation];

/**
 * dStudio Admin only middleware
 */
export const requireDStudioAdmin = requireRole('dstudio_admin');

/**
 * Organization Admin or higher middleware
 */
export const requireOrgAdmin = requireRole('org_admin', 'dstudio_admin');

/**
 * Any authenticated user with organization context
 */
export const requireOrgMember = [authenticate, requireOrganization];
