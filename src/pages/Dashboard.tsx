import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, ClipboardList, Sparkles, Clock, Video } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useApi } from '../hooks/useApi';
import PageTransition from '../components/PageTransition';
import { useScriptHistoryStore } from '../store/scriptHistoryStore';
import VideoList from '../components/VideoList';
import { useVideoStore } from '../store/videoStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { scripts, getScripts } = useScriptHistoryStore();
  const { videos, getVideos } = useVideoStore();
  
  const { execute: executeLogout, isLoading } = useApi(logout, {
    onSuccess: () => navigate('/login'),
    retryCount: 1
  });

  // Load scripts and videos when component mounts
  useEffect(() => {
    Promise.all([
      getScripts(),
      getVideos()
    ]).catch(console.error);
  }, [getScripts, getVideos]);

  const handleLogout = () => {
    executeLogout();
  };

  const handleStartQuestionnaire = () => {
    navigate('/questionnaire');
  };

  const handleStartScriptGenerator = () => {
    navigate('/script-generator');
  };

  const handleViewScriptHistory = () => {
    navigate('/script-generator?view=history');
  };

  const handleStartRecording = () => {
    navigate('/recording');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

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
          <div className="text-white text-sm font-medium tracking-wide">DASHBOARD</div>
          <div className="w-10"></div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-6">
          <div className="bg-white rounded-xl shadow-card p-8 mb-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-full">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-black">
                    Welcome back, <span className="text-primary">{user?.firstName} {user?.lastName}</span>!
                  </h2>
                  <p className="text-black">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing out...
                  </div>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </>
                )}
              </button>
            </div>
            
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-xl font-semibold text-black mb-6">Your Business Profile</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-2">Complete Your Business Profile</h4>
                    <p className="text-black mb-4">
                      Help us understand your business better by completing our "Get To Know You" questionnaire. This will allow us to provide personalized solutions for your specific needs.
                    </p>
                    <button
                      onClick={handleStartQuestionnaire}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                    >
                      <ClipboardList className="mr-2 h-5 w-5" />
                      Start Questionnaire
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-2">Generate Your 60-Second Script</h4>
                    <p className="text-black mb-4">
                      Create a compelling 60-second script for your business by answering a few questions. Our AI will generate a professional script based on your responses and business profile.
                    </p>
                    <button
                      onClick={handleStartScriptGenerator}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      Create Script
                    </button>
                  </div>
                </div>
              </div>
              
              {scripts.length > 0 && (
                <>
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-black mb-2">Your Script History</h4>
                        <p className="text-black mb-4">
                          You have {scripts.length} saved script{scripts.length !== 1 ? 's' : ''}. Your most recent script was created on {scripts.length > 0 ? formatDate(scripts[0].createdAt) : ''}.
                        </p>
                        <button
                          onClick={handleViewScriptHistory}
                          className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                        >
                          <Clock className="mr-2 h-5 w-5" />
                          View Script History
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        <Video className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-black mb-2">Record Your Script</h4>
                        <p className="text-black mb-4">
                          Ready to record? Use our teleprompter to record a professional video of your latest script. Features include auto-scrolling, word highlighting, and HD video recording.
                        </p>
                        <button
                          onClick={handleStartRecording}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
                        >
                          <Video className="mr-2 h-5 w-5" />
                          Start Recording
                        </button>
                      </div>
                    </div>
                  </div>

                  {videos.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                      <div className="flex items-start">
                        <div className="bg-primary/10 p-3 rounded-full mr-4">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-black mb-2">Your Recorded Videos</h4>
                          <p className="text-black mb-4">
                            You have {videos.length} recorded video{videos.length !== 1 ? 's' : ''}.
                            Share them with others or watch them again.
                          </p>
                          <VideoList />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-black mb-2">Our Services</h4>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      Business strategy consulting
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      Marketing and brand development
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      Digital transformation solutions
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-black mb-2">Resources</h4>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Business growth guide</a>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Marketing strategy templates</a>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Industry reports</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-black">
            © 2025 Business Solutions. All rights reserved.
          </p>
        </div>
        
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;