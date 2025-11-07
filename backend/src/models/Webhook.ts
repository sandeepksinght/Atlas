import { query } from '../config/database';
import { Webhook, WebhookEvent, WebhookDelivery, WebhookStatistics } from '../types/enterprise';
import axios from 'axios';
import crypto from 'crypto';

/**
 * Create a new webhook
 */
export const createWebhook = async (
  organizationId: string,
  url: string,
  eventTypes: WebhookEvent[],
  createdBy: string,
  secret?: string
): Promise<Webhook> => {
  const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

  const result = await query(
    `INSERT INTO webhooks (organization_id, url, event_types, secret, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [organizationId, url, eventTypes, webhookSecret, createdBy]
  );

  return result.rows[0];
};

/**
 * Get all webhooks for an organization
 */
export const getOrganizationWebhooks = async (
  organizationId: string,
  includeInactive: boolean = false
): Promise<Webhook[]> => {
  const sql = includeInactive
    ? `SELECT * FROM webhooks WHERE organization_id = $1 ORDER BY created_at DESC`
    : `SELECT * FROM webhooks WHERE organization_id = $1 AND is_active = true ORDER BY created_at DESC`;

  const result = await query(sql, [organizationId]);
  return result.rows;
};

/**
 * Get webhook by ID
 */
export const getWebhookById = async (id: string): Promise<Webhook | null> => {
  const result = await query(`SELECT * FROM webhooks WHERE id = $1`, [id]);
  return result.rows[0] || null;
};

/**
 * Update webhook
 */
export const updateWebhook = async (
  id: string,
  updates: {
    url?: string;
    event_types?: WebhookEvent[];
    is_active?: boolean;
  }
): Promise<Webhook | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let index = 1;

  if (updates.url !== undefined) {
    fields.push(`url = $${index++}`);
    values.push(updates.url);
  }
  if (updates.event_types !== undefined) {
    fields.push(`event_types = $${index++}`);
    values.push(updates.event_types);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${index++}`);
    values.push(updates.is_active);
  }

  if (fields.length === 0) {
    return getWebhookById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE webhooks SET ${fields.join(', ')} WHERE id = $${index} RETURNING *`,
    values
  );

  return result.rows[0] || null;
};

/**
 * Delete webhook
 */
export const deleteWebhook = async (id: string): Promise<boolean> => {
  const result = await query(`DELETE FROM webhooks WHERE id = $1`, [id]);
  return (result.rowCount || 0) > 0;
};

/**
 * Regenerate webhook secret
 */
export const regenerateSecret = async (id: string): Promise<string> => {
  const newSecret = crypto.randomBytes(32).toString('hex');

  await query(`UPDATE webhooks SET secret = $1 WHERE id = $2`, [newSecret, id]);

  return newSecret;
};

/**
 * Get webhook statistics
 */
export const getWebhookStatistics = async (webhookId: string): Promise<WebhookStatistics | null> => {
  const result = await query(
    `SELECT * FROM webhook_statistics WHERE webhook_id = $1`,
    [webhookId]
  );

  return result.rows[0] || null;
};

/**
 * Get all webhook statistics for an organization
 */
export const getOrganizationWebhookStatistics = async (
  organizationId: string
): Promise<WebhookStatistics[]> => {
  const result = await query(
    `SELECT * FROM webhook_statistics WHERE organization_id = $1`,
    [organizationId]
  );

  return result.rows;
};

/**
 * Get webhook deliveries (logs)
 */
export const getWebhookDeliveries = async (
  webhookId: string,
  limit: number = 100
): Promise<WebhookDelivery[]> => {
  const result = await query(
    `SELECT * FROM webhook_deliveries
     WHERE webhook_id = $1
     ORDER BY delivered_at DESC
     LIMIT $2`,
    [webhookId, limit]
  );

  return result.rows;
};

/**
 * Trigger a webhook by sending HTTP request
 */
export const triggerWebhook = async (
  webhook: Webhook,
  eventType: WebhookEvent,
  payload: Record<string, any>
): Promise<WebhookDelivery> => {
  const deliveryPayload = {
    event: eventType,
    timestamp: new Date().toISOString(),
    data: payload,
  };

  // Generate signature for security
  const signature = webhook.secret
    ? crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(deliveryPayload))
        .digest('hex')
    : null;

  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await axios.post(webhook.url, deliveryPayload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature || '',
        'X-Webhook-Event': eventType,
        'User-Agent': 'dStudio-Webhooks/1.0',
      },
      timeout: 30000, // 30 second timeout
    });

    responseStatus = response.status;
    responseBody = JSON.stringify(response.data);

    // Update last_triggered_at
    await query(`UPDATE webhooks SET last_triggered_at = NOW() WHERE id = $1`, [webhook.id]);
  } catch (error: any) {
    if (error.response) {
      responseStatus = error.response.status;
      responseBody = JSON.stringify(error.response.data);
      errorMessage = `HTTP ${error.response.status}: ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = 'No response received from webhook endpoint';
    } else {
      errorMessage = error.message;
    }
  }

  // Log the delivery
  const logResult = await query(
    `INSERT INTO webhook_deliveries (webhook_id, event_type, payload, response_status_code, response_body, error_message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [webhook.id, eventType, JSON.stringify(deliveryPayload), responseStatus, responseBody, errorMessage]
  );

  return logResult.rows[0];
};

/**
 * Trigger all webhooks for a specific event in an organization
 */
export const triggerOrganizationWebhooks = async (
  organizationId: string,
  eventType: WebhookEvent,
  payload: Record<string, any>
): Promise<void> => {
  const webhooks = await query(
    `SELECT * FROM webhooks
     WHERE organization_id = $1
     AND is_active = true
     AND $2 = ANY(event_types)`,
    [organizationId, eventType]
  );

  // Trigger all matching webhooks in parallel
  const triggers = webhooks.rows.map((webhook) => triggerWebhook(webhook, eventType, payload));

  await Promise.allSettled(triggers); // Use allSettled to continue even if some fail
};

/**
 * Retry a failed webhook delivery
 */
export const retryWebhookDelivery = async (deliveryId: string): Promise<WebhookDelivery> => {
  // Get the original delivery
  const deliveryResult = await query(
    `SELECT * FROM webhook_deliveries WHERE id = $1`,
    [deliveryId]
  );

  if (deliveryResult.rows.length === 0) {
    throw new Error('Webhook delivery not found');
  }

  const delivery = deliveryResult.rows[0];

  // Get the webhook
  const webhook = await getWebhookById(delivery.webhook_id);
  if (!webhook) {
    throw new Error('Webhook not found');
  }

  // Parse the original payload
  const originalPayload = typeof delivery.payload === 'string'
    ? JSON.parse(delivery.payload)
    : delivery.payload;

  // Trigger the webhook again
  const newDelivery = await triggerWebhook(webhook, delivery.event_type, originalPayload.data);

  // Update attempts count
  await query(
    `UPDATE webhook_deliveries SET attempts = $1 WHERE id = $2`,
    [delivery.attempts + 1, deliveryId]
  );

  return newDelivery;
};

/**
 * Clean up old webhook deliveries
 */
export const cleanupOldDeliveries = async (daysToKeep: number = 90): Promise<number> => {
  const result = await query(
    `DELETE FROM webhook_deliveries WHERE delivered_at < NOW() - INTERVAL '${daysToKeep} days'`
  );

  return result.rowCount || 0;
};
