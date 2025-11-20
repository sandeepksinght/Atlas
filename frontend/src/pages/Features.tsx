import React from 'react';
import { Link } from 'react-router-dom';

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Everything you need.<br />
            <span className="text-blue-600">Nothing you don't.</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
            Powerful features designed to help you create, share, and analyze assessments effortlessly.
          </p>
        </div>
      </section>

      {/* Feature 1 - AI Generation */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
              AI-Powered
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Questions that write themselves
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Upload a PDF, paste text, or share a URL. Our AI instantly generates relevant questions
              that match your content perfectly. Save hours of manual work.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Generate from PDFs, Word docs, and text files</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Extract content from any website URL</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Control difficulty, question types, and count</span>
              </li>
            </ul>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="AI-powered question generation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
          </div>
        </div>
      </section>

      {/* Feature 2 - Templates */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/6476589/pexels-photo-6476589.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Professional templates library"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20"></div>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium mb-6">
              Templates
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Start with proven templates
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Choose from professionally designed templates for every use case. HR onboarding,
              customer feedback, training assessments, and more.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">8+</div>
                <div className="text-sm text-gray-600">System Templates</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-gray-900 mb-1">∞</div>
                <div className="text-sm text-gray-600">Custom Templates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature 3 - Drag & Drop */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium mb-6">
              Intuitive Design
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Organize with a simple drag
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Reorder questions instantly with drag-and-drop. No more clicking arrows 50 times.
              Just grab, move, and you're done.
            </p>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Intuitive drag handles</span>
              </div>
              <div className="flex items-center p-4 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                </div>
                <span className="text-gray-700 font-medium">Auto-save reordering</span>
              </div>
            </div>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Drag and drop interface"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20"></div>
          </div>
        </div>
      </section>

      {/* Feature 4 - Analytics */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Analytics dashboard and insights"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20"></div>
          </div>
          <div className="order-1 md:order-2">
            <div className="inline-block px-4 py-2 bg-orange-600 text-white rounded-full text-sm font-medium mb-6">
              Analytics
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Insights that matter
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Beautiful charts and dashboards show you exactly what you need to know.
              Track completion rates, identify problem questions, and export everything.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Real-time response tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Interactive charts and graphs</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-orange-600 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Export to CSV, PDF, and more</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature 5 - Projects */}
      <section className="py-20 px-4 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium mb-6">
              Organization
            </div>
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Keep everything organized
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Create projects and folders to organize your assessments. Star your favorites,
              archive old ones, and find anything in seconds.
            </p>
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-600 mr-3"></div>
                <span className="text-gray-700 font-medium">Marketing Surveys</span>
              </div>
              <div className="flex items-center mb-4 ml-6">
                <div className="w-3 h-3 rounded-full bg-green-600 mr-3"></div>
                <span className="text-gray-700 font-medium">Q1 Feedback</span>
              </div>
              <div className="flex items-center ml-6">
                <div className="w-3 h-3 rounded-full bg-purple-600 mr-3"></div>
                <span className="text-gray-700 font-medium">Employee NPS</span>
              </div>
            </div>
          </div>
          <div className="relative h-96 rounded-3xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/7567443/pexels-photo-7567443.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Project organization and folders"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20"></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-bold text-gray-900 mb-8">
            Ready to get started?
          </h2>
          <p className="text-2xl text-gray-600 mb-12">
            Create your first assessment in minutes. No credit card required.
          </p>
          <Link
            to="/register"
            className="inline-block px-10 py-5 bg-blue-600 text-white text-xl rounded-2xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Start free today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Features;
