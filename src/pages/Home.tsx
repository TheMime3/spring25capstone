import { Link } from 'react-router-dom';
import { LogIn, UserPlus, Presentation } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Home = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full text-center">
          <Presentation className="mx-auto h-20 w-20 text-blue-500 mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Presentation Coach!
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12">
            Let's get started.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Home;