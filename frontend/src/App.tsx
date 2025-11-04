import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AssessmentsList from './pages/AssessmentsList';
import CreateAssessment from './pages/CreateAssessment';
import ViewResponses from './pages/ViewResponses';
import TakeAssessment from './pages/TakeAssessment';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public route for taking assessments - no navbar */}
            <Route path="/take/:token" element={<TakeAssessment />} />

            {/* All other routes with navbar */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/assessments"
                      element={
                        <ProtectedRoute>
                          <AssessmentsList />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/assessments/create"
                      element={
                        <ProtectedRoute>
                          <CreateAssessment />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/assessments/:id"
                      element={
                        <ProtectedRoute>
                          <CreateAssessment />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/assessments/:id/responses"
                      element={
                        <ProtectedRoute>
                          <ViewResponses />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </>
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
