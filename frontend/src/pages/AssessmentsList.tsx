import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { Assessment } from '../types';
import { toast } from 'react-toastify';
import ShareModal from '../components/ShareModal';

const AssessmentsList: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [creatingGameFor, setCreatingGameFor] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const response = await api.getAssessments();
      setAssessments(response.data);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await api.deleteAssessment(id);
      toast.success('Assessment deleted successfully');
      loadAssessments();
    } catch (error) {
      toast.error('Failed to delete assessment');
    }
  };

  const handleCreateLiveGame = async (assessment: Assessment) => {
    setCreatingGameFor(assessment.id);
    try {
      const response = await api.createGameSession({
        assessment_id: assessment.id,
        title: `${assessment.title} - Live Game`,
        settings: {
          timeLimit: 20,
          showLeaderboard: true,
        },
      });

      const sessionId = response.data.id;
      toast.success('Live game created!');
      navigate(`/game/host/${sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create live game');
      setCreatingGameFor(null);
    }
  };

  const handleShare = (assessment: Assessment) => {
    setSelectedAssessment(assessment);
    setShareModalOpen(true);
  };

  const handlePublish = async (assessmentId: string) => {
    setPublishingId(assessmentId);
    try {
      await api.publishAssessment(assessmentId);
      toast.success('Assessment published successfully');
      loadAssessments();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to publish assessment');
    } finally {
      setPublishingId(null);
    }
  };

  const filteredAssessments = assessments.filter((a) => {
    if (filter === 'published') return a.is_published;
    if (filter === 'draft') return !a.is_published;
    return true;
  });

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      quiz: 'bg-blue-100 text-blue-800',
      survey: 'bg-green-100 text-green-800',
      poll: 'bg-purple-100 text-purple-800',
      assessment: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Assessments</h1>
            <p className="text-gray-600">Manage all your assessments in one place</p>
          </div>
          <Link
            to="/assessments/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Assessment</span>
          </Link>
        </div>

        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All ({assessments.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'published'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Published ({assessments.filter(a => a.is_published).length})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'draft'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Drafts ({assessments.filter(a => !a.is_published).length})
          </button>
        </div>

        {filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-4">No assessments found</p>
            <Link
              to="/assessments/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Assessment
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{assessment.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(assessment.type)}`}>
                        {assessment.type}
                      </span>
                      {assessment.is_published && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Published
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-4">{assessment.description}</p>
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <span>Created {new Date(assessment.created_at).toLocaleDateString()}</span>
                      <span>Updated {new Date(assessment.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/assessments/${assessment.id}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Edit
                    </Link>
                    {!assessment.is_published && (
                      <button
                        onClick={() => handlePublish(assessment.id)}
                        disabled={publishingId === assessment.id}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {publishingId === assessment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Publishing...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span>Publish</span>
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      to={`/assessments/${assessment.id}/responses`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      Responses
                    </Link>
                    <button
                      onClick={() => handleShare(assessment)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Share</span>
                    </button>
                    {assessment.is_published && (
                      <button
                        onClick={() => handleCreateLiveGame(assessment)}
                        disabled={creatingGameFor === assessment.id}
                        className="px-4 py-2 bg-gradient-to-r from-pink-600 to-red-600 text-white rounded-lg hover:from-pink-700 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {creatingGameFor === assessment.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Live Game</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(assessment.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedAssessment && (
        <ShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          assessmentId={selectedAssessment.id}
          assessmentTitle={selectedAssessment.title}
        />
      )}
    </div>
  );
};

export default AssessmentsList;
