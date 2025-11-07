import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as adminApi from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface ReportData {
  users: {
    total: number;
    active: number;
    inactive: number;
    byRole: {
      org_admin: number;
      org_member: number;
    };
    recentlyCreated: number;
  };
  assessments: {
    total: number;
    byType: {
      survey: number;
      quiz: number;
      poll: number;
    };
    published: number;
    draft: number;
    recentlyCreated: number;
  };
  responses: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    averagePerAssessment: number;
  };
  activity: {
    totalActions: number;
    thisWeek: number;
    lastWeek: number;
    mostActiveUsers: Array<{
      email: string;
      full_name: string;
      actionCount: number;
    }>;
  };
  storage: {
    totalBackups: number;
    totalBackupSize: number;
    lastBackupDate: string | null;
  };
}

const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getReports(parseInt(dateRange));
      setData(response.data);
    } catch (error: any) {
      toast.error('Failed to load reports');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    const gb = mb / 1024;
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  const calculateGrowth = (current: number, previous: number): string => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return `${growth > 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Failed to load report data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />

      {/* Main Content with left margin for sidebar */}
      <div className="ml-64">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div>
              <h1 className="text-3xl font-black text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Organization insights and statistics</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Range Selector */}
        <div className="mb-6 flex justify-end">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={data.users.total}
              subtitle={`${data.users.recentlyCreated} created recently`}
              icon="👥"
              color="blue"
            />
            <StatCard
              title="Active Users"
              value={data.users.active}
              subtitle={`${((data.users.active / data.users.total) * 100).toFixed(0)}% of total`}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Admins"
              value={data.users.byRole.org_admin}
              subtitle={`${data.users.byRole.org_member} members`}
              icon="⭐"
              color="purple"
            />
            <StatCard
              title="Inactive Users"
              value={data.users.inactive}
              subtitle={`${((data.users.inactive / data.users.total) * 100).toFixed(0)}% of total`}
              icon="⏸️"
              color="gray"
            />
          </div>
        </div>

        {/* Assessment Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Assessments"
              value={data.assessments.total}
              subtitle={`${data.assessments.recentlyCreated} created recently`}
              icon="📝"
              color="blue"
            />
            <StatCard
              title="Published"
              value={data.assessments.published}
              subtitle={`${data.assessments.draft} drafts`}
              icon="✅"
              color="green"
            />
            <StatCard
              title="Surveys"
              value={data.assessments.byType.survey}
              subtitle="Total survey assessments"
              icon="📋"
              color="purple"
            />
            <StatCard
              title="Quizzes"
              value={data.assessments.byType.quiz}
              subtitle={`${data.assessments.byType.poll} polls`}
              icon="🎯"
              color="pink"
            />
          </div>
        </div>

        {/* Response Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Response Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Total Responses"
              value={data.responses.total}
              subtitle="All time"
              icon="📊"
              color="blue"
            />
            <StatCard
              title="This Month"
              value={data.responses.thisMonth}
              subtitle={calculateGrowth(data.responses.thisMonth, data.responses.lastMonth)}
              icon="📈"
              color="green"
            />
            <StatCard
              title="Last Month"
              value={data.responses.lastMonth}
              subtitle="Previous period"
              icon="📅"
              color="gray"
            />
            <StatCard
              title="Avg per Assessment"
              value={data.responses.averagePerAssessment.toFixed(1)}
              subtitle="Response rate"
              icon="🎯"
              color="purple"
            />
          </div>
        </div>

        {/* Activity Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Overview</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Actions"
              value={data.activity.totalActions}
              subtitle="All tracked actions"
              icon="⚡"
              color="blue"
            />
            <StatCard
              title="This Week"
              value={data.activity.thisWeek}
              subtitle={calculateGrowth(data.activity.thisWeek, data.activity.lastWeek)}
              icon="📈"
              color="green"
            />
            <StatCard
              title="Last Week"
              value={data.activity.lastWeek}
              subtitle="Previous period"
              icon="📅"
              color="gray"
            />
          </div>
        </div>

        {/* Most Active Users */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Most Active Users</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.activity.mostActiveUsers.map((user, index) => (
                  <tr key={user.email}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-bold">
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-lg font-bold text-purple-600">{user.actionCount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.activity.mostActiveUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No activity data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Storage & Backup Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Storage & Backups</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              title="Total Backups"
              value={data.storage.totalBackups}
              subtitle="Available backups"
              icon="💾"
              color="blue"
            />
            <StatCard
              title="Total Backup Size"
              value={formatBytes(data.storage.totalBackupSize)}
              subtitle="Storage used"
              icon="📦"
              color="purple"
            />
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Last Backup</p>
                <span className="text-2xl">🕐</span>
              </div>
              {data.storage.lastBackupDate ? (
                <>
                  <p className="text-sm font-bold text-gray-900 mb-1">
                    {new Date(data.storage.lastBackupDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(data.storage.lastBackupDate).toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500">No backups yet</p>
              )}
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
    gray: 'text-gray-600',
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

export default Reports;
