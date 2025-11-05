export interface User {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export type AssessmentType = 'survey' | 'quiz' | 'poll' | 'assessment';

export type QuestionType = 'multiple_choice' | 'single_choice' | 'text' | 'rating' | 'yes_no' | 'dropdown';

export interface Assessment {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: AssessmentType;
  settings: {
    show_results?: boolean;
    allow_multiple_submissions?: boolean;
    randomize_questions?: boolean;
    time_limit?: number;
    passing_score?: number;
  };
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Question {
  id: string;
  assessment_id: string;
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  correct_answer?: string | string[];
  points: number;
  order_index: number;
  is_required: boolean;
  created_at: Date;
}

export interface Response {
  id: string;
  assessment_id: string;
  respondent_name?: string;
  respondent_email?: string;
  answers: Record<string, any>;
  score?: number;
  max_score?: number;
  completed_at: Date;
}

export interface ShareLink {
  id: string;
  assessment_id: string;
  token: string;
  expires_at?: Date;
  is_active: boolean;
  created_at: Date;
}

export interface Job {
  id: string;
  user_id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

// Extend Express Request type to include user from JWT
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
