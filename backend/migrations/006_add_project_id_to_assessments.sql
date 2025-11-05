-- Add project_id to assessments table
ALTER TABLE assessments
ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE SET NULL;

-- Create index for faster queries
CREATE INDEX idx_assessments_project_id ON assessments(project_id);

-- Update existing assessments to have NULL project_id (will be assigned by users)
