import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { currentUser, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && currentUser.role !== requiredRole) {
    const redirectTo = currentUser.role === 'admin' ? '/admin-structure' : '/dashboard';
    return <Navigate to={redirectTo} replace />;
  }

  // Si el usuario está en la ruta incorrecta según su rol
  if (currentUser.role === 'admin' && location.pathname === '/dashboard') {
    return <Navigate to="/admin-structure" replace />;
  }
  if (currentUser.role === 'docente' && location.pathname === '/admin-structure') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
