import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';
import * as api from '../../services/api';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface AssessmentWizardProps {
  onComplete: (assessmentId: string) => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<any>({});
  const navigate = useNavigate();

  const steps: WizardStep[] = [
    {
      id: 'start',
      title: 'Choose Starting Point',
      description: 'Start from scratch, template, or import',
      completed: false,
    },
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Title, description, and type',
      completed: false,
    },
    {
      id: 'strategy',
      title: 'Question Strategy',
      description: 'How to create your questions',
      completed: false,
    },
    {
      id: 'content',
      title: 'Content & Questions',
      description: 'Configure your question source',
      completed: false,
    },
    {
      id: 'settings',
      title: 'Configure Settings',
      description: 'Timer, pagination, scoring',
      completed: false,
    },
    {
      id: 'preview',
      title: 'Preview & Publish',
      description: 'Review and publish your assessment',
      completed: false,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Special navigation for templates: skip strategy and content steps
      if (currentStep === 1 && wizardData.startMethod === 'template') {
        setCurrentStep(4); // From basic info, jump directly to settings
      }
      // If moving from step 2 (strategy) and manual is selected, skip step 3
      else if (currentStep === 2 && wizardData.questionStrategy === 'manual') {
        setCurrentStep(4); // Jump directly to settings
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Special navigation for templates: skip strategy and content steps
      if (currentStep === 4 && wizardData.startMethod === 'template') {
        setCurrentStep(1); // From settings, jump back to basic info
      }
      // If moving back from step 4 (settings) and manual is selected, skip step 3
      else if (currentStep === 4 && wizardData.questionStrategy === 'manual') {
        setCurrentStep(2); // Jump back to strategy
      } else {
        setCurrentStep(currentStep - 1);
      }
    }
  };

  const handleSkip = () => {
    // Skip optional steps (like AI options if not using AI)
    handleNext();
  };

  const updateWizardData = (data: any) => {
    setWizardData({ ...wizardData, ...data });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all',
                      index < currentStep
                        ? 'bg-emerald-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-gray-200 text-gray-500'
                    )}
                  >
                    {index < currentStep ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        'text-xs font-medium',
                        index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-4 rounded transition-all',
                      index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          {currentStep === 0 && (
            <Step1ChooseStart onNext={handleNext} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 1 && wizardData.startMethod === 'template' && (
            <Step1BTemplateSelect onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 1 && wizardData.startMethod !== 'template' && (
            <Step2BasicInfo onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 2 && (
            <Step3Strategy onNext={handleNext} onPrevious={handlePrevious} onSkip={handleSkip} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 3 && wizardData.questionStrategy === 'ai' && (
            <Step4AIOptions onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 3 && wizardData.questionStrategy === 'bank' && (
            <Step3QuestionBank onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 4 && (
            <Step5Settings onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 5 && (
            <Step6Preview onPrevious={handlePrevious} onComplete={onComplete} data={wizardData} />
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1: Choose Starting Point
interface StepProps {
  onNext: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  updateData: (data: any) => void;
  data: any;
  onComplete?: (id: string) => void;
}

const Step1ChooseStart: React.FC<StepProps> = ({ onNext, updateData, data }) => {
  const [selected, setSelected] = useState(data.startMethod || '');

  const options = [
    {
      id: 'scratch',
      title: 'Start from Scratch',
      description: 'Create a completely new assessment',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'template',
      title: 'Use a Template',
      description: 'Start with a pre-built template',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
      ),
    },
    {
      id: 'import',
      title: 'Import from File',
      description: 'Upload questions from CSV, Excel, or JSON',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      ),
    },
  ];

  const handleSelect = (id: string) => {
    setSelected(id);
    updateData({ startMethod: id });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">How would you like to start?</h2>
      <p className="text-gray-600 mb-8">Choose the best starting point for your assessment</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              'p-6 rounded-xl border-2 transition-all text-left hover:border-blue-300',
              selected === option.id
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <div className={cn('mb-4', selected === option.id ? 'text-blue-600' : 'text-gray-400')}>
              {option.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!selected} size="lg">
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 1B: Template Selection (shown when startMethod === 'template')
const Step1BTemplateSelect: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(data.selectedTemplateId || null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.getTemplates();
        setTemplates(response.data);
      } catch (err: any) {
        console.error('Error loading templates:', err);
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleSelectTemplate = async (templateId: string) => {
    try {
      setSelectedTemplate(templateId);
      // Load template details
      const response = await api.getTemplate(templateId);
      const template = response.data;

      // Pre-fill wizard data with template info
      updateData({
        selectedTemplateId: templateId,
        title: template.title || '',
        description: template.description || '',
        type: template.type || 'quiz',
        // We'll let the user go through question strategy selection
        // since the template already has questions
        templateQuestions: template.questions || [],
      });
    } catch (err: any) {
      console.error('Error loading template details:', err);
      setError('Failed to load template details.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose a Template</h2>
      <p className="text-gray-600 mb-8">Start with a pre-built template and customize it to your needs</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Available</h3>
          <p className="text-gray-600">There are no templates available yet. Try starting from scratch instead.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 max-h-[500px] overflow-y-auto pr-2">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              className={cn(
                'p-6 rounded-xl border-2 transition-all text-left hover:border-blue-300 h-full',
                selectedTemplate === template.id
                  ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                  : 'border-gray-200 hover:bg-gray-50'
              )}
            >
              <div className="flex items-start mb-3">
                {template.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {template.category}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
              {template.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{template.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {template.questions?.length > 0 && (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    {template.questions.length} questions
                  </span>
                )}
                {template.type && (
                  <span className="capitalize">{template.type}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!selectedTemplate}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 2: Basic Information
const Step2BasicInfo: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [title, setTitle] = useState(data.title || '');
  const [description, setDescription] = useState(data.description || '');
  const [type, setType] = useState(data.type || 'quiz');

  const handleNext = () => {
    updateData({ title, description, type });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
      <p className="text-gray-600 mb-8">Tell us about your assessment</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            placeholder="e.g., Product Knowledge Quiz Q4 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe the purpose and content of this assessment..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assessment Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 'quiz', label: 'Quiz', desc: 'Scored assessment', icon: '✓' },
              { value: 'survey', label: 'Survey', desc: 'Collect opinions', icon: '📊' },
              { value: 'poll', label: 'Poll', desc: 'Quick questions', icon: '📈' },
              { value: 'assessment', label: 'Assessment', desc: 'Evaluation', icon: '📝' },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                className={cn(
                  'p-4 rounded-lg border-2 transition-all text-left',
                  type === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-semibold text-gray-900">{option.label}</div>
                <div className="text-xs text-gray-500">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!title.trim()}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 3: Question Strategy
const Step3Strategy: React.FC<StepProps> = ({ onNext, onPrevious, onSkip, updateData, data }) => {
  const [strategy, setStrategy] = useState(data.questionStrategy || '');

  const handleSelect = (value: string) => {
    setStrategy(value);
    updateData({ questionStrategy: value, useAI: value === 'ai' });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">How will you create questions?</h2>
      <p className="text-gray-600 mb-8">Choose your question creation method</p>

      <div className="space-y-4 mb-8">
        {[
          {
            id: 'manual',
            title: 'Manual Entry',
            description: 'Add questions one by one manually',
          },
          {
            id: 'ai',
            title: 'AI Generation',
            description: 'Generate questions using AI from text, files, or URLs',
          },
          {
            id: 'bank',
            title: 'Question Bank',
            description: 'Select from your saved questions',
          },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              'w-full p-6 rounded-xl border-2 transition-all text-left',
              strategy === option.id
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{option.title}</h3>
            <p className="text-sm text-gray-600">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <div className="space-x-2">
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip
            </Button>
          )}
          <Button onClick={onNext} disabled={!strategy}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

// Step 3B: Question Bank (for 'bank' strategy)
const Step3QuestionBank: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(data.selectedQuestions || []);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);

  // TODO: Load questions from question bank API
  // For now, showing placeholder
  React.useEffect(() => {
    // Simulate loading questions
    setTimeout(() => {
      setQuestions([
        { id: '1', question_text: 'Sample Question 1', question_type: 'multiple_choice' },
        { id: '2', question_text: 'Sample Question 2', question_type: 'true_false' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const toggleQuestion = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId));
    } else {
      setSelectedQuestions([...selectedQuestions, questionId]);
    }
  };

  const handleNext = () => {
    updateData({ selectedQuestions });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Select from Question Bank</h2>
      <p className="text-gray-600 mb-8">Choose questions from your saved question bank</p>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Questions Available</h3>
          <p className="text-gray-600 mb-4">Your question bank is empty. Create some questions first!</p>
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          {questions.map((question) => (
            <button
              key={question.id}
              onClick={() => toggleQuestion(question.id)}
              className={cn(
                'w-full p-4 rounded-lg border-2 transition-all text-left',
                selectedQuestions.includes(question.id)
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              )}
            >
              <div className="flex items-start">
                <div className={cn(
                  'w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0',
                  selectedQuestions.includes(question.id)
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                )}>
                  {selectedQuestions.includes(question.id) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{question.question_text}</div>
                  <div className="text-sm text-gray-500 capitalize mt-1">{question.question_type.replace('_', ' ')}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={selectedQuestions.length === 0}>
          Continue ({selectedQuestions.length} selected)
        </Button>
      </div>
    </div>
  );
};

// Step 4: AI Options (Advanced)
const Step4AIOptions: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [contentSource, setContentSource] = useState(data.aiOptions?.contentSource || '');
  const [textContent, setTextContent] = useState(data.aiOptions?.textContent || '');
  const [url, setUrl] = useState(data.aiOptions?.url || '');
  const [file, setFile] = useState<File | null>(data.aiOptions?.file || null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(data.aiOptions?.numberOfQuestions || 10);
  const [difficulty, setDifficulty] = useState(data.aiOptions?.difficulty || 'mixed');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const isValidForNext = () => {
    if (!contentSource) return false;
    if (contentSource === 'text' && !textContent.trim()) return false;
    if (contentSource === 'url' && !url.trim()) return false;
    if (contentSource === 'file' && !file) return false;
    return true;
  };

  const handleNext = () => {
    updateData({
      aiOptions: {
        contentSource,
        textContent,
        url,
        file,
        numberOfQuestions,
        difficulty,
      },
    });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Generation Source</h2>
      <p className="text-gray-600 mb-8">Where should AI generate questions from?</p>

      <div className="space-y-6">
        {/* Content Source Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose Content Source <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'text',
                title: 'Paste Text',
                icon: '📝',
                description: 'Paste or type your content',
              },
              {
                id: 'file',
                title: 'Upload File',
                icon: '📄',
                description: 'PDF, Word, Excel, images',
              },
              {
                id: 'url',
                title: 'From URL',
                icon: '🔗',
                description: 'Webpage or online document',
              },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => setContentSource(option.id)}
                className={cn(
                  'p-4 rounded-xl border-2 transition-all text-left',
                  contentSource === option.id
                    ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{option.title}</h3>
                <p className="text-xs text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Text Content Input */}
        {contentSource === 'text' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Your Content <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Paste your content here... This can be lecture notes, study materials, articles, or any text you want to generate questions from."
            />
            <p className="mt-2 text-sm text-gray-500">
              {textContent.length} characters ({Math.ceil(textContent.length / 4)} tokens approx.)
            </p>
          </div>
        )}

        {/* File Upload */}
        {contentSource === 'file' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Document <span className="text-rose-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.pptx"
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-5xl mb-4">📤</div>
                {file ? (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">{file.name}</p>
                    <p className="text-sm text-gray-600">
                      {(file.size / 1024).toFixed(2)} KB • Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-600">
                      PDF, Word, Excel, PowerPoint, Images (Max 10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Supported: PDF, DOCX, XLSX, PPTX, TXT, PNG, JPG, JPEG
            </p>
          </div>
        )}

        {/* URL Input */}
        {contentSource === 'url' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://example.com/article-or-document"
            />
            <p className="mt-2 text-sm text-gray-500">
              We'll fetch and extract content from the webpage
            </p>
          </div>
        )}

        {/* Divider */}
        {contentSource && (
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Options</h3>
          </div>
        )}

        {/* Number of Questions */}
        {contentSource && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {numberOfQuestions}
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={numberOfQuestions}
              onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>25</span>
              <span>50</span>
            </div>
          </div>
        )}

        {/* Difficulty Level */}
        {contentSource && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
            <div className="grid grid-cols-4 gap-2">
              {['beginner', 'intermediate', 'advanced', 'mixed'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 transition-all capitalize',
                    difficulty === level
                      ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleNext} disabled={!isValidForNext()}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 5: Settings
const Step5Settings: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [settings, setSettings] = useState(
    data.settings || {
      timeLimit: { enabled: false, minutes: 30 },
      pagination: { enabled: false, questionsPerPage: 5 },
      passingScore: { enabled: false, percentage: 70 },
      randomize: false,
      showResults: true,
    }
  );

  const handleNext = () => {
    updateData({ settings });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure Settings</h2>
      <p className="text-gray-600 mb-8">Set up how your assessment will work</p>

      <div className="space-y-6">
        {/* Time Limit */}
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={settings.timeLimit.enabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                timeLimit: { ...settings.timeLimit, enabled: e.target.checked },
              })
            }
            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label className="block font-medium text-gray-900 mb-2">Time Limit</label>
            {settings.timeLimit.enabled && (
              <input
                type="number"
                value={settings.timeLimit.minutes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    timeLimit: { ...settings.timeLimit, minutes: parseInt(e.target.value) },
                  })
                }
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Minutes"
              />
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-start space-x-4">
          <input
            type="checkbox"
            checked={settings.pagination.enabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                pagination: { ...settings.pagination, enabled: e.target.checked },
              })
            }
            className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <div className="flex-1">
            <label className="block font-medium text-gray-900 mb-2">Pagination</label>
            {settings.pagination.enabled && (
              <input
                type="number"
                value={settings.pagination.questionsPerPage}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pagination: {
                      ...settings.pagination,
                      questionsPerPage: parseInt(e.target.value),
                    },
                  })
                }
                className="w-32 px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Questions per page"
              />
            )}
          </div>
        </div>

        {/* Other Settings */}
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.randomize}
              onChange={(e) => setSettings({ ...settings, randomize: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Randomize question order</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.showResults}
              onChange={(e) => setSettings({ ...settings, showResults: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="font-medium text-gray-900">Show results after submission</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};

// Step 6: Preview & Publish
const Step6Preview: React.FC<StepProps> = ({ onPrevious, onComplete, data }) => {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setCreating(true);
    setError(null);

    try {
      let assessmentId: string;

      // Step 1: Create the assessment (different flow for template vs scratch)
      if (data.startMethod === 'template' && data.selectedTemplateId) {
        // Use template creation API which creates assessment with all questions
        const templateResponse = await api.createFromTemplate(data.selectedTemplateId);
        assessmentId = templateResponse.data.id;

        // Optionally update the title/description if user modified them
        if (data.title || data.description) {
          await api.updateAssessment(assessmentId, {
            title: data.title,
            description: data.description,
            settings: data.settings || {},
          });
        }
      } else {
        // Create from scratch
        const assessmentData = {
          title: data.title,
          description: data.description || '',
          type: data.type || 'quiz',
          settings: data.settings || {},
          is_published: false,
        };

        const createResponse = await api.createAssessment(assessmentData);
        assessmentId = createResponse.data.id;
      }

      // Step 2: Handle question generation based on strategy
      if (data.questionStrategy === 'ai' && data.aiOptions) {
        const { contentSource, textContent, file, url, numberOfQuestions } = data.aiOptions;

        if (contentSource === 'text' && textContent) {
          // Generate questions from text
          await api.generateQuestionsFromText(assessmentId, textContent, numberOfQuestions || 10);
        } else if (contentSource === 'file' && file) {
          // Generate questions from uploaded file
          await api.generateQuestionsFromFile(assessmentId, file, numberOfQuestions || 10);
        } else if (contentSource === 'url' && url) {
          // Generate questions from URL
          await api.generateQuestionsFromUrl(assessmentId, url, numberOfQuestions || 10);
        }
      } else if (data.questionStrategy === 'bank' && data.selectedQuestions) {
        // TODO: Implement adding questions from question bank
        // For now, questions from bank need to be manually copied
        console.log('Question bank integration pending - selected questions:', data.selectedQuestions);
      }
      // For 'manual' strategy, just create empty assessment

      // Step 3: Redirect to editor
      onComplete?.(assessmentId);
    } catch (err: any) {
      console.error('Error creating assessment:', err);
      setError(err.response?.data?.message || 'Failed to create assessment. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Finish</h2>
      <p className="text-gray-600 mb-8">Review your assessment configuration</p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error Creating Assessment</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-6 space-y-4 mb-8">
        <div>
          <div className="text-sm font-medium text-gray-500">Title</div>
          <div className="text-lg font-semibold text-gray-900">{data.title}</div>
        </div>

        {data.description && (
          <div>
            <div className="text-sm font-medium text-gray-500">Description</div>
            <div className="text-gray-700">{data.description}</div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Type</div>
            <div className="text-gray-900 capitalize">{data.type}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Starting Point</div>
            <div className="text-gray-900 capitalize">
              {data.startMethod === 'template' ? 'From Template' :
               data.startMethod === 'import' ? 'Imported' : 'From Scratch'}
            </div>
          </div>
        </div>

        {/* Template Details */}
        {data.startMethod === 'template' && data.templateQuestions && (
          <div>
            <div className="text-sm font-medium text-gray-500">Template</div>
            <div className="text-gray-700">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{data.templateQuestions.length}</span>
                <span className="ml-1">pre-built questions from template</span>
              </div>
            </div>
          </div>
        )}

        {data.questionStrategy && (
          <div>
            <div className="text-sm font-medium text-gray-500">Question Method</div>
            <div className="text-gray-900 capitalize">{data.questionStrategy}</div>
          </div>
        )}

        {/* AI Strategy Details */}
        {data.questionStrategy === 'ai' && data.aiOptions && (
          <div>
            <div className="text-sm font-medium text-gray-500">AI Configuration</div>
            <div className="text-gray-700">
              <div className="mb-1">
                <span className="font-semibold">Source:</span>{' '}
                {data.aiOptions.contentSource === 'text' && 'Pasted Text'}
                {data.aiOptions.contentSource === 'file' && `File: ${data.aiOptions.file?.name || 'Uploaded'}`}
                {data.aiOptions.contentSource === 'url' && `URL: ${data.aiOptions.url}`}
              </div>
              <div>
                <span className="font-semibold">Questions:</span> {data.aiOptions.numberOfQuestions},{' '}
                <span className="font-semibold">Difficulty:</span> {data.aiOptions.difficulty}
              </div>
            </div>
          </div>
        )}

        {/* Question Bank Strategy Details */}
        {data.questionStrategy === 'bank' && data.selectedQuestions && (
          <div>
            <div className="text-sm font-medium text-gray-500">Question Bank</div>
            <div className="text-gray-700">
              <span className="font-semibold">{data.selectedQuestions.length}</span> questions selected from your question bank
            </div>
          </div>
        )}

        {/* Manual Strategy Details */}
        {data.questionStrategy === 'manual' && (
          <div>
            <div className="text-sm font-medium text-gray-500">Manual Entry</div>
            <div className="text-gray-700">
              Questions will be added manually after creation
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious} disabled={creating}>
          Back
        </Button>
        <Button onClick={handleFinish} loading={creating}>
          {creating
            ? data.questionStrategy === 'ai'
              ? 'Creating & Generating Questions...'
              : 'Creating Assessment...'
            : 'Finish & Create'}
        </Button>
      </div>

      {data.questionStrategy === 'ai' && !error && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-blue-800">
              <strong>Note:</strong> AI question generation will start once you create the assessment.
              You'll be redirected to the editor where you can monitor the progress and review generated questions.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
