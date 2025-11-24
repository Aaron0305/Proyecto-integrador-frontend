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

// Componente de campo de entrada animado
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
    role: '',  // Quitamos el valor por defecto para que el usuario deba seleccionar
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

  // Efecto para cargar carreras
  useEffect(() => {
    const fetchCarreras = async () => {
      setIsLoadingCarreras(true);
      try {
        const response = await fetch(`${API_CONFIG.CARRERAS_URL}`);
        if (!response.ok) {
          throw new Error('Error al cargar carreras');
        }
        const data = await response.json();
        console.log('Carreras recibidas:', data);
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

  // Verificación de email al perder el foco
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

  // Verificación de número de control al perder el foco
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
    // Solo permitir números
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
      if (file.size > 5000000) { // 5MB limit
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

  // Funciones auxiliares para WebAuthn
  const base64UrlToArrayBuffer = (base64Url) => {
    // Convertir base64url a base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const paddedBase64 = base64 + '='.repeat(pad === 0 ? 0 : 4 - pad);
    
    // Convertir base64 a binario string
    const binaryString = window.atob(paddedBase64);
    
    // Convertir binario string a ArrayBuffer
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  const arrayBufferToBase64Url = (buffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = window.btoa(binary);
    // Convertir base64 a base64url
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  };

  // Función para verificar si WebAuthn está disponible
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
      // Verificar si WebAuthn está disponible
      if (!isWebAuthnAvailable()) {
        throw new Error(
          'Tu navegador no soporta autenticación biométrica. ' +
          'Por favor, usa un navegador moderno como Chrome, Firefox, Edge o Safari (versión 14+).'
        );
      }

      // Validar que el usuario tenga email (necesario para WebAuthn)
      if (!formData.email || !formData.email.trim()) {
        throw new Error('Por favor, ingresa tu correo electrónico primero para registrar la huella digital.');
      }

      // Obtener el challenge del backend
      // NOTA: Esta ruta aún no existe en el backend, la crearemos después
      const challengeResponse = await apiClient.post(`${API_CONFIG.WEBAUTHN_URL}/register/begin`, {
        email: formData.email,
        username: `${formData.nombre} ${formData.apellidoPaterno}`.trim() || formData.email
      });

      if (!challengeResponse.data.success) {
        throw new Error(challengeResponse.data.message || 'Error al iniciar el registro de huella');
      }

      const { challenge, user, rp } = challengeResponse.data;

      // Convertir el challenge de base64url a ArrayBuffer
      const challengeArrayBuffer = base64UrlToArrayBuffer(challenge);

      // Convertir el user.id de base64url a ArrayBuffer
      const userIdArrayBuffer = base64UrlToArrayBuffer(user.id);

      // Preparar las opciones para crear la credencial
      const publicKeyCredentialCreationOptions = {
        challenge: challengeArrayBuffer,
        rp: {
          name: rp.name || 'Sistema de Gestión Académica',
          id: rp.id || window.location.hostname,
        },
        user: {
          id: userIdArrayBuffer,
          name: user.name || formData.email,
          displayName: user.displayName || `${formData.nombre} ${formData.apellidoPaterno}`.trim() || formData.email,
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' }, // ES256
          { alg: -257, type: 'public-key' }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform', // Usar autenticador integrado (huella del dispositivo)
          userVerification: 'required',
          requireResidentKey: false,
        },
        timeout: 60000, // 60 segundos
        attestation: 'direct',
      };

      // Solicitar al navegador crear la credencial (el usuario pondrá su huella)
      let credential;
      try {
        credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions,
        });
      } catch (webauthnError) {
        // Manejar errores específicos de WebAuthn
        if (webauthnError.name === 'NotAllowedError') {
          throw new Error('Registro cancelado o el dispositivo no está disponible. Por favor, intenta de nuevo.');
        } else if (webauthnError.name === 'InvalidStateError') {
          throw new Error('Ya existe una huella registrada para este dispositivo. Por favor, usa otro dispositivo o elimina la credencial existente.');
        } else if (webauthnError.name === 'NotSupportedError') {
          throw new Error('Tu dispositivo no soporta autenticación biométrica. Por favor, usa un dispositivo compatible.');
        } else if (webauthnError.name === 'SecurityError') {
          throw new Error('Error de seguridad. Asegúrate de estar usando HTTPS o localhost.');
        } else {
          throw new Error(`Error al capturar la huella: ${webauthnError.message}`);
        }
      }

      // Convertir la respuesta a un formato que el backend pueda entender
      const response = {
        id: credential.id,
        rawId: arrayBufferToBase64Url(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: arrayBufferToBase64Url(credential.response.clientDataJSON),
          attestationObject: arrayBufferToBase64Url(credential.response.attestationObject),
        },
      };

      // Enviar la respuesta al backend para validación y almacenamiento
      // NOTA: Esta ruta aún no existe en el backend, la crearemos después
      const verifyResponse = await apiClient.post(`${API_CONFIG.WEBAUTHN_URL}/register/complete`, {
        email: formData.email,
        credential: response,
      });

      if (!verifyResponse.data.success) {
        throw new Error(verifyResponse.data.message || 'Error al verificar la huella digital');
      }

      // Guardar el ID de la credencial para enviarlo con el registro del usuario
      setWebauthnCredentialId(verifyResponse.data.credentialId);
      setFingerprintRegistered(true);

    } catch (err) {
      console.error('Error al registrar huella:', err);
      
      // Mostrar mensaje de error más específico
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
        throw new Error('Por favor selecciona un rol (Docente o Administrador)');
      }

      if (!fingerprintRegistered) {
        throw new Error('Por favor registra tu huella digital antes de continuar');
      }

      if (!webauthnCredentialId) {
        throw new Error('No se encontró el ID de la credencial de huella digital. Por favor, registra tu huella nuevamente.');
      }

      const formDataToSend = new FormData();
      
      // Asegurarnos que el role se envía correctamente
      Object.keys(formData).forEach(key => {
        if (key !== 'confirmPassword') {
          formDataToSend.append(key, formData[key]);
        }
      });
      
      // Agregar el ID de la credencial WebAuthn
      formDataToSend.append('webauthnCredentialId', webauthnCredentialId);
      
      if (foto) {
        formDataToSend.append('fotoPerfil', foto);
      }

      console.log('Datos de registro a enviar:', Object.fromEntries(formDataToSend));
      
      const response = await register(formDataToSend);
      console.log('Respuesta del registro:', response);
      
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
              inputProps={{
                maxLength: 15,
                pattern: '[^0-9A-Z]*'
              }}
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
              <FormHelperText>
                {!formData.role ? 'Por favor selecciona un rol' : 
                 formData.role === 'admin' ? 'Rol de administrador seleccionado' : 'Rol de docente seleccionado'}
              </FormHelperText>
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
            <FormControl fullWidth required sx={{ mt: 2 }}>
              <InputLabel>Rol</InputLabel>
              <Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <MenuItem value="docente">Docente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
              <FormHelperText>
                {!formData.role ? 'Por favor selecciona un rol' : ''}
              </FormHelperText>
            </FormControl>

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
                        Es obligatorio registrar tu huella digital para completar el registro.
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          Usará la autenticación biométrica de tu dispositivo (huella dactilar o Face ID).
                        </Typography>
                      </Typography>
                      
                      {!isWebAuthnAvailable() && (
                        <Alert severity="warning" sx={{ mb: 2, textAlign: 'left' }}>
                          Tu navegador podría no soportar autenticación biométrica. 
                          Asegúrate de usar Chrome, Firefox, Edge o Safari (versión 14+).
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Fingerprint />}
                        onClick={handleRegisterFingerprint}
                        disabled={isRegisteringFingerprint || !formData.role || !formData.email}
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
                      {!formData.role && (
                        <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                          Por favor selecciona un rol primero
                        </Typography>
                      )}
                      {!formData.email && (
                        <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                          Por favor ingresa tu correo electrónico primero
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Fingerprint sx={{ fontSize: 48, color: theme.palette.success.main }} />
                      <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Huella digital registrada correctamente
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
                      ¡Registro exitoso! Redirigiendo al inicio de sesión...
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