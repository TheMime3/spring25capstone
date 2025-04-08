import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import { supabase } from '../services/supabase';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetComplete, setResetComplete] = useState(false);

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Get the type and token hash from URL query parameters
        const params = new URLSearchParams(window.location.search);
        const type = params.get('type');
        const tokenHash = params.get('token_hash');
        
        if (!type || !tokenHash) {
          navigate('/login');
          return;
        }

        // Verify the token
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'recovery'
        });

        if (error || !data.session) {
          throw new Error('Invalid or expired reset link');
        }
      } catch (error) {
        console.error('Error verifying reset token:', error);
        navigate('/login');
      }
    };

    handlePasswordReset();
  }, [navigate]);

  const { execute: executePasswordReset, error, isLoading } = useApi(
    async () => {
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      return api.updatePassword(newPassword);
    },
    {
      onSuccess: () => {
        setResetComplete(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executePasswordReset();
  };

  if (resetComplete) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-card p-8 text-center">
            <h2 className="text-2xl font-bold text-black mb-4">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </PageTransition>
    );
  }

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
          <div className="text-white text-sm font-medium tracking-wide">RESET PASSWORD</div>
          <div className="w-10"></div>
        </div>
        
        <div className="max-w-md mx-auto py-12 px-6">
          <div className="bg-white rounded-xl shadow-card p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-black">Reset Your Password</h1>
            
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-center mb-6">
                {error.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                  <Lock size={16} className="text-primary mr-2" />
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="flex items-center text-sm font-semibold uppercase mb-2 text-black">
                  <Lock size={16} className="text-primary mr-2" />
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3.5 border border-gray-300 rounded-lg shadow-input focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin mr-2"></div>
                    Updating Password...
                  </div>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;