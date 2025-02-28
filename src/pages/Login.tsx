import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useApi } from '../hooks/useApi';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { execute: executeLogin, error, isLoading, clearError } = useApi(
    async () => login(email, password),
    {
      onSuccess: () => navigate('/dashboard'),
      retryCount: 1
    }
  );

  // Force logout when visiting login page to prevent token bypass
  useEffect(() => {
    // If there's a token in localStorage but we're on the login page,
    // we should clear it to ensure the user has to log in again
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      logout();
    }
  }, [logout]);

  // Only redirect if user logs in through the form
  // We don't auto-redirect based on isAuthenticated anymore

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await executeLogin();
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
          <div className="text-white text-sm font-medium tracking-wide">SIGN IN</div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        
        {/* Main content */}
        <div className="max-w-md mx-auto py-12 px-6">
          <div className="bg-white rounded-xl shadow-card p-8 mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/src/logo.jpeg" 
                alt="Company Logo" 
                className="h-16 w-16 rounded-full"
              />
            </div>
            <h1 className="text-4xl font-extrabold text-center mb-2 text-black">
              <span className="text-primary">Sign</span> In
            </h1>
            <p className="text-center mb-8 text-black">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline transition-all">
                Create Account
              </Link>
            </p>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mb-6">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Email field */}
              <div>
                <label htmlFor="email" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                  <Mail size={16} className="text-primary mr-2" />
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Email address"
                />
              </div>

              {/* Password field */}
              <div>
                <label htmlFor="password" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                  <Lock size={16} className="text-primary mr-2" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'SIGN IN'
                )}
              </button>
            </form>
          </div>
          
          
        </div>
        
        {/* Decorative element */}
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Login;