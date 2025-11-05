import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { ProjectSelector } from './ProjectSelector';
import { toast } from 'react-toastify';
import * as api from '../../services/api';

interface Question {
  id: string;
  question_text: string;
  question_type:
    | 'short_text'
    | 'long_text'
    | 'email'
    | 'phone'
    | 'number'
    | 'url'
    | 'date'
    | 'multiple_choice'
    | 'single_choice'
    | 'dropdown'
    | 'yes_no'
    | 'true_false'
    | 'rating'
    | 'opinion_scale'
    | 'statement';
  options?: string[];
  required: boolean;
  description?: string;
  min?: number;
  max?: number;
  correct_answer?: string | string[] | number | boolean | null;
  points?: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export const TypeFormEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState<Assessment>({
    id: id || 'new',
    title: 'Untitled Assessment',
    description: '',
    questions: [
      {
        id: '1',
        question_text: '',
        question_type: 'short_text',
        required: false,
        points: 100,
        correct_answer: null,
      },
    ],
  });

  const currentQuestion = assessment.questions[currentQuestionIndex];

  // Load existing assessment
  useEffect(() => {
    if (id && id !== 'new') {
      loadAssessment();
    }
  }, [id]);

  const loadAssessment = async () => {
    try {
      const response = await api.getAssessment(id!);
      const data = response.data;

      // Parse questions and ensure correct_answer and points are set
      const loadedQuestions = (data.questions || []).map((q: any) => ({
        id: q.id.toString(),
        question_text: q.question_text,
        question_type: q.question_type,
        description: q.description,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        correct_answer: q.correct_answer ? (typeof q.correct_answer === 'string' ? JSON.parse(q.correct_answer) : q.correct_answer) : null,
        points: q.points || 100,
        required: q.is_required || false,
        min: q.min,
        max: q.max,
      }));

      setAssessment({
        id: data.id.toString(),
        title: data.title,
        description: data.description,
        questions: loadedQuestions.length > 0 ? loadedQuestions : assessment.questions,
      });
    } catch (error) {
      console.error('Failed to load assessment:', error);
      toast.error('Failed to load assessment');
    }
  };

  const questionTypes = [
    { value: 'short_text', label: 'Short Text', icon: '📝', category: 'Text' },
    { value: 'long_text', label: 'Long Text', icon: '📄', category: 'Text' },
    { value: 'email', label: 'Email', icon: '📧', category: 'Contact' },
    { value: 'phone', label: 'Phone Number', icon: '📱', category: 'Contact' },
    { value: 'url', label: 'Website', icon: '🔗', category: 'Contact' },
    { value: 'number', label: 'Number', icon: '🔢', category: 'Number' },
    { value: 'date', label: 'Date', icon: '📅', category: 'Date' },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️', category: 'Choice' },
    { value: 'single_choice', label: 'Single Choice', icon: '⭕', category: 'Choice' },
    { value: 'dropdown', label: 'Dropdown', icon: '▼', category: 'Choice' },
    { value: 'yes_no', label: 'Yes/No', icon: '✓✗', category: 'Choice' },
    { value: 'true_false', label: 'True/False', icon: '✓✗', category: 'Choice' },
    { value: 'rating', label: 'Rating', icon: '⭐', category: 'Rating' },
    { value: 'opinion_scale', label: 'Opinion Scale', icon: '📊', category: 'Rating' },
    { value: 'statement', label: 'Statement', icon: '💬', category: 'Content' },
  ];

  const updateQuestion = (updates: Partial<Question>) => {
    const newQuestions = [...assessment.questions];
    let updatedQuestion = { ...currentQuestion, ...updates };

    // Handle question type change - set appropriate defaults
    if (updates.question_type && updates.question_type !== currentQuestion.question_type) {
      const needsOptions = ['multiple_choice', 'single_choice', 'dropdown'].includes(updates.question_type);
      if (needsOptions && !updatedQuestion.options) {
        updatedQuestion.options = ['Option 1', 'Option 2'];
      } else if (!needsOptions) {
        delete updatedQuestion.options;
      }

      // Set defaults for opinion scale and rating
      if (updates.question_type === 'opinion_scale') {
        updatedQuestion.min = updatedQuestion.min || 1;
        updatedQuestion.max = updatedQuestion.max || 10;
      } else if (updates.question_type === 'rating') {
        updatedQuestion.max = updatedQuestion.max || 5;
      }
    }

    newQuestions[currentQuestionIndex] = updatedQuestion;
    setAssessment({ ...assessment, questions: newQuestions });
  };

