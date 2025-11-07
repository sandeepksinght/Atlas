import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as adminApi from '../../services/adminApi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useOrganization } from '../../context/OrganizationContext';

interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TemporaryPassword {
  id: string;
  password: string;
  created_at: string;
  created_by_email: string;
  used_at: string | null;
}

const TeamManagement: React.FC = () => {
  const { selectedOrganization, canSwitchContext } = useOrganization();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordsModal, setShowPasswordsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [temporaryPasswords, setTemporaryPasswords] = useState<TemporaryPassword[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);

  // Create form state
  const [newMember, setNewMember] = useState({
    email: '',
    fullName: '',
    role: 'org_member',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    role: 'org_member',
  });

  useEffect(() => {
    loadTeamMembers();
  }, [includeInactive, selectedOrganization]);

  const loadTeamMembers = async () => {
    // Don't load if DStudio admin without org selected
    if (canSwitchContext && !selectedOrganization) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await adminApi.getTeamMembers(
        includeInactive,
        selectedOrganization?.id
      );
      setMembers(response.data.members);
    } catch (error: any) {
      toast.error('Failed to load team members');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMember.email || !newMember.fullName) {
      toast.error('Email and full name are required');
      return;
    }

    try {
      const response = await adminApi.createTeamMember(newMember);
      const createdUser = response.data.user;

      toast.success(`Team member created successfully!`);

      // Show temporary password
      if (createdUser.temporaryPassword) {
        toast.info(
          `Temporary Password: ${createdUser.temporaryPassword}`,
          { autoClose: false }
        );
      }

      setShowCreateModal(false);
      setNewMember({ email: '', fullName: '', role: 'org_member' });
      loadTeamMembers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create team member';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMember) return;

    try {
      await adminApi.updateTeamMember(selectedMember.id, editForm);
      toast.success('Team member updated successfully');
      setShowEditModal(false);
      setSelectedMember(null);
      loadTeamMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update team member');
      console.error(error);
    }
  };

  const handleToggleStatus = async (member: TeamMember) => {
    const action = member.is_active ? 'deactivate' : 'activate';

    if (!confirm(`Are you sure you want to ${action} ${member.full_name}?`)) {
      return;
    }

    try {
      await adminApi.toggleTeamMemberStatus(member.id, !member.is_active);
      toast.success(`User ${action}d successfully`);
      loadTeamMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to ${action} user`);
      console.error(error);
    }
  };

  const handleResetPassword = async (member: TeamMember) => {
    if (!confirm(`Reset password for ${member.full_name}? A new temporary password will be generated.`)) {
      return;
    }

    try {
      const response = await adminApi.resetUserPassword(member.id);
      const newPassword = response.data.temporaryPassword;

      toast.success('Password reset successfully!');
      toast.info(`New Temporary Password: ${newPassword}`, { autoClose: false });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
      console.error(error);
    }
  };

  const handleViewPasswords = async (member: TeamMember) => {
    try {
      const response = await adminApi.getUserPasswords(member.id);
      setTemporaryPasswords(response.data.passwords);
      setSelectedMember(member);
      setShowPasswordsModal(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load passwords');
      console.error(error);
    }
  };

  const handleStartImpersonation = async (member: TeamMember) => {
    if (!confirm(`Impersonate ${member.full_name}? You will be logged in as this user.`)) {
      return;
    }

    try {
      const response = await adminApi.startImpersonation(member.id);
      const sessionId = response.data.session.id;

      // Store session ID in localStorage for the impersonation header
      localStorage.setItem('impersonation_session_id', sessionId);

      toast.success(`Now impersonating ${member.full_name}`);
      toast.info('You will be redirected to the main dashboard', { autoClose: 3000 });

      // Redirect to main app after 3 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to start impersonation');
      console.error(error);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setEditForm({
      fullName: member.full_name,
      role: member.role,
    });
    setShowEditModal(true);
  };

  // Show message for DStudio admins without org context
  if (canSwitchContext && !selectedOrganization) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-64 flex items-center justify-center h-screen">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Select an Organization
            </h2>
            <p className="text-gray-600 mb-6">
              To manage team members, please select an organization from the dropdown in the sidebar.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> Use the "Current Context" dropdown at the top of the sidebar to select which organization you want to manage.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading team members...</p>
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
              <h1 className="text-3xl font-black text-gray-900">Team Management</h1>
              <p className="text-gray-600 mt-1">Manage your organization's team members</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Show inactive users</span>
            </label>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            + Add Team Member
          </button>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((member) => (
                <tr key={member.id} className={!member.is_active ? 'bg-gray-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'org_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {member.role === 'org_admin' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {member.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditModal(member)}
                        className="text-purple-600 hover:text-purple-900"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(member)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reset Password"
                      >
                        Reset Pwd
                      </button>
                      <button
                        onClick={() => handleViewPasswords(member)}
                        className="text-green-600 hover:text-green-900"
                        title="View Passwords"
                      >
                        View Pwd
                      </button>
                      <button
                        onClick={() => handleStartImpersonation(member)}
                        className="text-orange-600 hover:text-orange-900"
                        title="Impersonate"
                      >
                        Impersonate
                      </button>
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`${
                          member.is_active
                            ? 'text-red-600 hover:text-red-900'
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={member.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {member.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No team members found</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Create Member Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Team Member</h2>
            <form onSubmit={handleCreateMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.fullName}
                    onChange={(e) => setNewMember({ ...newMember, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="org_member">Member</option>
                    <option value="org_admin">Admin</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    A temporary password will be generated and displayed after creation. Make sure to copy and share it with the user.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewMember({ email: '', fullName: '', role: 'org_member' });
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Team Member</h2>
            <form onSubmit={handleEditMember}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={selectedMember.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="org_member">Member</option>
                    <option value="org_admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedMember(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Passwords Modal */}
      {showPasswordsModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Temporary Passwords for {selectedMember.full_name}
            </h2>

            <div className="space-y-3 mb-6">
              {temporaryPasswords.length > 0 ? (
                temporaryPasswords.map((pwd) => (
                  <div
                    key={pwd.id}
                    className={`p-4 rounded-lg border ${
                      pwd.used_at ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-mono text-lg font-bold text-gray-900 mb-2">
                          {pwd.password}
                        </div>
                        <div className="text-sm text-gray-600">
                          Created: {new Date(pwd.created_at).toLocaleString()}
                          <br />
                          Created by: {pwd.created_by_email}
                          {pwd.used_at && (
                            <>
                              <br />
                              Used: {new Date(pwd.used_at).toLocaleString()}
                            </>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          pwd.used_at
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {pwd.used_at ? 'Used' : 'Active'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No temporary passwords found for this user
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowPasswordsModal(false);
                  setSelectedMember(null);
                  setTemporaryPasswords([]);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
