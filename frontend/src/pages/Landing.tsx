import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Landing: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Bold Asymmetric Design */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
        {/* Animated Background Orbs */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium">
                ✨ Powered by Advanced AI
              </div>
              <h1 className="text-7xl md:text-8xl font-black text-white mb-8 leading-none">
                Create<br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Smarter
                </span><br />
                Assessments
              </h1>
              <p className="text-2xl text-gray-300 mb-12 leading-relaxed max-w-xl">
                Build surveys, quizzes, and assessments in seconds with AI.
                Get insights that actually matter. No fluff, just results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link
                    to="/dashboard"
                    className="group px-8 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center"
                  >
                    Go to Dashboard
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="group px-8 py-5 bg-white text-gray-900 text-lg font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center"
                    >
                      Start Free Trial
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                    <Link
                      to="/pricing"
                      className="px-8 py-5 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white text-lg font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center"
                    >
                      View Pricing
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-8 flex items-center gap-8 text-white/60 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No credit card
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Free forever plan
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="hidden md:block relative">
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 shadow-2xl">
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl rotate-12 flex items-center justify-center shadow-xl">
                  <span className="text-white text-5xl font-black">AI</span>
                </div>
                <div className="space-y-8 mt-4">
                  <div>
                    <div className="text-5xl font-black text-white mb-2">10,000+</div>
                    <div className="text-gray-300">Active Users</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-white mb-2">500K+</div>
                    <div className="text-gray-300">Assessments Created</div>
                  </div>
                  <div>
                    <div className="text-5xl font-black text-white mb-2">2M+</div>
                    <div className="text-gray-300">Responses Collected</div>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/20">
                  <div className="flex -space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-red-400 border-2 border-white"></div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-white"></div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white"></div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 border-2 border-white"></div>
                  </div>
                  <p className="text-sm text-gray-300 mt-4">Trusted by educators, businesses & researchers worldwide</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Stats */}
      <section className="bg-gray-900 border-y border-gray-800 py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center text-center">
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">99.9%</div>
              <div className="text-gray-500 text-sm mt-1">Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">&lt;2s</div>
              <div className="text-gray-500 text-sm mt-1">Load Time</div>
            </div>
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-pink-400 to-red-400 text-transparent bg-clip-text">150+</div>
              <div className="text-gray-500 text-sm mt-1">Countries</div>
            </div>
            <div>
              <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-teal-400 text-transparent bg-clip-text">4.9★</div>
              <div className="text-gray-500 text-sm mt-1">Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features - Bold Card Grid */}
      <section className="py-32 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-6">
              Built for speed.<br />
              Designed for <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">results</span>.
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to create, share, and analyze assessments—nothing you don't.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Card */}
            <div className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-10 text-white overflow-hidden hover:scale-105 transition-transform shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4">AI Generation</h3>
                <p className="text-blue-100 leading-relaxed mb-6">
                  Drop in your content—text, PDF, or URL. Get intelligent questions in seconds. It's like having a teaching assistant who never sleeps.
                </p>
                <div className="inline-flex items-center text-sm font-bold group-hover:gap-2 transition-all">
                  Learn more
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Templates Card */}
            <div className="group relative bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-10 text-white overflow-hidden hover:scale-105 transition-transform shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4">Pro Templates</h3>
                <p className="text-purple-100 leading-relaxed mb-6">
                  8+ battle-tested templates for every use case. Employee surveys, course quizzes, customer feedback—we've got you covered.
                </p>
                <div className="inline-flex items-center text-sm font-bold group-hover:gap-2 transition-all">
                  Browse gallery
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Analytics Card */}
            <div className="group relative bg-gradient-to-br from-pink-500 to-pink-600 rounded-3xl p-10 text-white overflow-hidden hover:scale-105 transition-transform shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-black mb-4">Live Analytics</h3>
                <p className="text-pink-100 leading-relaxed mb-6">
                  Watch responses roll in real-time. Beautiful charts, detailed breakdowns, and insights you can actually use. No PhD required.
                </p>
                <div className="inline-flex items-center text-sm font-bold group-hover:gap-2 transition-all">
                  See insights
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">🚀</div>
              <h4 className="font-bold text-gray-900 mb-2">Instant Sharing</h4>
              <p className="text-gray-600 text-sm">One-click links. No login needed.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">📁</div>
              <h4 className="font-bold text-gray-900 mb-2">Smart Organization</h4>
              <p className="text-gray-600 text-sm">Projects, folders, favorites.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">✨</div>
              <h4 className="font-bold text-gray-900 mb-2">Drag & Drop</h4>
              <p className="text-gray-600 text-sm">Reorder anything instantly.</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-3">🎨</div>
              <h4 className="font-bold text-gray-900 mb-2">Beautiful UI</h4>
              <p className="text-gray-600 text-sm">Clean, modern, delightful.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Visual Timeline */}
      <section className="py-32 px-4 bg-gray-900 text-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-black mb-6">
              From idea to insights<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">in minutes</span>
            </h2>
          </div>

          <div className="space-y-24">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <div className="inline-block px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-bold mb-6">
                  STEP 1
                </div>
                <h3 className="text-5xl font-black mb-6">Choose your path</h3>
                <p className="text-xl text-gray-400 leading-relaxed mb-6">
                  Start from scratch, pick a template, or upload content for AI to work its magic.
                  Whatever fits your workflow.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Blank canvas for full control
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Professional templates ready to go
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    AI generation from any content
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl h-80 flex items-center justify-center">
                  <span className="text-9xl font-black text-white/20">01</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
              <div className="md:w-1/2">
                <div className="inline-block px-4 py-2 bg-purple-500 text-white rounded-full text-sm font-bold mb-6">
                  STEP 2
                </div>
                <h3 className="text-5xl font-black mb-6">Customize & polish</h3>
                <p className="text-xl text-gray-400 leading-relaxed mb-6">
                  Drag questions around. Tweak the copy. Add your branding.
                  Make it perfect with our intuitive editor.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Drag & drop question reordering
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Multiple question types supported
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Organize in projects & folders
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl h-80 flex items-center justify-center">
                  <span className="text-9xl font-black text-white/20">02</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="md:w-1/2">
                <div className="inline-block px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-bold mb-6">
                  STEP 3
                </div>
                <h3 className="text-5xl font-black mb-6">Share & analyze</h3>
                <p className="text-xl text-gray-400 leading-relaxed mb-6">
                  Generate a shareable link. Watch responses come in real-time.
                  Dive into analytics that actually tell you something useful.
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    One-click shareable links
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Real-time response tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    Beautiful charts & insights
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2">
                <div className="bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl h-80 flex items-center justify-center">
                  <span className="text-9xl font-black text-white/20">03</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-32 px-4 bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <div className="flex justify-center -space-x-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-red-400 border-4 border-white shadow-xl"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-4 border-white shadow-xl"></div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-4 border-white shadow-xl"></div>
            </div>
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </div>
          <blockquote className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
            "This is hands down the best assessment tool we've ever used.
            The AI saves us hours every single week."
          </blockquote>
          <div className="text-white/80 text-xl">
            <div className="font-bold">Sarah Chen</div>
            <div>Head of Learning, TechCorp</div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-white">
        <div className="container mx-auto max-w-5xl text-center">
          <h2 className="text-6xl md:text-7xl font-black text-gray-900 mb-8">
            Ready to build something<br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text">
              amazing?
            </span>
          </h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Join 10,000+ users creating better assessments with Atlas.
            Start free—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
            <Link
              to="/register"
              className="group px-12 py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center"
            >
              Start Free Trial
              <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="px-12 py-6 bg-gray-100 text-gray-900 text-xl font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center justify-center"
            >
              Talk to Sales
            </Link>
          </div>
          <p className="text-gray-500">
            Free plan includes AI generation • 10 assessments/month • Unlimited responses
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-20 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-white font-black text-2xl">A</span>
                </div>
                <span className="text-white font-black text-3xl">Atlas</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-sm mb-6">
                The smartest way to create surveys, quizzes, and assessments. Powered by AI. Built for humans.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/features" className="hover:text-white transition">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition">Pricing</Link></li>
                <li><Link to="/templates" className="hover:text-white transition">Templates</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/blog" className="hover:text-white transition">Blog</Link></li>
                <li><Link to="/help" className="hover:text-white transition">Help Center</Link></li>
                <li><Link to="/how-to" className="hover:text-white transition">Guides</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="hover:text-white transition">About</Link></li>
                <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">&copy; 2024 Atlas. All rights reserved.</p>
            <p className="text-sm text-gray-500">Made with ❤️ for educators, businesses & researchers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
