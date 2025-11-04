import { query } from '../config/database';
import { Assessment } from '../types';

export const createAssessment = async (
  userId: string,
  title: string,
  description: string,
  type: string,
  settings: any
): Promise<Assessment> => {
  const result = await query(
    'INSERT INTO assessments (user_id, title, description, type, settings) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, title, description, type, JSON.stringify(settings)]
  );

  return result.rows[0];
};

export const findAssessmentById = async (id: string): Promise<Assessment | null> => {
  const result = await query('SELECT * FROM assessments WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findAssessmentsByUserId = async (userId: string): Promise<Assessment[]> => {
  const result = await query(
    'SELECT * FROM assessments WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const updateAssessment = async (
  id: string,
  title: string,
  description: string,
  settings: any
): Promise<Assessment | null> => {
  const result = await query(
    'UPDATE assessments SET title = $1, description = $2, settings = $3 WHERE id = $4 RETURNING *',
    [title, description, JSON.stringify(settings), id]
  );

  return result.rows[0] || null;
};

export const publishAssessment = async (id: string): Promise<Assessment | null> => {
  const result = await query(
    'UPDATE assessments SET is_published = true WHERE id = $1 RETURNING *',
    [id]
  );

  return result.rows[0] || null;
};

export const deleteAssessment = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM assessments WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};
