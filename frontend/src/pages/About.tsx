import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="absolute inset-0 z-0 opacity-5">
          <img
            src="https://images.pexels.com/photos/3184398/pexels-photo-3184398.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt="Team collaboration"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            We're building the future<br />
            <span className="text-blue-600">of assessments</span>
          </h1>
          <p className="text-2xl text-gray-600 leading-relaxed">
            Atlas makes creating surveys, quizzes, and assessments as simple as having a conversation.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto prose prose-lg prose-gray">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Our story</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Atlas was born from a simple frustration: creating good assessments takes too long.
            Educators spend hours writing questions. HR teams struggle with engagement surveys.
            Marketers need quick feedback but don't have the tools.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            We believed there had to be a better way. So we built Atlas – a platform that combines
            the power of AI with intuitive design to make assessment creation effortless.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Today, thousands of users trust Atlas to create better assessments, faster.
            And we're just getting started.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Our values</h2>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple by default</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe powerful tools should be easy to use. Complexity is optional, not required.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Privacy first</h3>
              <p className="text-gray-600 leading-relaxed">
                Your data is yours. We'll never sell it, mine it, or use it for anything you don't approve.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Built for teams</h3>
              <p className="text-gray-600 leading-relaxed">
                Great work happens together. We build features that help teams collaborate seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Meet the team</h2>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Sarah Chen</h3>
              <p className="text-sm text-gray-600">CEO & Co-founder</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Marcus Johnson</h3>
              <p className="text-sm text-gray-600">CTO & Co-founder</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Emily Rodriguez</h3>
              <p className="text-sm text-gray-600">Head of Design</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">David Kim</h3>
              <p className="text-sm text-gray-600">Lead Engineer</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1102341/pexels-photo-1102341.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Priya Patel</h3>
              <p className="text-sm text-gray-600">Product Manager</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Alex Thompson</h3>
              <p className="text-sm text-gray-600">Marketing Lead</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Jordan Lee</h3>
              <p className="text-sm text-gray-600">Customer Success</p>
            </div>
            <div className="text-center">
              <img
                src="https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover shadow-lg"
              />
              <h3 className="font-semibold text-gray-900 mb-1">Maya Santos</h3>
              <p className="text-sm text-gray-600">Data Scientist</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Join us on our mission
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            We're always looking for talented people who share our vision
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-block px-10 py-5 bg-white text-blue-600 text-xl rounded-2xl hover:bg-blue-50 transition-all shadow-lg font-medium"
            >
              Get in touch
            </Link>
            <Link
              to="/register"
              className="inline-block px-10 py-5 bg-blue-500 text-white text-xl rounded-2xl hover:bg-blue-400 transition-all font-medium"
            >
              Try Atlas free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
