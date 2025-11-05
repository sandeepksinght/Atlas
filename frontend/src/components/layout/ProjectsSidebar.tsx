import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';
import { cn } from '../../utils/cn';

interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  parent_id: string | null;
  is_starred: boolean;
  position: number;
  level?: number;
}

interface ProjectsSidebarProps {
  defaultCollapsed?: boolean;
}

export const ProjectsSidebar: React.FC<ProjectsSidebarProps> = ({ defaultCollapsed = false }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.getProjectTree();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const handleToggleStar = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.toggleProjectStar(projectId);
      loadProjects();
    } catch (error) {
      console.error('Failed to toggle star:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const starredProjects = projects.filter(p => p.is_starred);
  const rootProjects = projects.filter(p => !p.parent_id && !p.is_starred);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return '?';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        'h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col transition-all duration-300 shadow-2xl',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header with Logo */}
      <div className="p-4 border-b border-slate-700/50">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 transition-all">
                  <span className="text-white font-bold text-lg">dS</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div>
                <span className="font-bold text-xl text-white group-hover:text-blue-400 transition">dStudio</span>
                <p className="text-xs text-slate-400">by CognoStack</p>
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">dS</span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!collapsed && (
          <div className="p-4 space-y-6">
            {/* Quick Actions */}
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">Navigation</p>

              <Link
                to="/dashboard"
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group',
                  location.pathname === '/dashboard'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>

              <Link
                to="/assessments"
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group',
                  location.pathname === '/assessments'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">All Assessments</span>
              </Link>

              <Link
                to="/templates"
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group',
                  location.pathname === '/templates'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span className="font-medium">Templates</span>
              </Link>

              <Link
                to="/wizard"
                className={cn(
                  'flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all group',
                  location.pathname === '/wizard'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                )}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="font-medium">AI Wizard</span>
              </Link>
            </div>

            {/* Starred Projects */}
            {starredProjects.length > 0 && (
              <div>
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Starred
                  </span>
                </div>
                <div className="space-y-1">
                  {starredProjects.map((project) => (
                    <ProjectItem
                      key={project.id}
                      project={project}
                      onToggleStar={handleToggleStar}
                      onRefresh={loadProjects}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            <div>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Projects
                </span>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="p-1 hover:bg-slate-700/50 rounded transition text-slate-400 hover:text-white"
                  title="Create project"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div className="space-y-1">
                {rootProjects.map((project) => (
                  <ProjectItem
                    key={project.id}
                    project={project}
                    onToggleStar={handleToggleStar}
                    onRefresh={loadProjects}
                    childProjects={projects.filter(p => p.parent_id === project.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-t border-slate-700/50 relative">
        {!collapsed ? (
          <div>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-700/50 transition group"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg text-white font-semibold">
                  {getUserInitials()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-white group-hover:text-blue-400 transition">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <svg className={cn('w-5 h-5 text-slate-400 transition', showProfileMenu && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute bottom-20 left-4 right-4 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="p-2 space-y-1">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition text-slate-300 hover:text-white"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition text-slate-300 hover:text-red-400"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg text-white font-semibold">
              {getUserInitials()}
            </div>
          </button>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            loadProjects();
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.5);
        }
      `}</style>
    </div>
  );
};

// Project Item Component
interface ProjectItemProps {
  project: Project;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onRefresh: () => void;
  childProjects?: Project[];
}

const ProjectItem: React.FC<ProjectItemProps> = ({ project, onToggleStar, onRefresh, childProjects = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = childProjects.length > 0;
  const indent = (project.level || 0) * 12;

  return (
    <div>
      <Link
        to={`/assessments?project=${project.id}`}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-all group"
        style={{ paddingLeft: `${12 + indent}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5"
          >
            <svg
              className={cn('w-3 h-3 text-slate-400 transition-transform', isExpanded && 'rotate-90')}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <div
          className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
          style={{ color: project.color }}
        >
          <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
          </svg>
        </div>
        <span className="flex-1 text-sm text-slate-300 group-hover:text-white truncate transition">{project.name}</span>
        <button
          onClick={(e) => onToggleStar(project.id, e)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg
            className={cn('w-4 h-4', project.is_starred ? 'text-yellow-500 fill-current' : 'text-slate-400')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        </button>
      </Link>
      {isExpanded && hasChildren && (
        <div className="mt-1">
          {childProjects.map((child) => (
            <ProjectItem
              key={child.id}
              project={{ ...child, level: (project.level || 0) + 1 }}
              onToggleStar={onToggleStar}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Create Project Modal
interface CreateProjectModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#6366F1', // Indigo
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.createProject({ name, description, color });
      onSuccess();
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">Create Project</h2>
          <p className="text-sm text-slate-400 mt-1">Organize your assessments</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="My Project"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Color</label>
            <div className="flex flex-wrap gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-10 h-10 rounded-xl transition-all shadow-lg',
                    color === c && 'ring-2 ring-offset-2 ring-offset-slate-800 ring-white scale-110'
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-700 rounded-xl text-slate-300 hover:bg-slate-700/50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-40 shadow-lg font-medium"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
