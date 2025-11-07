-- Atlas Database Schema - Production Ready

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment type enum
DO $$ BEGIN
    CREATE TYPE assessment_type AS ENUM ('survey', 'quiz', 'poll', 'assessment');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Projects / Folders table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366F1',
    icon VARCHAR(50) DEFAULT 'folder',
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type assessment_type NOT NULL DEFAULT 'survey',
    settings JSONB DEFAULT '{}',
    is_published BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    tags TEXT[],
    last_opened_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question type enum - Extended for TypeForm-style editor
DO $$ BEGIN
    CREATE TYPE question_type AS ENUM (
        'short_text',
        'long_text',
        'email',
        'phone',
        'number',
        'url',
        'date',
        'multiple_choice',
        'single_choice',
        'dropdown',
        'yes_no',
        'true_false',
        'rating',
        'opinion_scale',
        'statement',
        'text'  -- Legacy support
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE blooms_taxonomy AS ENUM ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_type question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Responses table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    respondent_name VARCHAR(255),
    respondent_email VARCHAR(255),
    answers JSONB NOT NULL,
    score INTEGER,
    max_score INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Share links table
CREATE TABLE IF NOT EXISTS share_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Job status table for background processing
CREATE TABLE IF NOT EXISTS jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    result JSONB,
    error TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Custom',
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false,
    thumbnail_url TEXT,
    preview_image_url TEXT,
    assessment_data JSONB NOT NULL,
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Bank table
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_type question_type NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer JSONB,
    points INTEGER DEFAULT 0,
    tags TEXT[],
    difficulty_level difficulty_level DEFAULT 'intermediate',
    blooms_level blooms_taxonomy,
    subject VARCHAR(100),
    topic VARCHAR(100),
    explanation TEXT,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question Analytics table
CREATE TABLE IF NOT EXISTS question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Summaries table for AI-generated response summaries with version history
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    summary_type VARCHAR(50) NOT NULL,
    custom_instructions TEXT,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light',
    default_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    sidebar_collapsed BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_project_id ON assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tags ON assessments USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_questions_assessment_id ON questions(assessment_id);
CREATE INDEX IF NOT EXISTS idx_responses_assessment_id ON responses(assessment_id);
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_assessment_id ON share_links(assessment_id);
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_user_id ON question_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bank_tags ON question_bank USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_question_analytics_question_id ON question_analytics(question_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_assessment_id ON summaries(assessment_id);
CREATE INDEX IF NOT EXISTS idx_summaries_type_version ON summaries(assessment_id, summary_type, version);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: System Templates
-- ============================================

INSERT INTO templates (user_id, name, description, category, is_public, is_system, assessment_data, tags)
VALUES
    (NULL, 'Employee Satisfaction Survey', 'Measure employee engagement and satisfaction across key areas including work-life balance, management, and company culture.', 'HR', true, true,
     '{"type": "survey", "title": "Employee Satisfaction Survey", "description": "Help us understand your experience", "questions": [{"type": "rating", "text": "How satisfied are you with your work-life balance?", "points": 0}, {"type": "rating", "text": "How would you rate communication within your team?", "points": 0}, {"type": "rating", "text": "How satisfied are you with your compensation and benefits?", "points": 0}, {"type": "text", "text": "What do you enjoy most about working here?", "points": 0}, {"type": "text", "text": "What could we improve to make this a better workplace?", "points": 0}]}'::jsonb,
     ARRAY['HR', 'Employee', 'Satisfaction', 'Engagement']),

    (NULL, 'Customer Feedback Form', 'Gather valuable feedback from your customers to improve products and services.', 'Marketing', true, true,
     '{"type": "survey", "title": "Customer Feedback", "description": "We value your opinion", "questions": [{"type": "rating", "text": "How satisfied are you with our product/service?", "points": 0}, {"type": "single_choice", "text": "How did you hear about us?", "options": ["Google Search", "Social Media", "Friend/Referral", "Advertisement", "Other"], "points": 0}, {"type": "yes_no", "text": "Would you recommend us to others?", "points": 0}, {"type": "text", "text": "What features would you like to see added?", "points": 0}, {"type": "text", "text": "Any additional comments?", "points": 0}]}'::jsonb,
     ARRAY['Customer', 'Feedback', 'NPS', 'Marketing']),

    (NULL, 'Product Knowledge Quiz', 'Test team understanding of your products and services.', 'Training', true, true,
     '{"type": "quiz", "title": "Product Knowledge Quiz", "description": "Test your product knowledge", "questions": [{"type": "single_choice", "text": "What is our flagship product?", "options": ["Product A", "Product B", "Product C", "Product D"], "correct_answer": "Product A", "points": 10}, {"type": "multiple_choice", "text": "Which features are included in the premium plan? (Select all that apply)", "options": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"], "correct_answer": ["Feature 1", "Feature 2", "Feature 3"], "points": 15}, {"type": "text", "text": "Describe the main benefit of our product in one sentence.", "points": 10}]}'::jsonb,
     ARRAY['Training', 'Product', 'Knowledge', 'Quiz']),

    (NULL, 'Event Registration', 'Collect attendee information and preferences for events.', 'Events', true, true,
     '{"type": "survey", "title": "Event Registration", "description": "Register for our upcoming event", "questions": [{"type": "text", "text": "Full Name", "points": 0}, {"type": "text", "text": "Email Address", "points": 0}, {"type": "text", "text": "Company/Organization", "points": 0}, {"type": "single_choice", "text": "Dietary Restrictions", "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Other"], "points": 0}, {"type": "yes_no", "text": "Will you attend the networking session?", "points": 0}]}'::jsonb,
     ARRAY['Event', 'Registration', 'RSVP']),

    (NULL, 'Course Evaluation', 'Get feedback on training courses and educational workshops.', 'Education', true, true,
     '{"type": "survey", "title": "Course Evaluation", "description": "Share your thoughts on this course", "questions": [{"type": "rating", "text": "Rate the overall course quality", "points": 0}, {"type": "rating", "text": "Rate the instructor effectiveness", "points": 0}, {"type": "rating", "text": "Rate the course materials and resources", "points": 0}, {"type": "text", "text": "What did you like most about this course?", "points": 0}, {"type": "text", "text": "What could be improved for future courses?", "points": 0}, {"type": "yes_no", "text": "Would you recommend this course to colleagues?", "points": 0}]}'::jsonb,
     ARRAY['Education', 'Training', 'Evaluation', 'Course']),

    (NULL, 'Skill Assessment Test', 'Evaluate technical or soft skills with a comprehensive quiz.', 'Assessment', true, true,
     '{"type": "quiz", "title": "Skill Assessment", "description": "Demonstrate your expertise", "questions": [{"type": "single_choice", "text": "Sample question 1", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option A", "points": 10}, {"type": "single_choice", "text": "Sample question 2", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option B", "points": 10}, {"type": "text", "text": "Explain your approach to solving this problem.", "points": 20}]}'::jsonb,
     ARRAY['Assessment', 'Skills', 'Testing', 'Evaluation']),

    (NULL, 'Quick Poll', 'Fast opinion polling with just a few questions.', 'Poll', true, true,
     '{"type": "poll", "title": "Quick Poll", "description": "Share your opinion", "questions": [{"type": "single_choice", "text": "What is your preferred work arrangement?", "options": ["Remote", "Hybrid", "In-Office"], "points": 0}, {"type": "yes_no", "text": "Are you satisfied with the current policy?", "points": 0}]}'::jsonb,
     ARRAY['Poll', 'Quick', 'Opinion']),

    (NULL, 'Customer Onboarding Survey', 'Understand new customer needs and expectations.', 'Onboarding', true, true,
     '{"type": "survey", "title": "Welcome! Tell us about yourself", "description": "Help us personalize your experience", "questions": [{"type": "text", "text": "What is your primary goal with our product?", "points": 0}, {"type": "single_choice", "text": "Company size", "options": ["1-10 employees", "11-50 employees", "51-200 employees", "201-1000 employees", "1000+ employees"], "points": 0}, {"type": "multiple_choice", "text": "Which features are you most interested in?", "options": ["Analytics", "Integrations", "Automation", "Collaboration", "Reporting"], "points": 0}, {"type": "text", "text": "How can we help you succeed?", "points": 0}]}'::jsonb,
     ARRAY['Onboarding', 'Customer', 'Survey', 'Welcome'])
ON CONFLICT DO NOTHING;
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
