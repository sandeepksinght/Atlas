import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';

interface Question {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'short_text' | 'long_text' | 'true_false' | 'rating' | 'email';
  options?: string[];
  required: boolean;
  description?: string;
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
  const [assessment, setAssessment] = useState<Assessment>({
    id: id || 'new',
    title: 'Untitled Assessment',
    description: '',
    questions: [
      {
        id: '1',
        question_text: '',
        question_type: 'multiple_choice',
        options: ['Option 1', 'Option 2'],
        required: false,
      },
    ],
  });

  const currentQuestion = assessment.questions[currentQuestionIndex];

  const questionTypes = [
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '☑️' },
    { value: 'short_text', label: 'Short Text', icon: '📝' },
    { value: 'long_text', label: 'Long Text', icon: '📄' },
    { value: 'true_false', label: 'True/False', icon: '✓✗' },
    { value: 'rating', label: 'Rating', icon: '⭐' },
    { value: 'email', label: 'Email', icon: '📧' },
  ];

  const updateQuestion = (updates: Partial<Question>) => {
    const newQuestions = [...assessment.questions];
    newQuestions[currentQuestionIndex] = { ...currentQuestion, ...updates };
    setAssessment({ ...assessment, questions: newQuestions });
  };

  const addQuestion = (position: 'before' | 'after') => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: '',
      question_type: 'multiple_choice',
      options: ['Option 1', 'Option 2'],
      required: false,
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
                onClick={() => navigate('/dashboard')}
                className="w-full"
                size="sm"
              >
                Save & Exit
              </Button>
              <Button
                variant="secondary"
                onClick={() => {/* TODO: Preview */}}
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
              {/* Multiple Choice */}
              {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 group">
                      <div className="w-6 h-6 rounded-full border-3 border-blue-600 flex-shrink-0" />
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

              {/* True/False */}
              {currentQuestion.question_type === 'true_false' && (
                <div className="space-y-3">
                  {['True', 'False'].map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full border-3 border-blue-600 flex-shrink-0" />
                      <div className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-lg text-gray-700">
                        {option}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rating */}
              {currentQuestion.question_type === 'rating' && (
                <div className="flex items-center justify-center space-x-4 py-8">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div
                      key={num}
                      className="w-14 h-14 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-400"
                    >
                      {num}
                    </div>
                  ))}
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
            </div>

            {/* Required Toggle */}
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
    </div>
  );
};
