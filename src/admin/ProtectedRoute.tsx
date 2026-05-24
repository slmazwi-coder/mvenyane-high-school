import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/storage';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};
