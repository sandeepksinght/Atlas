import { pool } from '../config/database';

export type QuestionType = 'multiple_choice' | 'single_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown';
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type BloomsTaxonomy = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

export interface QuestionBankItem {
  id: string;
  user_id: string;
  question_type: QuestionType;
  question_text: string;
  options: any;
  correct_answer: any;
  points: number;
  tags: string[];
  difficulty_level: DifficultyLevel;
  blooms_level: BloomsTaxonomy | null;
  subject: string | null;
  topic: string | null;
  explanation: string | null;
  is_public: boolean;
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export const QuestionBank = {
  // Get all questions for a user
  async findByUserId(userId: string): Promise<QuestionBankItem[]> {
    const result = await pool.query(
      `SELECT * FROM question_bank
       WHERE user_id = $1 OR is_public = true
       ORDER BY usage_count DESC, created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  // Get questions by subject
  async findBySubject(subject: string, userId?: string): Promise<QuestionBankItem[]> {
    const query = userId
      ? `SELECT * FROM question_bank
         WHERE subject = $1 AND (user_id = $2 OR is_public = true)
         ORDER BY usage_count DESC`
      : `SELECT * FROM question_bank
         WHERE subject = $1 AND is_public = true
         ORDER BY usage_count DESC`;

    const params = userId ? [subject, userId] : [subject];
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get questions by tags
  async findByTags(tags: string[], userId?: string): Promise<QuestionBankItem[]> {
    const query = userId
      ? `SELECT * FROM question_bank
         WHERE tags && $1 AND (user_id = $2 OR is_public = true)
         ORDER BY usage_count DESC`
      : `SELECT * FROM question_bank
         WHERE tags && $1 AND is_public = true
         ORDER BY usage_count DESC`;

    const params = userId ? [tags, userId] : [tags];
    const result = await pool.query(query, params);
    return result.rows;
  },

  // Get a single question by ID
  async findById(id: string): Promise<QuestionBankItem | null> {
    const result = await pool.query('SELECT * FROM question_bank WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  // Create a new question in the bank
  async create(data: {
    user_id: string;
    question_type: QuestionType;
    question_text: string;
    options?: any;
    correct_answer?: any;
    points?: number;
    tags?: string[];
    difficulty_level?: DifficultyLevel;
    blooms_level?: BloomsTaxonomy;
    subject?: string;
    topic?: string;
    explanation?: string;
    is_public?: boolean;
  }): Promise<QuestionBankItem> {
    const {
      user_id,
      question_type,
      question_text,
      options = null,
      correct_answer = null,
      points = 0,
      tags = [],
      difficulty_level = 'intermediate',
      blooms_level = null,
      subject = null,
      topic = null,
      explanation = null,
      is_public = false,
    } = data;

    const result = await pool.query(
      `INSERT INTO question_bank (
        user_id, question_type, question_text, options, correct_answer, points,
        tags, difficulty_level, blooms_level, subject, topic, explanation, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        user_id,
        question_type,
        question_text,
        JSON.stringify(options),
        JSON.stringify(correct_answer),
        points,
        tags,
        difficulty_level,
        blooms_level,
        subject,
        topic,
        explanation,
        is_public,
      ]
    );
    return result.rows[0];
  },

  // Update a question
  async update(id: string, data: Partial<Omit<QuestionBankItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<QuestionBankItem> {
    const fields = Object.keys(data);
    const values = Object.values(data).map((value) => {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return JSON.stringify(value);
      }
      return value;
    });
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    const result = await pool.query(
      `UPDATE question_bank SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return result.rows[0];
  },

  // Delete a question
  async delete(id: string): Promise<void> {
    await pool.query('DELETE FROM question_bank WHERE id = $1', [id]);
  },

  // Increment usage count
  async incrementUsage(id: string): Promise<void> {
    await pool.query('UPDATE question_bank SET usage_count = usage_count + 1 WHERE id = $1', [id]);
  },

  // Search questions
  async search(query: string, userId?: string): Promise<QuestionBankItem[]> {
    const searchQuery = userId
      ? `SELECT * FROM question_bank
         WHERE (user_id = $2 OR is_public = true)
         AND (
           question_text ILIKE $1 OR
           subject ILIKE $1 OR
           topic ILIKE $1 OR
           $1 = ANY(tags)
         )
         ORDER BY usage_count DESC`
      : `SELECT * FROM question_bank
         WHERE is_public = true
         AND (
           question_text ILIKE $1 OR
           subject ILIKE $1 OR
           topic ILIKE $1 OR
           $1 = ANY(tags)
         )
         ORDER BY usage_count DESC`;

    const params = userId ? [`%${query}%`, userId] : [`%${query}%`];
    const result = await pool.query(searchQuery, params);
    return result.rows;
  },

  // Filter by difficulty
  async findByDifficulty(difficulty: DifficultyLevel, userId?: string): Promise<QuestionBankItem[]> {
    const query = userId
      ? `SELECT * FROM question_bank
         WHERE difficulty_level = $1 AND (user_id = $2 OR is_public = true)
         ORDER BY usage_count DESC`
      : `SELECT * FROM question_bank
         WHERE difficulty_level = $1 AND is_public = true
         ORDER BY usage_count DESC`;

    const params = userId ? [difficulty, userId] : [difficulty];
    const result = await pool.query(query, params);
    return result.rows;
  },
};
