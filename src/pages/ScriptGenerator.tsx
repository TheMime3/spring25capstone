import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, CheckCircle, Sparkles, Clock, Trash, AlertCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useScriptGeneratorStore } from '../store/scriptGeneratorStore';
import { useScriptHistoryStore } from '../store/scriptHistoryStore';
import { useQuestionnaireStore } from '../store/questionnaireStore';
import { useAuthStore } from '../store/authStore';
import { GeneratedScript } from '../types/scriptGenerator';
import { api } from '../services/api';

const ScriptGenerator = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryScript, setSelectedHistoryScript] = useState<GeneratedScript | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  
  const {
    responses,
    isLoading,
    error,
    updateResponse,
    saveResponses,
    loadResponses,
  } = useScriptGeneratorStore();

  const {
    scripts,
    addScript,
    getScripts,
    deleteScript
  } = useScriptHistoryStore();

  const { responses: businessProfileResponses, loadQuestionnaire } = useQuestionnaireStore();

  // Load existing data if available
  useEffect(() => {
    loadResponses().catch(console.error);
    loadQuestionnaire().catch(console.error);
  }, [loadResponses, loadQuestionnaire]);

  // Check URL parameters for direct history view
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'history') {
      setShowHistory(true);
      setIsViewingHistory(true);
    }
  }, []);

  const totalSteps = 7;

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
      const success = await saveResponses();
      
      if (success) {
        setIsComplete(true);
      } else {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Failed to submit responses:', error);
      setIsSubmitting(false);
    }
  };

  const generateScriptWithAI = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    
    try {
      const scriptContent = await api.generateScript({
        scriptResponses: responses,
        businessProfile: businessProfileResponses,
        userName: user?.firstName ? `${user.firstName} ${user.lastName}` : undefined
      });
      
      setGeneratedScript(scriptContent);
      
      const title = `${businessProfileResponses.businessInfo.businessName || 'Business'} Script`;
      addScript(scriptContent, title);
    } catch (error: any) {
      console.error('Failed to generate script:', error);
      setGenerationError(error.message || 'Failed to generate script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewHistory = () => {
    // Update URL without reloading the page
    window.history.pushState({}, '', '?view=history');
    setShowHistory(true);
    setIsViewingHistory(true);
    setSelectedHistoryScript(null);
  };

  const handleSelectHistoryScript = (script: GeneratedScript) => {
    setSelectedHistoryScript(script);
    setGeneratedScript(script.content);
    setIsComplete(true);
    setShowHistory(false);
    // Remove the history parameter from URL
    window.history.pushState({}, '', window.location.pathname);
  };

  const handleDeleteScript = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScript(id);
    if (selectedHistoryScript && selectedHistoryScript.id === id) {
      setSelectedHistoryScript(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">1</span>
              Core Problem
            </h3>
            <p className="text-black">
              What is the core problem your business solves?
            </p>
            <p className="text-sm text-gray-500 italic">
              Explain the specific challenge or pain point your target customers face and why it's important to solve it.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="coreProblem" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="coreProblem"
                  name="coreProblem"
                  rows={4}
                  required
                  value={responses.coreProblem}
                  onChange={(e) => updateResponse('coreProblem', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Many small business owners struggle to create engaging video content that effectively communicates their brand story. We make it simple by providing an easy-to-use video scripting and recording solution."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">2</span>
              Ideal Customer
            </h3>
            <p className="text-black">
              Who is your ideal customer, and how do you help them?
            </p>
            <p className="text-sm text-gray-500 italic">
              Describe your target audience and how your product or service makes their lives better.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="idealCustomer" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="idealCustomer"
                  name="idealCustomer"
                  rows={4}
                  required
                  value={responses.idealCustomer}
                  onChange={(e) => updateResponse('idealCustomer', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Our ideal customers are small business owners and entrepreneurs who want to enhance their online presence. We provide them with AI-generated scripts and a guided recording process, so they can create professional videos without prior experience."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">3</span>
              Business Inspiration
            </h3>
            <p className="text-black">
              What inspired you to start this business?
            </p>
            <p className="text-sm text-gray-500 italic">
              Share a personal story or moment that led you to create your business.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="businessInspiration" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="businessInspiration"
                  name="businessInspiration"
                  rows={4}
                  required
                  value={responses.businessInspiration}
                  onChange={(e) => updateResponse('businessInspiration', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="I struggled to explain my own business in a clear and engaging way. After seeing others face the same issue, I realized there was a need for a tool that simplifies storytelling for business owners."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">4</span>
              Unique Value
            </h3>
            <p className="text-black">
              What makes your business unique compared to competitors?
            </p>
            <p className="text-sm text-gray-500 italic">
              Highlight your unique value proposition—what sets you apart in the market.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="uniqueValue" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="uniqueValue"
                  name="uniqueValue"
                  rows={4}
                  required
                  value={responses.uniqueValue}
                  onChange={(e) => updateResponse('uniqueValue', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Unlike other video-making tools, our platform generates scripts based on each user's unique business story and provides step-by-step guidance to create compelling videos."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">5</span>
              Key Message
            </h3>
            <p className="text-black">
              What is the key message you want customers to remember about your business?
            </p>
            <p className="text-sm text-gray-500 italic">
              Summarize your brand's core message in a simple and memorable way.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="keyMessage" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="keyMessage"
                  name="keyMessage"
                  rows={4}
                  required
                  value={responses.keyMessage}
                  onChange={(e) => updateResponse('keyMessage', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="We help business owners turn their ideas into powerful video stories, effortlessly."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">6</span>
              Customer Journey
            </h3>
            <p className="text-black">
              How do customers typically interact with your product/service?
            </p>
            <p className="text-sm text-gray-500 italic">
              Walk through the customer journey from discovery to engagement with your business.
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="customerJourney" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="customerJourney"
                  name="customerJourney"
                  rows={4}
                  required
                  value={responses.customerJourney}
                  onChange={(e) => updateResponse('customerJourney', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Customers sign up, answer a few key questions about their business, and receive a ready-to-use script. They can then record their video using our platform and instantly share it on social media."
                ></textarea>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-black flex items-center">
              <span className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center text-primary font-bold mr-2">7</span>
              Call to Action
            </h3>
            <p className="text-black">
              What is your call to action? (What do you want potential customers to do next?)
            </p>
            <p className="text-sm text-gray-500 italic">
              Provide a clear next step for your audience (e.g., visit your website, book a call, try your product).
            </p>
            <div className="space-y-4">
              <div>
                <label htmlFor="callToAction" className="block text-sm font-semibold mb-2 text-black">
                  Your Answer:
                </label>
                <textarea
                  id="callToAction"
                  name="callToAction"
                  rows={4}
                  required
                  value={responses.callToAction}
                  onChange={(e) => updateResponse('callToAction', e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="If you're ready to create your first professional business video, sign up today and let us help you tell your story!"
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
        <div className="min-h-screen bg-gray-50 font-sans">
          <div className="bg-primary p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center">
              <img 
                src="/src/logo.jpeg" 
                alt="Company Logo" 
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div className="text-white text-sm font-medium tracking-wide">YOUR SCRIPT</div>
            <div className="w-10"></div>
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
                <h2 className="text-xl font-semibold text-black">Your 60-Second Script</h2>
                <p className="mt-1 text-sm text-black">
                  Based on your business profile and responses, we've generated a script for you.
                </p>
              </div>
              
              <div className="px-6 py-5">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-12 h-12 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-4"></div>
                    <p className="text-black">Generating your script with AI...</p>
                    <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                  </div>
                ) : showHistory ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-black">Your Script History</h3>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-sm text-primary hover:text-primary-dark"
                      >
                        Back to Current Script
                      </button>
                    </div>
                    {scripts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>You haven't generated any scripts yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {scripts.map((script) => (
                          <div 
                            key={script.id}
                            onClick={() => handleSelectHistoryScript(script)}
                            className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-black">{script.title}</h4>
                                <p className="text-xs text-gray-500">{formatDate(script.createdAt)}</p>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteScript(script.id, e)}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {script.content.substring(0, 100)}...
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : generatedScript ? (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-black mb-4">Your 60-Second Script</h3>
                      <div className="whitespace-pre-line text-black">
                        {generatedScript}
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        Return to Dashboard
                      </button>
                      
                      {scripts.length > 0 && (
                        <button
                          onClick={handleViewHistory}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          View Script History
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <Sparkles className="h-12 w-12 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">Ready to Generate Your Script</h3>
                    <p className="text-black text-center mb-6">
                      We've collected all the information we need. Click the button below to generate your 60-second script using AI.
                    </p>
                    
                    {generationError && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 w-full max-w-md">
                        <div className="flex">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                          <p className="text-sm text-red-700">
                            {generationError}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={generateScriptWithAI}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <Sparkles className="mr-2 h-5 w-5" />
                        Generate Script with AI
                      </button>
                      
                      {scripts.length > 0 && (
                        <button
                          onClick={handleViewHistory}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <Clock className="mr-2 h-5 w-5" />
                          View Script History
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (showHistory || isViewingHistory) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 font-sans">
          <div className="bg-primary p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center">
              <img 
                src="/src/logo.jpeg" 
                alt="Company Logo" 
                className="h-10 w-10 rounded-full"
              />
            </div>
            <div className="text-white text-sm font-medium tracking-wide">SCRIPT HISTORY</div>
            <div className="w-10"></div>
          </div>
          
          <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <button
                onClick={() => {
                  window.history.pushState({}, '', window.location.pathname);
                  setShowHistory(false);
                  setIsViewingHistory(false);
                  navigate('/dashboard');
                }}
                className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-dark"
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Dashboard
              </button>
            </div>
            
            <div className="bg-white shadow-card overflow-hidden rounded-xl">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-black">Your Script History</h2>
                <p className="mt-1 text-sm text-black">
                  View and manage your previously generated scripts.
                </p>
              </div>
              
              <div className="px-6 py-5">
                {scripts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>You haven't generated any scripts yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scripts.map((script) => (
                      <div 
                        key={script.id}
                        onClick={() => handleSelectHistoryScript(script)}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-black">{script.title}</h4>
                            <p className="text-xs text-gray-500">{formatDate(script.createdAt)}</p>
                          </div>
                          <button 
                            onClick={(e) => handleDeleteScript(script.id, e)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {script.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-sans">
        <div className="bg-primary p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            <img 
              src="/src/logo.jpeg" 
              alt="Company Logo" 
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div className="text-white text-sm font-medium tracking-wide">SCRIPT GENERATOR</div>
          <div className="w-10"></div>
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
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-black">60-Second Script Generator</h2>
                  <p className="mt-1 text-sm text-black">
                    Answer these questions to generate a compelling 60-second script for your business.
                  </p>
                </div>
                
                {scripts.length > 0 && (
                  <button
                    onClick={handleViewHistory}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  >
                    <Clock className="mr-1.5 h-4 w-4" />
                    Script History
                  </button>
                )}
              </div>
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
              
              <div className="mb-8">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin"></div>
                  </div>
                ) : (
                  renderStepContent()
                )}
              </div>
              
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
      </div>
    </PageTransition>
  );
};

export default ScriptGenerator;