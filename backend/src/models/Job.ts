import { query } from '../config/database';
import { Job } from '../types';

export const createJob = async (
  userId: string,
  jobType: string
): Promise<Job> => {
  const result = await query(
    'INSERT INTO jobs (user_id, job_type, status) VALUES ($1, $2, $3) RETURNING *',
    [userId, jobType, 'pending']
  );

  return result.rows[0];
};

export const updateJobStatus = async (
  id: string,
  status: string,
  result?: any,
  error?: string
): Promise<Job | null> => {
  const updateResult = await query(
    'UPDATE jobs SET status = $1, result = $2, error = $3 WHERE id = $4 RETURNING *',
    [status, result ? JSON.stringify(result) : null, error, id]
  );

  return updateResult.rows[0] || null;
};

export const findJobById = async (id: string): Promise<Job | null> => {
  const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findJobsByUserId = async (userId: string): Promise<Job[]> => {
  const result = await query(
    'SELECT * FROM jobs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
    [userId]
  );
  return result.rows;
};
