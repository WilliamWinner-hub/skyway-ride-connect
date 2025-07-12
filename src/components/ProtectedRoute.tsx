import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  allowedRoles = [] 
}: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth state to load

    if (requireAuth && !user) {
      navigate('/auth');
      return;
    }

    if (allowedRoles.length > 0 && user && profile) {
      if (!allowedRoles.includes(profile.role || '')) {
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, requireAuth, allowedRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return null;
  }

  if (allowedRoles.length > 0 && user && profile && !allowedRoles.includes(profile.role || '')) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;