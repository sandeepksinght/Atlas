import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as WebhookModel from '../models/Webhook';
import { WebhookEvent } from '../types/enterprise';

/**
 * Get all webhooks for the organization
 */
export const getWebhooks = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const includeInactive = req.query.includeInactive === 'true';

    const webhooks = await WebhookModel.getOrganizationWebhooks(organizationId, includeInactive);

    res.json({ webhooks });
  } catch (error: any) {
    console.error('Error getting webhooks:', error);
    res.status(500).json({ error: 'Failed to get webhooks' });
  }
};

/**
 * Get webhook statistics
 */
export const getWebhookStats = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;

    const stats = await WebhookModel.getOrganizationWebhookStatistics(organizationId);

    res.json({ statistics: stats });
  } catch (error: any) {
    console.error('Error getting webhook statistics:', error);
    res.status(500).json({ error: 'Failed to get webhook statistics' });
  }
};

/**
 * Get webhook by ID
 */
export const getWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;

    const webhook = await WebhookModel.getWebhookById(webhookId);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ webhook });
  } catch (error: any) {
    console.error('Error getting webhook:', error);
    res.status(500).json({ error: 'Failed to get webhook' });
  }
};

/**
 * Create a new webhook
 */
export const createWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const organizationId = req.user!.organizationId!;
    const { url, eventTypes, secret } = req.body;

    if (!url || !eventTypes || !Array.isArray(eventTypes) || eventTypes.length === 0) {
      return res.status(400).json({ error: 'URL and at least one event type are required' });
    }

    // Validate URL format
    if (!url.match(/^https?:\/\//)) {
      return res.status(400).json({ error: 'URL must start with http:// or https://' });
    }

    const webhook = await WebhookModel.createWebhook(
      organizationId,
      url,
      eventTypes,
      req.user!.userId,
      secret
    );

    res.status(201).json({
      webhook,
      message: 'Webhook created successfully',
    });
  } catch (error: any) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
};

/**
 * Update webhook
 */
export const updateWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;
    const { url, eventTypes, isActive } = req.body;

    // Verify webhook belongs to organization
    const webhook = await WebhookModel.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updates: any = {};
    if (url !== undefined) updates.url = url;
    if (eventTypes !== undefined) updates.event_types = eventTypes;
    if (isActive !== undefined) updates.is_active = isActive;

    const updatedWebhook = await WebhookModel.updateWebhook(webhookId, updates);

    res.json({
      webhook: updatedWebhook,
      message: 'Webhook updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
};

/**
 * Delete webhook
 */
export const deleteWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;

    // Verify webhook belongs to organization
    const webhook = await WebhookModel.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await WebhookModel.deleteWebhook(webhookId);

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
};

/**
 * Regenerate webhook secret
 */
export const regenerateSecret = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;

    // Verify webhook belongs to organization
    const webhook = await WebhookModel.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const newSecret = await WebhookModel.regenerateSecret(webhookId);

    res.json({
      secret: newSecret,
      message: 'Webhook secret regenerated successfully',
    });
  } catch (error: any) {
    console.error('Error regenerating webhook secret:', error);
    res.status(500).json({ error: 'Failed to regenerate secret' });
  }
};

/**
 * Get webhook deliveries (logs)
 */
export const getWebhookDeliveries = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;
    const limit = parseInt(req.query.limit as string) || 100;

    // Verify webhook belongs to organization
    const webhook = await WebhookModel.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const deliveries = await WebhookModel.getWebhookDeliveries(webhookId, limit);

    res.json({ deliveries });
  } catch (error: any) {
    console.error('Error getting webhook deliveries:', error);
    res.status(500).json({ error: 'Failed to get webhook deliveries' });
  }
};

/**
 * Test webhook by sending a test event
 */
export const testWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const { webhookId } = req.params;
    const organizationId = req.user!.organizationId!;

    // Verify webhook belongs to organization
    const webhook = await WebhookModel.getWebhookById(webhookId);
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    if (webhook.organization_id !== organizationId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Send test payload
    const testPayload = {
      test: true,
      organization_id: organizationId,
      webhook_id: webhookId,
      message: 'This is a test webhook delivery',
      timestamp: new Date().toISOString(),
    };

    const delivery = await WebhookModel.triggerWebhook(
      webhook,
      webhook.event_types[0], // Use first event type for test
      testPayload
    );

    res.json({
      delivery,
      message: 'Test webhook sent',
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
};

/**
 * Retry a failed webhook delivery
 */
export const retryDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { deliveryId } = req.params;

    const newDelivery = await WebhookModel.retryWebhookDelivery(deliveryId);

    res.json({
      delivery: newDelivery,
      message: 'Webhook delivery retried',
    });
  } catch (error: any) {
    console.error('Error retrying webhook delivery:', error);
    res.status(500).json({ error: error.message || 'Failed to retry delivery' });
  }
};
