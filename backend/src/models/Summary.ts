import { query } from '../config/database';

export interface Summary {
  id: string;
  assessment_id: string;
  summary_type: string;
  custom_instructions: string | null;
  content: string;
  version: number;
  created_at: Date;
  created_by: string;
}

export const createSummary = async (
  assessmentId: string,
  summaryType: string,
  customInstructions: string | null,
  content: string,
  createdBy: string
): Promise<Summary> => {
  // Get the next version number
  const versionResult = await query(
    `SELECT COALESCE(MAX(version), 0) + 1 as next_version
     FROM summaries
     WHERE assessment_id = $1 AND summary_type = $2`,
    [assessmentId, summaryType]
  );

  const version = versionResult.rows[0].next_version;

  const result = await query(
    `INSERT INTO summaries
    (assessment_id, summary_type, custom_instructions, content, version, created_by)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [assessmentId, summaryType, customInstructions, content, version, createdBy]
  );

  return result.rows[0];
};

export const findLatestSummary = async (
  assessmentId: string,
  summaryType: string
): Promise<Summary | null> => {
  const result = await query(
    `SELECT * FROM summaries
     WHERE assessment_id = $1 AND summary_type = $2
     ORDER BY version DESC
     LIMIT 1`,
    [assessmentId, summaryType]
  );
  return result.rows[0] || null;
};

export const findSummaryVersions = async (
  assessmentId: string,
  summaryType: string
): Promise<Summary[]> => {
  const result = await query(
    `SELECT * FROM summaries
     WHERE assessment_id = $1 AND summary_type = $2
     ORDER BY version DESC`,
    [assessmentId, summaryType]
  );
  return result.rows;
};

export const findSummaryById = async (id: string): Promise<Summary | null> => {
  const result = await query('SELECT * FROM summaries WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findSummariesByAssessmentId = async (assessmentId: string): Promise<Summary[]> => {
  const result = await query(
    `SELECT * FROM summaries
     WHERE assessment_id = $1
     ORDER BY created_at DESC`,
    [assessmentId]
  );
  return result.rows;
};

export const deleteSummary = async (id: string): Promise<void> => {
  await query('DELETE FROM summaries WHERE id = $1', [id]);
};
