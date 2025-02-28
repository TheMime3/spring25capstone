import { useAuthStore } from '../store/authStore';
import { LogOut, User, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
import PageTransition from '../components/PageTransition';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  
  const { execute: executeLogout, isLoading } = useApi(logout, {
    onSuccess: () => navigate('/login'),
    retryCount: 1
  });

  const handleLogout = () => {
    executeLogout();
  };

  const handleStartQuestionnaire = () => {
    navigate('/questionnaire');
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-sans">
        {/* Header bar */}
        <div className="bg-primary p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center">
            <img 
              src="/src/logo.jpeg" 
              alt="Company Logo" 
              className="h-10 w-10 rounded-full"
            />
          </div>
          <div className="text-white text-sm font-medium tracking-wide">DASHBOARD</div>
          <div className="w-10"></div> {/* Spacer for balance */}
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
              <h3 className="text-xl font-semibold text-black mb-6">Your Presentation Journey</h3>
              
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-3 rounded-full mr-4">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-black mb-2">Complete Your Questionnaire</h4>
                    <p className="text-black mb-4">
                      Help us understand your presentation needs by completing a short questionnaire. This will allow us to provide personalized guidance for your specific situation.
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-black mb-2">Upcoming Features</h4>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      Presentation recording and analysis
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      AI-powered feedback on delivery
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      Practice sessions with virtual audience
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-black mb-2">Resources</h4>
                  <ul className="space-y-2 text-black">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Presentation templates</a>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Public speaking tips</a>
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                      <a href="#" className="text-primary hover:underline">Body language guide</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-center text-xs text-black">
            © 2025 Presentation Coach. All rights reserved.
          </p>
        </div>
        
        {/* Decorative element */}
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;