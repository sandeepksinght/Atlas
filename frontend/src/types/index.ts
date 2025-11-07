export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
  organization_id?: string;
  full_name?: string;
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
  created_at: string;
  updated_at: string;
  questions?: Question[];
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
}

export interface Response {
  id: string;
  assessment_id: string;
  respondent_name?: string;
  respondent_email?: string;
  answers: Record<string, any>;
  score?: number;
  max_score?: number;
  completed_at: string;
}

export interface ShareLink {
  id: string;
  assessment_id: string;
  token: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  user_id: string;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}
