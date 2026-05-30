import React from 'react';
import { Navigate } from 'react-router-dom';

// Placeholder auth check. Replace with real context/hooks later.
function useAuth() {
  return { isAuthenticated: false };
}

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}