import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { Assessment, Question } from '../types';
import { toast } from 'react-toastify';

const TakeAssessment: React.FC = () => {
  const { token } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [respondentName, setRespondentName] = useState('');
  const [respondentEmail, setRespondentEmail] = useState('');

  useEffect(() => {
    loadAssessment();
  }, [token]);

  const loadAssessment = async () => {
    try {
      const response = await api.getAssessmentByToken(token!);
      setAssessment(response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error('Invalid or expired link');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleMultipleChoiceChange = (questionId: string, option: string, checked: boolean) => {
    const current = answers[questionId] || [];
    if (checked) {
      setAnswers({ ...answers, [questionId]: [...current, option] });
    } else {
      setAnswers({ ...answers, [questionId]: current.filter((o: string) => o !== option) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required questions
    for (const question of questions) {
      if (question.is_required && !answers[question.id]) {
        toast.error(`Please answer: ${question.question_text}`);
        return;
      }
    }

    setSubmitting(true);

    try {
      const response = await api.submitResponse(token!, {
        respondent_name: respondentName,
        respondent_email: respondentEmail,
        answers,
      });

      setResult(response.data);
      setSubmitted(true);
      toast.success('Response submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xl text-gray-700">Invalid or expired link</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    const isScored = assessment?.type === 'quiz' || assessment?.type === 'assessment';
    const hasValidScore = result?.score !== undefined && result?.maxScore !== undefined && !isNaN(result.score) && !isNaN(result.maxScore);

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            {isScored
              ? 'Your response has been submitted successfully.'
              : 'Thank you for taking the time to complete this ' + assessment?.type + '.'}
          </p>

          {isScored && hasValidScore && (
            <div className="bg-blue-50 rounded-xl p-6 mb-6">
              <p className="text-gray-700 mb-2">Your Score</p>
              <p className="text-5xl font-bold text-blue-600 mb-2">
                {result.score} / {result.maxScore}
              </p>
              <p className="text-2xl text-blue-700">
                {((result.score / result.maxScore) * 100).toFixed(0)}%
              </p>
            </div>
          )}

          {!isScored && (
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <p className="text-gray-600">Your feedback has been recorded and will help us improve.</p>
            </div>
          )}

          <p className="text-gray-600">You can now close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{assessment.title}</h1>
          {assessment.description && (
            <p className="text-gray-600 mb-6">{assessment.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
              {assessment.type}
            </span>
            <span>{questions.length} questions</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Information (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>

          {questions.map((question, index) => (
            <div key={question.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="mb-4">
                <div className="flex items-start space-x-2">
                  <span className="font-semibold text-gray-900">Q{index + 1}.</span>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">{question.question_text}</p>
                    {question.is_required && (
                      <span className="text-red-500 text-sm ml-1">*</span>
                    )}
                  </div>
                  {question.points > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {question.points} pts
                    </span>
                  )}
                </div>
              </div>

              {question.question_type === 'single_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name={question.id}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'multiple_choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((option, i) => (
                    <label key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(answers[question.id] || []).includes(option)}
                        onChange={(e) => handleMultipleChoiceChange(question.id, option, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.question_type === 'text' && (
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Type your answer here..."
                />
              )}

              {question.question_type === 'rating' && (
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleAnswerChange(question.id, rating)}
                      className={`w-12 h-12 rounded-lg font-semibold transition ${
                        answers[question.id] === rating
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
              )}

              {question.question_type === 'yes_no' && (
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => handleAnswerChange(question.id, 'Yes')}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      answers[question.id] === 'Yes'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAnswerChange(question.id, 'No')}
                    className={`flex-1 py-3 rounded-lg font-medium transition ${
                      answers[question.id] === 'No'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              )}
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-md p-6">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TakeAssessment;
