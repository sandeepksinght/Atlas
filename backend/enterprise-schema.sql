-- Enterprise Multi-Tenancy Schema Updates
-- Run this after rebuilding Docker containers

-- =====================================================
-- 1. CREATE ENUMS
-- =====================================================

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('dstudio_admin', 'org_admin', 'org_member');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Organization subscription status
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'suspended', 'cancelled', 'trial');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Audit action types
DO $$ BEGIN
    CREATE TYPE audit_action AS ENUM (
        'user_created', 'user_updated', 'user_deleted', 'user_disabled', 'user_enabled',
        'password_reset', 'password_changed', 'user_impersonated',
        'assessment_created', 'assessment_updated', 'assessment_deleted', 'assessment_published',
        'question_created', 'question_updated', 'question_deleted',
        'response_submitted', 'response_deleted',
        'backup_created', 'backup_restored',
        'settings_updated', 'license_assigned', 'license_removed',
        'login', 'logout', 'failed_login'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. CREATE ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,

    -- Subscription details
    subscription_status subscription_status DEFAULT 'trial',
    license_count INTEGER DEFAULT 5,
    used_licenses INTEGER DEFAULT 0,
    subscription_start_date TIMESTAMP,
    subscription_end_date TIMESTAMP,

    -- Settings
    settings JSONB DEFAULT '{}',
    branding JSONB DEFAULT '{}', -- logo, colors, etc.

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. UPDATE USERS TABLE
-- =====================================================

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'org_member';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add comment for passwords (org admins can see plain passwords)
COMMENT ON COLUMN users.password_hash IS 'Password hash - org admins can reset and view temporary passwords';

-- =====================================================
-- 4. CREATE AUDIT LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    impersonated_by UUID REFERENCES users(id) ON DELETE SET NULL,

    action audit_action NOT NULL,
    resource_type VARCHAR(100), -- 'assessment', 'user', 'question', etc.
    resource_id UUID,

    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- =====================================================
-- 5. CREATE BACKUPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    backup_type VARCHAR(50) DEFAULT 'manual', -- 'manual', 'auto', 'scheduled'
    description TEXT,

    -- Backup data (compressed JSON)
    data JSONB NOT NULL,
    data_size BIGINT, -- Size in bytes

    -- Metadata
    includes_assessments BOOLEAN DEFAULT true,
    includes_questions BOOLEAN DEFAULT true,
    includes_responses BOOLEAN DEFAULT true,
    includes_users BOOLEAN DEFAULT false,

    -- Status
    status VARCHAR(50) DEFAULT 'completed', -- 'in_progress', 'completed', 'failed'
    error_message TEXT,

    -- Restore tracking
    restored_at TIMESTAMP,
    restored_by UUID REFERENCES users(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Indexes for backups
CREATE INDEX IF NOT EXISTS idx_backups_org ON backups(organization_id);
CREATE INDEX IF NOT EXISTS idx_backups_created ON backups(created_at DESC);

-- =====================================================
-- 6. CREATE IMPERSONATION SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS impersonation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    reason TEXT,
    session_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::TEXT,
    ip_address INET,
    user_agent TEXT,

    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Indexes for impersonation
CREATE INDEX IF NOT EXISTS idx_impersonation_admin ON impersonation_sessions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_target ON impersonation_sessions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_active ON impersonation_sessions(is_active) WHERE is_active = true;

-- =====================================================
-- 7. CREATE ACTIVITY TRACKING TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    activity_type VARCHAR(100) NOT NULL, -- 'page_view', 'assessment_created', etc.
    activity_details JSONB DEFAULT '{}',

    duration_seconds INTEGER,
    page_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for activity tracking
CREATE INDEX IF NOT EXISTS idx_activity_org_date ON user_activity(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON user_activity(user_id, created_at DESC);

-- =====================================================
-- 8. CREATE LICENSE ASSIGNMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS license_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,

    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,

    UNIQUE(organization_id, user_id)
);

-- =====================================================
-- 9. UPDATE ASSESSMENTS TABLE
-- =====================================================

-- Add organization_id to assessments for multi-tenancy
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add audit fields
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(255);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES users(id);

-- =====================================================
-- 10. UPDATE RESPONSES TABLE
-- =====================================================

-- Add organization tracking
ALTER TABLE responses ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- =====================================================
-- 11. CREATE TEMPORARY PASSWORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS temporary_passwords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    password_plain VARCHAR(255) NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    must_change_password BOOLEAN DEFAULT true,
    expires_at TIMESTAMP,
    used_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 12. CREATE SYSTEM SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,

    is_public BOOLEAN DEFAULT false, -- If true, visible to org admins
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO system_settings (key, value, description, is_public) VALUES
    ('allow_public_signup', '"false"', 'Allow public user registration', false),
    ('max_licenses_per_org', '100', 'Maximum licenses per organization', false),
    ('default_license_count', '5', 'Default license count for new organizations', false),
    ('backup_retention_days', '90', 'Number of days to retain backups', true),
    ('session_timeout_minutes', '480', 'Session timeout in minutes (8 hours)', true)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 13. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Users
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));

-- Organizations
CREATE INDEX IF NOT EXISTS idx_orgs_active ON organizations(is_active);
CREATE INDEX IF NOT EXISTS idx_orgs_status ON organizations(subscription_status);

-- Assessments
CREATE INDEX IF NOT EXISTS idx_assessments_org ON assessments(organization_id) WHERE organization_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_assessments_user_org ON assessments(user_id, organization_id);

-- =====================================================
-- 14. CREATE VIEWS FOR REPORTING
-- =====================================================

-- Organization usage statistics
CREATE OR REPLACE VIEW organization_usage_stats AS
SELECT
    o.id as organization_id,
    o.name as organization_name,
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN u.is_active THEN u.id END) as active_users,
    COUNT(DISTINCT a.id) as total_assessments,
    COUNT(DISTINCT r.id) as total_responses,
    MAX(u.last_login) as last_user_activity,
    o.license_count,
    o.used_licenses,
    (o.license_count - o.used_licenses) as available_licenses
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id
LEFT JOIN assessments a ON a.organization_id = o.id
LEFT JOIN responses r ON r.assessment_id = a.id
GROUP BY o.id;

-- User activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
    u.id as user_id,
    u.name,
    u.email,
    u.organization_id,
    u.role,
    u.is_active,
    u.last_login,
    COUNT(DISTINCT a.id) as assessments_created,
    COUNT(DISTINCT r.id) as responses_received,
    COUNT(DISTINCT act.id) as total_activities,
    MAX(act.created_at) as last_activity
FROM users u
LEFT JOIN assessments a ON a.user_id = u.id
LEFT JOIN responses r ON r.assessment_id = a.id
LEFT JOIN user_activity act ON act.user_id = u.id
GROUP BY u.id;

-- =====================================================
-- 15. CREATE TRIGGERS FOR AUTO-UPDATES
-- =====================================================

-- Update updated_at timestamp on organizations
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Track license usage
CREATE OR REPLACE FUNCTION update_license_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE organizations
        SET used_licenses = used_licenses + 1
        WHERE id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE organizations
        SET used_licenses = GREATEST(0, used_licenses - 1)
        WHERE id = OLD.organization_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER track_license_usage
    AFTER INSERT OR DELETE ON license_assignments
    FOR EACH ROW EXECUTE FUNCTION update_license_usage();

-- =====================================================
-- GRANTS (Optional - uncomment if needed)
-- =====================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- =====================================================
-- END OF ENTERPRISE SCHEMA
-- =====================================================
