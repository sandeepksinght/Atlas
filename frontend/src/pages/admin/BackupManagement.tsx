import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as adminApi from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Backup {
  id: string;
  description: string | null;
  data_size: number | null;
  restored_at: string | null;
  restored_by: string | null;
  created_at: string;
  created_by_email?: string;
}

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [description, setDescription] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getBackups();
      setBackups(response.data.backups);
    } catch (error: any) {
      toast.error('Failed to load backups');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setCreatingBackup(true);
      await adminApi.createBackup(description || undefined);
      toast.success('Backup created successfully!');
      setShowCreateModal(false);
      setDescription('');
      loadBackups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create backup');
      console.error(error);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    const confirmMessage = `Are you sure you want to restore from this backup?\n\nCreated: ${new Date(
      backup.created_at
    ).toLocaleString()}\n\nWARNING: This will replace ALL current data with the backup data. This action cannot be undone!`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Double confirmation for safety
    if (!confirm('FINAL CONFIRMATION: Restore backup and overwrite all current data?')) {
      return;
    }

    try {
      const response = await adminApi.restoreBackup(backup.id);
      toast.success('Backup restored successfully!');
      toast.info(response.data.message, { autoClose: 5000 });
      loadBackups();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to restore backup');
      console.error(error);
    }
  };

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) return `${mb.toFixed(2)} MB`;
    return `${kb.toFixed(2)} KB`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading backups...</p>
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
              <h1 className="text-3xl font-black text-gray-900">Backup & Restore</h1>
              <p className="text-gray-600 mt-1">Create and restore organization data backups</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">About Backups</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Backups include all organization data: users, assessments, questions, responses, and projects</li>
            <li>• Restoring a backup will replace ALL current data with the backup data</li>
            <li>• Always create a new backup before restoring to preserve current state</li>
            <li>• Backup restoration cannot be undone - use with caution</li>
          </ul>
        </div>

        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-600">
              Total backups: <span className="font-bold">{backups.length}</span>
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            + Create New Backup
          </button>
        </div>

        {/* Backups Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {backups.map((backup) => (
                <tr key={backup.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(backup.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {backup.description || <span className="text-gray-400 italic">No description</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatBytes(backup.data_size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {backup.created_by_email || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {backup.restored_at ? (
                      <div>
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Restored
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(backup.restored_at).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Available
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleRestoreBackup(backup)}
                      className="text-purple-600 hover:text-purple-900 font-medium"
                    >
                      Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {backups.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💾</div>
              <p className="text-gray-500 mb-2">No backups yet</p>
              <p className="text-sm text-gray-400">Create your first backup to get started</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Backup</h2>
            <form onSubmit={handleCreateBackup}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows={3}
                    placeholder="e.g., Before major update, End of quarter backup, etc."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    This backup will include all organization data. The process may take a few moments depending on the amount of data.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setDescription('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  disabled={creatingBackup}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-300"
                  disabled={creatingBackup}
                >
                  {creatingBackup ? 'Creating Backup...' : 'Create Backup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupManagement;
