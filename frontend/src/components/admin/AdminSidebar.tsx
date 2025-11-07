import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrganization } from '../../context/OrganizationContext';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const {
    selectedOrganization,
    setSelectedOrganization,
    organizations,
    isSystemView,
    canSwitchContext,
    loading,
  } = useOrganization();

  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  // Define navigation items based on view
  const getDStudioNavItems = (): NavItem[] => [
    { name: 'Organizations', path: '/admin/dstudio-dashboard', icon: '🏢' },
    { name: 'System Audit Logs', path: '/admin/system/audit-logs', icon: '📋' },
  ];

  const getOrgAdminNavItems = (): NavItem[] => [
    { name: 'Dashboard', path: '/admin/dashboard', icon: '📊' },
    { name: 'Team Members', path: '/admin/team', icon: '👥' },
    { name: 'Backups', path: '/admin/backups', icon: '💾' },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: '📋' },
    { name: 'Reports', path: '/admin/reports', icon: '📈' },
  ];

  // Determine which nav items to show
  const navItems = isSystemView ? getDStudioNavItems() : getOrgAdminNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleOrgSelect = (org: typeof organizations[0] | null) => {
    setSelectedOrganization(org);
    setShowOrgDropdown(false);
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-black text-purple-600">Admin Portal</h2>
        <p className="text-sm text-gray-600 mt-1">
          {isSystemView ? 'System Administration' : 'Organization Management'}
        </p>
      </div>

      {/* Organization Context Switcher - Only for DStudio Admins */}
      {canSwitchContext && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Current Context
          </label>
          <div className="relative">
            <button
              onClick={() => setShowOrgDropdown(!showOrgDropdown)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-left text-sm flex items-center justify-between hover:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <span className="truncate">
                {loading ? (
                  'Loading...'
                ) : selectedOrganization ? (
                  <span>
                    <span className="font-semibold">{selectedOrganization.name}</span>
                    <span className="text-xs text-gray-500 block">Org View</span>
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold">System View</span>
                    <span className="text-xs text-gray-500 block">All Organizations</span>
                  </span>
                )}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showOrgDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {/* System View Option */}
                <button
                  onClick={() => handleOrgSelect(null)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                    isSystemView ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  <span className="text-lg">🌐</span>
                  <div>
                    <div className="font-medium">System View</div>
                    <div className="text-xs text-gray-500">Manage all organizations</div>
                  </div>
                </button>

                <div className="border-t border-gray-200 my-1"></div>

                {/* Organizations List */}
                {organizations.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No organizations yet
                  </div>
                ) : (
                  organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                        selectedOrganization?.id === org.id
                          ? 'bg-purple-50 text-purple-700 font-semibold'
                          : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg">🏢</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{org.name}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {org.subscription_status} • {org.is_active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <span>←</span>
          <span>Back to Main App</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
