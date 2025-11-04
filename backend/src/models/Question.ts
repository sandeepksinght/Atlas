import { query } from '../config/database';
import { Question } from '../types';

export const createQuestion = async (
  assessmentId: string,
  questionType: string,
  questionText: string,
  options: string[] | null,
  correctAnswer: any,
  points: number,
  orderIndex: number,
  isRequired: boolean = true
): Promise<Question> => {
  const result = await query(
    `INSERT INTO questions
    (assessment_id, question_type, question_text, options, correct_answer, points, order_index, is_required)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      assessmentId,
      questionType,
      questionText,
      options ? JSON.stringify(options) : null,
      correctAnswer ? JSON.stringify(correctAnswer) : null,
      points,
      orderIndex,
      isRequired,
    ]
  );

  return result.rows[0];
};

export const createQuestions = async (questions: any[]): Promise<Question[]> => {
  const client = await query('SELECT 1');

  const createdQuestions: Question[] = [];

  for (const q of questions) {
    const result = await query(
      `INSERT INTO questions
      (assessment_id, question_type, question_text, options, correct_answer, points, order_index, is_required)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        q.assessment_id,
        q.question_type,
        q.question_text,
        q.options ? JSON.stringify(q.options) : null,
        q.correct_answer ? JSON.stringify(q.correct_answer) : null,
        q.points || 0,
        q.order_index,
        q.is_required !== false,
      ]
    );
    createdQuestions.push(result.rows[0]);
  }

  return createdQuestions;
};

export const findQuestionsByAssessmentId = async (assessmentId: string): Promise<Question[]> => {
  const result = await query(
    'SELECT * FROM questions WHERE assessment_id = $1 ORDER BY order_index ASC',
    [assessmentId]
  );
  return result.rows;
};

export const updateQuestion = async (
  id: string,
  questionType: string,
  questionText: string,
  options: string[] | null,
  correctAnswer: any,
  points: number,
  isRequired: boolean
): Promise<Question | null> => {
  const result = await query(
    `UPDATE questions
    SET question_type = $1, question_text = $2, options = $3, correct_answer = $4, points = $5, is_required = $6
    WHERE id = $7 RETURNING *`,
    [
      questionType,
      questionText,
      options ? JSON.stringify(options) : null,
      correctAnswer ? JSON.stringify(correctAnswer) : null,
      points,
      isRequired,
      id,
    ]
  );

  return result.rows[0] || null;
};

export const deleteQuestion = async (id: string): Promise<boolean> => {
  const result = await query('DELETE FROM questions WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
};

export const deleteQuestionsByAssessmentId = async (assessmentId: string): Promise<boolean> => {
  const result = await query('DELETE FROM questions WHERE assessment_id = $1', [assessmentId]);
  return (result.rowCount ?? 0) > 0;
};
