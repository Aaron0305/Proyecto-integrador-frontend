import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
  ThemeProvider,
  Grow,
  Zoom,
  Fade
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  LockReset,
  CheckCircle
} from '@mui/icons-material';
import { theme } from '../../theme/palette';

// Componente de campo de entrada animado
const AnimatedTextField = ({ label, type, value, onChange, icon, endAdornment, ...props }) => {
  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
      <TextField
        label={label}
        type={type}
        fullWidth
        variant="outlined"
        value={value}
        onChange={onChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {icon}
            </InputAdornment>
          ),
          endAdornment: endAdornment,
          sx: {
            '&:hover': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.secondary.main,
              },
            },
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
                borderWidth: 2,
              },
            },
            transition: 'all 0.3s ease-in-out',
          }
        }}
        sx={{
          '& label.Mui-focused': {
            color: theme.palette.primary.main,
          },
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused fieldset': {
              borderColor: theme.palette.primary.main,
            },
          },
          mb: 2,
        }}
        {...props}
      />
    </Grow>
  );
};

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { resetPassword } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación inválido o expirado');
    }
  }, [token]);

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validaciones
    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Token de recuperación inválido');
      setLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container 
        maxWidth="sm" 
        sx={{ 
          mt: 12, 
          mb: 8,
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper 
            elevation={6} 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
              width: '100%',
              background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.paper} 80%, rgba(0, 251, 250, 0.1) 100%)`,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '5px',
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              }
            }}
          >
            <Box sx={{ 
              p: 4, 
              bgcolor: theme.palette.primary.main, 
              color: 'white',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '-15px',
                right: '-15px',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.palette.secondary.light} 0%, transparent 0%)`,
                opacity: 0.3,
              },
            }}>
              <Fade in={true} timeout={1000}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textShadow: '0px 2px 4px rgb(0, 0, 0)'
                  }}
                >
                  Nueva Contraseña
                </Typography>
              </Fade>
              <Fade in={true} timeout={1500}>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Ingresa tu nueva contraseña
                </Typography>
              </Fade>
            </Box>

            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ 
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {error && (
                <Grow in={!!error} timeout={500}>
                  <Alert 
                    severity="error" 
                    variant="filled"
                    sx={{
                      borderRadius: 2,
                      bgcolor: '#f44336',
                      mb: 2,
                      '& .MuiAlert-message': {
                        fontWeight: 500
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </Grow>
              )}

              {success && (
                <Grow in={!!success} timeout={500}>
                  <Alert 
                    severity="success" 
                    variant="filled"
                    sx={{
                      borderRadius: 2,
                      bgcolor: theme.palette.secondary.main,
                      color: theme.palette.common.white,
                      mb: 2,
                      '& .MuiAlert-message': {
                        fontWeight: 500
                      }
                    }}
                  >
                    {success}
                  </Alert>
                </Grow>
              )}

              <AnimatedTextField
                label="Nueva contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock sx={{ color: theme.palette.primary.main }} />}
                disabled={loading || success || !token}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleShowPassword}
                      edge="end"
                      sx={{
                        color: showPassword ? theme.palette.secondary.main : 'inherit',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />

              <AnimatedTextField
                label="Confirmar nueva contraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                icon={<Lock sx={{ color: theme.palette.primary.main }} />}
                disabled={loading || success || !token}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleShowConfirmPassword}
                      edge="end"
                      sx={{
                        color: showConfirmPassword ? theme.palette.secondary.main : 'inherit',
                        transition: 'color 0.3s ease'
                      }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />

              <Zoom in={true} style={{ transitionDelay: '400ms' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disableElevation
                  disabled={loading || success || !token}
                  endIcon={loading ? null : success ? <CheckCircle /> : <LockReset />}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    borderRadius: 2,
                    background: '#041c6c',
                    color: '#fff',
                    fontWeight: 500,
                    mt: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: '#041c6c',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} sx={{ color: '#fff' }} />
                  ) : success ? (
                    'Contraseña Restablecida'
                  ) : (
                    'Restablecer Contraseña'
                  )}
                </Button>
              </Zoom>

              <Fade in={true} style={{ transitionDelay: '600ms' }}>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': {
                          color: theme.palette.secondary.main,
                          textDecoration: 'underline'
                        },
                        transition: 'color 0.3s ease'
                      }}
                    >
                      Volver al inicio de sesión
                    </Typography>
                  </Link>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </ThemeProvider>
  );
}
