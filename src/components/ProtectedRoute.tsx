import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
  redirectTo?: string;
  children?: React.ReactNode;
  requiredPremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  redirectTo = '/login',
  children,
  requiredPremium
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredPremium && !user.isPremium) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
