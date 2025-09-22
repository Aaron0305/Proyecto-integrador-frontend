import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ActiveSession from './components/dashboard/ActiveSession';
import Structure from './components/Admin/Structure';
import ProtectedRoute from './components/Auth/ProtectedRoute';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  HOME: '/',
  AdminStructure: '/admin-structure',
  DASHBOARD: '/dashboard',
};

export default function Router() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
      
      {/* Ruta del dashboard protegida para docentes */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute requiredRole="docente">
            <ActiveSession />
          </ProtectedRoute>
        } 
      />
      
      {/* Ruta de administración protegida para admins */}
      <Route 
        path={ROUTES.AdminStructure} 
        element={
          <ProtectedRoute requiredRole="admin">
            <Structure />
          </ProtectedRoute>
        } 
      />
      
      {/* Redirección por defecto basada en el rol */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
