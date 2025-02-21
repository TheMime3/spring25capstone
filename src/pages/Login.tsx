import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useApi } from '../hooks/useApi';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { execute: executeLogin, error, isLoading, clearError } = useApi(
    async () => login(email, password),
    {
      onSuccess: () => navigate('/dashboard'),
      retryCount: 1
    }
  );

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await executeLogin();
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
          <div className="text-center">
            <LogIn className="mx-auto h-12 w-12 text-blue-500" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Sign in to your account</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
              {error.message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Email address"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Password"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <p className="mt-2 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;