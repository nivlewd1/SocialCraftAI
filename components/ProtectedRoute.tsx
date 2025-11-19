import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to home page if not authenticated
    // You could also redirect to a specific sign-in page if one existed
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
