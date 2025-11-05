import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

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
      id: 'ai-options',
      title: 'AI Generation Options',
      description: 'Configure AI question generation',
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
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
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
                        ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
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
          {currentStep === 1 && (
            <Step2BasicInfo onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 2 && (
            <Step3Strategy onNext={handleNext} onPrevious={handlePrevious} onSkip={handleSkip} updateData={updateWizardData} data={wizardData} />
          )}
          {currentStep === 3 && wizardData.useAI && (
            <Step4AIOptions onNext={handleNext} onPrevious={handlePrevious} updateData={updateWizardData} data={wizardData} />
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
              'p-6 rounded-xl border-2 transition-all text-left hover:border-indigo-300',
              selected === option.id
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
                : 'border-gray-200 hover:bg-gray-50'
            )}
          >
            <div className={cn('mb-4', selected === option.id ? 'text-indigo-600' : 'text-gray-400')}>
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg"
            placeholder="e.g., Product Knowledge Quiz Q4 2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    ? 'border-indigo-600 bg-indigo-50'
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
                ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-100'
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

// Step 4: AI Options (Advanced)
const Step4AIOptions: React.FC<StepProps> = ({ onNext, onPrevious, updateData, data }) => {
  const [numberOfQuestions, setNumberOfQuestions] = useState(data.aiOptions?.numberOfQuestions || 10);
  const [difficulty, setDifficulty] = useState(data.aiOptions?.difficulty || 'mixed');
  const [questionTypes, setQuestionTypes] = useState(
    data.aiOptions?.questionTypes || {
      single_choice: 50,
      multiple_choice: 25,
      text: 15,
      rating: 10,
    }
  );
  const [bloomsLevel, setBloomsLevel] = useState(data.aiOptions?.bloomsLevel || 'understand');

  const handleNext = () => {
    updateData({
      aiOptions: {
        numberOfQuestions,
        difficulty,
        questionTypes,
        bloomsLevel,
      },
    });
    onNext();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Generation Options</h2>
      <p className="text-gray-600 mb-8">Configure how AI generates your questions</p>

      <div className="space-y-6">
        {/* Number of Questions */}
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
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <div className="grid grid-cols-4 gap-2">
            {['beginner', 'intermediate', 'advanced', 'mixed'].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={cn(
                  'px-4 py-2 rounded-lg border-2 transition-all capitalize',
                  difficulty === level
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Bloom's Taxonomy */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bloom's Taxonomy Level</label>
          <select
            value={bloomsLevel}
            onChange={(e) => setBloomsLevel(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="remember">Remember (recall facts)</option>
            <option value="understand">Understand (explain concepts)</option>
            <option value="apply">Apply (use knowledge)</option>
            <option value="analyze">Analyze (examine details)</option>
            <option value="evaluate">Evaluate (justify decisions)</option>
            <option value="create">Create (design solutions)</option>
          </select>
        </div>

        {/* Question Type Distribution */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Question Type Distribution (%)
          </label>
          <div className="space-y-3">
            {Object.entries(questionTypes).map(([type, value]) => (
              <div key={type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-700 capitalize">{type.replace('_', ' ')}</span>
                  <span className="text-sm font-medium text-gray-900">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={value}
                  onChange={(e) =>
                    setQuestionTypes({ ...questionTypes, [type]: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Total: {Object.values(questionTypes).reduce((a: number, b: number) => a + b, 0)}%
          </div>
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
            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
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
            className="mt-1 w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
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
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="font-medium text-gray-900">Randomize question order</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.showResults}
              onChange={(e) => setSettings({ ...settings, showResults: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
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

  const handleFinish = async () => {
    setCreating(true);
    // In a real implementation, this would create the assessment
    // For now, just simulate
    setTimeout(() => {
      onComplete?.('new-assessment-id');
    }, 1500);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Finish</h2>
      <p className="text-gray-600 mb-8">Review your assessment configuration</p>

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
            <div className="text-sm font-medium text-gray-500">Question Method</div>
            <div className="text-gray-900 capitalize">{data.questionStrategy}</div>
          </div>
        </div>

        {data.aiOptions && (
          <div>
            <div className="text-sm font-medium text-gray-500">AI Configuration</div>
            <div className="text-gray-700">
              {data.aiOptions.numberOfQuestions} questions, {data.aiOptions.difficulty} difficulty
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onPrevious}>
          Back
        </Button>
        <Button onClick={handleFinish} loading={creating}>
          {creating ? 'Creating Assessment...' : 'Finish & Create'}
        </Button>
      </div>
    </div>
  );
};
