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
