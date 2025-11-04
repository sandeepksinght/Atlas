import { query } from '../config/database';
import { ShareLink } from '../types';
import { v4 as uuidv4 } from 'uuid';

export const createShareLink = async (
  assessmentId: string,
  expiresAt: Date | null = null
): Promise<ShareLink> => {
  const token = uuidv4();

  const result = await query(
    'INSERT INTO share_links (assessment_id, token, expires_at) VALUES ($1, $2, $3) RETURNING *',
    [assessmentId, token, expiresAt]
  );

  return result.rows[0];
};

export const findShareLinkByToken = async (token: string): Promise<ShareLink | null> => {
  const result = await query(
    'SELECT * FROM share_links WHERE token = $1 AND is_active = true',
    [token]
  );

  const link = result.rows[0];

  if (!link) return null;

  // Check if expired
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return null;
  }

  return link;
};

export const findShareLinksByAssessmentId = async (assessmentId: string): Promise<ShareLink[]> => {
  const result = await query(
    'SELECT * FROM share_links WHERE assessment_id = $1 ORDER BY created_at DESC',
    [assessmentId]
  );
  return result.rows;
};

export const deactivateShareLink = async (id: string): Promise<boolean> => {
  const result = await query(
    'UPDATE share_links SET is_active = false WHERE id = $1',
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};
