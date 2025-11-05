import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-32 pb-12 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Terms of Service
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
              <strong>TL;DR:</strong> Be respectful, don't abuse the service, and follow the law. We'll provide
              a great service, but we can't be held liable for how you use it.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Acceptance of Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            By using dStudio, you agree to these terms. If you don't agree, please don't use our service.
            These terms apply to all users, whether you're on a free or paid plan.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your Account</h2>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Account Creation</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            You must be at least 16 years old to use dStudio. You're responsible for keeping your account
            credentials secure. Don't share your password with others.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Account Responsibility</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            You're responsible for all activity that occurs under your account. If you think someone
            has accessed your account without permission, let us know immediately.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Acceptable Use</h2>
          <p className="text-gray-600 leading-relaxed mb-4">You agree not to:</p>
          <ul className="space-y-3 mb-8">
            <li className="text-gray-600 leading-relaxed">
              Use dStudio for any illegal purpose or to violate any laws
            </li>
            <li className="text-gray-600 leading-relaxed">
              Harass, abuse, or harm other users
            </li>
            <li className="text-gray-600 leading-relaxed">
              Attempt to gain unauthorized access to our systems
            </li>
            <li className="text-gray-600 leading-relaxed">
              Upload malware, viruses, or malicious code
            </li>
            <li className="text-gray-600 leading-relaxed">
              Spam or send unsolicited communications
            </li>
            <li className="text-gray-600 leading-relaxed">
              Scrape or copy content using automated means
            </li>
            <li className="text-gray-600 leading-relaxed">
              Resell or redistribute dStudio without permission
            </li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your Content</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            You own all the content you create on dStudio – your assessments, questions, and responses.
            We never claim ownership of your content.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            By using dStudio, you grant us permission to store and display your content as necessary
            to provide the service. For example, we need to show your questions to the people taking
            your assessments.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            You're responsible for ensuring you have the right to use any content you upload. Don't
            upload copyrighted material unless you own it or have permission.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Payment Terms</h2>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Paid Plans</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            If you subscribe to a paid plan, you agree to pay the fees shown at the time of purchase.
            All fees are non-refundable except as required by law.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Billing</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            Paid plans are billed in advance on a monthly or yearly basis. Your subscription automatically
            renews unless you cancel before the renewal date. We'll notify you before charging your card.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cancellation</h3>
          <p className="text-gray-600 leading-relaxed mb-6">
            You can cancel your subscription at any time. You'll continue to have access until the end
            of your billing period. We don't provide refunds for partial months.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Service Availability</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We work hard to keep dStudio available 24/7, but we can't guarantee 100% uptime. We may need
            to perform maintenance or make updates. We'll try to notify you in advance for scheduled downtime.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Termination</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We reserve the right to suspend or terminate your account if you violate these terms.
            We'll usually warn you first, but we may terminate immediately for serious violations.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            If we terminate your account, you can export your data within 30 days. After that,
            your data will be permanently deleted.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            dStudio is provided "as is" without warranties of any kind. We're not liable for any damages
            arising from your use of the service, including but not limited to lost data, lost profits,
            or business interruption.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            If we are found liable, our liability is limited to the amount you paid us in the past 12 months.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Indemnification</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            You agree to indemnify and hold us harmless from any claims arising from your use of dStudio
            or violation of these terms.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We may update these terms from time to time. We'll notify you of significant changes by
            email and by posting a notice in the app. Continuing to use dStudio after changes means you
            accept the new terms.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Governing Law</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            These terms are governed by the laws of the United States and the state where our company
            is registered. Any disputes will be resolved in the courts of that jurisdiction.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Contact</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Questions about these terms? Contact us at:
          </p>
          <p className="text-gray-600 leading-relaxed">
            Email: <a href="mailto:legal@atlas.com" className="text-blue-600 hover:text-blue-700">legal@atlas.com</a><br />
            Or use our <a href="/contact" className="text-blue-600 hover:text-blue-700">contact form</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Terms;
