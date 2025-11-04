-- Migration: Add Projects, Templates, Question Bank, and Enhanced Features
-- Date: 2025-11-04

-- ============================================
-- 1. PROJECTS / FOLDERS SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6366F1', -- indigo-500
    icon VARCHAR(50) DEFAULT 'folder',
    position INTEGER DEFAULT 0,
    is_archived BOOLEAN DEFAULT false,
    is_starred BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_parent_id ON projects(parent_id);
CREATE INDEX idx_projects_user_starred ON projects(user_id, is_starred) WHERE is_starred = true;

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 2. TEMPLATES SYSTEM
-- ============================================

CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'Custom',
    is_public BOOLEAN DEFAULT false,
    is_system BOOLEAN DEFAULT false, -- built-in templates
    thumbnail_url TEXT,
    preview_image_url TEXT,
    assessment_data JSONB NOT NULL, -- complete assessment structure
    tags TEXT[],
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX idx_templates_system ON templates(is_system) WHERE is_system = true;

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. QUESTION BANK
-- ============================================

CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');
CREATE TYPE blooms_taxonomy AS ENUM ('remember', 'understand', 'apply', 'analyze', 'evaluate', 'create');

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
    explanation TEXT, -- explain why answer is correct
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_bank_user_id ON question_bank(user_id);
CREATE INDEX idx_question_bank_subject ON question_bank(subject);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty_level);
CREATE INDEX idx_question_bank_tags ON question_bank USING GIN(tags);
CREATE INDEX idx_question_bank_public ON question_bank(is_public) WHERE is_public = true;

CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 4. ASSESSMENT ENHANCEMENTS
-- ============================================

-- Add new columns to assessments table
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS last_opened_at TIMESTAMP;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

CREATE INDEX idx_assessments_project_id ON assessments(project_id);
CREATE INDEX idx_assessments_tags ON assessments USING GIN(tags);
CREATE INDEX idx_assessments_starred ON assessments(user_id, is_starred) WHERE is_starred = true;
CREATE INDEX idx_assessments_archived ON assessments(user_id, is_archived);

-- ============================================
-- 5. VERSION HISTORY
-- ============================================

CREATE TABLE IF NOT EXISTS assessment_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    title VARCHAR(500),
    description TEXT,
    snapshot JSONB NOT NULL, -- complete assessment state with questions
    change_summary TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, version_number)
);

CREATE INDEX idx_assessment_versions_assessment_id ON assessment_versions(assessment_id);
CREATE INDEX idx_assessment_versions_created_by ON assessment_versions(created_by);

-- ============================================
-- 6. COLLABORATION (Future-ready)
-- ============================================

CREATE TYPE collaborator_role AS ENUM ('owner', 'editor', 'viewer', 'commenter');

CREATE TABLE IF NOT EXISTS assessment_collaborators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role collaborator_role NOT NULL DEFAULT 'viewer',
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, user_id)
);

CREATE INDEX idx_assessment_collaborators_assessment_id ON assessment_collaborators(assessment_id);
CREATE INDEX idx_assessment_collaborators_user_id ON assessment_collaborators(user_id);

CREATE TRIGGER update_assessment_collaborators_updated_at BEFORE UPDATE ON assessment_collaborators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. ANALYTICS ENHANCEMENTS
-- ============================================

-- Add more detailed response tracking
ALTER TABLE responses ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS device_type VARCHAR(50);
ALTER TABLE responses ADD COLUMN IF NOT EXISTS browser VARCHAR(100);
ALTER TABLE responses ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT true;

CREATE INDEX idx_responses_completed_at ON responses(assessment_id, completed_at);
CREATE INDEX idx_responses_score ON responses(assessment_id, score);

-- Question-level analytics
CREATE TABLE IF NOT EXISTS question_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    answer JSONB,
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_analytics_question_id ON question_analytics(question_id);
CREATE INDEX idx_question_analytics_response_id ON question_analytics(response_id);

-- ============================================
-- 8. SYSTEM TEMPLATES
-- ============================================

-- Insert built-in system templates
INSERT INTO templates (user_id, name, description, category, is_public, is_system, assessment_data, tags)
VALUES
    (NULL, 'Employee Satisfaction Survey', 'Measure employee engagement and satisfaction across key areas', 'HR', true, true,
     '{"type": "survey", "questions": [{"type": "rating", "text": "How satisfied are you with your work-life balance?"}, {"type": "rating", "text": "How would you rate communication within your team?"}, {"type": "text", "text": "What could we improve?"}]}'::jsonb,
     ARRAY['HR', 'Employee', 'Satisfaction']),

    (NULL, 'Customer Feedback Form', 'Gather valuable feedback from your customers', 'Marketing', true, true,
     '{"type": "survey", "questions": [{"type": "rating", "text": "How satisfied are you with our product/service?"}, {"type": "multiple_choice", "text": "How did you hear about us?", "options": ["Google Search", "Social Media", "Friend", "Advertisement", "Other"]}, {"type": "text", "text": "Any additional comments?"}]}'::jsonb,
     ARRAY['Customer', 'Feedback', 'NPS']),

    (NULL, 'Product Knowledge Quiz', 'Test team understanding of your products', 'Training', true, true,
     '{"type": "quiz", "questions": [{"type": "single_choice", "text": "Sample product question", "options": ["Option A", "Option B", "Option C", "Option D"], "correct_answer": "Option A", "points": 10}]}'::jsonb,
     ARRAY['Training', 'Product', 'Knowledge']),

    (NULL, 'Event Registration', 'Collect attendee information for events', 'Events', true, true,
     '{"type": "survey", "questions": [{"type": "text", "text": "Full Name"}, {"type": "text", "text": "Email Address"}, {"type": "single_choice", "text": "Dietary Restrictions", "options": ["None", "Vegetarian", "Vegan", "Gluten-Free", "Other"]}]}'::jsonb,
     ARRAY['Event', 'Registration']),

    (NULL, 'Course Evaluation', 'Get feedback on training courses and workshops', 'Education', true, true,
     '{"type": "survey", "questions": [{"type": "rating", "text": "Rate the course content quality"}, {"type": "rating", "text": "Rate the instructor effectiveness"}, {"type": "text", "text": "What did you like most?"}, {"type": "text", "text": "What could be improved?"}]}'::jsonb,
     ARRAY['Education', 'Training', 'Evaluation'])
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
    default_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    sidebar_collapsed BOOLEAN DEFAULT false,
    email_notifications BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 10. ACTIVITY LOG
-- ============================================

CREATE TYPE activity_type AS ENUM (
    'assessment_created', 'assessment_updated', 'assessment_published', 'assessment_deleted',
    'question_added', 'question_updated', 'question_deleted',
    'response_received', 'share_link_generated',
    'template_created', 'project_created'
);

CREATE TABLE IF NOT EXISTS activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    activity_type activity_type NOT NULL,
    entity_type VARCHAR(50), -- assessment, question, template, etc.
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id, created_at DESC);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
