import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { Response, Assessment, Question } from '../types';
import { toast } from 'react-toastify';

const ViewResponses: React.FC = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assessmentRes, responsesRes] = await Promise.all([
        api.getAssessment(id!),
        api.getAssessmentResponses(id!),
      ]);

      setAssessment(assessmentRes.data);
      setQuestions(assessmentRes.data.questions || []);
      setResponses(responsesRes.data);
    } catch (error) {
      toast.error('Failed to load responses');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionById = (questionId: string) => {
    return questions.find((q) => q.id === questionId);
  };

  const calculateAverageScore = () => {
    if (responses.length === 0 || assessment?.type !== 'quiz') return null;

    const total = responses.reduce((sum, r) => sum + (r.score || 0), 0);
    const maxTotal = responses.reduce((sum, r) => sum + (r.max_score || 0), 0);

    return {
      average: (total / responses.length).toFixed(1),
      percentage: ((total / maxTotal) * 100).toFixed(1),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const stats = calculateAverageScore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{assessment?.title}</h1>
          <p className="text-gray-600">View all responses and detailed analytics</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p className="text-gray-600 text-sm">Total Responses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{responses.length}</p>
          </div>

          {stats && (
            <>
              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.average}</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <p className="text-gray-600 text-sm">Average Percentage</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.percentage}%</p>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Responses</h2>

          {responses.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-600">No responses yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition cursor-pointer"
                  onClick={() => setSelectedResponse(response)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Response #{index + 1}
                        {response.respondent_name && ` - ${response.respondent_name}`}
                      </p>
                      {response.respondent_email && (
                        <p className="text-sm text-gray-600">{response.respondent_email}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(response.completed_at).toLocaleString()}
                      </p>
                    </div>
                    {response.score !== undefined && response.max_score !== undefined && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary-600">
                          {response.score}/{response.max_score}
                        </p>
                        <p className="text-sm text-gray-600">
                          {((response.score / response.max_score) * 100).toFixed(0)}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedResponse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Response Details</h3>
                  {selectedResponse.respondent_name && (
                    <p className="text-gray-600 mt-1">{selectedResponse.respondent_name}</p>
                  )}
                  {selectedResponse.respondent_email && (
                    <p className="text-sm text-gray-600">{selectedResponse.respondent_email}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedResponse.score !== undefined && (
                <div className="mb-6 p-4 bg-primary-50 rounded-lg">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-3xl font-bold text-primary-600">
                    {selectedResponse.score} / {selectedResponse.max_score}
                    <span className="text-lg ml-2">
                      ({((selectedResponse.score / selectedResponse.max_score!) * 100).toFixed(0)}%)
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {Object.entries(selectedResponse.answers).map(([questionId, answer]) => {
                  const question = getQuestionById(questionId);
                  if (!question) return null;

                  return (
                    <div key={questionId} className="border-b border-gray-200 pb-4">
                      <p className="font-semibold text-gray-900 mb-2">{question.question_text}</p>
                      <div className="ml-4">
                        {Array.isArray(answer) ? (
                          <ul className="list-disc list-inside">
                            {answer.map((a, i) => (
                              <li key={i} className="text-gray-700">{a}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{answer}</p>
                        )}
                      </div>
                      {question.correct_answer && (
                        <p className="text-sm text-gray-600 mt-2 ml-4">
                          Correct answer: {Array.isArray(question.correct_answer)
                            ? question.correct_answer.join(', ')
                            : question.correct_answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedResponse(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewResponses;
