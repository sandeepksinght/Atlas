import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (email: string, password: string, name: string) =>
  api.post('/api/auth/register', { email, password, name });

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const getProfile = () => api.get('/api/auth/profile');

// Assessments
export const createAssessment = (data: any) =>
  api.post('/api/assessments', data);

export const getAssessments = () => api.get('/api/assessments');

export const getAssessment = (id: string) =>
  api.get(`/api/assessments/${id}`);

export const updateAssessment = (id: string, data: any) =>
  api.put(`/api/assessments/${id}`, data);

export const deleteAssessment = (id: string) =>
  api.delete(`/api/assessments/${id}`);

export const publishAssessment = (id: string) =>
  api.post(`/api/assessments/${id}/publish`);

export const generateShareLink = (id: string, expiresAt?: string) =>
  api.post(`/api/assessments/${id}/share`, { expiresAt });

export const getAssessmentResponses = (id: string) =>
  api.get(`/api/assessments/${id}/responses`);

export const chatAboutResponses = (id: string, question: string, chatHistory?: any[]) =>
  api.post(`/api/assessments/${id}/responses/chat`, { question, chatHistory });

export const generateResponsesSummary = (id: string, summaryType: string, customInstructions?: string, saveToDatabase?: boolean) =>
  api.post(`/api/assessments/${id}/responses/summary`, { summaryType, customInstructions, saveToDatabase });

export const checkExistingSummary = (id: string, summaryType: string) =>
  api.get(`/api/assessments/${id}/responses/summary/check`, { params: { summaryType } });

export const getSummaryVersions = (id: string, summaryType: string) =>
  api.get(`/api/assessments/${id}/responses/summary/versions`, { params: { summaryType } });

export const getAllSummaries = (id: string) =>
  api.get(`/api/assessments/${id}/summaries`);

// Questions
export const addQuestion = (assessmentId: string, data: any) =>
  api.post(`/api/assessments/${assessmentId}/questions`, data);

export const updateQuestion = (id: string, data: any) =>
  api.put(`/api/assessments/questions/${id}`, data);

export const deleteQuestion = (id: string) =>
  api.delete(`/api/assessments/questions/${id}`);

export const generateQuestionsFromText = (assessmentId: string, content: string, numberOfQuestions: number, questionTypes?: string[]) =>
  api.post(`/api/assessments/${assessmentId}/generate-from-text`, { content, numberOfQuestions, questionTypes });

export const generateQuestionsFromFile = (assessmentId: string, file: File, numberOfQuestions: number, extractMode?: boolean, questionTypes?: string[]) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('numberOfQuestions', numberOfQuestions.toString());
  formData.append('extractMode', (extractMode || false).toString());
  if (questionTypes && questionTypes.length > 0) {
    formData.append('questionTypes', JSON.stringify(questionTypes));
  }
  return api.post(`/api/assessments/${assessmentId}/generate-from-file`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const generateQuestionsFromUrl = (assessmentId: string, url: string, numberOfQuestions: number, questionTypes?: string[]) =>
  api.post(`/api/assessments/${assessmentId}/generate-from-url`, { url, numberOfQuestions, questionTypes });

// Public responses
export const getAssessmentByToken = (token: string) =>
  axios.get(`${API_URL}/api/responses/public/${token}`);

export const submitResponse = (token: string, data: any) =>
  axios.post(`${API_URL}/api/responses/public/${token}/submit`, data);

// Jobs
export const getJob = (id: string) => api.get(`/api/jobs/${id}`);

export const getUserJobs = () => api.get('/api/jobs');

// Projects
export const getProjects = () => api.get('/api/projects');

export const getProjectTree = () => api.get('/api/projects/tree');

export const getProject = (id: string) => api.get(`/api/projects/${id}`);

export const createProject = (data: any) => api.post('/api/projects', data);

export const updateProject = (id: string, data: any) => api.put(`/api/projects/${id}`, data);

export const deleteProject = (id: string) => api.delete(`/api/projects/${id}`);

export const archiveProject = (id: string) => api.post(`/api/projects/${id}/archive`);

export const toggleProjectStar = (id: string) => api.post(`/api/projects/${id}/star`);

// Templates
export const getTemplates = () => api.get('/api/templates');

export const getTemplatesByCategory = (category: string) =>
  api.get(`/api/templates/category/${category}`);

export const getTemplate = (id: string) => api.get(`/api/templates/${id}`);

export const createTemplate = (data: any) => api.post('/api/templates', data);

export const updateTemplate = (id: string, data: any) => api.put(`/api/templates/${id}`, data);

export const deleteTemplate = (id: string) => api.delete(`/api/templates/${id}`);

export const searchTemplates = (query: string) =>
  api.get(`/api/templates/search?q=${encodeURIComponent(query)}`);

export const getPopularTemplates = (limit?: number) =>
  api.get(`/api/templates/popular${limit ? `?limit=${limit}` : ''}`);

export const createFromTemplate = (id: string) => api.post(`/api/templates/${id}/use`);

// Contact
export const sendContactMessage = (data: { name: string; email: string; subject: string; message: string }) =>
  api.post('/api/contact', data);

// Live Game
export const createGameSession = (data: { assessment_id?: string; title: string; settings?: any }) =>
  api.post('/api/game/create', data);

export const getGameSession = (id: string) => api.get(`/api/game/session/${id}`);

export const joinGameByPin = (pin: string) => api.get(`/api/game/join/${pin}`);

export const getGameParticipants = (sessionId: string) =>
  api.get(`/api/game/session/${sessionId}/participants`);

export const getGameLeaderboard = (sessionId: string) =>
  api.get(`/api/game/session/${sessionId}/leaderboard`);

export default api;
