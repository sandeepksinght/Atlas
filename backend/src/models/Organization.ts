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

export const findAllOrganizations = async (
  limit: number = 50,
  offset: number = 0
): Promise<{ organizations: Organization[]; total: number }> => {
  // Get total count
  const countResult = await query('SELECT COUNT(*) as total FROM organizations');
  const total = parseInt(countResult.rows[0].total);

  // Get paginated organizations
  const result = await query(
    `SELECT * FROM organizations ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    organizations: result.rows,
    total,
  };
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
  status: SubscriptionStatus,
  licenseCount?: number,
  endDate?: Date
): Promise<Organization | null> => {
  const updates: string[] = ['subscription_status = $1'];
  const params: any[] = [status];
  let paramIndex = 2;

  if (licenseCount !== undefined) {
    updates.push(`license_count = $${paramIndex}`);
    params.push(licenseCount);
    paramIndex++;
  }

  if (endDate !== undefined) {
    updates.push(`subscription_end_date = $${paramIndex}`);
    params.push(endDate);
    paramIndex++;
  }

  params.push(id);

  const result = await query(
    `UPDATE organizations SET ${updates.join(', ')}, updated_at = NOW()
     WHERE id = $${paramIndex} RETURNING *`,
    params
  );
  return result.rows[0] || null;
};

export const deactivateOrganization = async (id: string): Promise<Organization | null> => {
  const result = await query(
    `UPDATE organizations SET is_active = false, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

export const activateOrganization = async (id: string): Promise<Organization | null> => {
  const result = await query(
    `UPDATE organizations SET is_active = true, updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
};

export const getOrganizationStats = async (orgId: string) => {
  const result = await query(
    `SELECT * FROM organization_usage_stats WHERE organization_id = $1`,
    [orgId]
  );
  return result.rows[0] || null;
};
