import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';

interface NavItem {
  name: string;
  path: string;
  icon: string;
}

interface User {
  role: string;
  organizationId: string | null;
}

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get user info from localStorage or API
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }
  }, []);

  // Define navigation items based on user role
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
  const navItems = user?.role === 'dstudio_admin' && !user?.organizationId
    ? getDStudioNavItems()
    : getOrgAdminNavItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-black text-purple-600">Admin Portal</h2>
        <p className="text-sm text-gray-600 mt-1">
          {user?.role === 'dstudio_admin' && !user?.organizationId
            ? 'System Administration'
            : 'Organization Management'}
        </p>
      </div>

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
