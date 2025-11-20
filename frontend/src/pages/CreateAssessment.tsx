import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { Assessment, Question, AssessmentType, QuestionType } from '../types';
import { toast } from 'react-toastify';
import QuestionCard from '../components/QuestionCard';
import AssessmentSettings from '../components/AssessmentSettings';
import { DraggableQuestionList } from '../components/DraggableQuestionList';
import { StickySaveBar } from '../components/StickySaveBar';

const CreateAssessment: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const questionsContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AssessmentType>('quiz');
  const [showResults, setShowResults] = useState(true);

  // Mark as unsaved when fields change
  const handleTitleChange = (value: string) => {
    setTitle(value);
    setHasUnsavedChanges(true);
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setHasUnsavedChanges(true);
  };

  const handleTypeChange = (value: AssessmentType) => {
    setType(value);
    setHasUnsavedChanges(true);
  };

  const [activeTab, setActiveTab] = useState<'manual' | 'text' | 'file' | 'url'>('manual');
  const [aiContent, setAiContent] = useState('');
  const [aiUrl, setAiUrl] = useState('');
  const [aiFile, setAiFile] = useState<File | null>(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [jobStatus, setJobStatus] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (id) {
      loadAssessment();
    }
  }, [id]);

  // Keyboard shortcut for save (Cmd/Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, description, type, showResults]);

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
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
      } else {
        const response = await api.createAssessment(data);
        const newId = response.data.id;
        toast.success('Assessment created successfully');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
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

      // Try to copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      } catch (clipboardError) {
        // Fallback: show prompt with the link
        prompt('Copy this share link:', shareUrl);
        toast.info('Please copy the link from the dialog');
      }
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
      await loadAssessment();

      // Scroll to questions container after adding
      setTimeout(() => {
        if (questionsContainerRef.current) {
          questionsContainerRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          // Focus on the container for keyboard navigation
          questionsContainerRef.current.focus();
        }
      }, 100);
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

  const handleUpdateQuestion = async (questionId: string, data: any) => {
    try {
      await api.updateQuestion(questionId, data);
      // Update local state without reloading
      setQuestions(questions.map(q => q.id === questionId ? { ...q, ...data } : q));
    } catch (error) {
      toast.error('Failed to update question');
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    if (!id) return;

    try {
      await api.addQuestion(id, {
        question_type: question.question_type,
        question_text: `${question.question_text} (Copy)`,
        options: question.options,
        correct_answer: question.correct_answer,
        points: question.points,
        order_index: questions.length,
      });
      toast.success('Question duplicated');
      loadAssessment();
    } catch (error) {
      toast.error('Failed to duplicate question');
    }
  };

  const handleMoveQuestion = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);

    // Update order on backend
    try {
      await Promise.all(
        newQuestions.map((q, idx) =>
          api.updateQuestion(q.id, { ...q, order_index: idx })
        )
      );
    } catch (error) {
      toast.error('Failed to reorder questions');
      loadAssessment();
    }
  };

  const handleSaveSettings = async (newSettings: any) => {
    if (!id) return;

    try {
      await api.updateAssessment(id, { title, description, settings: newSettings });
      setAssessment({ ...assessment!, settings: newSettings });
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleReorderQuestions = async (reorderedQuestions: Question[]) => {
    setQuestions(reorderedQuestions);
    setHasUnsavedChanges(true);

    // Update order on backend
    try {
      await Promise.all(
        reorderedQuestions.map((q, idx) =>
          api.updateQuestion(q.id, { ...q, order_index: idx })
        )
      );
      toast.success('Questions reordered');
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      toast.error('Failed to update question order');
      loadAssessment(); // Reload to restore original order
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
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter assessment title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter assessment description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as AssessmentType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
              </div>

              <div className="mb-6">
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setActiveTab('manual')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Manual
                  </button>
                  <button
                    onClick={() => setActiveTab('text')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'text'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    From Text (AI)
                  </button>
                  <button
                    onClick={() => setActiveTab('file')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    From File (AI)
                  </button>
                  <button
                    onClick={() => setActiveTab('url')}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === 'url'
                        ? 'bg-blue-600 text-white'
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

              <div ref={questionsContainerRef} tabIndex={-1} className="focus:outline-none">
                {questions.length > 0 ? (
                  <DraggableQuestionList
                    questions={questions}
                    assessmentType={type}
                    onUpdate={handleUpdateQuestion}
                    onDelete={handleDeleteQuestion}
                    onDuplicate={handleDuplicateQuestion}
                    onReorder={handleReorderQuestions}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No questions yet. Add questions manually or generate them with AI.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment Settings Modal */}
      {showSettings && assessment && (
        <AssessmentSettings
          settings={assessment.settings || {}}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Sticky Save Bar */}
      {id && (
        <StickySaveBar
          onSave={handleSave}
          onPublish={handlePublish}
          isSaving={loading}
          isPublished={assessment?.is_published || false}
          hasUnsavedChanges={hasUnsavedChanges}
          lastSaved={lastSaved}
        />
      )}
    </div>
  );
};

export default CreateAssessment;
