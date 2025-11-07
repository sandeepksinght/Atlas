-- Webhooks Schema for Enterprise dStudio
-- This allows organizations to integrate with external systems

-- Webhook event types enum
CREATE TYPE webhook_event AS ENUM (
    'assessment.created',
    'assessment.updated',
    'assessment.deleted',
    'assessment.published',
    'response.submitted',
    'user.created',
    'user.updated',
    'user.deleted',
    'backup.created',
    'backup.restored'
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    event_types webhook_event[] NOT NULL,
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at TIMESTAMP,

    CONSTRAINT valid_url CHECK (url ~ '^https?://'),
    CONSTRAINT valid_event_types CHECK (array_length(event_types, 1) > 0)
);

-- Webhook delivery logs table
CREATE TABLE IF NOT EXISTS webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type webhook_event NOT NULL,
    payload JSONB NOT NULL,
    response_status_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 1,
    delivered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_webhook_deliveries_webhook (webhook_id),
    INDEX idx_webhook_deliveries_event (event_type),
    INDEX idx_webhook_deliveries_status (response_status_code),
    INDEX idx_webhook_deliveries_delivered (delivered_at)
);

-- Webhook statistics view
CREATE OR REPLACE VIEW webhook_statistics AS
SELECT
    w.id AS webhook_id,
    w.organization_id,
    w.url,
    w.is_active,
    COUNT(wd.id) AS total_deliveries,
    COUNT(CASE WHEN wd.response_status_code >= 200 AND wd.response_status_code < 300 THEN 1 END) AS successful_deliveries,
    COUNT(CASE WHEN wd.response_status_code IS NULL OR wd.response_status_code >= 400 THEN 1 END) AS failed_deliveries,
    MAX(wd.delivered_at) AS last_delivery_at,
    AVG(CASE WHEN wd.response_status_code >= 200 AND wd.response_status_code < 300 THEN 1 ELSE 0 END) AS success_rate
FROM webhooks w
LEFT JOIN webhook_deliveries wd ON w.id = wd.webhook_id
GROUP BY w.id, w.organization_id, w.url, w.is_active;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(is_active);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_webhooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER webhooks_updated_at_trigger
    BEFORE UPDATE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION update_webhooks_updated_at();

-- Function to clean up old webhook deliveries (older than 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_webhook_deliveries()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM webhook_deliveries
    WHERE delivered_at < NOW() - INTERVAL '90 days';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE webhooks IS 'Webhook endpoints registered by organizations for event notifications';
COMMENT ON TABLE webhook_deliveries IS 'Log of webhook delivery attempts with responses and errors';
COMMENT ON VIEW webhook_statistics IS 'Aggregated statistics for webhook deliveries';
COMMENT ON FUNCTION cleanup_old_webhook_deliveries() IS 'Deletes webhook delivery logs older than 90 days';
