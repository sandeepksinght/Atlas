import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { Response, Assessment, Question } from '../types';
import { toast } from 'react-toastify';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const ViewResponses: React.FC = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);

  // Chat sidebar state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Summary state
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryType, setSummaryType] = useState('overview');
  const [customInstructions, setCustomInstructions] = useState('');
  const [generatedSummary, setGeneratedSummary] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);

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

  const exportToCSV = () => {
    const csvData = responses.map((response, index) => {
      const row: any = {
        'Response #': index + 1,
        'Name': response.respondent_name || 'Anonymous',
        'Email': response.respondent_email || '',
        'Completed At': new Date(response.completed_at).toLocaleString(),
      };

      if (response.score !== undefined) {
        row['Score'] = response.score;
        row['Max Score'] = response.max_score;
        row['Percentage'] = `${((response.score / response.max_score!) * 100).toFixed(0)}%`;
      }

      questions.forEach((question) => {
        const answer = response.answers[question.id];
        row[question.question_text] = Array.isArray(answer) ? answer.join(', ') : answer;
      });

      return row;
    });

    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(v => `"${v}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${assessment?.title || 'responses'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  const exportToExcel = () => {
    const excelData = responses.map((response, index) => {
      const row: any = {
        'Response #': index + 1,
        'Name': response.respondent_name || 'Anonymous',
        'Email': response.respondent_email || '',
        'Completed At': new Date(response.completed_at).toLocaleString(),
      };

      if (response.score !== undefined) {
        row['Score'] = response.score;
        row['Max Score'] = response.max_score;
        row['Percentage'] = ((response.score / response.max_score!) * 100).toFixed(0) + '%';
      }

      questions.forEach((question) => {
        const answer = response.answers[question.id];
        row[question.question_text] = Array.isArray(answer) ? answer.join(', ') : answer;
      });

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Responses');
    XLSX.writeFile(wb, `${assessment?.title || 'responses'}-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel exported successfully');
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: chatInput };
    setChatMessages([...chatMessages, userMessage]);
    setChatInput('');
    setChatLoading(true);

    try {
      const chatHistory = chatMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await api.chatAboutResponses(id!, chatInput, chatHistory);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.data.answer };
      setChatMessages([...chatMessages, userMessage, assistantMessage]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to get response');
      setChatMessages(msgs => msgs.slice(0, -1)); // Remove user message on error
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setGeneratedSummary('');

    try {
      const response = await api.generateResponsesSummary(id!, summaryType, customInstructions);
      setGeneratedSummary(response.data.summary);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const getScoreDistribution = () => {
    if (!assessment || assessment.type !== 'quiz') return [];

    const ranges = [
      { name: '0-20%', count: 0 },
      { name: '21-40%', count: 0 },
      { name: '41-60%', count: 0 },
      { name: '61-80%', count: 0 },
      { name: '81-100%', count: 0 },
    ];

    responses.forEach(r => {
      if (r.score !== undefined && r.max_score !== undefined) {
        const percentage = (r.score / r.max_score) * 100;
        if (percentage <= 20) ranges[0].count++;
        else if (percentage <= 40) ranges[1].count++;
        else if (percentage <= 60) ranges[2].count++;
        else if (percentage <= 80) ranges[3].count++;
        else ranges[4].count++;
      }
    });

    return ranges.filter(r => r.count > 0);
  };

  const getQuestionAnalytics = (question: Question) => {
    const answers: Record<string, number> = {};

    responses.forEach(response => {
      const answer = response.answers[question.id];
      if (answer) {
        if (Array.isArray(answer)) {
          answer.forEach(a => {
            answers[a] = (answers[a] || 0) + 1;
          });
        } else {
          answers[String(answer)] = (answers[String(answer)] || 0) + 1;
        }
      }
    });

    return Object.entries(answers).map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = calculateAverageScore();
  const scoreDistribution = getScoreDistribution();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${chatOpen ? 'mr-96' : ''}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{assessment?.title}</h1>
              <p className="text-gray-600">Analytics and response data</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                disabled={responses.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>CSV</span>
              </button>
              <button
                onClick={exportToExcel}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
                disabled={responses.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Excel</span>
              </button>
              <button
                onClick={() => setShowSummaryModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center space-x-2"
                disabled={responses.length === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Generate Summary</span>
              </button>
              <button
                onClick={() => setChatOpen(!chatOpen)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>AI Chat</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
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

          {/* Analytics Charts */}
          {responses.length > 0 && (
            <>
              {scoreDistribution.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Score Distribution</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Question Analytics */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {questions.slice(0, 4).map((question) => {
                  if (!['single_choice', 'multiple_choice', 'yes_no', 'true_false'].includes(question.question_type)) {
                    return null;
                  }

                  const data = getQuestionAnalytics(question);
                  if (data.length === 0) return null;

                  return (
                    <div key={question.id} className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="font-semibold text-gray-900 mb-4 line-clamp-2">{question.question_text}</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {data.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Responses List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Individual Responses</h2>

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
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition cursor-pointer"
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
                          <p className="text-2xl font-bold text-blue-600">
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
        </div>
      </div>

      {/* Chat Sidebar */}
      {chatOpen && (
        <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-40">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-indigo-600 text-white">
            <h2 className="text-lg font-semibold">AI Response Analyst</h2>
            <button onClick={() => setChatOpen(false)} className="text-white hover:text-gray-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p className="text-sm">Ask questions about your response data</p>
                <p className="text-xs mt-2">Example: "What are the most common answers?"</p>
              </div>
            )}

            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChat()}
                placeholder="Ask about the responses..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={handleChat}
                disabled={chatLoading || !chatInput.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Generate AI Summary</h2>
                <button onClick={() => setShowSummaryModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary Type</label>
                <select
                  value={summaryType}
                  onChange={(e) => setSummaryType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="overview">Overview - General summary of all responses</option>
                  <option value="key-insights">Key Insights - Top 5 important findings</option>
                  <option value="trends">Trends - Patterns and emerging topics</option>
                  <option value="recommendations">Recommendations - Actionable next steps</option>
                  <option value="detailed">Detailed Analysis - Comprehensive breakdown</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Instructions (Optional)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Add specific instructions for the AI to follow..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: "Focus on demographic differences" or "Include statistical analysis"
                </p>
              </div>

              <button
                onClick={handleGenerateSummary}
                disabled={summaryLoading}
                className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {summaryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Summary...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Generate Summary</span>
                  </>
                )}
              </button>

              {generatedSummary && (
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Generated Summary</h3>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">{generatedSummary}</pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSummary);
                      toast.success('Summary copied to clipboard');
                    }}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    Copy to Clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Response Detail Modal */}
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
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-3xl font-bold text-blue-600">
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
  );
};

export default ViewResponses;
