import React, { useState } from 'react';

interface AssessmentSettingsProps {
  settings: any;
  onSave: (settings: any) => void;
  onClose: () => void;
}

const AssessmentSettings: React.FC<AssessmentSettingsProps> = ({ settings: initialSettings, onSave, onClose }) => {
  const [settings, setSettings] = useState(initialSettings || {});

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Assessment Settings</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {/* Response Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <div>
                  <div className="font-medium text-gray-900">Show results to respondents</div>
                  <div className="text-sm text-gray-600">Display scores/results after submission</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.show_results !== false}
                  onChange={(e) => setSettings({ ...settings, show_results: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <div>
                  <div className="font-medium text-gray-900">Allow multiple submissions</div>
                  <div className="text-sm text-gray-600">Users can submit more than once</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allow_multiple_submissions || false}
                  onChange={(e) => setSettings({ ...settings, allow_multiple_submissions: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <div>
                  <div className="font-medium text-gray-900">Randomize questions</div>
                  <div className="text-sm text-gray-600">Show questions in random order</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.randomize_questions || false}
                  onChange={(e) => setSettings({ ...settings, randomize_questions: e.target.checked })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
              </label>
            </div>
          </div>

          {/* Time Limit */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Limit</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={!!settings.time_limit}
                  onChange={(e) => setSettings({ ...settings, time_limit: e.target.checked ? 30 : undefined })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">Enable time limit</span>
              </label>

              {settings.time_limit && (
                <div className="flex items-center space-x-4 mt-4">
                  <input
                    type="number"
                    value={settings.time_limit}
                    onChange={(e) => setSettings({ ...settings, time_limit: parseInt(e.target.value) || 30 })}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                  <span className="text-gray-700">minutes</span>
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagination</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={!!settings.questions_per_page}
                  onChange={(e) => setSettings({ ...settings, questions_per_page: e.target.checked ? 1 : undefined })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">Show one question per page</span>
              </label>

              {settings.questions_per_page && (
                <div className="flex items-center space-x-4 mt-4">
                  <input
                    type="number"
                    value={settings.questions_per_page}
                    onChange={(e) => setSettings({ ...settings, questions_per_page: parseInt(e.target.value) || 1 })}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="1"
                  />
                  <span className="text-gray-700">questions per page</span>
                </div>
              )}
            </div>
          </div>

          {/* Passing Score (for quizzes) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Passing Score</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  checked={!!settings.passing_score}
                  onChange={(e) => setSettings({ ...settings, passing_score: e.target.checked ? 70 : undefined })}
                  className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">Set passing score</span>
              </label>

              {settings.passing_score && (
                <div className="flex items-center space-x-4 mt-4">
                  <input
                    type="number"
                    value={settings.passing_score}
                    onChange={(e) => setSettings({ ...settings, passing_score: parseInt(e.target.value) || 70 })}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    min="0"
                    max="100"
                  />
                  <span className="text-gray-700">% required to pass</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssessmentSettings;
