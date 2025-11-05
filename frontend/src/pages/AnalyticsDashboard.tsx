import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface Response {
  id: string;
  score: number;
  max_score: number;
  completed_at: string;
  time_spent_seconds?: number;
}

export const AnalyticsDashboard: React.FC = () => {
  const { id } = useParams();
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResponses();
    }
  }, [id]);

  const loadResponses = async () => {
    try {
      const response = await api.getAssessmentResponses(id!);
      setResponses(response.data);
    } catch (error) {
      console.error('Failed to load responses:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>
    );
  }

  // Calculate statistics
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.score !== null).length;
  const avgScore =
    completedResponses > 0
      ? responses.reduce((sum, r) => sum + (r.score || 0), 0) / completedResponses
      : 0;
  const avgPercentage =
    completedResponses > 0
      ? responses.reduce((sum, r) => {
          const percentage = r.max_score > 0 ? (r.score / r.max_score) * 100 : 0;
          return sum + percentage;
        }, 0) / completedResponses
      : 0;

  // Responses over time
  const responsesByDate = responses.reduce((acc: any, r) => {
    const date = new Date(r.completed_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const responseTrendData = Object.entries(responsesByDate).map(([date, count]) => ({
    date,
    responses: count,
  }));

  // Score distribution
  const scoreDistribution = responses.reduce((acc: any, r) => {
    if (r.score === null) return acc;
    const percentage = r.max_score > 0 ? Math.floor((r.score / r.max_score) * 100) : 0;
    const bucket = Math.floor(percentage / 10) * 10;
    const key = `${bucket}-${bucket + 10}%`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const scoreDistributionData = Object.entries(scoreDistribution).map(([range, count]) => ({
    range,
    count,
  }));

  // Pass/Fail distribution
  const passingScore = 70;
  const passed = responses.filter(r => {
    if (r.score === null || r.max_score === 0) return false;
    return (r.score / r.max_score) * 100 >= passingScore;
  }).length;
  const failed = completedResponses - passed;

  const passFailData = [
    { name: 'Passed', value: passed, color: '#10B981' },
    { name: 'Failed', value: failed, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Detailed insights and statistics for your assessment</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card padding="md">
            <div className="text-sm font-medium text-gray-500">Total Responses</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalResponses}</div>
            <div className="text-sm text-gray-600 mt-1">All submissions</div>
          </Card>

          <Card padding="md">
            <div className="text-sm font-medium text-gray-500">Completion Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">{completedResponses} completed</div>
          </Card>

          <Card padding="md">
            <div className="text-sm font-medium text-gray-500">Average Score</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {avgPercentage.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600 mt-1">{avgScore.toFixed(1)} points avg</div>
          </Card>

          <Card padding="md">
            <div className="text-sm font-medium text-gray-500">Pass Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {completedResponses > 0 ? Math.round((passed / completedResponses) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {passed} of {completedResponses} passed
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Response Trend */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Responses Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ fill: '#6366F1', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Score Distribution */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Pass/Fail Distribution */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pass/Fail Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Recent Responses */}
          <Card padding="md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Responses</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {responses.slice(0, 10).map((response) => (
                <div
                  key={response.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">
                      {new Date(response.completed_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {response.score} / {response.max_score}
                    </div>
                    <div
                      className={`text-xs ${
                        response.max_score > 0 && (response.score / response.max_score) * 100 >= passingScore
                          ? 'text-emerald-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {response.max_score > 0
                        ? `${((response.score / response.max_score) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Export Options */}
        <Card padding="md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
          <div className="flex space-x-4">
            <Button variant="secondary" icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            }>
              Export to CSV
            </Button>
            <Button variant="secondary" icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }>
              Export to PDF
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
