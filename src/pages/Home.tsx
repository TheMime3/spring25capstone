import { Link } from 'react-router-dom';
import { LogIn, UserPlus } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const Home = () => {
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
          <div className="text-white text-sm font-medium tracking-wide">PRESENTATION COACH</div>
          <div className="w-10"></div> {/* Spacer for balance */}
        </div>
        
        <div className="max-w-4xl mx-auto py-16 px-6 text-center">
          <img 
            src="/src/logo.jpeg" 
            alt="Company Logo" 
            className="mx-auto h-24 w-24 rounded-full border-4 border-primary mb-8"
          />
          <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-6">
            Welcome to Presentation Coach!
          </h1>
          <p className="text-xl md:text-2xl text-black mb-12 max-w-2xl mx-auto">
            Elevate your presentation skills with personalized coaching and feedback.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200"
            >
              <LogIn className="h-5 w-5 mr-2" />
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-lg text-primary bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Create Account
            </Link>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="fixed right-0 bottom-1/4 w-4 h-4 bg-primary rounded-full opacity-60"></div>
      </div>
    </PageTransition>
  );
};

export default Home;