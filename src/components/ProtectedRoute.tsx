import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // If user is logged in and trying to access auth pages (login/signup)
  if (user && !requireAuth) {
    return <Navigate to="/" replace />;
  }

  // If user is not logged in and trying to access protected pages
  if (!user && requireAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
