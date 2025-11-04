import { pool } from '../config/database';

export interface Project {
  id: string;
  user_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  position: number;
  is_archived: boolean;
  is_starred: boolean;
  created_at: Date;
  updated_at: Date;
}

export const Project = {
  // Get all projects for a user
  async findByUserId(userId: string): Promise<Project[]> {
    const result = await pool.query(
      `SELECT * FROM projects
       WHERE user_id = $1 AND is_archived = false
       ORDER BY is_starred DESC, position ASC, created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get a single project by ID
  async findById(id: string): Promise<Project | null> {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Create a new project
  async create(data: {
    user_id: string;
    parent_id?: string | null;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    position?: number;
  }): Promise<Project> {
    const {
      user_id,
      parent_id = null,
      name,
      description = null,
      color = '#6366F1',
      icon = 'folder',
      position = 0,
    } = data;

    const result = await pool.query(
      `INSERT INTO projects (user_id, parent_id, name, description, color, icon, position)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, parent_id, name, description, color, icon, position]
    );
    return result.rows[0];
  },

  // Update a project
  async update(id: string, data: Partial<Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<Project> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE projects SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  },

  // Delete a project
  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
  },

  // Archive a project
  async archive(id: string): Promise<Project> {
    const result = await pool.query(
      'UPDATE projects SET is_archived = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Toggle star
  async toggleStar(id: string): Promise<Project> {
    const result = await pool.query(
      'UPDATE projects SET is_starred = NOT is_starred WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Get project tree (hierarchical structure)
  async getTree(userId: string): Promise<any[]> {
    const result = await pool.query(
      `WITH RECURSIVE project_tree AS (
        SELECT *, 0 as level
        FROM projects
        WHERE user_id = $1 AND parent_id IS NULL AND is_archived = false

        UNION ALL

        SELECT p.*, pt.level + 1
        FROM projects p
        INNER JOIN project_tree pt ON p.parent_id = pt.id
        WHERE p.is_archived = false
      )
      SELECT * FROM project_tree ORDER BY level, is_starred DESC, position ASC`,
      [userId]
    );
    return result.rows;
  },
};
