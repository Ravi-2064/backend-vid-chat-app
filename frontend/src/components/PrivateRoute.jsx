import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-primary">
        <div className="text-white text-2xl font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }
  
  // Check both user object and token
  const token = localStorage.getItem('token');
  const isAuthenticated = user && token;
  
  if (!isAuthenticated) {
    // Clear any stale data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login with the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return children;
};

export default PrivateRoute; 