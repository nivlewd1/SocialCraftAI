import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wrapper component that requires authentication
 * Shows auth modal if user is not logged in
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage-green mx-auto"></div>
          <p className="mt-4 text-deep-charcoal">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-gray">
        <div className="text-center">
          <h2 className="text-2xl font-bold font-serif text-deep-charcoal mb-4">
            Authentication Required
          </h2>
          <p className="text-deep-charcoal mb-6">
            Please sign in to access this feature
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary py-2 px-6 rounded-md"
          >
            Sign In
          </button>
        </div>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </div>
    );
  }

  return <>{children}</>;
};
