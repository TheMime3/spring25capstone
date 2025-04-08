import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, logout } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const { execute: executeLogin, error, isLoading, clearError } = useApi(
    async () => login(email, password),
    {
      onSuccess: () => navigate('/dashboard'),
      retryCount: 1
    }
  );

  const { execute: executeResetPassword, error: resetError, isLoading: isResetting } = useApi(
    async () => api.resetPassword(email),
    {
      onSuccess: () => {
        setResetEmailSent(true);
        setTimeout(() => {
          setShowResetPassword(false);
          setResetEmailSent(false);
        }, 5000);
      },
      retryCount: 1
    }
  );

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      logout();
    }
  }, [logout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await executeLogin();
    } catch (error: any) {
      console.error('Login failed:', error);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      return;
    }
    try {
      await executeResetPassword();
    } catch (error: any) {
      console.error('Password reset failed:', error);
    }
  };

  const getErrorMessage = (error: any) => {
    if (error?.message === 'Invalid login credentials') {
      return 'Invalid email or password. Please try again.';
    }
    if (error?.message === 'Failed to retrieve user profile') {
      return 'Unable to retrieve your profile. Please ensure your account is properly set up or contact support.';
    }
    if (error?.message === 'User profile not found') {
      return 'Your user profile could not be found. Please ensure your account is properly set up or contact support.';
    }
    if (error?.message === 'Failed to create user profile') {
      return 'Unable to set up your profile. Please try registering again or contact support.';
    }
    return error?.message || 'An error occurred during login. Please try again.';
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
          <div className="text-white text-sm font-medium tracking-wide">SIGN IN</div>
          <div className="w-10"></div>
        </div>
        
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
                {getErrorMessage(error)}
              </div>
            )}

            {showResetPassword ? (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-center mb-4">Reset Password</h2>
                {resetEmailSent ? (
                  <div className="bg-green-50 text-green-600 p-4 rounded-md text-center">
                    Password reset instructions have been sent to your email.
                  </div>
                ) : (
                  <>
                    {resetError && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mb-4">
                        {resetError.message}
                      </div>
                    )}
                    <form onSubmit={handleResetPassword}>
                      <div className="mb-4">
                        <label htmlFor="reset-email" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                          <Mail size={16} className="text-primary mr-2" />
                          Email
                        </label>
                        <input
                          id="reset-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isResetting || !email}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isResetting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          'Send Reset Instructions'
                        )}
                      </button>
                    </form>
                  </>
                )}
                <button
                  onClick={() => setShowResetPassword(false)}
                  className="w-full mt-4 text-primary hover:text-primary-dark font-medium"
                >
                  Back to Sign In
                </button>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
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

                <button
                  type="button"
                  onClick={() => setShowResetPassword(true)}
                  className="w-full text-primary hover:text-primary-dark font-medium"
                >
                  Forgot Password?
                </button>
              </form>
            )}
          </div>
        </div>
        
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Login;