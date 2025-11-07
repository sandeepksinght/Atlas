import { query } from '../config/database';
import { Organization, SubscriptionStatus } from '../types/enterprise';

export const createOrganization = async (
  name: string,
  contactEmail: string | null,
  licenseCount: number,
  createdBy: string | null
): Promise<Organization> => {
  const result = await query(
    `INSERT INTO organizations (name, contact_email, license_count, created_by, subscription_status, subscription_start_date)
     VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
    [name, contactEmail, licenseCount, createdBy, 'trial']
  );
  return result.rows[0];
};

export const findOrganizationById = async (id: string): Promise<Organization | null> => {
  const result = await query('SELECT * FROM organizations WHERE id = $1', [id]);
  return result.rows[0] || null;
};

export const findAllOrganizations = async (): Promise<Organization[]> => {
  const result = await query(
    `SELECT * FROM organizations ORDER BY created_at DESC`
  );
  return result.rows;
};

export const updateOrganization = async (
  id: string,
  updates: Partial<Organization>
): Promise<Organization | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id' && key !== 'created_at') {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (fields.length === 0) return null;

  values.push(id);
  const result = await query(
    `UPDATE organizations SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

export const updateSubscriptionStatus = async (
  id: string,
  status: SubscriptionStatus
): Promise<Organization | null> => {
  const result = await query(
    `UPDATE organizations SET subscription_status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );
  return result.rows[0] || null;
};

export const deactivateOrganization = async (id: string): Promise<boolean> => {
  const result = await query(
    `UPDATE organizations SET is_active = false, updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

export const activateOrganization = async (id: string): Promise<boolean> => {
  const result = await query(
    `UPDATE organizations SET is_active = true, updated_at = NOW()
     WHERE id = $1`,
    [id]
  );
  return (result.rowCount ?? 0) > 0;
};

export const getOrganizationStats = async (orgId: string) => {
  const result = await query(
    `SELECT * FROM organization_usage_stats WHERE organization_id = $1`,
    [orgId]
  );
  return result.rows[0] || null;
};
