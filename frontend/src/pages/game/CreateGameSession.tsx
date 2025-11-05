import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import * as api from '../../services/api';
import { toast } from 'react-toastify';

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  question_count?: number;
  created_at: string;
}

export const CreateGameSession: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [gameTitle, setGameTitle] = useState('');

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await api.getAssessments();
      // Filter to only show published assessments with questions
      const publishedAssessments = response.data.filter((a: any) => a.is_published);
      setAssessments(publishedAssessments);
    } catch (error) {
      toast.error('Failed to load assessments');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentSelect = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId);
    const selected = assessments.find(a => a.id === assessmentId);
    if (selected) {
      setGameTitle(selected.title + ' - Live Game');
    }
  };

  const handleCreateGame = async () => {
    if (!selectedAssessmentId) {
      toast.error('Please select an assessment');
      return;
    }

    if (!gameTitle.trim()) {
      toast.error('Please enter a game title');
      return;
    }

    setCreating(true);
    try {
      const response = await api.createGameSession({
        assessment_id: selectedAssessmentId,
        title: gameTitle,
        settings: {
          timeLimit: 20,
          showLeaderboard: true,
        },
      });

      const sessionId = response.data.id;
      toast.success('Game session created!');
      navigate(`/game/host/${sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create game session');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
          <p className="text-xl font-bold text-gray-700">Loading assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-black text-gray-900 mb-3">
            Create Live Game 🎮
          </h1>
          <p className="text-lg text-gray-600">
            Select an assessment to create an interactive live game session
          </p>
        </div>

        {assessments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No published assessments</h3>
            <p className="text-gray-600 mb-6">
              You need to create and publish an assessment before creating a live game
            </p>
            <Button
              onClick={() => navigate('/editor/new')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700"
            >
              Create Assessment
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Game Title Input */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Game Title
              </label>
              <input
                type="text"
                value={gameTitle}
                onChange={(e) => setGameTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                placeholder="Enter game title..."
              />
            </div>

            {/* Assessment Selection */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Assessment ({assessments.length} available)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assessments.map((assessment) => (
                  <button
                    key={assessment.id}
                    onClick={() => handleAssessmentSelect(assessment.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all ${
                      selectedAssessmentId === assessment.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {assessment.title}
                        </h3>
                        {assessment.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assessment.description}
                          </p>
                        )}
                      </div>
                      {selectedAssessmentId === assessment.id && (
                        <div className="ml-3 flex-shrink-0">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg font-medium">
                        {assessment.type}
                      </span>
                      <span className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Create Button */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateGame}
                disabled={!selectedAssessmentId || !gameTitle.trim() || creating}
                loading={creating}
                className="px-8 py-3 text-lg font-bold bg-gradient-to-r from-pink-600 to-red-600"
              >
                Create Live Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
