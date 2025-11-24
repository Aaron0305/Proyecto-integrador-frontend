import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { API_CONFIG } from '../../config/api.js';
import apiClient from '../../config/api.js';
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
  MenuItem,
  CircularProgress,
  ThemeProvider,
  Grow,
  Zoom,
  Fade,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Badge,
  Person,
  School,
  MenuBook,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  PhotoCamera,
  Save,
  Fingerprint
} from '@mui/icons-material';
import { theme } from '../../theme/palette';

const AnimatedTextField = ({ label, type, value, onChange, icon, endAdornment, select, children, ...props }) => {
  return (
    <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
      <TextField
        label={label}
        type={type}
        fullWidth
        variant="outlined"
        value={value}
        onChange={onChange}
        select={select}
        InputProps={{
          startAdornment: icon && (
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
      >
        {children}
      </TextField>
    </Grow>
  );
};

export default function Register() {
  const [activeStep, setActiveStep] = useState(0);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [carreras, setCarreras] = useState([]);
  const [isLoadingCarreras, setIsLoadingCarreras] = useState(true);
  const [formData, setFormData] = useState({
    numeroControl: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    carrera: '',
    role: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fingerprintRegistered, setFingerprintRegistered] = useState(false);
  const [isRegisteringFingerprint, setIsRegisteringFingerprint] = useState(false);
  const [webauthnCredentialId, setWebauthnCredentialId] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, checkEmailExists, checkNumeroControlExists } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCarreras = async () => {
      setIsLoadingCarreras(true);
      try {
        const response = await fetch(`${API_CONFIG.CARRERAS_URL}`);
        if (!response.ok) {
          throw new Error('Error al cargar carreras');
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCarreras(data);
        } else {
          throw new Error('Formato de datos inválido');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error al cargar las carreras');
      } finally {
        setIsLoadingCarreras(false);
      }
    };

    fetchCarreras();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  const handleEmailBlur = async () => {
    if (formData.email.trim() !== '') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@tesjo\.edu\.mx$/;
      if (!emailRegex.test(formData.email)) {
        setError('Por favor, introduce un correo válido (ejemplo: usuario@tesjo.edu.mx)');
        return;
      }
      try {
        const emailExists = await checkEmailExists(formData.email);
        if (emailExists) {
          setError('Este correo electrónico ya está registrado');
        }
      } catch (err) {
        console.error('Error al verificar email:', err);
      }
    }
  };

  const handleNumeroControlBlur = async () => {
    if (formData.numeroControl.trim() !== '') {
      const numeroControlRegex = /^[0-9A-Z]{10,15}$/; 
      if (!numeroControlRegex.test(formData.numeroControl)) {
        setError('El número de empleado debe tener entre 10-15 dígitos');
        return;
      }
      try {
        const numeroControlExists = await checkNumeroControlExists(formData.numeroControl);
        if (numeroControlExists) {
          setError('Este número de control ya está registrado');
        }
      } catch (err) {
        console.error('Error al verificar número de control:', err);
      }
    }
  };

  const handleShowPassword = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleNumeroControlChange = (e) => {
    const { value } = e.target;
    const numeroControl = value.replace(/[^0-9A-Z]/g, '');
    if (numeroControl.length <= 15) {
      setFormData({ 
        ...formData,
        numeroControl
      });
      setError('');
    }
  };

  const handleFotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) {
        setError('La imagen no debe superar los 5MB');
        return;
      }
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // CORRECCIÓN: Usar Uint8Array en lugar de Buffer.from para mejor compatibilidad
  const base64UrlToArrayBuffer = (base64Url) => {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    
    const binaryString = window.atob(paddedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  // CORRECCIÓN: Asegurar que siempre devuelva base64url válido
  const arrayBufferToBase64Url = (buffer) => {
    const view = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < view.byteLength; i++) {
      binary += String.fromCharCode(view[i]);
    }
    const base64 = window.btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  const isWebAuthnAvailable = () => {
    return (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      navigator.credentials &&
      navigator.credentials.create &&
      window.PublicKeyCredential
    );
  };

  const handleRegisterFingerprint = async () => {
    setIsRegisteringFingerprint(true);
    setError('');
    
    try {
      if (!isWebAuthnAvailable()) {
        throw new Error(
          'Tu navegador no soporta autenticación biométrica. ' +
          'Por favor, usa un navegador moderno como Chrome, Firefox, Edge o Safari (versión 14+).'
        );
      }

      if (!formData.email || !formData.email.trim()) {
        throw new Error('Por favor, ingresa tu correo electrónico primero.');
      }

      console.log('Iniciando registro de huella digital para:', formData.email);

      // Obtener el challenge del backend
      const challengeResponse = await apiClient.post(`${API_CONFIG.WEBAUTHN_URL}/register/begin`, {
        email: formData.email,
        username: `${formData.nombre} ${formData.apellidoPaterno}`.trim() || formData.email
      });

      if (!challengeResponse.data.success) {
        throw new Error(challengeResponse.data.message || 'Error al iniciar el registro');
      }

      const { challenge, user, rp } = challengeResponse.data;

      console.log('Challenge recibido:', challenge);

      // Convertir base64url a ArrayBuffer
      const challengeArrayBuffer = base64UrlToArrayBuffer(challenge);
      const userIdArrayBuffer = base64UrlToArrayBuffer(user.id);

      const publicKeyCredentialCreationOptions = {
        challenge: challengeArrayBuffer,
        rp: {
          name: rp.name || 'Sistema de Gestión Académica',
          id: rp.id || window.location.hostname,
        },
        user: {
          id: userIdArrayBuffer,
          name: user.name || formData.email,
          displayName: user.displayName || formData.email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },
          { alg: -257, type: 'public-key' },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: 'direct',
      };

      console.log('Opciones de creación:', publicKeyCredentialCreationOptions);

      let credential;
      try {
        credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        });
      } catch (webauthnError) {
        console.error('Error de WebAuthn:', webauthnError);
        if (webauthnError.name === 'NotAllowedError') {
          throw new Error('Registro cancelado o el dispositivo no está disponible.');
        } else if (webauthnError.name === 'InvalidStateError') {
          throw new Error('Ya existe una huella registrada para este dispositivo.');
        } else if (webauthnError.name === 'NotSupportedError') {
          throw new Error('Tu dispositivo no soporta autenticación biométrica.');
        } else if (webauthnError.name === 'SecurityError') {
          throw new Error('Error de seguridad. Asegúrate de estar usando HTTPS o localhost.');
        } else {
          throw new Error(`Error al capturar la huella: ${webauthnError.message}`);
        }
      }

      if (!credential) {
        throw new Error('No se recibió credencial del dispositivo');
      }

      console.log('Credencial recibida:', credential);

      // CORRECCIÓN CRÍTICA: Normalizar credential.id a base64url válido
      // Diferentes navegadores devuelven credential.id en distintos formatos:
      // - Chrome: a veces base64 normal (con +, /, =)
      // - Firefox: a veces ya es base64url
      // - Safari: puede ser Uint8Array
      let credentialId = credential.id;
      
      if (credential.id instanceof ArrayBuffer || credential.id instanceof Uint8Array) {
        // Si es buffer, convertir a base64url
        credentialId = arrayBufferToBase64Url(credential.id);
        console.log('[WebAuthn] credential.id era Uint8Array/ArrayBuffer, convertido a base64url');
      } else if (typeof credential.id === 'string') {
        // Si es string, normalizar a base64url
        // Remover caracteres de padding y convertir caracteres base64 especiales
        credentialId = credential.id
          .replace(/\+/g, '-')      // + -> -
          .replace(/\//g, '_')      // / -> _
          .replace(/=/g, '');       // eliminar padding =
        console.log('[WebAuthn] credential.id normalizado de string a base64url');
      }
      
      console.log('[WebAuthn] credentialId final (primeros 40 chars):', credentialId.substring(0, 40));

      // CORRECCIÓN CRÍTICA: Convertir correctamente la credencial
      const response = {
        id: credentialId,  // ✅ Ahora es base64url válido
        rawId: arrayBufferToBase64Url(credential.rawId), // CORRECCIÓN: debe ser base64url
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
          attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
        },
      };

      console.log('Respuesta convertida a enviar:', {
        ...response,
        rawId: response.rawId.substring(0, 20) + '...', // Solo mostrar parte para logs
      });

      // Enviar al backend
      const verifyResponse = await apiClient.post(`${API_CONFIG.WEBAUTHN_URL}/register/complete`, {
        email: formData.email,
        credential: response,
      });

      console.log('Respuesta del servidor:', verifyResponse.data);

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Error al verificar la huella');
      }

      setWebauthnCredentialId(verifyResponse.data.credentialId);
      setFingerprintRegistered(true);
      setError('');

    } catch (err) {
      console.error('Error al registrar huella:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Error al registrar la huella digital. Por favor, intenta de nuevo.');
      }
      
      setFingerprintRegistered(false);
      setWebauthnCredentialId(null);
    } finally {
      setIsRegisteringFingerprint(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeStep !== steps.length - 1) {
      handleNext();
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      if (!formData.role) {
        throw new Error('Por favor selecciona un rol');
      }

      if (!fingerprintRegistered) {
        throw new Error('Por favor registra tu huella digital antes de continuar');
      }

      if (!webauthnCredentialId) {
        throw new Error('No se encontró el ID de credencial. Registra tu huella nuevamente.');
      }

      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      formDataToSend.append('webauthnCredentialId', webauthnCredentialId);
      
      if (foto) {
        formDataToSend.append('fotoPerfil', foto);
      }

      const response = await register(formDataToSend);
      
      if (!response.success) {
        throw new Error(response.message || 'Error en el registro');
      }
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
      
    } catch (err) {
      console.error('Error en el registro:', err);
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Información Personal', 'Información Académica', 'Cuenta'];

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '3px solid',
                  borderColor: theme.palette.primary.main,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }}
              >
                <Avatar
                  src={fotoPreview}
                  sx={{
                    width: '100%',
                    height: '100%',
                    cursor: 'pointer'
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <PhotoCamera sx={{ fontSize: 40 }} />
                </Avatar>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFotoChange}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <PhotoCamera sx={{ color: 'white' }} />
                </IconButton>
              </Box>
            </Box>
            
            <AnimatedTextField
              label="Número de Empleado"
              name="numeroControl"
              value={formData.numeroControl}
              onChange={handleNumeroControlChange}
              onBlur={handleNumeroControlBlur}
              required
              icon={<Badge />}
              helperText="Ingresa tu Empleado (10-15 caracteres)"
            />
            <AnimatedTextField
              label="Nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              icon={<Person />}
            />
            <AnimatedTextField
              label="Apellido Paterno"
              name="apellidoPaterno"
              value={formData.apellidoPaterno}
              onChange={handleChange}
              required
              icon={<Person />}
            />
            <AnimatedTextField
              label="Apellido Materno"
              name="apellidoMaterno"
              value={formData.apellidoMaterno}
              onChange={handleChange}
              required
              icon={<Person />}
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <AnimatedTextField
              select
              label="Carrera"
              name="carrera"
              value={formData.carrera}
              onChange={handleChange}
              required
              icon={<School />}
              disabled={isLoadingCarreras}
            >
              {isLoadingCarreras ? (
                <MenuItem disabled>Cargando carreras...</MenuItem>
              ) : (
                carreras.map((carrera) => (
                  <MenuItem key={carrera._id} value={carrera._id}>
                    {carrera.nombre}
                  </MenuItem>
                ))
              )}
            </AnimatedTextField>

            <FormControl fullWidth required sx={{ mt: 2 }}>
              <InputLabel>Rol de Usuario</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                label="Rol de Usuario"
              >
                <MenuItem value="docente">Docente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <AnimatedTextField
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              required
              icon={<Email />}
              helperText="Ingresa tu correo (ejemplo: usuario@tesjo.edu.mx)"
            />
            <AnimatedTextField
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              icon={<Lock />}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleShowPassword('password')}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
            <AnimatedTextField
              label="Confirmar Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              icon={<Lock />}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleShowPassword('confirm')}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />

            <Box sx={{ mt: 3, mb: 2 }}>
              <Grow in={true} style={{ transformOrigin: '0 0 0' }} timeout={700}>
                <Box
                  sx={{
                    p: 2,
                    border: `2px dashed ${fingerprintRegistered ? theme.palette.success.main : theme.palette.primary.main}`,
                    borderRadius: 2,
                    backgroundColor: fingerprintRegistered ? theme.palette.success.light + '20' : 'transparent',
                    textAlign: 'center'
                  }}
                >
                  <Typography variant="body1" gutterBottom sx={{ mb: 2, fontWeight: 'bold' }}>
                    Registro de Huella Digital {fingerprintRegistered && '✓'}
                  </Typography>
                  
                  {!fingerprintRegistered ? (
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Es obligatorio registrar tu huella digital.
                      </Typography>
                      
                      {!isWebAuthnAvailable() && (
                        <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                          Tu navegador podría no soportar autenticación biométrica.
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Fingerprint />}
                        onClick={handleRegisterFingerprint}
                        disabled={isRegisteringFingerprint || !formData.email}
                        sx={{
                          minWidth: 250,
                          py: 1.5,
                          fontSize: '1rem',
                          fontWeight: 'bold'
                        }}
                      >
                        {isRegisteringFingerprint ? (
                          <>
                            <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                            Coloca tu huella...
                          </>
                        ) : (
                          'Registrar Huella Digital'
                        )}
                      </Button>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Fingerprint sx={{ fontSize: 48, color: theme.palette.success.main }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Huella digital registrada ✓
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setFingerprintRegistered(false)}
                        sx={{ mt: 1 }}
                      >
                        Volver a registrar
                      </Button>
                    </Box>
                  )}
                </Box>
              </Grow>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ py: 12 }}>
        <Zoom in={true} style={{ transitionDelay: '100ms' }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              backgroundColor: 'background.paper'
            }}
          >
            <Box
              sx={{
                p: 3,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                textAlign: 'center'
              }}
            >
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Registro de Docentes
              </Typography>
              <Typography variant="subtitle1">
                Completa el formulario para crear tu cuenta
              </Typography>
            </Box>

            <Box sx={{ width: '100%', p: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {renderStepContent(activeStep)}

                {error && (
                  <Grow in={!!error} timeout={500}>
                    <Alert
                      severity="error"
                      variant="filled"
                      sx={{ mt: 2 }}
                    >
                      {error}
                    </Alert>
                  </Grow>
                )}

                {success && (
                  <Grow in={success} timeout={500}>
                    <Alert
                      severity="success"
                      variant="filled"
                      sx={{ mt: 2 }}
                    >
                      ¡Registro exitoso! Redirigiendo...
                    </Alert>
                  </Grow>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<KeyboardArrowLeft />}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    endIcon={activeStep === steps.length - 1 ? <Save /> : <KeyboardArrowRight />}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} sx={{ color: '#fff' }} />
                    ) : activeStep === steps.length - 1 ? (
                      'Registrarse'
                    ) : (
                      'Siguiente'
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Zoom>
      </Container>
    </ThemeProvider>
  );
}