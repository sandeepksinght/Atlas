import React from 'react';
import { Link } from 'react-router-dom';

interface Guide {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  icon: string;
}

const guides: Guide[] = [
  {
    id: '1',
    title: 'Create Your First Quiz in 5 Minutes',
    description: 'A step-by-step guide to creating and publishing your first quiz using dStudio',
    difficulty: 'Beginner',
    duration: '5 min',
    icon: 'rocket'
  },
  {
    id: '2',
    title: 'Use AI to Generate Questions from a PDF',
    description: 'Learn how to upload a PDF and automatically generate quiz questions using AI',
    difficulty: 'Beginner',
    duration: '7 min',
    icon: 'ai'
  },
  {
    id: '3',
    title: 'Build an Employee Engagement Survey',
    description: 'Create a comprehensive employee survey using templates and best practices',
    difficulty: 'Intermediate',
    duration: '15 min',
    icon: 'survey'
  },
  {
    id: '4',
    title: 'Set Up Advanced Quiz Settings',
    description: 'Configure time limits, randomization, scoring rules, and more',
    difficulty: 'Intermediate',
    duration: '10 min',
    icon: 'settings'
  },
  {
    id: '5',
    title: 'Analyze Survey Results Like a Pro',
    description: 'Master the analytics dashboard and export data for deeper analysis',
    difficulty: 'Advanced',
    duration: '20 min',
    icon: 'analytics'
  },
  {
    id: '6',
    title: 'Organize with Projects and Folders',
    description: 'Learn how to keep your assessments organized as your library grows',
    difficulty: 'Beginner',
    duration: '8 min',
    icon: 'folder'
  },
  {
    id: '7',
    title: 'Create Custom Templates',
    description: 'Save time by creating reusable templates for your organization',
    difficulty: 'Intermediate',
    duration: '12 min',
    icon: 'template'
  },
  {
    id: '8',
    title: 'Multi-Step Assessment Creation Wizard',
    description: 'Use the guided wizard to create complex assessments with advanced options',
    difficulty: 'Advanced',
    duration: '25 min',
    icon: 'wizard'
  }
];

const HowTo: React.FC = () => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-700';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'Advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            How-To Guides
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Step-by-step tutorials to master dStudio and create amazing assessments
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {guides.map(guide => (
              <Link
                key={guide.id}
                to={`/how-to/${guide.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden group"
              >
                {/* Icon header */}
                <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getDifficultyColor(guide.difficulty)}`}>
                      {guide.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">{guide.duration}</span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h3>

                  <p className="text-gray-600">
                    {guide.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="h-64 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-8">
              <svg className="w-24 h-24 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Prefer Video Tutorials?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Check out our YouTube channel for video walkthroughs and tips
            </p>
            <a
              href="#"
              className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
            >
              Watch Video Tutorials
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Create your first assessment in minutes
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            Start Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HowTo;
