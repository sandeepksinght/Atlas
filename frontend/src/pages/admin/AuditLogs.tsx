import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as adminApi from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, any>;
  ip_address: string | null;
  user_agent: string | null;
  impersonated_by: string | null;
  impersonated_by_email: string | null;
  created_at: string;
}

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadAuditLogs();
  }, [page, filters]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAuditLogs({
        page,
        limit: 50,
        userId: filters.userId || undefined,
        action: filters.action || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setLogs(response.data.logs);
      setTotalPages(Math.ceil(response.data.total / 50));
    } catch (error: any) {
      toast.error('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
    setPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    setFilters({
      userId: '',
      action: '',
      startDate: '',
      endDate: '',
    });
    setPage(1);
  };

  const formatAction = (action: string): string => {
    const actionMap: Record<string, string> = {
      user_created: 'Created User',
      user_updated: 'Updated User',
      user_deleted: 'Deleted User',
      password_reset: 'Reset Password',
      assessment_created: 'Created Assessment',
      assessment_updated: 'Updated Assessment',
      assessment_deleted: 'Deleted Assessment',
      assessment_published: 'Published Assessment',
      backup_created: 'Created Backup',
      backup_restored: 'Restored Backup',
      login: 'Logged In',
      logout: 'Logged Out',
      impersonation_started: 'Started Impersonation',
      impersonation_ended: 'Ended Impersonation',
    };

    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getActionColor = (action: string): string => {
    if (action.includes('created')) return 'bg-green-100 text-green-800';
    if (action.includes('updated')) return 'bg-blue-100 text-blue-800';
    if (action.includes('deleted')) return 'bg-red-100 text-red-800';
    if (action.includes('impersonation')) return 'bg-orange-100 text-orange-800';
    if (action.includes('backup')) return 'bg-purple-100 text-purple-800';
    if (action.includes('login') || action.includes('logout')) return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading audit logs...</p>
        </div>
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
              <h1 className="text-3xl font-black text-gray-900">Audit Logs</h1>
              <p className="text-gray-600 mt-1">Track all actions and changes in your organization</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action Type
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                <option value="user_created">User Created</option>
                <option value="user_updated">User Updated</option>
                <option value="user_deleted">User Deleted</option>
                <option value="password_reset">Password Reset</option>
                <option value="assessment_created">Assessment Created</option>
                <option value="assessment_updated">Assessment Updated</option>
                <option value="assessment_deleted">Assessment Deleted</option>
                <option value="assessment_published">Assessment Published</option>
                <option value="backup_created">Backup Created</option>
                <option value="backup_restored">Backup Restored</option>
                <option value="impersonation_started">Impersonation Started</option>
                <option value="impersonation_ended">Impersonation Ended</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Audit Logs List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{log.user_email}</div>
                      {log.impersonated_by_email && (
                        <div className="text-xs text-orange-600">
                          via {log.impersonated_by_email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                          log.action
                        )}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.resource_type || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <details className="cursor-pointer">
                        <summary className="font-medium text-purple-600 hover:text-purple-800">
                          View Details
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono overflow-auto max-h-40">
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      </details>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ip_address || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {logs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-500 mb-2">No audit logs found</p>
                <p className="text-sm text-gray-400">
                  {filters.action || filters.startDate || filters.endDate
                    ? 'Try adjusting your filters'
                    : 'Actions will appear here as they occur'}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Page <span className="font-medium">{page}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
