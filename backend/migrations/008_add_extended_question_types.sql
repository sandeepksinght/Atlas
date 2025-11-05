-- Add new question types to support TypeForm-style editor
-- This migration extends the question_type enum to include all types used by the frontend editor

-- Add new values to the question_type enum
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'short_text';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'long_text';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'email';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'phone';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'number';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'url';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'date';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'true_false';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'opinion_scale';
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'statement';

-- Note: The existing 'text' type maps to both 'short_text' and 'long_text' in the frontend
-- The frontend will use 'short_text' or 'long_text' going forward
