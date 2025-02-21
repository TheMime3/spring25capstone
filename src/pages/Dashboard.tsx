import { useAuthStore } from '../store/authStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../hooks/useApi';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">Dashboard</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Welcome back, {user?.name}!
              </h3>
              <div className="mt-3 max-w-xl text-sm text-gray-500">
                <p>You're signed in with {user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;