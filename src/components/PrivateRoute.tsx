import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is admin using the admin_list table
  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      return error ? false : data;
    } catch {
      return false;
    }
  };

  // Redirect admin to admin dashboard
  if (checkAdminAccess() && window.location.pathname !== '/admin') {
    return <Navigate to="/admin" />;
  }

  // Prevent non-admins from accessing admin dashboard
  if (!checkAdminAccess() && window.location.pathname === '/admin') {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;