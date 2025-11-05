import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Check if we're on the landing page
  const isLandingPage = location.pathname === '/';

  // Glassmorphism navbar for landing page
  const navbarClasses = isLandingPage
    ? 'absolute top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10'
    : 'bg-white shadow-sm border-b border-gray-100';

  const linkClasses = isLandingPage
    ? 'text-white/90 hover:text-white font-medium transition'
    : 'text-gray-700 hover:text-blue-600 font-medium transition';

  const logoTextClasses = isLandingPage
    ? 'text-white'
    : 'text-gray-900';

  return (
    <nav className={navbarClasses}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
              <span className="text-white font-black text-xl">A</span>
            </div>
            <span className={`text-2xl font-black ${logoTextClasses}`}>Atlas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!user && (
              <>
                <Link to="/features" className={linkClasses}>
                  Features
                </Link>
                <Link to="/pricing" className={linkClasses}>
                  Pricing
                </Link>
                <Link to="/blog" className={linkClasses}>
                  Blog
                </Link>
                <Link to="/help" className={linkClasses}>
                  Help
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link to="/dashboard" className={linkClasses}>
                  Dashboard
                </Link>
                <Link to="/assessments" className={linkClasses}>
                  Assessments
                </Link>
                <div className="flex items-center space-x-4">
                  <span className={linkClasses}>{user.name}</span>
                  <button
                    onClick={handleLogout}
                    className={isLandingPage
                      ? "px-6 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all font-medium"
                      : "px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                    }
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className={isLandingPage
                    ? "px-6 py-2.5 text-white/90 hover:text-white font-medium transition"
                    : "px-6 py-2.5 text-gray-700 hover:text-blue-600 font-medium transition"
                  }
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={isLandingPage
                    ? "px-6 py-2.5 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl font-bold hover:scale-105 active:scale-95"
                    : "px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-bold hover:scale-105 active:scale-95"
                  }
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg ${isLandingPage ? 'text-white' : 'text-gray-700'}`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 ${isLandingPage ? 'bg-gray-900/90 backdrop-blur-lg' : 'bg-white border-t border-gray-100'}`}>
            {!user && (
              <>
                <Link
                  to="/features"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  to="/pricing"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  to="/blog"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  to="/help"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Help
                </Link>
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/assessments"
                  className={`block py-3 px-4 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Assessments
                </Link>
                <div className="px-4 py-3">
                  <span className={`block mb-2 ${linkClasses}`}>{user.name}</span>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-4 ${isLandingPage
                      ? 'bg-white/10 text-white rounded-xl'
                      : 'bg-gray-100 text-gray-700 rounded-xl'
                    }`}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="px-4 py-3 space-y-2">
                <Link
                  to="/login"
                  className={`block text-center py-2 ${linkClasses}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className={`block text-center py-2 px-4 ${isLandingPage
                    ? 'bg-white text-gray-900 rounded-xl'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl'
                  } font-bold`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
