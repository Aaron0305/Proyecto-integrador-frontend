import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Agregar esta importación
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Close
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Estilo personalizado para el diálogo
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #174baa, #1d71c8, #FFD700)',
    }
  }
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  background: 'linear-gradient(135deg, #174baa 0%, #1d71c8 100%)',
  color: '#ffffff',
  textAlign: 'center',
  padding: '24px',
  position: 'relative',
  '& .MuiTypography-root': {
    fontWeight: 600,
    fontSize: '1.3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  }
}));

const AdminTextField = styled(TextField)(() => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 0 0 2px rgba(23, 75, 170, 0.2)',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#174baa',
    }
  }
}));

const AdminButton = styled(Button)(() => ({
  borderRadius: '10px',
  padding: '12px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&.MuiButton-contained': {
    background: 'linear-gradient(45deg, #174baa 30%, #1d71c8 90%)',
    boxShadow: '0 4px 15px rgba(23, 75, 170, 0.3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #1d71c8 30%, #174baa 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(23, 75, 170, 0.4)',
    }
  },
  '&.MuiButton-text': {
    color: '#666',
    '&:hover': {
      backgroundColor: 'rgba(0,0,0,0.04)',
    }
  }
}));

export default function AdminAccessDialog({ open, onClose, onSuccess }) {
  const navigate = useNavigate(); // Agregar el hook useNavigate
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const ADMIN_PASSWORD = 'admin123'; // Cambia esto por la contraseña que desees

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setAdminError('');

    // Simular una pequeña demora para mostrar el estado de carga
    setTimeout(() => {
      if (adminPassword === ADMIN_PASSWORD) {
        setAdminPassword('');
        setAdminError('');
        setIsLoading(false);
        
        // Cerrar el diálogo primero
        onClose();
        
        // Llamar a onSuccess si se proporciona
        if (onSuccess) {
          onSuccess();
        }
        
        // Navegar a la ruta de admin-structure
        navigate('/admin-structure');
      } else {
        setAdminError('Contraseña incorrecta. Intenta nuevamente.');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleDialogClose = () => {
    if (!isLoading) {
      setAdminPassword('');
      setAdminError('');
      setShowPassword(false);
      onClose();
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <StyledDialog 
      open={open} 
      onClose={handleDialogClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      <StyledDialogTitle>
        <AdminPanelSettings sx={{ fontSize: '1.5rem' }} />
        Acceso Administrativo
        <IconButton
          onClick={handleDialogClose}
          disabled={isLoading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'rgba(255,255,255,0.7)',
            '&:hover': {
              color: '#ffffff',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }
          }}
        >
          <Close />
        </IconButton>
      </StyledDialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ padding: '32px', textAlign: 'center' }}>
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 3, 
              color: '#666',
              fontSize: '1rem',
              lineHeight: 1.6 
            }}
          >
            Ingresa la contraseña de administrador para acceder al panel de control del sistema.
          </Typography>

          {adminError && (
            <Fade in={!!adminError}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2, 
                  borderRadius: '12px',
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                {adminError}
              </Alert>
            </Fade>
          )}

          <AdminTextField
            autoFocus
            margin="dense"
            label="Contraseña de Administrador"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            error={!!adminError}
            disabled={isLoading}
            placeholder="Ingresa tu contraseña..."
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    disabled={isLoading}
                    sx={{
                      color: '#174baa',
                      '&:hover': {
                        backgroundColor: 'rgba(23, 75, 170, 0.1)',
                      }
                    }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <Box sx={{ mt: 2, mb: 1 }}>
            <Typography variant="caption" sx={{ color: '#888', fontStyle: 'italic' }}>
              💡 Contacta al administrador del sistema si no tienes acceso
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ padding: '16px 32px 32px 32px', gap: 2 }}>
          <AdminButton 
            onClick={handleDialogClose}
            disabled={isLoading}
            variant="text"
            sx={{ minWidth: '100px' }}
          >
            Cancelar
          </AdminButton>
          <AdminButton 
            type="submit" 
            variant="contained"
            disabled={isLoading || !adminPassword.trim()}
            sx={{ 
              minWidth: '120px',
              opacity: (!adminPassword.trim() || isLoading) ? 0.7 : 1
            }}
          >
            {isLoading ? 'Verificando...' : 'Ingresar'}
          </AdminButton>
        </DialogActions>
      </form>
    </StyledDialog>
  );
}