import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // 또는 스피너

  return isAuthenticated ? children : (
    <Navigate to="/" replace state={{ from: location }} />
  );
}
