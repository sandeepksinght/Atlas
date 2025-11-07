import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as adminApi from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface DashboardData {
  organization: any;
  stats: any;
  users: any[];
  recentActivity: any[];
}

const OrgAdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrgDashboard();
      setData(response.data);
    } catch (error: any) {
      toast.error('Failed to load dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard data</p>
      </div>
    );
  }

  const { organization, stats, users, recentActivity } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content with left margin for sidebar */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-3xl font-black text-gray-900">{organization.name}</h1>
            <p className="text-gray-600 mt-1">Organization Administration Dashboard</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link
            to="/admin/team"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-bold text-gray-900">Team Members</h3>
            <p className="text-sm text-gray-600 mt-1">Manage your team</p>
          </Link>

          <Link
            to="/admin/backups"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">💾</div>
            <h3 className="font-bold text-gray-900">Backups</h3>
            <p className="text-sm text-gray-600 mt-1">Backup & restore data</p>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📋</div>
            <h3 className="font-bold text-gray-900">Audit Logs</h3>
            <p className="text-sm text-gray-600 mt-1">View activity logs</p>
          </Link>

          <Link
            to="/admin/reports"
            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow text-center"
          >
            <div className="text-4xl mb-2">📊</div>
            <h3 className="font-bold text-gray-900">Reports</h3>
            <p className="text-sm text-gray-600 mt-1">Analytics & insights</p>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            subtitle={`${stats?.active_users || 0} active`}
            icon="👥"
            color="blue"
          />
          <StatCard
            title="Licenses"
            value={`${organization.used_licenses || 0} / ${organization.license_count || 0}`}
            subtitle={`${organization.license_count - organization.used_licenses} available`}
            icon="🎫"
            color="purple"
          />
          <StatCard
            title="Assessments"
            value={stats?.total_assessments || 0}
            subtitle="Total created"
            icon="📝"
            color="green"
          />
          <StatCard
            title="Responses"
            value={stats?.total_responses || 0}
            subtitle="Total collected"
            icon="📊"
            color="pink"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Members */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
              <Link
                to="/admin/team"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {users.slice(0, 5).map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name || user.email}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'org_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {user.role === 'org_admin' ? 'Admin' : 'Member'}
                    </span>
                  </div>
                ))}
              </div>
              {users.length === 0 && (
                <p className="text-center text-gray-500 py-4">No team members yet</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <Link
                to="/admin/audit-logs"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity: any) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user_email}</span>{' '}
                        {formatAction(activity.action)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {recentActivity.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recent activity</p>
              )}
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Organization Name</label>
              <p className="mt-1 text-gray-900">{organization.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Contact Email</label>
              <p className="mt-1 text-gray-900">{organization.contact_email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Subscription Status</label>
              <p className="mt-1">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    organization.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : organization.subscription_status === 'trial'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {organization.subscription_status}
                </span>
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Created</label>
              <p className="mt-1 text-gray-900">
                {new Date(organization.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: string;
}> = ({ title, value, subtitle, icon, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-green-600',
    pink: 'text-pink-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{title}</p>
        <span className={`text-2xl ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </span>
      </div>
      <p className="text-3xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );
};

const formatAction = (action: string): string => {
  const actionMap: Record<string, string> = {
    user_created: 'created a user',
    user_updated: 'updated a user',
    user_deleted: 'deleted a user',
    password_reset: 'reset a password',
    assessment_created: 'created an assessment',
    assessment_updated: 'updated an assessment',
    assessment_deleted: 'deleted an assessment',
    assessment_published: 'published an assessment',
    backup_created: 'created a backup',
    backup_restored: 'restored a backup',
    login: 'logged in',
    logout: 'logged out',
  };

  return actionMap[action] || action.replace(/_/g, ' ');
};

export default OrgAdminDashboard;
