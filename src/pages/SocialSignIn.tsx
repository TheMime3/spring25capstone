import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

interface SocialSignInProps {
  provider: 'Google' | 'Microsoft';
}

const SocialSignIn: React.FC<SocialSignInProps> = ({ provider }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
          <AlertCircle className="mx-auto h-16 w-16 text-yellow-500" />
          <h2 className="text-3xl font-bold text-gray-900">
            {provider} Sign In Not Available
          </h2>
          <p className="text-gray-600 mt-4">
            {provider} authentication is currently under development. Please use email and password to sign in.
          </p>
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Redirecting to login page in a few seconds...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default SocialSignIn;