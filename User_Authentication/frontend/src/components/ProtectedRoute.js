import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, loading, isAdmin } = useAuth();

  // Show loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Redirect if not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // Redirect if admin access required but user is not admin
  if (adminOnly && !isAdmin()) {
    return <Navigate to="/unauthorized" />;
  }

  // Render children if authenticated and authorized
  return children;
};

export default ProtectedRoute; 