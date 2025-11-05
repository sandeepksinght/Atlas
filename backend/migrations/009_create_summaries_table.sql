-- Create summaries table for storing AI-generated summaries with version history
CREATE TABLE IF NOT EXISTS summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  summary_type VARCHAR(50) NOT NULL,
  custom_instructions TEXT,
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_summaries_assessment_id ON summaries(assessment_id);
CREATE INDEX IF NOT EXISTS idx_summaries_type_version ON summaries(assessment_id, summary_type, version);

-- Add comment
COMMENT ON TABLE summaries IS 'Stores AI-generated summaries of assessment responses with version history';
