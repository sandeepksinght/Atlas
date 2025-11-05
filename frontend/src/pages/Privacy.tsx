import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-600">
            Last updated: January 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg mb-12">
            <p className="text-gray-700 leading-relaxed m-0">
              <strong>TL;DR:</strong> We respect your privacy. We collect only what we need to provide our service,
              we never sell your data, and you have full control over your information.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">What information we collect</h2>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Account Information</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            When you create an account, we collect your name, email address, and password.
            Your password is encrypted and we can never see it in plain text.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Assessment Data</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            We store the assessments you create and the responses you collect. This is necessary
            to provide you with our service. You own all of this data and can export or delete it at any time.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Usage Data</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            We collect basic usage data like which features you use and when. This helps us improve
            dStudio and fix bugs. This data is anonymized and never sold to third parties.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">How we use your information</h2>
          <ul className="space-y-3 mb-8">
            <li className="text-gray-600 leading-relaxed">
              <strong>To provide our service:</strong> We use your data to power dStudio and deliver the features you use
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>To improve our product:</strong> We analyze usage patterns to make dStudio better
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>To communicate with you:</strong> We'll send important updates and respond to your support requests
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>To ensure security:</strong> We monitor for suspicious activity to keep your account safe
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">What we DON'T do with your data</h2>
          <div className="bg-gray-50 p-6 rounded-xl mb-8">
            <ul className="space-y-3">
              <li className="flex items-start text-gray-700">
                <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                We never sell your data to anyone
              </li>
              <li className="flex items-start text-gray-700">
                <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                We never use your assessment content to train AI models
              </li>
              <li className="flex items-start text-gray-700">
                <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                We never share your data with advertisers
              </li>
              <li className="flex items-start text-gray-700">
                <svg className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                We never read your assessment responses unless you explicitly request support
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your rights</h2>
          <p className="text-gray-600 leading-relaxed mb-4">You have complete control over your data:</p>
          <ul className="space-y-3 mb-8">
            <li className="text-gray-600 leading-relaxed">
              <strong>Access:</strong> You can view all your data at any time in your account
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>Export:</strong> Download all your data in standard formats (CSV, PDF)
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>Delete:</strong> Delete your account and all associated data permanently
            </li>
            <li className="text-gray-600 leading-relaxed">
              <strong>Correct:</strong> Update or correct any information in your account
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Security</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We take security seriously. All data is encrypted in transit (TLS/SSL) and at rest. We use
            industry-standard security practices and regularly audit our systems. If you discover a security
            vulnerability, please contact us immediately at security@atlas.com.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Cookies</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We use essential cookies to keep you logged in and remember your preferences. We don't use
            tracking cookies or third-party advertising cookies.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Changes to this policy</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We may update this privacy policy from time to time. We'll notify you of any significant
            changes by email and by posting a notice in the app.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Contact us</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you have questions about this privacy policy or how we handle your data, please contact us at:
          </p>
          <p className="text-gray-600 leading-relaxed">
            Email: <a href="mailto:privacy@atlas.com" className="text-blue-600 hover:text-blue-700">privacy@atlas.com</a><br />
            Or use our <a href="/contact" className="text-blue-600 hover:text-blue-700">contact form</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
