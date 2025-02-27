import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useAuthStore } from '../store/authStore';

const Questionnaire = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const {
    responses,
    isLoading,
    error,
    updateBasicInfo,
    updatePresentationDetails,
    updateGoals,
    saveQuestionnaire,
    loadQuestionnaire,
  } = useQuestionnaireStore();

  // Load existing questionnaire data if available
  useEffect(() => {
    loadQuestionnaire().catch(console.error);
  }, [loadQuestionnaire]);

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const success = await saveQuestionnaire();
      
      if (success) {
        setIsComplete(true);
        
        // Redirect after showing completion message
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        // Handle error
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to submit questionnaire:', error);
      setIsSubmitting(false);
    }
  };

  const handleVisualAidChange = (aid: string, checked: boolean) => {
    const currentAids = [...responses.presentationDetails.visualAids];
    
    if (checked && !currentAids.includes(aid)) {
      updatePresentationDetails('visualAids', [...currentAids, aid]);
    } else if (!checked && currentAids.includes(aid)) {
      updatePresentationDetails(
        'visualAids', 
        currentAids.filter(item => item !== aid)
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <p className="text-gray-500">
              Please provide some basic information about your presentation needs.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="presentationType" className="block text-sm font-medium text-gray-700">
                  What type of presentation are you preparing for?
                </label>
                <select
                  id="presentationType"
                  name="presentationType"
                  value={responses.basicInfo.presentationType}
                  onChange={(e) => updateBasicInfo('presentationType', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Business pitch</option>
                  <option>Academic presentation</option>
                  <option>Conference talk</option>
                  <option>Sales presentation</option>
                  <option>Training session</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="audienceSize" className="block text-sm font-medium text-gray-700">
                  Approximately how large is your audience?
                </label>
                <select
                  id="audienceSize"
                  name="audienceSize"
                  value={responses.basicInfo.audienceSize}
                  onChange={(e) => updateBasicInfo('audienceSize', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Small (1-10 people)</option>
                  <option>Medium (11-50 people)</option>
                  <option>Large (51-200 people)</option>
                  <option>Very large (200+ people)</option>
                </select>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Presentation Details</h3>
            <p className="text-gray-500">
              Tell us more about your presentation content and structure.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                  How long will your presentation be?
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={responses.presentationDetails.duration}
                  onChange={(e) => updatePresentationDetails('duration', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Less than 5 minutes</option>
                  <option>5-15 minutes</option>
                  <option>15-30 minutes</option>
                  <option>30-60 minutes</option>
                  <option>More than 60 minutes</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="visualAids" className="block text-sm font-medium text-gray-700">
                  Will you be using visual aids?
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="visualAids-slides"
                      name="visualAids"
                      type="checkbox"
                      checked={responses.presentationDetails.visualAids.includes('Slides/PowerPoint')}
                      onChange={(e) => handleVisualAidChange('Slides/PowerPoint', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visualAids-slides" className="ml-2 block text-sm text-gray-700">
                      Slides/PowerPoint
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="visualAids-handouts"
                      name="visualAids"
                      type="checkbox"
                      checked={responses.presentationDetails.visualAids.includes('Handouts')}
                      onChange={(e) => handleVisualAidChange('Handouts', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visualAids-handouts" className="ml-2 block text-sm text-gray-700">
                      Handouts
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="visualAids-demos"
                      name="visualAids"
                      type="checkbox"
                      checked={responses.presentationDetails.visualAids.includes('Live demonstrations')}
                      onChange={(e) => handleVisualAidChange('Live demonstrations', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visualAids-demos" className="ml-2 block text-sm text-gray-700">
                      Live demonstrations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="visualAids-videos"
                      name="visualAids"
                      type="checkbox"
                      checked={responses.presentationDetails.visualAids.includes('Videos')}
                      onChange={(e) => handleVisualAidChange('Videos', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="visualAids-videos" className="ml-2 block text-sm text-gray-700">
                      Videos
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Your Presentation Goals</h3>
            <p className="text-gray-500">
              Help us understand what you want to achieve with your presentation.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="primaryGoal" className="block text-sm font-medium text-gray-700">
                  What is your primary goal for this presentation?
                </label>
                <select
                  id="primaryGoal"
                  name="primaryGoal"
                  value={responses.goals.primaryGoal}
                  onChange={(e) => updateGoals('primaryGoal', e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option>Inform or educate the audience</option>
                  <option>Persuade the audience to take action</option>
                  <option>Secure funding or resources</option>
                  <option>Build relationships or network</option>
                  <option>Showcase expertise or research</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="concerns" className="block text-sm font-medium text-gray-700">
                  What are your biggest concerns about presenting?
                </label>
                <textarea
                  id="concerns"
                  name="concerns"
                  rows={3}
                  value={responses.goals.concerns}
                  onChange={(e) => updateGoals('concerns', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., public speaking anxiety, organizing content, engaging the audience..."
                ></textarea>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Questionnaire Complete!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for completing the questionnaire. We'll use this information to help you prepare for your presentation.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Presentation Questionnaire</h2>
              <p className="mt-1 text-sm text-gray-500">
                Help us understand your presentation needs so we can provide tailored guidance.
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="px-4 py-5 sm:p-6">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-sm font-medium text-gray-500">
                    {Math.round((currentStep / totalSteps) * 100)}% Complete
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Step content */}
              <div className="mb-8">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  renderStepContent()
                )}
              </div>
              
              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep < totalSteps ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Questionnaire;