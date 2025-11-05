import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { ProjectsSidebar } from './components/layout/ProjectsSidebar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AssessmentsList from './pages/AssessmentsList';
import CreateAssessment from './pages/CreateAssessment';
import ViewResponses from './pages/ViewResponses';
import TakeAssessment from './pages/TakeAssessment';
import { TemplatesGallery } from './pages/TemplatesGallery';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { AssessmentWizard } from './components/wizard/AssessmentWizard';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Help from './pages/Help';
import HowTo from './pages/HowTo';
import Contact from './pages/Contact';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Layout wrapper with sidebar for authenticated routes
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <ProjectsSidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public route for taking assessments - no navbar, no sidebar */}
            <Route path="/take/:token" element={<TakeAssessment />} />

            {/* Public routes with navbar only */}
            <Route path="/" element={<><Navbar /><Landing /></>} />

            {/* Auth routes without navbar - they have their own layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/features" element={<><Navbar /><Features /></>} />
            <Route path="/pricing" element={<><Navbar /><Pricing /></>} />
            <Route path="/about" element={<><Navbar /><About /></>} />
            <Route path="/privacy" element={<><Navbar /><Privacy /></>} />
            <Route path="/terms" element={<><Navbar /><Terms /></>} />
            <Route path="/blog" element={<><Navbar /><Blog /></>} />
            <Route path="/blog/:id" element={<><Navbar /><BlogPost /></>} />
            <Route path="/help" element={<><Navbar /><Help /></>} />
            <Route path="/how-to" element={<><Navbar /><HowTo /></>} />
            <Route path="/contact" element={<><Navbar /><Contact /></>} />

            {/* Protected routes with sidebar */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <Dashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/templates"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <TemplatesGallery />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/wizard"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <AssessmentWizard onComplete={(id) => window.location.href = `/assessments/${id}`} />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <AssessmentsList />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments/create"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CreateAssessment />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments/:id"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <CreateAssessment />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments/:id/responses"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <ViewResponses />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/assessments/:id/analytics"
              element={
                <ProtectedRoute>
                  <AuthenticatedLayout>
                    <AnalyticsDashboard />
                  </AuthenticatedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
