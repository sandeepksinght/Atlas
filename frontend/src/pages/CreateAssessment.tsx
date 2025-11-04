import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { Assessment, Question, AssessmentType, QuestionType } from '../types';
import { toast } from 'react-toastify';

const CreateAssessment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssessmentType>('quiz');
  const [showResults, setShowResults] = useState(true);

  const [activeTab, setActiveTab] = useState<'manual' | 'text' | 'file' | 'url'>('manual');
  const [aiContent, setAiContent] = useState('');
  const [aiUrl, setAiUrl] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [jobStatus, setJobStatus] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadAssessment();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      const response = await api.getAssessment(id!);
      const data = response.data;
      setAssessment(data);
      setTitle(data.title);
      setDescription(data.description);
      setType(data.type);
      setShowResults(data.settings?.show_results ?? true);
      setQuestions(data.questions || []);
    } catch (error) {
      toast.error('Failed to load assessment');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setLoading(true);
    try {
      const data = {
        title,
        description,
        type,
        settings: { show_results: showResults },
      };

      if (id) {
        await api.updateAssessment(id, data);
        toast.success('Assessment updated successfully');
      } else {
        const response = await api.createAssessment(data);
        const newId = response.data.id;
        toast.success('Assessment created successfully');
        navigate(`/assessments/${newId}`);
      }
    } catch (error) {
      toast.error('Failed to save assessment');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!id) {
      toast.error('Please save the assessment first');
      return;
    }

    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    try {
      await api.publishAssessment(id);
      toast.success('Assessment published successfully');
      loadAssessment();
    } catch (error) {
      toast.error('Failed to publish assessment');
    }
  };

  const handleGenerateShareLink = async () => {
    if (!id || !assessment?.is_published) {
      toast.error('Please publish the assessment first');
      return;
    }

    try {
      const response = await api.generateShareLink(id);
      const token = response.data.token;
      const shareUrl = `${window.location.origin}/take/${token}`;

      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate share link');
    }
  };

  const handleAddQuestion = async () => {
    if (!id) {
      toast.error('Please save the assessment first');
      return;
    }

    const newQuestion = {
      question_type: 'single_choice' as QuestionType,
      question_text: 'New question',
      options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
      correct_answer: type === 'quiz' ? 'Option 1' : null,
      points: type === 'quiz' ? 10 : 0,
      order_index: questions.length,
    };

    try {
      await api.addQuestion(id, newQuestion);
      toast.success('Question added');
      loadAssessment();
    } catch (error) {
      toast.error('Failed to add question');
    }
  };

  const handleGenerateFromText = async () => {
    if (!id) {
      toast.error('Please save the assessment first');
      return;
    }

    if (!aiContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      const response = await api.generateQuestionsFromText(id, aiContent, numberOfQuestions);
      const jobId = response.data.jobId;
      toast.info('Generating questions... Please wait');
      pollJobStatus(jobId);
    } catch (error) {
      toast.error('Failed to generate questions');
    }
  };

  const handleGenerateFromFile = async () => {
    if (!id) {
      toast.error('Please save the assessment first');
      return;
    }

    if (!aiFile) {
      toast.error('Please select a file');
      return;
    }

    try {
      const response = await api.generateQuestionsFromFile(id, aiFile, numberOfQuestions);
      const jobId = response.data.jobId;
      toast.info('Processing file... Please wait');
      pollJobStatus(jobId);
    } catch (error) {
      toast.error('Failed to process file');
    }
  };

  const handleGenerateFromUrl = async () => {
    if (!id) {
      toast.error('Please save the assessment first');
      return;
    }

    if (!aiUrl.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    try {
      const response = await api.generateQuestionsFromUrl(id, aiUrl, numberOfQuestions);
      const jobId = response.data.jobId;
      toast.info('Fetching content... Please wait');
      pollJobStatus(jobId);
    } catch (error) {
      toast.error('Failed to fetch URL');
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await api.getJob(jobId);
        const job = response.data;
        setJobStatus(job);

        if (job.status === 'completed') {
          clearInterval(interval);
          toast.success(`${job.result?.count || 0} questions generated successfully!`);
          loadAssessment();
          setAiContent('');
          setAiUrl('');
          setAiFile(null);
        } else if (job.status === 'failed') {
          clearInterval(interval);
          toast.error(`Failed: ${job.error}`);
        }
      } catch (error) {
        clearInterval(interval);
        toast.error('Failed to check job status');
      }
    }, 2000);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      await api.deleteQuestion(questionId);
      toast.success('Question deleted');
      loadAssessment();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {id ? 'Edit Assessment' : 'Create Assessment'}
          </h1>

          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter assessment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter assessment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AssessmentType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="quiz">Quiz (with scoring)</option>
                  <option value="survey">Survey</option>
                  <option value="poll">Poll</option>
                  <option value="assessment">Assessment</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={showResults}
                  onChange={(e) => setShowResults(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Show results to respondents after submission
                </label>
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>

              {id && !assessment?.is_published && (
                <button
                  onClick={handlePublish}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  Publish
                </button>
              )}

              {id && assessment?.is_published && (
                <button
                  onClick={handleGenerateShareLink}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Copy Share Link
                </button>
              )}
            </div>
          </div>

          {id && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Questions</h2>

              <div className="mb-6">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'manual'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'text'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    From Text (AI)
                  </button>
                  <button
                    onClick={() => setActiveTab('file')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'file'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    From File (AI)
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'url'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    From URL (AI)
                  </button>
                </div>

                {activeTab === 'manual' && (
                  <div>
                    <button
                      onClick={handleAddQuestion}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Add Question
                    </button>
                  </div>
                )}

                {activeTab === 'text' && (
                  <div className="space-y-4">
                    <textarea
                      value={aiContent}
                      onChange={(e) => setAiContent(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Paste your content here... AI will generate questions based on this content."
                    />
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of questions
                        </label>
                        <input
                          type="number"
                          value={numberOfQuestions}
                          onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                          min="1"
                          max="50"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleGenerateFromText}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        Generate Questions
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'file' && (
                  <div className="space-y-4">
                    <div>
                      <input
                        type="file"
                        onChange={(e) => setAiFile(e.target.files?.[0] || null)}
                        accept=".txt,.pdf,.doc,.docx,.csv"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of questions
                        </label>
                        <input
                          type="number"
                          value={numberOfQuestions}
                          onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                          min="1"
                          max="50"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleGenerateFromFile}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        Generate Questions
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'url' && (
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={aiUrl}
                      onChange={(e) => setAiUrl(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="https://example.com/article"
                    />
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of questions
                        </label>
                        <input
                          type="number"
                          value={numberOfQuestions}
                          onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 10)}
                          min="1"
                          max="50"
                          className="w-24 px-4 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <button
                        onClick={handleGenerateFromUrl}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                      >
                        Generate Questions
                      </button>
                    </div>
                  </div>
                )}

                {jobStatus && jobStatus.status === 'processing' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <span className="text-blue-800">Processing... Please wait</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900">Q{index + 1}.</span>
                          <span className="text-gray-900">{question.question_text}</span>
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {question.question_type.replace('_', ' ')}
                          </span>
                          {type === 'quiz' && (
                            <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                              {question.points} pts
                            </span>
                          )}
                        </div>
                        {question.options && (
                          <ul className="ml-6 mt-2 space-y-1">
                            {question.options.map((option, i) => (
                              <li key={i} className="text-gray-700 text-sm">• {option}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {questions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No questions yet. Add questions manually or generate them with AI.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAssessment;
