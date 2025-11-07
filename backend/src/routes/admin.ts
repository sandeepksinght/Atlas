import { Router } from 'express';
import * as dstudioAdminController from '../controllers/dstudioAdminController';
import * as orgAdminController from '../controllers/orgAdminController';
import * as webhookController from '../controllers/webhookController';
import { authenticate, requireDStudioAdmin, requireOrgAdmin, requirePermission } from '../middleware/auth';

const router = Router();

// ========== dStudio Admin Routes ==========
// These routes require dStudio admin role

router.post('/organizations', authenticate, requireDStudioAdmin, dstudioAdminController.createOrganization);
router.get('/organizations', authenticate, requireDStudioAdmin, dstudioAdminController.getAllOrganizations);
router.get('/organizations/:organizationId', authenticate, requireDStudioAdmin, dstudioAdminController.getOrganization);
router.put('/organizations/:organizationId', authenticate, requireDStudioAdmin, dstudioAdminController.updateOrganization);
router.put('/organizations/:organizationId/subscription', authenticate, requireDStudioAdmin, dstudioAdminController.updateSubscription);
router.put('/organizations/:organizationId/status', authenticate, requireDStudioAdmin, dstudioAdminController.toggleOrganizationStatus);
router.get('/system/statistics', authenticate, requireDStudioAdmin, dstudioAdminController.getSystemStatistics);
router.get('/system/audit-logs', authenticate, requireDStudioAdmin, dstudioAdminController.getSystemAuditLogs);

// ========== Organization Admin Routes ==========
// These routes require org admin role

// Dashboard
router.get('/dashboard', authenticate, requireOrgAdmin, orgAdminController.getDashboard);

// Team Management
router.get('/team', authenticate, requireOrgAdmin, orgAdminController.getTeamMembers);
router.post('/team', authenticate, requireOrgAdmin, orgAdminController.createTeamMember);
router.put('/team/:userId', authenticate, requireOrgAdmin, orgAdminController.updateTeamMember);
router.put('/team/:userId/status', authenticate, requireOrgAdmin, orgAdminController.toggleUserStatus);

// Password Management
router.post('/team/:userId/reset-password', authenticate, requireOrgAdmin, orgAdminController.resetUserPassword);
router.get('/team/:userId/passwords', authenticate, requireOrgAdmin, orgAdminController.getUserPasswords);

// Impersonation
router.post('/impersonate/:userId', authenticate, requireOrgAdmin, requirePermission('impersonate'), orgAdminController.startImpersonation);
router.post('/impersonate/:sessionId/end', authenticate, requireOrgAdmin, orgAdminController.endImpersonation);
router.get('/impersonate/active', authenticate, requireOrgAdmin, orgAdminController.getActiveSessions);

// Backup & Restore
router.post('/backups', authenticate, requireOrgAdmin, requirePermission('backup_restore'), orgAdminController.createBackup);
router.get('/backups', authenticate, requireOrgAdmin, orgAdminController.getBackups);
router.post('/backups/:backupId/restore', authenticate, requireOrgAdmin, requirePermission('backup_restore'), orgAdminController.restoreBackup);

// Audit Logs
router.get('/audit-logs', authenticate, requireOrgAdmin, orgAdminController.getAuditLogs);

// Reports
router.get('/reports', authenticate, requireOrgAdmin, requirePermission('view_reports'), orgAdminController.getReports);

// Webhooks
router.get('/webhooks', authenticate, requireOrgAdmin, webhookController.getWebhooks);
router.get('/webhooks/statistics', authenticate, requireOrgAdmin, webhookController.getWebhookStats);
router.get('/webhooks/:webhookId', authenticate, requireOrgAdmin, webhookController.getWebhook);
router.post('/webhooks', authenticate, requireOrgAdmin, webhookController.createWebhook);
router.put('/webhooks/:webhookId', authenticate, requireOrgAdmin, webhookController.updateWebhook);
router.delete('/webhooks/:webhookId', authenticate, requireOrgAdmin, webhookController.deleteWebhook);
router.post('/webhooks/:webhookId/regenerate-secret', authenticate, requireOrgAdmin, webhookController.regenerateSecret);
router.get('/webhooks/:webhookId/deliveries', authenticate, requireOrgAdmin, webhookController.getWebhookDeliveries);
router.post('/webhooks/:webhookId/test', authenticate, requireOrgAdmin, webhookController.testWebhook);
router.post('/webhooks/deliveries/:deliveryId/retry', authenticate, requireOrgAdmin, webhookController.retryDelivery);

export default router;
