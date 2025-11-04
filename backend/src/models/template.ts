import { pool } from '../config/database';

export interface Template {
  id: string;
  user_id: string | null;
  name: string;
  description: string | null;
  category: string;
  is_public: boolean;
  is_system: boolean;
  thumbnail_url: string | null;
  preview_image_url: string | null;
  assessment_data: any;
  tags: string[];
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export const Template = {
  // Get all templates (system + user's private templates)
  async findAll(userId?: string): Promise<Template[]> {
    const query = userId
      ? `SELECT * FROM templates
         WHERE is_system = true OR (user_id = $1 AND is_public = false)
         ORDER BY is_system DESC, usage_count DESC, created_at DESC`
      : `SELECT * FROM templates WHERE is_public = true ORDER BY usage_count DESC`;

    const params = userId ? [userId] : [];
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get templates by category
  async findByCategory(category: string, userId?: string): Promise<Template[]> {
    const query = userId
      ? `SELECT * FROM templates
         WHERE category = $1 AND (is_system = true OR user_id = $2)
         ORDER BY is_system DESC, usage_count DESC`
      : `SELECT * FROM templates WHERE category = $1 AND is_public = true ORDER BY usage_count DESC`;

    const params = userId ? [category, userId] : [category];
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get a single template by ID
  async findById(id: string): Promise<Template | null> {
    const result = await pool.query('SELECT * FROM templates WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Create a new template
  async create(data: {
    user_id: string;
    name: string;
    description?: string;
    category?: string;
    is_public?: boolean;
    thumbnail_url?: string;
    assessment_data: any;
    tags?: string[];
  }): Promise<Template> {
    const {
      user_id,
      name,
      description = null,
      category = 'Custom',
      is_public = false,
      thumbnail_url = null,
      assessment_data,
      tags = [],
    } = data;

    const result = await pool.query(
      `INSERT INTO templates (user_id, name, description, category, is_public, thumbnail_url, assessment_data, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [user_id, name, description, category, is_public, thumbnail_url, JSON.stringify(assessment_data), tags]
    );
    return result.rows[0];
  },

  // Update a template
  async update(id: string, data: Partial<Omit<Template, 'id' | 'created_at' | 'updated_at'>>): Promise<Template> {
    const fields = Object.keys(data);
    const values = Object.values(data).map((value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    });
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE templates SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  },

  // Delete a template
  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM templates WHERE id = $1', [id]);
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    await pool.query('UPDATE templates SET usage_count = usage_count + 1 WHERE id = $1', [id]);
  },

  // Get popular templates
  async getPopular(limit: number = 10): Promise<Template[]> {
    const result = await pool.query(
      `SELECT * FROM templates
       WHERE is_public = true
       ORDER BY usage_count DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  // Search templates
  async search(query: string, userId?: string): Promise<Template[]> {
    const searchQuery = userId
      ? `SELECT * FROM templates
         WHERE (is_system = true OR user_id = $2)
         AND (
           name ILIKE $1 OR
           description ILIKE $1 OR
           category ILIKE $1 OR
           $1 = ANY(tags)
         )
         ORDER BY is_system DESC, usage_count DESC`
      : `SELECT * FROM templates
         WHERE is_public = true
         AND (
           name ILIKE $1 OR
           description ILIKE $1 OR
           category ILIKE $1 OR
           $1 = ANY(tags)
         )
         ORDER BY usage_count DESC`;

    const params = userId ? [`%${query}%`, userId] : [`%${query}%`];
    const result = await pool.query(searchQuery, params);
    return result.rows;
  },
};
