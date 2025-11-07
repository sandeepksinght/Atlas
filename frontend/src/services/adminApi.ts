import api from './api';

// ========== dStudio Admin APIs ==========

/**
 * Create a new organization
 */
export const createOrganization = (data: {
  name: string;
  contactEmail: string;
  licenseCount: number;
  adminEmail: string;
  adminName: string;
  adminPassword?: string;
}) => api.post('/api/admin/organizations', data);

/**
 * Get all organizations
 */
export const getAllOrganizations = (page = 1, limit = 20) =>
  api.get('/api/admin/organizations', { params: { page, limit } });

/**
 * Get organization by ID
 */
export const getOrganization = (organizationId: string) =>
  api.get(`/api/admin/organizations/${organizationId}`);

/**
 * Update organization
 */
export const updateOrganization = (organizationId: string, updates: any) =>
  api.put(`/api/admin/organizations/${organizationId}`, updates);

/**
 * Update organization subscription
 */
export const updateSubscription = (
  organizationId: string,
  data: { status: string; licenseCount?: number; endDate?: string }
) => api.put(`/api/admin/organizations/${organizationId}/subscription`, data);

/**
 * Toggle organization status
 */
export const toggleOrganizationStatus = (organizationId: string, isActive: boolean) =>
  api.put(`/api/admin/organizations/${organizationId}/status`, { isActive });

/**
 * Get system statistics
 */
export const getSystemStatistics = () => api.get('/api/admin/system/statistics');

// ========== Organization Admin APIs ==========

/**
 * Get organization dashboard
 */
export const getOrgDashboard = (organizationId?: string) =>
  api.get('/api/admin/dashboard', { params: { organizationId } });

/**
 * Get team members
 */
export const getTeamMembers = (includeInactive = false, organizationId?: string) =>
  api.get('/api/admin/team', { params: { includeInactive, organizationId } });

/**
 * Create team member
 */
export const createTeamMember = (data: {
  email: string;
  fullName: string;
  role?: string;
}) => api.post('/api/admin/team', data);

/**
 * Update team member
 */
export const updateTeamMember = (userId: string, updates: any) =>
  api.put(`/api/admin/team/${userId}`, updates);

/**
 * Toggle team member status
 */
export const toggleTeamMemberStatus = (userId: string, isActive: boolean) =>
  api.put(`/api/admin/team/${userId}/status`, { isActive });

/**
 * Reset user password
 */
export const resetUserPassword = (userId: string) =>
  api.post(`/api/admin/team/${userId}/reset-password`);

/**
 * Get user's temporary passwords
 */
export const getUserPasswords = (userId: string) =>
  api.get(`/api/admin/team/${userId}/passwords`);

/**
 * Start impersonation
 */
export const startImpersonation = (userId: string, reason?: string) =>
  api.post(`/api/admin/impersonate/${userId}`, { reason });

/**
 * End impersonation
 */
export const endImpersonation = (sessionId: string) =>
  api.post(`/api/admin/impersonate/${sessionId}/end`);

/**
 * Get active impersonation sessions
 */
export const getActiveSessions = () => api.get('/api/admin/impersonate/active');

/**
 * Create backup
 */
export const createBackup = (description?: string) =>
  api.post('/api/admin/backups', { description });

/**
 * Get backups
 */
export const getBackups = (page = 1, limit = 20, organizationId?: string) =>
  api.get('/api/admin/backups', { params: { page, limit, organizationId } });

/**
 * Restore backup
 */
export const restoreBackup = (backupId: string) =>
  api.post(`/api/admin/backups/${backupId}/restore`);

/**
 * Get audit logs
 */
export const getAuditLogs = (filters?: {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resourceType?: string;
  organizationId?: string;
}) => api.get('/api/admin/audit-logs', { params: filters });

/**
 * Get organization reports
 */
export const getReports = (dateRange?: number, organizationId?: string) =>
  api.get('/api/admin/reports', { params: { dateRange, organizationId } });
