import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, Mail, Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuthStore } from '../store/authStore';
import { useApi } from '../hooks/useApi';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, register, logout } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const { execute: executeRegister, error, isLoading, clearError } = useApi(
    async () => {
      if (password !== confirmPassword) {
        throw { message: 'Passwords do not match', status: 400 };
      }
      await register(firstName, lastName, email, password);
    },
    {
      onSuccess: () => navigate('/dashboard'),
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
      await executeRegister();
    } catch (error: any) {
      if (error?.code === 'USER_EXISTS') {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    }
  };

  const getErrorMessage = (error: any) => {
    if (error?.message === 'User already registered') {
      return (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-center mb-6">
          This email is already registered. Please{' '}
          <Link to="/login" className="font-bold underline hover:text-blue-800">
            sign in
          </Link>{' '}
          instead.
        </div>
      );
    }
    return (
      <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mb-6">
        {error.message}
      </div>
    );
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
          <div className="text-white text-sm font-medium tracking-wide">ACCOUNT SETUP</div>
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
              <span className="text-primary">Create</span> Account
            </h1>
            <p className="text-center mb-8 text-black">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline transition-all">
                Sign In
              </Link>
            </p>

            {error && getErrorMessage(error)}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                    <User size={16} className="text-primary mr-2" />
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                    <User size={16} className="text-primary mr-2" />
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                    placeholder="Last name"
                  />
                </div>
              </div>

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
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                  <Lock size={16} className="text-primary mr-2" />
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Confirm Password"
                  minLength={6}
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
                    Creating account...
                  </div>
                ) : (
                  'CREATE ACCOUNT'
                )}
              </button>
            </form>
          </div>
        </div>
        
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Register;