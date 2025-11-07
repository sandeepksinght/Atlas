import { query } from '../config/database';
import { Backup } from '../types/enterprise';

/**
 * Create a backup of organization data
 */
export const createBackup = async (
  organizationId: string,
  createdBy: string,
  description: string | null = null
): Promise<Backup> => {
  // Gather all organization data
  const backupData: Record<string, any> = {};

  // Get organization details
  const orgResult = await query(
    'SELECT * FROM organizations WHERE id = $1',
    [organizationId]
  );
  backupData.organization = orgResult.rows[0];

  // Get all users in the organization
  const usersResult = await query(
    'SELECT * FROM users WHERE organization_id = $1',
    [organizationId]
  );
  backupData.users = usersResult.rows;

  // Get all assessments
  const assessmentsResult = await query(
    'SELECT * FROM assessments WHERE organization_id = $1',
    [organizationId]
  );
  backupData.assessments = assessmentsResult.rows;

  // Get all questions for these assessments
  const assessmentIds = assessmentsResult.rows.map(a => a.id);
  if (assessmentIds.length > 0) {
    const questionsResult = await query(
      `SELECT q.* FROM questions q
       INNER JOIN assessments a ON q.assessment_id = a.id
       WHERE a.organization_id = $1`,
      [organizationId]
    );
    backupData.questions = questionsResult.rows;
  } else {
    backupData.questions = [];
  }

  // Get all responses
  const responsesResult = await query(
    `SELECT r.* FROM responses r
     INNER JOIN assessments a ON r.assessment_id = a.id
     WHERE a.organization_id = $1`,
    [organizationId]
  );
  backupData.responses = responsesResult.rows;

  // Get all projects
  const projectsResult = await query(
    'SELECT * FROM projects WHERE user_id IN (SELECT id FROM users WHERE organization_id = $1)',
    [organizationId]
  );
  backupData.projects = projectsResult.rows;

  // Calculate backup size (approximate)
  const backupJson = JSON.stringify(backupData);
  const backupSize = Buffer.byteLength(backupJson, 'utf8');

  // Create backup record
  const result = await query(
    `INSERT INTO backups (organization_id, created_by, data, data_size, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [organizationId, createdBy, backupData, backupSize, description]
  );

  return result.rows[0];
};

/**
 * Restore organization data from a backup
 */
export const restoreBackup = async (
  backupId: string,
  restoredBy: string
): Promise<{ success: boolean; message: string; details: any }> => {
  // Get the backup
  const backupResult = await query(
    'SELECT * FROM backups WHERE id = $1',
    [backupId]
  );

  if (backupResult.rows.length === 0) {
    throw new Error('Backup not found');
  }

  const backup: Backup = backupResult.rows[0];
  const backupData = backup.data;
  const organizationId = backup.organization_id;

  try {
    // Start transaction
    await query('BEGIN');

    // Delete existing data (in reverse order of dependencies)
    await query(
      'DELETE FROM responses WHERE assessment_id IN (SELECT id FROM assessments WHERE organization_id = $1)',
      [organizationId]
    );
    await query(
      'DELETE FROM questions WHERE assessment_id IN (SELECT id FROM assessments WHERE organization_id = $1)',
      [organizationId]
    );
    await query('DELETE FROM assessments WHERE organization_id = $1', [organizationId]);
    await query(
      'DELETE FROM projects WHERE user_id IN (SELECT id FROM users WHERE organization_id = $1)',
      [organizationId]
    );
    // Note: We don't delete users as they may have auth sessions

    // Restore organization details (excluding id)
    if (backupData.organization) {
      const org = backupData.organization;
      await query(
        `UPDATE organizations
         SET name = $1, subdomain = $2, contact_email = $3, contact_phone = $4,
             address = $5, settings = $6, branding = $7
         WHERE id = $8`,
        [
          org.name,
          org.subdomain,
          org.contact_email,
          org.contact_phone,
          org.address,
          org.settings,
          org.branding,
          organizationId,
        ]
      );
    }

    // Restore assessments
    if (backupData.assessments && backupData.assessments.length > 0) {
      for (const assessment of backupData.assessments) {
        await query(
          `INSERT INTO assessments (
            id, organization_id, user_id, project_id, title, description, type,
            settings, is_published, expires_at, max_responses, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            settings = EXCLUDED.settings,
            is_published = EXCLUDED.is_published`,
          [
            assessment.id,
            organizationId,
            assessment.user_id,
            assessment.project_id,
            assessment.title,
            assessment.description,
            assessment.type,
            assessment.settings,
            assessment.is_published,
            assessment.expires_at,
            assessment.max_responses,
            assessment.created_at,
            assessment.updated_at,
          ]
        );
      }
    }

    // Restore questions
    if (backupData.questions && backupData.questions.length > 0) {
      for (const question of backupData.questions) {
        await query(
          `INSERT INTO questions (
            id, assessment_id, question_type, question_text, options,
            correct_answer, points, order_index, is_required, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            question_text = EXCLUDED.question_text,
            options = EXCLUDED.options,
            correct_answer = EXCLUDED.correct_answer,
            points = EXCLUDED.points`,
          [
            question.id,
            question.assessment_id,
            question.question_type,
            question.question_text,
            question.options,
            question.correct_answer,
            question.points,
            question.order_index,
            question.is_required,
            question.created_at,
            question.updated_at,
          ]
        );
      }
    }

    // Restore responses
    if (backupData.responses && backupData.responses.length > 0) {
      for (const response of backupData.responses) {
        await query(
          `INSERT INTO responses (
            id, assessment_id, respondent_email, respondent_name, answers,
            score, time_taken, submitted_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            answers = EXCLUDED.answers,
            score = EXCLUDED.score,
            time_taken = EXCLUDED.time_taken`,
          [
            response.id,
            response.assessment_id,
            response.respondent_email,
            response.respondent_name,
            response.answers,
            response.score,
            response.time_taken,
            response.submitted_at,
            response.created_at,
            response.updated_at,
          ]
        );
      }
    }

    // Restore projects
    if (backupData.projects && backupData.projects.length > 0) {
      for (const project of backupData.projects) {
        await query(
          `INSERT INTO projects (
            id, user_id, name, description, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description`,
          [
            project.id,
            project.user_id,
            project.name,
            project.description,
            project.created_at,
            project.updated_at,
          ]
        );
      }
    }

    // Update backup record
    await query(
      'UPDATE backups SET restored_at = NOW(), restored_by = $1 WHERE id = $2',
      [restoredBy, backupId]
    );

    // Commit transaction
    await query('COMMIT');

    return {
      success: true,
      message: 'Backup restored successfully',
      details: {
        assessments: backupData.assessments?.length || 0,
        questions: backupData.questions?.length || 0,
        responses: backupData.responses?.length || 0,
        projects: backupData.projects?.length || 0,
      },
    };
  } catch (error: any) {
    // Rollback transaction on error
    await query('ROLLBACK');
    console.error('Backup restoration failed:', error);
    throw new Error(`Failed to restore backup: ${error.message}`);
  }
};

/**
 * Get all backups for an organization
 */
export const getOrganizationBackups = async (
  organizationId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ backups: Backup[]; total: number }> => {
  // Get total count
  const countResult = await query(
    'SELECT COUNT(*) as total FROM backups WHERE organization_id = $1',
    [organizationId]
  );
  const total = parseInt(countResult.rows[0].total);

  // Get backups (without full backup_data for list view)
  const result = await query(
    `SELECT id, organization_id, created_by, backup_size, description,
            restored_at, restored_by, created_at
     FROM backups
     WHERE organization_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [organizationId, limit, offset]
  );

  return {
    backups: result.rows,
    total,
  };
};

/**
 * Get a specific backup by ID (with full data)
 */
export const getBackupById = async (backupId: string): Promise<Backup | null> => {
  const result = await query(
    'SELECT * FROM backups WHERE id = $1',
    [backupId]
  );
  return result.rows[0] || null;
};

/**
 * Delete a backup
 */
export const deleteBackup = async (backupId: string): Promise<boolean> => {
  const result = await query(
    'DELETE FROM backups WHERE id = $1',
    [backupId]
  );
  return (result.rowCount || 0) > 0;
};

/**
 * Get backup statistics for an organization
 */
export const getBackupStatistics = async (organizationId: string): Promise<{
  totalBackups: number;
  totalSize: number;
  lastBackupDate: Date | null;
  lastRestoredDate: Date | null;
}> => {
  const result = await query(
    `SELECT
       COUNT(*) as total_backups,
       SUM(backup_size) as total_size,
       MAX(created_at) as last_backup_date,
       MAX(restored_at) as last_restored_date
     FROM backups
     WHERE organization_id = $1`,
    [organizationId]
  );

  const row = result.rows[0];
  return {
    totalBackups: parseInt(row.total_backups) || 0,
    totalSize: parseInt(row.total_size) || 0,
    lastBackupDate: row.last_backup_date,
    lastRestoredDate: row.last_restored_date,
  };
};

/**
 * Auto-cleanup old backups (keep only N most recent)
 */
export const cleanupOldBackups = async (
  organizationId: string,
  keepCount: number = 10
): Promise<number> => {
  const result = await query(
    `DELETE FROM backups
     WHERE organization_id = $1
     AND id NOT IN (
       SELECT id FROM backups
       WHERE organization_id = $1
       ORDER BY created_at DESC
       LIMIT $2
     )`,
    [organizationId, keepCount]
  );
  return result.rowCount || 0;
};
