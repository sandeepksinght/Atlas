import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { Assessment } from '../types';
import { toast } from 'react-toastify';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  is_system: boolean;
  thumbnail_url: string | null;
  tags: string[];
  usage_count: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assessmentsRes, templatesRes] = await Promise.all([
        api.getAssessments(),
        api.getTemplates(),
      ]);
      setAssessments(assessmentsRes.data);
      setTemplates(templatesRes.data.filter((t: Template) => t.is_system).slice(0, 3));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    try {
      const response = await api.createFromTemplate(templateId);
      const templateData = response.data.template_data;

      const assessmentResponse = await api.createAssessment({
        title: templateData.title,
        description: templateData.description,
        type: templateData.type,
      });

      const assessmentId = assessmentResponse.data.id;

      if (templateData.questions && templateData.questions.length > 0) {
        for (let i = 0; i < templateData.questions.length; i++) {
          const q = templateData.questions[i];
          await api.addQuestion(assessmentId, {
            question_type: q.type,
            question_text: q.text,
            options: q.options || null,
            correct_answer: q.correct_answer || null,
            points: q.points || 0,
            order_index: i,
          });
        }
      }

      toast.success('Assessment created from template!');
      window.location.href = `/assessments/${assessmentId}`;
    } catch (error) {
      console.error('Failed to use template:', error);
      toast.error('Failed to create from template');
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      quiz: 'bg-blue-50 text-blue-700 border-blue-200',
      survey: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      poll: 'bg-purple-50 text-purple-700 border-purple-200',
      assessment: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[type] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Employee Engagement': 'bg-blue-50 text-blue-600',
      'Customer Feedback': 'bg-emerald-50 text-emerald-600',
      'Training & Education': 'bg-purple-50 text-purple-600',
      'Market Research': 'bg-amber-50 text-amber-600',
      'HR & Recruitment': 'bg-pink-50 text-pink-600',
    };
    return colors[category] || 'bg-gray-50 text-gray-600';
  };

  const publishedCount = assessments.filter(a => a.is_published).length;
  const draftCount = assessments.filter(a => !a.is_published).length;
  const thisWeekCount = assessments.filter(a => {
    const createdDate = new Date(a.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return createdDate >= weekAgo;
  }).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name} 👋
          </h1>
          <p className="text-gray-600">Here's your workspace overview</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Assessments */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900">{assessments.length}</p>
                {thisWeekCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    <span className="text-emerald-600 font-semibold">+{thisWeekCount}</span> this week
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Published */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-emerald-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-gray-900">{publishedCount}</p>
                {assessments.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    {Math.round((publishedCount / assessments.length) * 100)}% of total
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Drafts */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-amber-200 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-gray-900">{draftCount}</p>
                {draftCount > 0 && (
                  <p className="text-xs text-gray-500 mt-2">Ready to publish</p>
                )}
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Create New - CTA Card */}
          <Link
            to="/assessments/create"
            className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 rounded-2xl p-6 text-white hover:shadow-xl hover:scale-105 transition-all group"
          >
            <div className="flex items-start justify-between h-full">
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-100 mb-1">Quick Action</p>
                <p className="text-2xl font-bold">Create New</p>
                <p className="text-xs text-blue-100 mt-2">Start from scratch</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick Start Templates */}
        {templates.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Quick Start Templates</h2>
                <p className="text-sm text-gray-600 mt-0.5">Get started quickly with pre-built templates</p>
              </div>
              <Link
                to="/templates"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
              >
                <span>View all</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                  <button
                    onClick={() => handleUseTemplate(template.id)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Recent Assessments */}
          <div className="lg:col-span-2">
            {/* Recent Assessments Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Recent Assessments</h2>
                    <p className="text-sm text-gray-600 mt-0.5">Your latest work</p>
                  </div>
                  <Link
                    to="/assessments"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center space-x-1 group"
                  >
                    <span>View all</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              <div className="p-6">
                {assessments.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-900 font-semibold mb-2">No assessments yet</p>
                    <p className="text-gray-600 text-sm mb-6">Create your first assessment to get started</p>
                    <Link
                      to="/assessments/create"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Assessment
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assessments.slice(0, 5).map((assessment) => (
                      <Link
                        key={assessment.id}
                        to={`/assessments/${assessment.id}`}
                        className="block p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all group"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-blue-700 transition">
                                {assessment.title}
                              </h3>
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium border ${getTypeColor(assessment.type)}`}>
                                {assessment.type}
                              </span>
                            </div>
                            {assessment.description && (
                              <p className="text-sm text-gray-600 line-clamp-1 mb-2">{assessment.description}</p>
                            )}
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
                              </span>
                              {assessment.is_published && (
                                <span className="flex items-center space-x-1 text-emerald-600">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="font-medium">Published</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all ml-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Links & Stats */}
          <div className="space-y-6">
            {/* Quick Links */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  to="/templates"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Browse Templates</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/wizard"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">AI Wizard</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                <Link
                  to="/assessments"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-sm">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">All Assessments</span>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {assessments.filter(a => a.type === 'survey').length}
                    </p>
                    <p className="text-sm text-gray-600">Surveys</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col space-y-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {assessments.filter(a => a.type === 'quiz').length}
                    </p>
                    <p className="text-sm text-gray-600">Quizzes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
