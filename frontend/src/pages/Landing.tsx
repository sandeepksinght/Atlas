import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - TypeForm Style */}
      <section className="pt-32 pb-40 px-4 bg-gradient-to-b from-blue-50/30 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-7xl md:text-8xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            Forms that feel like<br />
            <span className="text-blue-600">conversations</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-16 font-light leading-relaxed max-w-3xl mx-auto">
            Create surveys, quizzes, and assessments powered by AI.<br />Get insights that matter.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {user ? (
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-all font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-10 py-5 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 transition-all font-medium"
                >
                  Get started—it's free
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Value Prop 1 - AI */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-8">
              AI-powered
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Questions that write themselves
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Drop in your content—text, PDFs, or URLs—and watch as AI generates relevant questions in seconds.
              No more staring at blank forms.
            </p>
            <Link to="/features" className="text-blue-600 text-lg font-medium hover:underline">
              Learn more about AI features →
            </Link>
          </div>
          <div className="h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center">
            <svg className="w-32 h-32 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Value Prop 2 - Templates */}
      <section className="py-32 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1 h-96 bg-gradient-to-br from-purple-100 to-purple-200 rounded-3xl flex items-center justify-center">
            <svg className="w-32 h-32 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium mb-8">
              Templates
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              Start with what works
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Browse our gallery of professional templates for HR, education, marketing, and more.
              Click, customize, and launch in minutes.
            </p>
            <Link to="/features" className="text-purple-600 text-lg font-medium hover:underline">
              Explore templates →
            </Link>
          </div>
        </div>
      </section>

      {/* Value Prop 3 - Analytics */}
      <section className="py-32 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium mb-8">
              Analytics
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
              See what matters
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Real-time responses, detailed scores, and beautiful charts.
              Understand your audience at a glance—no spreadsheet detective work required.
            </p>
            <Link to="/features" className="text-green-600 text-lg font-medium hover:underline">
              View analytics features →
            </Link>
          </div>
          <div className="h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-3xl flex items-center justify-center">
            <svg className="w-32 h-32 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-32 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-12 leading-tight">
            Loved by teams everywhere
          </h2>
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">10k+</div>
              <div className="text-xl text-gray-600">Active users</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">500k+</div>
              <div className="text-xl text-gray-600">Assessments created</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-blue-600 mb-2">2M+</div>
              <div className="text-xl text-gray-600">Responses collected</div>
            </div>
          </div>
          <p className="text-2xl text-gray-600 font-light italic">
            "The best form builder we've ever used. Period."
          </p>
        </div>
      </section>

      {/* How It Works - Simplified */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-20 leading-tight">
            How it works
          </h2>
          <div className="space-y-20">
            <div className="text-left">
              <div className="text-7xl font-bold text-blue-100 mb-4">01</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Choose your starting point</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Start from scratch, pick a template, or let AI generate questions from your content.
              </p>
            </div>
            <div className="text-left">
              <div className="text-7xl font-bold text-blue-100 mb-4">02</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Customize everything</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                Drag, drop, edit. Make it yours. Add logic, branding, and personality.
              </p>
            </div>
            <div className="text-left">
              <div className="text-7xl font-bold text-blue-100 mb-4">03</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">Share and analyze</h3>
              <p className="text-xl text-gray-600 leading-relaxed">
                One link. Any device. Watch responses roll in and insights emerge.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-40 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Ready to create?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 font-light">
            It's free to start. No credit card needed.
          </p>
          <Link
            to="/register"
            className="inline-block px-12 py-6 bg-white text-blue-600 text-xl rounded-lg hover:bg-blue-50 transition-all font-medium shadow-xl"
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <span className="text-white font-bold text-2xl">Atlas</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm">
                Create professional assessments, surveys, and quizzes powered by AI.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><Link to="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/templates" className="hover:text-white transition">Templates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3">
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/how-to" className="hover:text-white transition">Guides</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">&copy; 2024 Atlas. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
