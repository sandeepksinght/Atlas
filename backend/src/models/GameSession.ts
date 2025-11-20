import pool from '../config/database';

export interface GameSession {
  id: string;
  host_id: string;
  assessment_id: string | null;
  pin: string;
  title: string;
  status: 'lobby' | 'playing' | 'question' | 'leaderboard' | 'finished';
  current_question_index: number;
  settings: {
    question_time_limit?: number;
    show_leaderboard_after_question?: boolean;
    randomize_questions?: boolean;
    randomize_answers?: boolean;
  };
  created_at: Date;
  started_at: Date | null;
  ended_at: Date | null;
}

export interface GameParticipant {
  id: string;
  game_session_id: string;
  nickname: string;
  score: number;
  joined_at: Date;
  is_active: boolean;
}

export interface GameAnswer {
  id: string;
  game_session_id: string;
  participant_id: string;
  question_id: string;
  question_index: number;
  answer: string;
  is_correct: boolean;
  points_awarded: number;
  time_taken: number;
  answered_at: Date;
}

export const GameSessionModel = {
  // Generate unique 6-digit PIN
  async generatePin(): Promise<string> {
    let pin: string;
    let exists = true;

    while (exists) {
      pin = Math.floor(100000 + Math.random() * 900000).toString();
      const result = await pool.query(
        'SELECT id FROM game_sessions WHERE pin = $1',
        [pin]
      );
      exists = result.rows.length > 0;
    }

    return pin!;
  },

  // Create a new game session
  async create(data: {
    host_id: string;
    assessment_id?: string;
    title: string;
    settings?: any;
  }): Promise<GameSession> {
    const pin = await this.generatePin();
    const result = await pool.query(
      `INSERT INTO game_sessions (host_id, assessment_id, pin, title, settings)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.host_id, data.assessment_id || null, pin, data.title, JSON.stringify(data.settings || {})]
    );
    return result.rows[0];
  },

  // Find session by PIN
  async findByPin(pin: string): Promise<GameSession | null> {
    const result = await pool.query(
      'SELECT * FROM game_sessions WHERE pin = $1',
      [pin]
    );
    return result.rows[0] || null;
  },

  // Find session by ID
  async findById(id: string): Promise<GameSession | null> {
    const result = await pool.query(
      'SELECT * FROM game_sessions WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  },

  // Update session status
  async updateStatus(id: string, status: string, additionalData?: any): Promise<GameSession> {
    const updates: string[] = ['status = $2'];
    const values: any[] = [id, status];
    let paramCount = 2;

    if (status === 'playing' && !additionalData?.started_at) {
      updates.push(`started_at = CURRENT_TIMESTAMP`);
    }

    if (status === 'finished' && !additionalData?.ended_at) {
      updates.push(`ended_at = CURRENT_TIMESTAMP`);
    }

    if (additionalData?.current_question_index !== undefined) {
      paramCount++;
      updates.push(`current_question_index = $${paramCount}`);
      values.push(additionalData.current_question_index);
    }

    const result = await pool.query(
      `UPDATE game_sessions SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0];
  },

  // Add participant
  async addParticipant(gameSessionId: string, nickname: string): Promise<GameParticipant> {
    const result = await pool.query(
      `INSERT INTO game_participants (game_session_id, nickname)
       VALUES ($1, $2)
       RETURNING *`,
      [gameSessionId, nickname]
    );
    return result.rows[0];
  },

  // Get all participants
  async getParticipants(gameSessionId: string): Promise<GameParticipant[]> {
    const result = await pool.query(
      `SELECT * FROM game_participants
       WHERE game_session_id = $1 AND is_active = true
       ORDER BY score DESC, joined_at ASC`,
      [gameSessionId]
    );
    return result.rows;
  },

  // Record answer
  async recordAnswer(data: {
    game_session_id: string;
    participant_id: string;
    question_id: string;
    question_index: number;
    answer: string;
    is_correct: boolean;
    points_awarded: number;
    time_taken: number;
  }): Promise<GameAnswer> {
    const result = await pool.query(
      `INSERT INTO game_answers
       (game_session_id, participant_id, question_id, question_index, answer, is_correct, points_awarded, time_taken)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.game_session_id,
        data.participant_id,
        data.question_id,
        data.question_index,
        data.answer,
        data.is_correct,
        data.points_awarded,
        data.time_taken,
      ]
    );

    // Update participant score
    await pool.query(
      'UPDATE game_participants SET score = score + $1 WHERE id = $2',
      [data.points_awarded, data.participant_id]
    );

    return result.rows[0];
  },

  // Get question results
  async getQuestionResults(gameSessionId: string, questionIndex: number) {
    const result = await pool.query(
      `SELECT
        ga.*,
        gp.nickname,
        gp.score
       FROM game_answers ga
       JOIN game_participants gp ON ga.participant_id = gp.id
       WHERE ga.game_session_id = $1 AND ga.question_index = $2
       ORDER BY ga.answered_at ASC`,
      [gameSessionId, questionIndex]
    );
    return result.rows;
  },

  // Get final leaderboard
  async getLeaderboard(gameSessionId: string) {
    const result = await pool.query(
      `SELECT
        id,
        nickname,
        score,
        (SELECT COUNT(*) FROM game_answers WHERE participant_id = gp.id AND is_correct = true) as correct_answers,
        (SELECT COUNT(*) FROM game_answers WHERE participant_id = gp.id) as total_answers
       FROM game_participants gp
       WHERE game_session_id = $1 AND is_active = true
       ORDER BY score DESC, joined_at ASC`,
      [gameSessionId]
    );
    return result.rows;
  },

  // End game session
  async endSession(id: string): Promise<GameSession> {
    const result = await pool.query(
      `UPDATE game_sessions
       SET status = 'finished', ended_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
};
