import React from 'react';
import { Link, useParams } from 'react-router-dom';

const BlogPost: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
              Best Practices
            </span>
            <span className="text-gray-500 text-sm">5 min read</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            10 Best Practices for Creating Effective Online Assessments
          </h1>
          <div className="flex items-center text-gray-600">
            <span>By Sarah Johnson</span>
            <span className="mx-3">•</span>
            <span>January 15, 2024</span>
          </div>
        </header>

        {/* Featured image */}
        <div className="h-96 rounded-2xl mb-12 overflow-hidden shadow-lg">
          <img
            src="https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Creating Effective Online Assessments"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Creating effective online assessments requires careful planning and attention to detail. Whether you're an educator, HR professional, or marketer, following these best practices will help you create assessments that accurately measure knowledge and engage your audience.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">1. Define Clear Learning Objectives</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Before creating any questions, clearly define what you want to assess. Each question should map to a specific learning objective or competency. This ensures your assessment is focused and measures what it's supposed to measure.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">2. Use Varied Question Types</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Don't rely solely on multiple-choice questions. Mix in different question types like:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-6">
            <li>Multiple choice for knowledge recall</li>
            <li>True/false for concept verification</li>
            <li>Short answer for deeper understanding</li>
            <li>Rating scales for opinions and attitudes</li>
          </ul>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">3. Write Clear, Concise Questions</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Avoid ambiguous language and double negatives. Each question should have one clear purpose. Test your questions with a colleague before deployment to catch any confusion.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">4. Provide Immediate Feedback</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            When appropriate, provide immediate feedback after each question or at the end of the assessment. This reinforces learning and helps participants understand their mistakes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">5. Make It Mobile-Friendly</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Ensure your assessments work seamlessly on all devices. With dStudio, all assessments are automatically responsive and mobile-optimized.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">6. Set Appropriate Time Limits</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            If using timed assessments, ensure the time limit is realistic. Consider the complexity and length of your assessment when setting time constraints.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">7. Randomize Questions and Answers</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Randomizing questions and answer options helps prevent cheating and ensures fair assessment across multiple attempts.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">8. Test Before Launch</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Always preview and test your assessment before sharing it. Check for typos, ensure questions make sense, and verify that scoring works correctly.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">9. Analyze Results and Iterate</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            After collecting responses, analyze the data to identify problematic questions or areas where participants struggled. Use these insights to improve future assessments.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">10. Respect Privacy and Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Ensure you're complying with data protection regulations. Be transparent about how you'll use participant data and provide options for anonymity when appropriate.
          </p>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-12 rounded-r-lg">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Tip</h3>
            <p className="text-gray-700">
              Use dStudio's AI-powered question generation to quickly create diverse, high-quality questions from your existing content. This saves time while maintaining assessment quality.
            </p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-4">Conclusion</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Creating effective online assessments is both an art and a science. By following these best practices, you'll create assessments that are engaging, fair, and provide valuable insights. Remember to continuously gather feedback and iterate on your approach.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Ready to put these practices into action? <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium underline">Start creating your first assessment with dStudio today</Link>.
          </p>
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Ready to Create Your Assessment?</h3>
          <p className="text-blue-100 mb-6">Join thousands who trust dStudio for their surveys and quizzes</p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;
