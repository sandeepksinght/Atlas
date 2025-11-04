import { query } from '../config/database';
import { Response } from '../types';

export const createResponse = async (
  assessmentId: string,
  respondentName: string | null,
  respondentEmail: string | null,
  answers: any,
  score: number | null,
  maxScore: number | null
): Promise<Response> => {
  const result = await query(
    `INSERT INTO responses
    (assessment_id, respondent_name, respondent_email, answers, score, max_score)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [assessmentId, respondentName, respondentEmail, JSON.stringify(answers), score, maxScore]
  );

  return result.rows[0];
};

export const findResponsesByAssessmentId = async (assessmentId: string): Promise<Response[]> => {
  const result = await query(
    'SELECT * FROM responses WHERE assessment_id = $1 ORDER BY completed_at DESC',
    [assessmentId]
  );
  return result.rows;
};

export const findResponseById = async (id: string): Promise<Response | null> => {
  const result = await query('SELECT * FROM responses WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const countResponsesByAssessmentId = async (assessmentId: string): Promise<number> => {
  const result = await query(
    'SELECT COUNT(*) as count FROM responses WHERE assessment_id = $1',
    [assessmentId]
  );
  return parseInt(result.rows[0].count);
};
