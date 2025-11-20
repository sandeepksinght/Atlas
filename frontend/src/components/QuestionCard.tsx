import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  index: number;
  assessmentType: string;
  onUpdate: (questionId: string, data: any) => void;
  onDelete: (questionId: string) => void;
  onDuplicate: (question: Question) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  assessmentType,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [localQuestion, setLocalQuestion] = useState(question);

  const handleBlur = (field: string, value: any) => {
    if (JSON.stringify(question[field as keyof Question]) !== JSON.stringify(value)) {
      onUpdate(question.id, { ...question, [field]: value });
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...(localQuestion.options || [])];
    newOptions[index] = value;
    setLocalQuestion({ ...localQuestion, options: newOptions });
  };

  const handleOptionBlur = () => {
    if (JSON.stringify(question.options) !== JSON.stringify(localQuestion.options)) {
      onUpdate(question.id, { ...question, options: localQuestion.options });
    }
  };

  const addOption = () => {
    const newOptions = [...(localQuestion.options || []), `Option ${(localQuestion.options?.length || 0) + 1}`];
    setLocalQuestion({ ...localQuestion, options: newOptions });
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = localQuestion.options?.filter((_, i) => i !== index) || [];
    setLocalQuestion({ ...localQuestion, options: newOptions });
    onUpdate(question.id, { ...question, options: newOptions });
  };

  const toggleCorrectAnswer = (option: string) => {
    if (assessmentType !== 'quiz') return;

    let newCorrectAnswer;
    if (question.question_type === 'multiple_choice') {
      const current = Array.isArray(question.correct_answer) ? question.correct_answer : [];
      newCorrectAnswer = current.includes(option)
        ? current.filter((a: string) => a !== option)
        : [...current, option];
    } else {
      newCorrectAnswer = question.correct_answer === option ? null : option;
    }

    onUpdate(question.id, { ...question, correct_answer: newCorrectAnswer });
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 border-l-4 border-primary-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-sm font-semibold text-gray-400">Q{index + 1}</span>
            <input
              type="text"
              value={localQuestion.question_text}
              onChange={(e) => setLocalQuestion({ ...localQuestion, question_text: e.target.value })}
              onBlur={(e) => handleBlur('question_text', e.target.value)}
              className="flex-1 text-lg font-medium text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-primary-500 rounded px-2 py-1"
              placeholder="Type your question here..."
            />
          </div>

          {/* Action Buttons (show on hover) */}
          <div className={`flex items-center space-x-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {onMoveUp && (
              <button
                onClick={onMoveUp}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                title="Move up"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={onMoveDown}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                title="Move down"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            <button
              onClick={() => onDuplicate(question)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
              title="Duplicate"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
              title="Delete"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          {/* Question Type Selector */}
          <select
            value={localQuestion.question_type}
            onChange={(e) => {
              const newType = e.target.value;
              setLocalQuestion({ ...localQuestion, question_type: newType as any });
              onUpdate(question.id, { ...question, question_type: newType });
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="single_choice">📻 Single Choice</option>
            <option value="multiple_choice">☑️ Multiple Choice</option>
            <option value="text">✏️ Text Answer</option>
            <option value="rating">⭐ Rating</option>
            <option value="yes_no">✓ Yes/No</option>
          </select>

          <div className="flex items-center space-x-4">
            {/* Points (for quizzes) */}
            {assessmentType === 'quiz' && (
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Points:</label>
                <input
                  type="number"
                  value={localQuestion.points}
                  onChange={(e) => setLocalQuestion({ ...localQuestion, points: parseInt(e.target.value) || 0 })}
                  onBlur={(e) => handleBlur('points', parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500"
                  min="0"
                />
              </div>
            )}

            {/* Required Toggle */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localQuestion.is_required}
                onChange={(e) => {
                  setLocalQuestion({ ...localQuestion, is_required: e.target.checked });
                  onUpdate(question.id, { ...question, is_required: e.target.checked });
                }}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <span className="text-sm text-gray-600">Required</span>
            </label>
          </div>
        </div>

        {/* Options (for choice questions) */}
        {(localQuestion.question_type === 'single_choice' || localQuestion.question_type === 'multiple_choice') && (
          <div className="space-y-3">
            {localQuestion.options?.map((option, i) => (
              <div key={i} className="flex items-center space-x-3 group">
                {/* Correct Answer Checkbox/Radio */}
                {assessmentType === 'quiz' && (
                  <input
                    type={localQuestion.question_type === 'multiple_choice' ? 'checkbox' : 'radio'}
                    name={`correct-${question.id}`}
                    checked={
                      localQuestion.question_type === 'multiple_choice'
                        ? Array.isArray(question.correct_answer) && question.correct_answer.includes(option)
                        : question.correct_answer === option
                    }
                    onChange={() => toggleCorrectAnswer(option)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    title="Mark as correct answer"
                  />
                )}

                {/* Option Input */}
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  onBlur={handleOptionBlur}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder={`Option ${i + 1}`}
                />

                {/* Remove Option Button */}
                <button
                  onClick={() => removeOption(i)}
                  className="p-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add Option Button */}
            <button
              onClick={addOption}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">Add option</span>
            </button>
          </div>
        )}

        {/* Correct Answer Indicator */}
        {assessmentType === 'quiz' && question.correct_answer && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-green-800">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>
                Correct answer:{' '}
                {Array.isArray(question.correct_answer)
                  ? question.correct_answer.join(', ')
                  : question.correct_answer}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;