  const addQuestion = (position: 'before' | 'after') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: '',
      question_type: 'short_text',
      required: false,
      points: 100,
      correct_answer: null,
    };

    const newQuestions = [...assessment.questions];
    const insertIndex = position === 'before' ? currentQuestionIndex : currentQuestionIndex + 1;
    newQuestions.splice(insertIndex, 0, newQuestion);
    setAssessment({ ...assessment, questions: newQuestions });
    setCurrentQuestionIndex(insertIndex);
  };

  const deleteQuestion = () => {
    if (assessment.questions.length === 1) return; // Keep at least one question
    const newQuestions = assessment.questions.filter((_, i) => i !== currentQuestionIndex);
    setAssessment({ ...assessment, questions: newQuestions });
    if (currentQuestionIndex >= newQuestions.length) {
      setCurrentQuestionIndex(newQuestions.length - 1);
    }
  };

  const addOption = () => {
    if (currentQuestion.options) {
      updateQuestion({ options: [...currentQuestion.options, `Option ${currentQuestion.options.length + 1}`] });
    }
  };

  const updateOption = (index: number, value: string) => {
    if (currentQuestion.options) {
      const newOptions = [...currentQuestion.options];
      newOptions[index] = value;
      updateQuestion({ options: newOptions });
    }
  };

  const deleteOption = (index: number) => {
    if (currentQuestion.options && currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      updateQuestion({ options: newOptions });
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (currentQuestionIndex < assessment.questions.length - 1)
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, assessment.questions.length]);

  const handleSaveAndExit = () => {
    setShowProjectSelector(true);
  };

  const handleProjectSelected = async (projectId: string) => {
    setSaving(true);
    try {
      // Create or update assessment
      const assessmentData = {
        title: assessment.title,
        description: assessment.description,
        type: 'survey',
        settings: {},
        project_id: projectId,
      };

      let assessmentId = assessment.id;
      if (assessment.id === 'new') {
        const response = await api.createAssessment(assessmentData);
        assessmentId = response.data.id;
      } else {
        await api.updateAssessment(assessment.id, assessmentData);
      }

      // Save questions
      for (const question of assessment.questions) {
        const questionData = {
          question_type: question.question_type,
          question_text: question.question_text,
          description: question.description,
          options: question.options ? JSON.stringify(question.options) : null,
          correct_answer: question.correct_answer ? JSON.stringify(question.correct_answer) : null,
          points: question.points || 100,
          order_index: assessment.questions.indexOf(question),
          is_required: question.required,
        };

        // If question has a numeric ID (existing question), update it, otherwise add new
        if (question.id && !isNaN(Number(question.id))) {
          await api.updateQuestion(question.id, questionData);
        } else {
          await api.addQuestion(assessmentId, questionData);
        }
      }

      toast.success('Assessment saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast.error('Failed to save assessment');
    } finally {
      setSaving(false);
      setShowProjectSelector(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden flex">
      {/* Sidebar */}
      <div
        className={cn(
          'bg-white shadow-2xl transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-80' : 'w-0'
        )}
      >
        {sidebarOpen && (
          <div className="flex-1 flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Questions</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={assessment.title}
                onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Assessment title..."
              />
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {assessment.questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all group',
                    currentQuestionIndex === index
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                  )}
                >
                  <div className="flex items-start">
                    <span className="text-xs font-semibold text-gray-500 mr-2 mt-0.5">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {question.question_text || 'Untitled question'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 capitalize">
                        {question.question_type.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => addQuestion('after')}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-all"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm font-medium">Add Question</span>
                </div>
              </button>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <Button
                onClick={handleSaveAndExit}
                className="w-full"
                size="sm"
                loading={saving}
              >
                Save & Exit
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPreviewMode(true)}
                className="w-full"
                size="sm"
              >
                Preview
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Toolbar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                Questions
              </div>
            </button>
          )}

          <div className="flex-1" />

          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow-md">
              {currentQuestionIndex + 1} / {assessment.questions.length}
            </div>
            {!rightSidebarOpen && (
              <button
                onClick={() => setRightSidebarOpen(true)}
                className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all text-gray-700 font-medium"
                title="Show question settings"
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Question Editor - Full Screen */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-3xl">
            {/* Question Number & Type Selector */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {currentQuestionIndex + 1}
                </div>
                <select
                  value={currentQuestion.question_type}
                  onChange={(e) => updateQuestion({ question_type: e.target.value as any })}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-gray-700 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  {questionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={deleteQuestion}
                  disabled={assessment.questions.length === 1}
                  className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Delete question"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="mb-8">
              <textarea
                value={currentQuestion.question_text}
                onChange={(e) => updateQuestion({ question_text: e.target.value })}
                placeholder="Type your question here..."
                rows={2}
                className="w-full text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 resize-none placeholder-gray-300"
                style={{ lineHeight: '1.2' }}
              />
              <input
                type="text"
                value={currentQuestion.description || ''}
                onChange={(e) => updateQuestion({ description: e.target.value })}
                placeholder="Add a description (optional)"
                className="w-full mt-4 text-lg text-gray-600 bg-transparent border-none focus:outline-none focus:ring-0 placeholder-gray-300"
              />
            </div>

            {/* Question Type Specific Content */}
            <div className="space-y-4">
              {/* Short Text */}
              {currentQuestion.question_type === 'short_text' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="Short answer text"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* Long Text */}
              {currentQuestion.question_type === 'long_text' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <textarea
                    placeholder="Long answer text..."
                    rows={4}
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Email */}
              {currentQuestion.question_type === 'email' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="email"
                    placeholder="name@example.com"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* Phone */}
              {currentQuestion.question_type === 'phone' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* Number */}
              {currentQuestion.question_type === 'number' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="number"
                    placeholder="Enter a number"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* URL */}
              {currentQuestion.question_type === 'url' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* Date */}
              {currentQuestion.question_type === 'date' && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <input
                    type="date"
                    disabled
                    className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none"
                  />
                </div>
              )}

              {/* Multiple Choice (Checkboxes) */}
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-6 h-6 rounded border-2 border-blue-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder={`Option ${index + 1}`}
                      />
                      {currentQuestion.options!.length > 2 && (
                        <button
                          onClick={() => deleteOption(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <div className="w-6 h-6 rounded border-2 border-dashed border-blue-400 flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>Add option</span>
                  </button>
                </div>
              )}

              {/* Single Choice (Radio Buttons) */}
              {currentQuestion.question_type === 'single_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex-shrink-0" />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder={`Option ${index + 1}`}
                      />
                      {currentQuestion.options!.length > 2 && (
                        <button
                          onClick={() => deleteOption(index)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addOption}
                    className="flex items-center space-x-3 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <div className="w-6 h-6 rounded-full border-2 border-dashed border-blue-400 flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span>Add option</span>
                  </button>
                </div>
              )}

              {/* Dropdown */}
              {currentQuestion.question_type === 'dropdown' && currentQuestion.options && (
                <div className="space-y-3">
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <select disabled className="w-full text-lg text-gray-400 bg-transparent border-none focus:outline-none">
                      <option>Select an option...</option>
                      {currentQuestion.options.map((opt, i) => (
                        <option key={i}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="pl-4 space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-3 group">
                        <span className="text-sm text-gray-500">{index + 1}.</span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                          placeholder={`Option ${index + 1}`}
                        />
                        {currentQuestion.options!.length > 2 && (
                          <button
                            onClick={() => deleteOption(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addOption}
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add option</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Yes/No */}
              {currentQuestion.question_type === 'yes_no' && (
                <div className="space-y-3">
                  {['Yes', 'No'].map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex-shrink-0" />
                      <div className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg text-gray-700">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* True/False */}
              {currentQuestion.question_type === 'true_false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-2 border-blue-600 flex-shrink-0" />
                      <div className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg text-gray-700">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating */}
              {currentQuestion.question_type === 'rating' && (
                <div>
                  <div className="flex items-center justify-center space-x-4 py-8">
                    {Array.from({ length: currentQuestion.max || 5 }, (_, i) => i + 1).map((num) => (
                      <div
                        key={num}
                        className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400"
                      >
                        ⭐
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <label className="text-sm text-gray-600">Stars:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={currentQuestion.max || 5}
                      onChange={(e) => updateQuestion({ max: parseInt(e.target.value) || 5 })}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg text-center"
                    />
                  </div>
                </div>
              )}

              {/* Opinion Scale */}
              {currentQuestion.question_type === 'opinion_scale' && (
                <div>
                  <div className="flex items-center justify-center space-x-2 py-8">
                    {Array.from(
                      { length: (currentQuestion.max || 10) - (currentQuestion.min || 1) + 1 },
                      (_, i) => (currentQuestion.min || 1) + i
                    ).map((num) => (
                      <div
                        key={num}
                        className="w-12 h-12 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center text-lg font-bold text-gray-400"
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Min:</label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={currentQuestion.min || 1}
                        onChange={(e) => updateQuestion({ min: parseInt(e.target.value) || 1 })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Max:</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={currentQuestion.max || 10}
                        onChange={(e) => updateQuestion({ max: parseInt(e.target.value) || 10 })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Statement (No input) */}
              {currentQuestion.question_type === 'statement' && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500 italic">
                    This is an informational statement. No response required.
                  </p>
                </div>
              )}
            </div>

            {/* Required Toggle - Hide for statement type */}
            {currentQuestion.question_type !== 'statement' && (
              <div className="mt-8 flex items-center justify-between">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentQuestion.required}
                    onChange={(e) => updateQuestion({ required: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">Required</span>
                </label>
              </div>
            )}

            {/* Navigation Arrows */}
            <div className="flex items-center justify-center space-x-4 mt-12">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={() => addQuestion('after')}
                className="px-6 py-3 bg-blue-600 text-white rounded-full shadow-md hover:shadow-lg hover:bg-blue-700 transition-all font-medium"
              >
                + Add Question
              </button>

              <button
                onClick={() =>
                  setCurrentQuestionIndex(
                    Math.min(assessment.questions.length - 1, currentQuestionIndex + 1)
                  )
                }
                disabled={currentQuestionIndex === assessment.questions.length - 1}
                className="p-3 bg-white rounded-full shadow-md hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Keyboard Hints */}
            <div className="mt-8 text-center text-sm text-gray-400">
              Use <kbd className="px-2 py-1 bg-white rounded shadow">⌘</kbd> +{' '}
              <kbd className="px-2 py-1 bg-white rounded shadow">↑</kbd> /{' '}
              <kbd className="px-2 py-1 bg-white rounded shadow">↓</kbd> to navigate
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Question Settings */}
      <div
        className={cn(
          'bg-white shadow-2xl transition-all duration-300 flex flex-col border-l border-gray-200',
          rightSidebarOpen ? 'w-80' : 'w-0'
        )}
      >
        {rightSidebarOpen && (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Question Settings</h2>
                <button
                  onClick={() => setRightSidebarOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Points Setting */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={currentQuestion.points || 100}
                  onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 100 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
                <p className="text-xs text-gray-500 mt-1">Points awarded for correct answer</p>
              </div>

              {/* Correct Answer Settings - Only for quiz-compatible question types */}
              {['single_choice', 'multiple_choice', 'dropdown', 'yes_no', 'true_false'].includes(currentQuestion.question_type) && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Correct Answer
                  </label>

                  {/* Single Choice, Dropdown, Yes/No, True/False - Single selection */}
                  {['single_choice', 'dropdown', 'yes_no', 'true_false'].includes(currentQuestion.question_type) && (
                    <div className="space-y-2">
                      {(currentQuestion.question_type === 'yes_no' ? ['Yes', 'No'] :
                        currentQuestion.question_type === 'true_false' ? ['True', 'False'] :
                        currentQuestion.options || []).map((option, index) => (
                        <label
                          key={index}
                          className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                          style={{
                            borderColor: currentQuestion.correct_answer === option ? '#3b82f6' : '#e5e7eb',
                            backgroundColor: currentQuestion.correct_answer === option ? '#eff6ff' : 'white'
                          }}
                        >
                          <input
                            type="radio"
                            name="correct-answer"
                            checked={currentQuestion.correct_answer === option}
                            onChange={() => updateQuestion({ correct_answer: option })}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="text-sm text-gray-700 flex-1">{option}</span>
                          {currentQuestion.correct_answer === option && (
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Multiple Choice - Multiple selection */}
                  {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option, index) => {
                        const correctAnswers = Array.isArray(currentQuestion.correct_answer) ? currentQuestion.correct_answer : [];
                        const isChecked = correctAnswers.includes(option);

                        return (
                          <label
                            key={index}
                            className="flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50"
                            style={{
                              borderColor: isChecked ? '#3b82f6' : '#e5e7eb',
                              backgroundColor: isChecked ? '#eff6ff' : 'white'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const newAnswers = e.target.checked
                                  ? [...correctAnswers, option]
                                  : correctAnswers.filter((a) => a !== option);
                                updateQuestion({ correct_answer: newAnswers });
                              }}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <span className="text-sm text-gray-700 flex-1">{option}</span>
                            {isChecked && (
                              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {currentQuestion.question_type === 'multiple_choice'
                      ? 'Select all correct answers'
                      : 'Select the correct answer'}
                  </p>
                </div>
              )}

              {/* Info for non-quiz question types */}
              {!['single_choice', 'multiple_choice', 'dropdown', 'yes_no', 'true_false'].includes(currentQuestion.question_type) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-blue-900">Not a quiz question</p>
                      <p className="text-xs text-blue-700 mt-1">
                        This question type cannot be auto-scored in live games. Only choice-based questions support scoring.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quiz Mode Info */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-purple-900">Live Game Scoring</p>
                    <p className="text-xs text-purple-700 mt-1">
                      Points are calculated based on correctness + speed. Faster correct answers earn bonus points!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
                {assessment.description && (
                  <p className="text-gray-600 mt-1">{assessment.description}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewMode(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Questions */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {assessment.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-200 pb-8 last:border-0">
                  <div className="flex items-start space-x-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {question.question_text || 'Untitled question'}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      {question.description && (
                        <p className="text-gray-600 text-sm mt-1">{question.description}</p>
                      )}
                    </div>
                  </div>

                  <div className="ml-11">
                    {/* Text inputs */}
                    {['short_text', 'email', 'phone', 'url', 'number'].includes(question.question_type) && (
                      <input
                        type={question.question_type === 'email' ? 'email' : question.question_type === 'phone' ? 'tel' : question.question_type === 'url' ? 'url' : question.question_type === 'number' ? 'number' : 'text'}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder={
                          question.question_type === 'email' ? 'name@example.com' :
                          question.question_type === 'phone' ? '+1 (555) 000-0000' :
                          question.question_type === 'url' ? 'https://example.com' :
                          question.question_type === 'number' ? 'Enter a number' :
                          'Your answer...'
                        }
                        disabled
                      />
                    )}

                    {/* Long text */}
                    {question.question_type === 'long_text' && (
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="Your answer..."
                        disabled
                      />
                    )}

                    {/* Date */}
                    {question.question_type === 'date' && (
                      <input type="date" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" disabled />
                    )}

                    {/* Multiple choice */}
                    {question.question_type === 'multiple_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" disabled />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Single choice */}
                    {question.question_type === 'single_choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, i) => (
                          <label key={i} className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input type="radio" name={`q-${question.id}`} className="w-5 h-5 text-blue-600" disabled />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Dropdown */}
                    {question.question_type === 'dropdown' && question.options && (
                      <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg" disabled>
                        <option>Select an option...</option>
                        {question.options.map((option, i) => (
                          <option key={i}>{option}</option>
                        ))}
                      </select>
                    )}

                    {/* Yes/No */}
                    {question.question_type === 'yes_no' && (
                      <div className="flex space-x-4">
                        {['Yes', 'No'].map((option) => (
                          <button
                            key={option}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            disabled
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* True/False */}
                    {question.question_type === 'true_false' && (
                      <div className="flex space-x-4">
                        {['True', 'False'].map((option) => (
                          <button
                            key={option}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                            disabled
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Rating */}
                    {question.question_type === 'rating' && (
                      <div className="flex items-center justify-center space-x-3 py-4">
                        {Array.from({ length: question.max || 5 }, (_, i) => i + 1).map((num) => (
                          <button
                            key={num}
                            className="w-12 h-12 text-2xl hover:scale-110 transition-transform"
                            disabled
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Opinion Scale */}
                    {question.question_type === 'opinion_scale' && (
                      <div className="flex items-center justify-between space-x-1">
                        {Array.from(
                          { length: (question.max || 10) - (question.min || 1) + 1 },
                          (_, i) => (question.min || 1) + i
                        ).map((num) => (
                          <button
                            key={num}
                            className="flex-1 px-3 py-3 border-2 border-gray-300 rounded-lg hover:bg-blue-50 font-semibold"
                            disabled
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Statement */}
                    {question.question_type === 'statement' && (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center text-gray-600 italic">
                        This is an informational statement.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => setPreviewMode(false)}>
                Close Preview
              </Button>
              <Button onClick={handleSaveAndExit} loading={saving}>
                Save & Exit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Project Selector Modal */}
      {showProjectSelector && (
        <ProjectSelector
          onSelect={handleProjectSelected}
          onClose={() => setShowProjectSelector(false)}
        />
      )}
    </div>
  );
};
