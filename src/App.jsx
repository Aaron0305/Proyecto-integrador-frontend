import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ActiveSession from './components/dashboard/ActiveSession';
import { theme } from './theme/palette';
import AdminAccessDialog from './components/Admin/AdminAccessDialog';
import Structure from './components/Admin/Structure';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey="6LccyvsrAAAAAPNhIOvetTXBcp_h8Rh1oU4Sq062"
      scriptProps={{
        async: true,
        defer: true,
        appendTo: 'head'
      }}
    >
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path='/admin-access' element={<AdminAccessDialog />} />
              <Route path='/admin-structure' element={<Structure />} />
              <Route path="/dashboard" element={ <PrivateRoute> <ActiveSession /> </PrivateRoute> } />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
}

export default App;
