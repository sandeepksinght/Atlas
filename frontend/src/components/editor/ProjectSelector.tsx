import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import * as api from '../../services/api';
import { cn } from '../../utils/cn';

interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_starred: boolean;
  level?: number;
}

interface ProjectSelectorProps {
  onSelect: (projectId: string) => void;
  onClose: () => void;
}

export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelect, onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#6366F1');
  const [creating, setCreating] = useState(false);

  const predefinedColors = [
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await api.getProjects();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    setCreating(true);
    try {
      const response = await api.createProject({
        name: newProjectName,
        color: newProjectColor,
        icon: 'folder',
      });
      const newProject = response.data;
      setProjects([newProject, ...projects]);
      setSelectedProjectId(newProject.id);
      setShowNewProjectForm(false);
      setNewProjectName('');
    } catch (error) {
      console.error('Failed to create project:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleSelect = () => {
    if (selectedProjectId) {
      onSelect(selectedProjectId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Select a Project</h2>
              <p className="text-gray-600 text-sm mt-1">
                Choose which project this assessment belongs to
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : (
            <>
              {/* New Project Form */}
              {showNewProjectForm ? (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        placeholder="e.g., Marketing Surveys, HR Assessments"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                      <div className="flex space-x-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewProjectColor(color)}
                            className={cn(
                              'w-8 h-8 rounded-full transition-all',
                              newProjectColor === color
                                ? 'ring-2 ring-offset-2 ring-gray-900 scale-110'
                                : 'hover:scale-105'
                            )}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setShowNewProjectForm(false);
                          setNewProjectName('');
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim() || creating}
                        loading={creating}
                        size="sm"
                      >
                        Create Project
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewProjectForm(true)}
                  className="w-full mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Create New Project</span>
                </button>
              )}

              {/* Projects List */}
              {projects.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <div className="text-5xl mb-4">📁</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                  <p className="text-gray-600 mb-4">Create your first project to organize your assessments</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 transition-all text-left group',
                        selectedProjectId === project.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      )}
                      style={{ paddingLeft: project.level ? `${project.level * 1.5 + 1}rem` : '1rem' }}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: project.color }}
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
                            {project.is_starred && (
                              <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            )}
                          </div>
                          {project.description && (
                            <p className="text-sm text-gray-600 truncate mt-0.5">{project.description}</p>
                          )}
                        </div>
                        {selectedProjectId === project.id && (
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSelect} disabled={!selectedProjectId}>
            Select Project
          </Button>
        </div>
      </div>
    </div>
  );
};
