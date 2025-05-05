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
    updateBusinessInfo,
    updateContactInfo,
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">1</span>
              Business Information
            </h3>
            <p className="text-black">
              Please tell us about your business.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="businessName" className="block text-sm font-semibold uppercase mb-2 text-black">
                  What is the name of your business and website? *
                </label>
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  required
                  value={responses.businessInfo.businessName}
                  onChange={(e) => updateBusinessInfo('businessName', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Your business name"
                />
              </div>
              
              <div>
                <label htmlFor="businessYears" className="block text-sm font-semibold uppercase mb-2 text-black">
                  How many years have you been in business and how many employees do you have including yourself? *
                </label>
                <input
                  id="businessYears"
                  name="businessYears"
                  type="text"
                  required
                  value={responses.businessInfo.businessYears}
                  onChange={(e) => updateBusinessInfo('businessYears', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="e.g., 5 years, 12 employees"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-semibold uppercase mb-2 text-black">
                  What industry are you in? *
                </label>
                <input
                  id="industry"
                  name="industry"
                  type="text"
                  required
                  value={responses.businessInfo.industry}
                  onChange={(e) => updateBusinessInfo('industry', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Your industry"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">2</span>
              Target Audience & Interests
            </h3>
            <p className="text-black">
              Tell us about your audience and what you're looking to learn.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-semibold uppercase mb-2 text-black">
                  Who is your target audience and in what industry? Please explain if you have multiple client segments. *
                </label>
                <textarea
                  id="targetAudience"
                  name="targetAudience"
                  rows={3}
                  required
                  value={responses.businessInfo.targetAudience}
                  onChange={(e) => updateBusinessInfo('targetAudience', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Describe your target audience"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="learningInterests" className="block text-sm font-semibold uppercase mb-2 text-black">
                  What are you interested in learning more from this call? *
                </label>
                <textarea
                  id="learningInterests"
                  name="learningInterests"
                  rows={3}
                  required
                  value={responses.businessInfo.learningInterests}
                  onChange={(e) => updateBusinessInfo('learningInterests', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="What would you like to learn?"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="foundUs" className="block text-sm font-semibold uppercase mb-2 text-black">
                  How did you find us? *
                </label>
                <input
                  id="foundUs"
                  name="foundUs"
                  type="text"
                  required
                  value={responses.businessInfo.foundUs}
                  onChange={(e) => updateBusinessInfo('foundUs', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="e.g., Google, Referral, Social Media"
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">3</span>
              Contact Information & Certifications
            </h3>
            <p className="text-black">
              Please provide your contact details and certification information.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="contactInfo" className="block text-sm font-semibold uppercase mb-2 text-black">
                  What is your name, email address, and contact phone number? *
                </label>
                <input
                  id="contactInfo"
                  name="contactInfo"
                  type="text"
                  required
                  value={responses.contactInfo.contactDetails}
                  onChange={(e) => updateContactInfo('contactDetails', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Name, Email, Phone"
                />
              </div>
              
              <div>
                <label htmlFor="certifications" className="block text-sm font-semibold uppercase mb-2 text-black">
                  Is your business certified with WBENC, NMSDC, LGBTQ, Disability, or Veteran-owned? *
                </label>
                <input
                  id="certifications"
                  name="certifications"
                  type="text"
                  required
                  value={responses.contactInfo.certifications}
                  onChange={(e) => updateContactInfo('certifications', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="List any certifications"
                />
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
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-card p-8 text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Thank You!</h2>
            <p className="text-black mb-6">
              We've received your information and will be in touch soon. Thank you for taking the time to tell us about your business.
            </p>
            <p className="text-sm text-black">
              Redirecting to dashboard...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header bar */}
        <div className="bg-primary p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            <img 
              src="/public/logo.jpeg" 
              alt="Company Logo" 
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div className="text-white text-sm font-medium tracking-wide">GET TO KNOW YOU</div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        
        <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </button>
          </div>
          
          <div className="bg-white shadow-card overflow-hidden rounded-xl">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-black">Get To Know You</h2>
              <p className="mt-1 text-sm text-black">
                Help us understand your business better so we can provide tailored solutions.
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
            
            <div className="px-6 py-5">
              {/* Progress indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-primary">
                    Step {currentStep} of {totalSteps}
                  </span>
                  <span className="text-sm font-medium text-black">
                    {Math.round((currentStep / totalSteps) * 100)}% Complete
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Step content */}
              <div className="mb-8">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
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
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
                
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting || isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
        
        {/* Decorative element */}
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Questionnaire;