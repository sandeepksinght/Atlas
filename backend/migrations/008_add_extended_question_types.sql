-- Migration 008: Add extended question types to support TypeForm-style editor
-- This migration extends the question_type enum to include all types used by the frontend editor
-- Run this migration against an existing database to enable new question types

DO $$
BEGIN
    -- Add new values to the question_type enum if they don't exist
    -- Note: ALTER TYPE ADD VALUE cannot run inside a transaction block in older PostgreSQL versions
    -- but using IF NOT EXISTS makes it safe to run multiple times

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'short_text' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'short_text';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'long_text' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'long_text';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'email' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'email';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'phone' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'phone';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'number' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'number';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'url' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'url';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'date' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'date';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'true_false' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'true_false';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'opinion_scale' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'opinion_scale';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'statement' AND enumtypid = 'question_type'::regtype) THEN
        ALTER TYPE question_type ADD VALUE 'statement';
    END IF;
END$$;

-- Verify the enum has all expected values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'question_type'::regtype ORDER BY enumsortorder;
