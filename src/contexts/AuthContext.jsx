import React, { createContext, useState, useEffect } from 'react';
import apiClient, { API_CONFIG } from '../config/api.js';
import setupAxiosInterceptors from '../utils/axiosDebugger';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Configurar interceptors de axios para debugging
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  const login = async (email, password) => {
    try {
              const response = await apiClient.post('/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        setRetryCount(0); // Reset retry count on successful login
        
        // Determinar la ruta de redirección basada en el rol
        const redirectPath = user.role === 'admin' ? '/admin-structure' : '/dashboard';
        return { success: true, user, redirectPath };
      }
      
      throw new Error('Credenciales inválidas');
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  const register = async (userData) => {
    try {
              const response = await apiClient.post('/api/auth/register', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        return { success: true, user: response.data.user, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Error inesperado durante el registro');
      }
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Error al registrar usuario. Por favor, intenta de nuevo.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setRetryCount(0);
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setLoading(false);
    } catch (err) {
      console.error('Error parsing saved user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setLoading(false);
    }

    try {
              const response = await apiClient.get('/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      setRetryCount(0); // Reset retry count on successful verification
      setLoading(false);
      
    } catch (error) {
      console.error('Error verificando token:', error);
      
      // Si el error es de autenticación y no hemos excedido los reintentos
      if (error.response?.status === 401 && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        // Reintentamos en 1 segundo
        setTimeout(verifyToken, 1000);
        return;
      }
      
      // Si excedimos los reintentos o es otro tipo de error, limpiamos todo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  // Verificar el token cada 5 minutos
  useEffect(() => {
    const interval = setInterval(verifyToken, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, []);

  const updateUserProfile = async () => {
    await verifyToken(); // Usar la misma función de verificación
    return currentUser;
  };

  const forgotPassword = async (email) => {
    try {
              const response = await apiClient.post('/api/auth/forgot-password', {
        email
      });
      
      return { 
        success: true, 
        message: response.data.message || 'Se ha enviado un enlace de recuperación a tu correo electrónico' 
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al procesar la solicitud');
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
              const response = await apiClient.post('/api/auth/reset-password', {
        token,
        newPassword
      });
      
      return { 
        success: true, 
        message: response.data.message || 'Contraseña restablecida exitosamente' 
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al restablecer la contraseña');
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        currentUser, 
        login, 
        register, 
        logout,
        loading,
        updateUserProfile,
        forgotPassword,
        resetPassword,
        verifyToken // Exponemos la función de verificación
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};