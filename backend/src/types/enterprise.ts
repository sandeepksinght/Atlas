// Enterprise Multi-Tenancy Types

export type UserRole = 'dstudio_admin' | 'org_admin' | 'org_member';

export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trial';

export type AuditAction =
  | 'user_created' | 'user_updated' | 'user_deleted' | 'user_disabled' | 'user_enabled'
  | 'password_reset' | 'password_changed' | 'user_impersonated'
  | 'assessment_created' | 'assessment_updated' | 'assessment_deleted' | 'assessment_published'
  | 'question_created' | 'question_updated' | 'question_deleted'
  | 'response_submitted' | 'response_deleted'
  | 'backup_created' | 'backup_restored'
  | 'settings_updated' | 'license_assigned' | 'license_removed'
  | 'login' | 'logout' | 'failed_login';

export interface Organization {
  id: string;
  name: string;
  subdomain: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  subscription_status: SubscriptionStatus;
  license_count: number;
  used_licenses: number;
  subscription_start_date: Date | null;
  subscription_end_date: Date | null;
  settings: Record<string, any>;
  branding: Record<string, any>;
  is_active: boolean;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface EnterpriseUser {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  organization_id: string | null;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
  created_by: string | null;
  updated_by: string | null;
  metadata: Record<string, any>;
  created_at: Date;
}

export interface AuditLog {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  impersonated_by: string | null;
  action: AuditAction;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export interface Backup {
  id: string;
  organization_id: string;
  created_by: string | null;
  backup_type: string;
  description: string | null;
  data: Record<string, any>;
  data_size: number | null;
  includes_assessments: boolean;
  includes_questions: boolean;
  includes_responses: boolean;
  includes_users: boolean;
  status: string;
  error_message: string | null;
  created_at: Date;
  expires_at: Date | null;
}

export interface ImpersonationSession {
  id: string;
  organization_id: string;
  admin_user_id: string;
  target_user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  started_at: Date;
  ended_at: Date | null;
  is_active: boolean;
}

export interface UserActivity {
  id: string;
  organization_id: string | null;
  user_id: string | null;
  activity_type: string;
  activity_details: Record<string, any>;
  duration_seconds: number | null;
  page_url: string | null;
  created_at: Date;
}

export interface LicenseAssignment {
  id: string;
  organization_id: string;
  user_id: string;
  assigned_by: string | null;
  assigned_at: Date;
  expires_at: Date | null;
  is_active: boolean;
}

export interface TemporaryPassword {
  id: string;
  user_id: string;
  password_plain: string;
  created_by: string | null;
  must_change_password: boolean;
  expires_at: Date | null;
  used_at: Date | null;
  created_at: Date;
}

export interface OrganizationUsageStats {
  organization_id: string;
  organization_name: string;
  total_users: number;
  active_users: number;
  total_assessments: number;
  total_responses: number;
  last_user_activity: Date | null;
  license_count: number;
  used_licenses: number;
  available_licenses: number;
}

export interface UserActivitySummary {
  user_id: string;
  name: string | null;
  email: string;
  organization_id: string | null;
  role: UserRole;
  is_active: boolean;
  last_login: Date | null;
  assessments_created: number;
  responses_received: number;
  total_activities: number;
  last_activity: Date | null;
}
