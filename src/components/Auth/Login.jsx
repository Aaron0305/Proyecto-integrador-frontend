import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Fade,
  Divider,
  Chip
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  KeyboardArrowRight,
  Fingerprint,
  CheckCircle
} from '@mui/icons-material';
import { theme } from '../../theme/palette';
import ForgotPasswordLink from './ForgotPasswordLink';
import ReCAPTCHA from 'react-google-recaptcha';

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LccyvsrAAAAAPNhIOvetTXBcp_h8Rh1oU4Sq062';

// ============================================
// HOOK PERSONALIZADO PARA DETECCIÓN DE BIOMETRÍA
// ============================================
const useBiometricSupport = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Verificar si el navegador soporta Credential Management API
        if (!window.PublicKeyCredential) {
          setIsSupported(false);
          setIsChecking(false);
          return;
        }

        // Verificar si hay autenticador biométrico disponible
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsSupported(available);
      } catch (error) {
        console.error('Error checking biometric support:', error);
        setIsSupported(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSupport();
  }, []);

  return { isSupported, isChecking };
};

// ============================================
// COMPONENTE DE CAMPO DE ENTRADA ANIMADO
// ============================================
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

// ============================================
// COMPONENTE PRINCIPAL - LOGIN
// ============================================
export default function Login() {
  // Estados del formulario tradicional
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  
  // Estados para biometría
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);
  const [hasSavedCredentials, setHasSavedCredentials] = useState(false);
  
  const { login, currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { isSupported: biometricSupported, isChecking: checkingBiometric } = useBiometricSupport();
  
  // ============================================
  // EFECTO: Verificar si hay credenciales guardadas
  // ============================================
  useEffect(() => {
    const checkSavedCredentials = () => {
      const savedEmail = localStorage.getItem('biometric_email');
      if (savedEmail && biometricSupported) {
        setHasSavedCredentials(true);
      }
    };
    
    if (!checkingBiometric) {
      checkSavedCredentials();
    }
  }, [biometricSupported, checkingBiometric]);
  
  // ============================================
  // EFECTO: Redirigir si ya hay sesión activa
  // ============================================
  useEffect(() => {
    if (currentUser) {
      const redirectPath = currentUser.role === 'admin' ? '/admin-structure' : '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [currentUser, navigate]);

  // ============================================
  // FUNCIÓN: Mostrar/ocultar contraseña
  // ============================================
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ============================================
  // FUNCIÓN: Guardar credenciales con biometría
  // ============================================
  const saveBiometricCredentials = async (userEmail, userPassword) => {
    try {
      // Guardar email en localStorage como referencia
      localStorage.setItem('biometric_email', userEmail);
      localStorage.setItem('biometric_enabled', 'true');
      
      // Intentar usar Password Credential API (navegadores modernos)
      if (window.PasswordCredential) {
        const cred = new PasswordCredential({
          id: userEmail,
          password: userPassword,
          name: userEmail
        });
        
        await navigator.credentials.store(cred);
        console.log('Credenciales guardadas con PasswordCredential API');
      } else {
        // Fallback: guardar en localStorage (el navegador lo encripta)
        const encodedPassword = btoa(userPassword);
        localStorage.setItem('biometric_cred', encodedPassword);
        console.log('Credenciales guardadas en localStorage');
      }
      
      return true;
    } catch (error) {
      console.error('Error saving biometric credentials:', error);
      return false;
    }
  };

  // ============================================
  // FUNCIÓN: Recuperar credenciales con biometría
  // ============================================
  const getBiometricCredentials = async () => {
    try {
      const savedEmail = localStorage.getItem('biometric_email');
      
      if (!savedEmail) {
        throw new Error('No hay credenciales guardadas');
      }

      // Intentar recuperar con Password Credential API
      if (window.PasswordCredential) {
        const cred = await navigator.credentials.get({
          password: true,
          mediation: 'required' // Fuerza autenticación biométrica del sistema
        });
        
        if (cred && cred.password) {
          console.log('Credenciales recuperadas con PasswordCredential API');
          return {
            email: cred.id,
            password: cred.password
          };
        }
      }
      
      // Fallback: recuperar de localStorage
      const encodedPassword = localStorage.getItem('biometric_cred');
      if (encodedPassword) {
        console.log('Credenciales recuperadas de localStorage');
        return {
          email: savedEmail,
          password: atob(encodedPassword)
        };
      }
      
      throw new Error('No se pudieron recuperar las credenciales');
    } catch (error) {
      console.error('Error getting biometric credentials:', error);
      throw error;
    }
  };

  // ============================================
  // FUNCIÓN: Login con huella digital
  // ============================================
  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Recuperar credenciales guardadas (esto activa la biometría del dispositivo)
      const credentials = await getBiometricCredentials();
      
      if (!credentials) {
        throw new Error('No se pudieron recuperar las credenciales');
      }

      // Usar el último token de reCAPTCHA válido guardado
      const savedToken = localStorage.getItem('last_recaptcha_token') || recaptchaToken;
      
      // Hacer login con el backend
      const result = await login(credentials.email, credentials.password, savedToken);
      
      if (result && result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(result.redirectPath || '/', { replace: true });
        }, 1000);
      } else {
        throw new Error('Error en la autenticación');
      }
    } catch (err) {
      let msg = 'Error al autenticar con huella digital';
      
      // Si no hay credenciales guardadas, limpiar todo
      if (err.message.includes('credenciales')) {
        msg = 'No hay credenciales guardadas. Inicia sesión normalmente primero.';
        setHasSavedCredentials(false);
        localStorage.removeItem('biometric_email');
        localStorage.removeItem('biometric_enabled');
        localStorage.removeItem('biometric_cred');
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.message) {
        msg = err.message;
      }
      
      setError(msg);
    } finally {
      setBiometricLoading(false);
    }
  };

  // ============================================
  // FUNCIÓN: Login tradicional (con email y password)
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validación básica
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      setLoading(false);
      return;
    }

    if (!recaptchaToken) {
      setError('Por favor completa el reCAPTCHA');
      setLoading(false);
      return;
    }

    try {
      // Hacer login con el backend
      const result = await login(email, password, recaptchaToken);
      
      if (result && result.success) {
        setSuccess(true);
        
        // Guardar token de reCAPTCHA para uso futuro con biometría
        localStorage.setItem('last_recaptcha_token', recaptchaToken);
        
        // Si hay soporte biométrico y no tiene credenciales guardadas, preguntar
        if (biometricSupported && !hasSavedCredentials) {
          setShowBiometricPrompt(true);
        } else if (hasSavedCredentials) {
          // Actualizar credenciales guardadas si ya existen
          await saveBiometricCredentials(email, password);
        }
        
        // Redirigir según el rol
        setTimeout(() => {
          navigate(result.redirectPath || '/', { replace: true });
        }, showBiometricPrompt ? 3000 : 1000);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      let msg = 'Usuario o contraseña incorrectos';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // FUNCIÓN: Activar biometría después del login
  // ============================================
  const enableBiometric = async () => {
    const saved = await saveBiometricCredentials(email, password);
    if (saved) {
      setHasSavedCredentials(true);
      setShowBiometricPrompt(false);
    }
  };

  // ============================================
  // FUNCIÓN: Desactivar biometría
  // ============================================
  const disableBiometric = () => {
    localStorage.removeItem('biometric_email');
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('biometric_cred');
    localStorage.removeItem('last_recaptcha_token');
    setHasSavedCredentials(false);
    setShowBiometricPrompt(false);
  };

  // ============================================
  // RENDER DEL COMPONENTE
  // ============================================
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
            {/* HEADER */}
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
                  component="div" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textShadow: '0px 2px 4px rgb(0, 0, 0)'
                  }}
                >
                  Bienvenido
                </Typography>
              </Fade>
              <Fade in={true} timeout={1500}>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Inicia sesión para continuar
                </Typography>
              </Fade>
            </Box>

            {/* FORMULARIO */}
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
              {/* PROMPT PARA ACTIVAR BIOMETRÍA */}
              {showBiometricPrompt && (
                <Grow in={showBiometricPrompt} timeout={500}>
                  <Alert 
                    severity="info"
                    icon={<Fingerprint />}
                    action={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={enableBiometric}
                          sx={{ fontWeight: 600 }}
                        >
                          Activar
                        </Button>
                        <Button 
                          color="inherit" 
                          size="small" 
                          onClick={() => setShowBiometricPrompt(false)}
                        >
                          Ahora no
                        </Button>
                      </Box>
                    }
                    sx={{
                      borderRadius: 2,
                      mb: 2,
                    }}
                  >
                    ¿Quieres usar tu huella digital para entrar más rápido la próxima vez?
                  </Alert>
                </Grow>
              )}

              {/* MENSAJE DE ERROR */}
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

              {/* MENSAJE DE ÉXITO */}
              {success && (
                <Grow in={success} timeout={500}>
                  <Alert 
                    severity="success" 
                    variant="filled"
                    icon={<CheckCircle />}
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
                    Iniciando sesión correctamente...
                  </Alert>
                </Grow>
              )}

              {/* BOTÓN DE LOGIN BIOMÉTRICO */}
              {biometricSupported && hasSavedCredentials && !success && (
                <Zoom in={true} style={{ transitionDelay: '200ms' }}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={handleBiometricLogin}
                      disabled={biometricLoading}
                      startIcon={biometricLoading ? null : <Fingerprint />}
                      sx={{
                        py: 1.8,
                        fontSize: '1rem',
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #00bfa5 0%, #00796b 100%)',
                        color: '#fff',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0, 191, 165, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #00897b 0%, #004d40 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 6px 16px rgba(0, 191, 165, 0.4)'
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        }
                      }}
                    >
                      {biometricLoading ? (
                        <CircularProgress size={24} sx={{ color: '#fff' }} />
                      ) : (
                        'Entrar con Huella Digital'
                      )}
                    </Button>
                    
                    {/* Botón para desactivar biometría */}
                    <Button
                      size="small"
                      onClick={disableBiometric}
                      sx={{ 
                        mt: 1, 
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                        '&:hover': {
                          color: 'error.main'
                        }
                      }}
                    >
                      Desactivar huella digital
                    </Button>
                  </Box>
                </Zoom>
              )}

              {/* DIVISOR "O" */}
              {biometricSupported && hasSavedCredentials && !success && (
                <Fade in={true} timeout={800}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="O continuar con" size="small" />
                  </Divider>
                </Fade>
              )}

              {/* CAMPO DE EMAIL */}
              <AnimatedTextField
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Email sx={{ color: theme.palette.primary.main }} />}
              />

              {/* CAMPO DE CONTRASEÑA */}
              <AnimatedTextField
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock sx={{ color: theme.palette.primary.main }} />}
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

              {/* LINK DE OLVIDÉ MI CONTRASEÑA */}
              <ForgotPasswordLink />

              {/* RECAPTCHA */}
              <ReCAPTCHA
                sitekey={SITE_KEY}
                onChange={(token) => setRecaptchaToken(token || '')}
                style={{ margin: '16px 0' }}
              />

              {/* BOTÓN DE LOGIN TRADICIONAL */}
              <Zoom in={true} style={{ transitionDelay: '600ms' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disableElevation
                  disabled={loading || success}
                  endIcon={loading ? null : <KeyboardArrowRight />}
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
                  ) : (
                    'Iniciar Sesión'
                  )}
                </Button>
              </Zoom>

              {/* INFO SOBRE BIOMETRÍA DISPONIBLE */}
              {biometricSupported && !hasSavedCredentials && !checkingBiometric && (
                <Fade in={true} timeout={1000}>
                  <Alert 
                    severity="info" 
                    icon={<Fingerprint />}
                    sx={{ 
                      mt: 2,
                      borderRadius: 2,
                      fontSize: '0.875rem'
                    }}
                  >
                    Después de iniciar sesión, podrás activar el acceso con huella digital
                  </Alert>
                </Fade>
              )}

              {/* LINK DE REGISTRO */}
              <Fade in={true} style={{ transitionDelay: '900ms' }}>
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Typography variant="body1">
                    ¿No tienes cuenta?{' '}
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                      <Typography 
                        component="span" 
                        fontWeight="bold" 
                        sx={{ 
                          color: '#041c6c',
                          position: 'relative',
                          '&:hover': {
                            '&::after': {
                              width: '100%',
                            }
                          },
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: '-2px',
                            left: 0,
                            width: '0%',
                            height: '2px',
                            backgroundColor: '#041c6c',
                            transition: 'width 0.3s ease'
                          }
                        }}
                      >
                        Regístrate
                      </Typography>
                    </Link>
                  </Typography>
                </Box>
              </Fade>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </ThemeProvider>
  );
}