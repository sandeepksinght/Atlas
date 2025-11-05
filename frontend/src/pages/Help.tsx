import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
}

const helpArticles: HelpArticle[] = [
  // Getting Started
  { id: '1', category: 'Getting Started', title: 'Creating Your First Assessment', description: 'Learn how to create your first quiz or survey in minutes' },
  { id: '2', category: 'Getting Started', title: 'Understanding Assessment Types', description: 'Learn about quizzes, surveys, polls, and assessments' },
  { id: '3', category: 'Getting Started', title: 'Navigating the Dashboard', description: 'A complete guide to the Atlas dashboard' },

  // AI Features
  { id: '4', category: 'AI Features', title: 'Generating Questions from Text', description: 'Use AI to automatically create questions from your content' },
  { id: '5', category: 'AI Features', title: 'Uploading Files for AI Generation', description: 'Generate questions from PDFs and documents' },
  { id: '6', category: 'AI Features', title: 'Creating Questions from URLs', description: 'Extract content from websites to generate questions' },

  // Question Management
  { id: '7', category: 'Question Management', title: 'Adding and Editing Questions', description: 'Learn how to create and modify questions manually' },
  { id: '8', category: 'Question Management', title: 'Using Question Types', description: 'Understanding different question formats' },
  { id: '9', category: 'Question Management', title: 'Reordering Questions', description: 'Use drag-and-drop to organize your questions' },

  // Sharing & Distribution
  { id: '10', category: 'Sharing & Distribution', title: 'Generating Share Links', description: 'Create shareable links for your assessments' },
  { id: '11', category: 'Sharing & Distribution', title: 'Understanding Privacy Settings', description: 'Control who can access your assessments' },
  { id: '12', category: 'Sharing & Distribution', title: 'Embedding Assessments', description: 'Add your assessments to websites and apps' },

  // Analytics
  { id: '13', category: 'Analytics', title: 'Viewing Response Data', description: 'Access and interpret your response data' },
  { id: '14', category: 'Analytics', title: 'Understanding Analytics Charts', description: 'Make sense of your analytics dashboard' },
  { id: '15', category: 'Analytics', title: 'Exporting Results', description: 'Download your data in various formats' },

  // Projects & Organization
  { id: '16', category: 'Projects & Organization', title: 'Creating Projects and Folders', description: 'Organize your assessments effectively' },
  { id: '17', category: 'Projects & Organization', title: 'Using Templates', description: 'Speed up creation with ready-made templates' },
  { id: '18', category: 'Projects & Organization', title: 'Starring and Archiving', description: 'Manage your assessment library' },
];

const Help: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(helpArticles.map(a => a.category)))];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedArticles = filteredArticles.reduce((acc, article) => {
    if (!acc[article.category]) {
      acc[article.category] = [];
    }
    acc[article.category].push(article);
    return acc;
  }, {} as Record<string, HelpArticle[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Help Center
            </h1>
            <p className="text-xl text-blue-100 mb-10">
              Find answers to your questions and learn how to make the most of Atlas
            </p>

            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-xl border-0 shadow-lg focus:ring-4 focus:ring-blue-300 text-lg"
              />
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
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

      {/* Help Articles */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {Object.keys(groupedArticles).length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No articles found. Try a different search term.</p>
            </div>
          ) : (
            Object.entries(groupedArticles).map(([category, articles]) => (
              <div key={category} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">{category}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {articles.map(article => (
                    <Link
                      key={article.id}
                      to={`/help/${article.id}`}
                      className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-600 hover:shadow-md transition-all group"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{article.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Still need help?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Link
            to="/contact"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Help;
