import React from 'react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '10 Best Practices for Creating Effective Online Assessments',
    excerpt: 'Learn how to create assessments that accurately measure knowledge and engage your audience with these proven techniques.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    category: 'Best Practices',
    readTime: '5 min read',
    image: 'assessment'
  },
  {
    id: '2',
    title: 'How AI is Revolutionizing Quiz and Survey Creation',
    excerpt: 'Discover how artificial intelligence is transforming the way educators and businesses create assessments, saving time and improving quality.',
    author: 'Michael Chen',
    date: '2024-01-10',
    category: 'AI & Technology',
    readTime: '7 min read',
    image: 'ai'
  },
  {
    id: '3',
    title: 'The Ultimate Guide to Employee Engagement Surveys',
    excerpt: 'A comprehensive guide to creating, distributing, and analyzing employee engagement surveys that drive real organizational change.',
    author: 'Emily Rodriguez',
    date: '2024-01-05',
    category: 'HR & Workplace',
    readTime: '10 min read',
    image: 'engagement'
  },
  {
    id: '4',
    title: 'Boost Quiz Completion Rates: 7 Proven Strategies',
    excerpt: 'Increase your quiz completion rates with these data-driven strategies from successful educators and marketers.',
    author: 'David Kim',
    date: '2023-12-28',
    category: 'Marketing',
    readTime: '6 min read',
    image: 'completion'
  },
  {
    id: '5',
    title: 'Making Assessments Accessible: WCAG Compliance Guide',
    excerpt: 'Ensure your quizzes and surveys are accessible to all users with this practical guide to WCAG compliance.',
    author: 'Lisa Martinez',
    date: '2023-12-20',
    category: 'Accessibility',
    readTime: '8 min read',
    image: 'accessibility'
  },
  {
    id: '6',
    title: 'From Data to Insights: Analyzing Survey Results Effectively',
    excerpt: 'Learn how to transform raw survey data into actionable insights that drive decision-making in your organization.',
    author: 'James Taylor',
    date: '2023-12-15',
    category: 'Analytics',
    readTime: '9 min read',
    image: 'analytics'
  }
];

const Blog: React.FC = () => {
  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Atlas Blog
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Insights, tips, and best practices for creating better assessments
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {filteredPosts.map(post => (
              <Link
                key={post.id}
                to={`/blog/${post.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
              >
                {/* Image placeholder */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <svg className="w-16 h-16 text-blue-600 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.author}</span>
                    <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to create your first assessment?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust Atlas for their surveys and quizzes
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Blog;
