import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import TeacherAssignments from './TeacherAssignments';
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Container,
  Chip,
  Paper,
  Alert,
  Fade,
  LinearProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Divider,
  Badge,
  Skeleton,
  Grow,
  Slide,
  Stack,
  Tooltip
} from '@mui/material';
import {
  School,
  Email,
  Person,
  Assignment,
  Close,
  FiberManualRecord,
  Dashboard,
  AccountCircle,
  VerifiedUser,
  BadgeOutlined,
  ContentCopy,
  Code
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Animaciones optimizadas
const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const floatingAnimation = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
`;

const pulseGlow = keyframes`
  0%, 100% { 
    box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
    transform: scale(1);
  }
  50% { 
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.6);
    transform: scale(1.02);
  }
`;

const shimmerAnimation = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// Contenedor principal más compacto y moderno
const ModernContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(1),
  maxWidth: '100% !important',
  width: '100%',
  marginTop: theme.spacing(4), // Espacio reducido para el navbar
  paddingTop: theme.spacing(1), // Padding adicional en la parte superior
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
    maxWidth: '98% !important',
    marginTop: theme.spacing(4.5),
    paddingTop: theme.spacing(1.5),
  },
  
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
    maxWidth: '96% !important',
    marginTop: theme.spacing(5),
    paddingTop: theme.spacing(2),
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(2.5),
    maxWidth: '94% !important',
    marginTop: theme.spacing(5.5),
    paddingTop: theme.spacing(2.5),
  },
  
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(3),
    maxWidth: '92% !important',
    marginTop: theme.spacing(6),
    paddingTop: theme.spacing(3),
  },
}));

// Card principal más compacto con glassmorphism moderno
const CompactProfileCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.95) 100%)',
  backdropFilter: 'blur(30px)',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.5)',
  boxShadow: '0 15px 30px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
  margin: '0.5rem 0',
  width: '100%',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.4)',
    '& .gradient-bar': {
      height: '6px',
    }
  },
  
  [theme.breakpoints.down('sm')]: {
    borderRadius: '12px',
    margin: '0.25rem 0',
    padding: theme.spacing(1),
  },
  
  [theme.breakpoints.up('sm')]: {
    borderRadius: '16px',
    margin: '0.5rem 0',
    padding: theme.spacing(1.5),
  },
  
  [theme.breakpoints.up('md')]: {
    borderRadius: '20px',
    margin: '0.75rem 0',
    padding: theme.spacing(2),
  }
}));

// Barra de gradiente más elegante
const ElegantGradientBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '5px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
  backgroundSize: '400% 100%',
  animation: `${gradientShift} 8s ease infinite`,
  transition: 'height 0.3s ease',
  
  [theme.breakpoints.up('md')]: {
    height: '6px',
  }
}));

// Avatar más compacto y moderno
const ModernAvatar = styled(Avatar)(({ theme }) => ({
  width: 100,
  height: 100,
  border: '4px solid white',
  boxShadow: '0 20px 40px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(99, 102, 241, 0.1)',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${floatingAnimation} 8s ease-in-out infinite`,
  objectFit: 'cover',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  
  '&:hover': {
    transform: 'scale(1.15) rotate(8deg)',
    boxShadow: '0 30px 60px rgba(99, 102, 241, 0.35), 0 0 0 2px rgba(99, 102, 241, 0.2)',
    animation: `${pulseGlow} 2s ease-in-out infinite`,
  },
  
  [theme.breakpoints.up('sm')]: {
    width: 110,
    height: 110,
  },
  
  [theme.breakpoints.up('md')]: {
    width: 120,
    height: 120,
  },
  
  [theme.breakpoints.up('lg')]: {
    width: 130,
    height: 130,
  }
}));

// Tarjetas de información más modernas y compactas
const ModernInfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  borderRadius: '12px',
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)',
  border: '1px solid rgba(99, 102, 241, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  margin: '0.25rem 0',
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.12)',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    
    '& .info-shimmer': {
      transform: 'translateX(100%)',
    },
    
    '& .icon-container': {
      transform: 'scale(1.05) rotate(3deg)',
    }
  },
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(1.5),
    borderRadius: '14px',
    margin: '0.5rem 0',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(2),
    borderRadius: '16px',
    margin: '0.75rem 0',
  }
}));

// Efecto shimmer mejorado
const EnhancedShimmerEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '100%',
  height: '100%',
  background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent)',
  transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
  pointerEvents: 'none',
}));

// Contenedor del icono mejorado
const ModernIconContainer = styled(Box)(({ theme }) => ({
  width: 36,
  height: 36,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  flexShrink: 0,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: 'linear-gradient(145deg, rgba(255,255,255,0.3), transparent)',
    pointerEvents: 'none',
  },
  
  [theme.breakpoints.up('sm')]: {
    width: 42,
    height: 42,
    borderRadius: '14px',
  },
  
  [theme.breakpoints.up('md')]: {
    width: 48,
    height: 48,
    borderRadius: '16px',
  }
}));

// Alert de bienvenida más elegante
const ElegantWelcomeAlert = styled(Alert)(({ theme }) => ({
  borderRadius: '20px',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  boxShadow: '0 15px 35px rgba(99, 102, 241, 0.2), 0 0 0 1px rgba(99, 102, 241, 0.1)',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  
  '& .MuiAlert-icon': {
    color: 'white',
  },
  
  '& .MuiAlert-message': {
    fontWeight: 500,
  },
  
  [theme.breakpoints.up('sm')]: {
    marginBottom: theme.spacing(2.5),
    marginTop: theme.spacing(1.5),
    borderRadius: '24px',
  }
}));

// Título más moderno y compacto
const ModernTitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.75rem',
  fontWeight: 700,
  textAlign: 'center',
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: theme.spacing(1),
  letterSpacing: '-0.025em',
  
  [theme.breakpoints.up('sm')]: {
    fontSize: '2rem',
    textAlign: 'left',
  },
  
  [theme.breakpoints.up('md')]: {
    fontSize: '2.25rem',
  },
  
  [theme.breakpoints.up('lg')]: {
    fontSize: '2.5rem',
  }
}));

// Chip de rol más moderno
const ModernRoleChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  color: 'white',
  fontWeight: 600,
  fontSize: '0.875rem',
  height: 32,
  borderRadius: '16px',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.4)',
  },
  
  '& .MuiChip-icon': {
    color: 'white',
    fontSize: '1.1rem',
  },
  
  [theme.breakpoints.up('sm')]: {
    height: 36,
    fontSize: '0.9rem',
    borderRadius: '18px',
  }
}));

// Loading container mejorado
const ModernLoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  textAlign: 'center',
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  }
}));

const ActiveSession = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const DriveActivesession = React.lazy(() => import('./DriveActivesession'));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  const [userReady, setUserReady] = useState(false);
  const [error, setError] = useState('');
  const [openWelcome, setOpenWelcome] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  useEffect(() => {
    if (!loading && currentUser) {
      console.log('✅ Usuario completamente cargado:', currentUser);
      console.log('📁 Foto de perfil disponible:', currentUser.fotoPerfil);
      
      setUserReady(true);
      setTimeout(() => setShowContent(true), 200);
      
    } else if (!loading && !currentUser) {
      console.log('❌ No hay usuario autenticado');
      setUserReady(true);
      setTimeout(() => setShowContent(true), 200);
    }
  }, [loading, currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOpenWelcome(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  // Pantalla de loading moderna
  if (loading || !userReady) {
    return (
      <ModernLoadingContainer>
        <Box sx={{ width: '100%', maxWidth: 350, mb: 4 }}>
          <LinearProgress 
            sx={{ 
              width: '100%', 
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 4,
              }
            }} 
          />
        </Box>
        
        <Skeleton 
          variant="circular" 
          width={100} 
          height={100} 
          sx={{ 
            mb: 3,
            boxShadow: '0 15px 35px rgba(0,0,0,0.1)'
          }} 
        />
        
        <Skeleton variant="text" width={280} height={40} sx={{ mb: 1, borderRadius: 2 }} />
        <Skeleton variant="text" width={200} height={28} sx={{ mb: 3, borderRadius: 1 }} />
        
        <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
          <Skeleton variant="rectangular" width={140} height={70} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width={140} height={70} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width={140} height={70} sx={{ borderRadius: 3 }} />
        </Stack>
      </ModernLoadingContainer>
    );
  }

  // Configuración de información del usuario con iconos modernos
  const userInfo = [
    {
      icon: <BadgeOutlined />,
      label: 'Número de Empleado',
      value: currentUser?.numeroControl || 'N/A',
      color: { primary: '#6366f1', secondary: '#4f46e5' }
    },
    {
      icon: <Email />,
      label: 'Correo Electrónico',
      value: currentUser?.email || 'N/A',
      color: { primary: '#ec4899', secondary: '#db2777' }
    },
    {
      icon: <School />,
      label: 'Carrera',
      value: currentUser?.carrera?.nombre || 'N/A',
      color: { primary: '#06b6d4', secondary: '#0891b2' }
    }
  ];

  // Utilidades de formato y copia
  const toTitleCase = (text) => (text || '')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (t) => t.toUpperCase());

  const fullName = `${toTitleCase(currentUser?.nombre)} ${toTitleCase(currentUser?.apellidoPaterno)} ${toTitleCase(currentUser?.apellidoMaterno)}`.trim();

  const handleCopy = async (value, fieldKey) => {
    try {
      if (!value) return;
      await navigator.clipboard.writeText(String(value));
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(''), 1200);
    } catch (e) {
      console.error('No se pudo copiar al portapapeles', e);
    }
  };

  const isISC = (currentUser?.carrera?.nombre || '').toLowerCase().includes('sistemas');

  return (
    <ModernContainer>
      <React.Suspense fallback={null}>
        <DriveActivesession />
      </React.Suspense>
      <Fade in={showContent} timeout={600}>
        <Box>
          {/* Mensaje de bienvenida elegante */}
          {openWelcome && currentUser && (
            <Slide direction="down" in={openWelcome} timeout={500}>
              <ElegantWelcomeAlert
                severity="success"
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setOpenWelcome(false)}
                    sx={{ 
                      '&:hover': { 
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Close />
                  </IconButton>
                }
              >
                <Typography 
                  variant={isMobile ? "body2" : "body1"} 
                  fontWeight="medium"
                >
                  ¡Bienvenido(a) de vuelta, {currentUser.nombre}! 
                  {!isMobile && " Tu sesión está activa y lista."}
                </Typography>
              </ElegantWelcomeAlert>
            </Slide>
          )}

          {/* Mensaje de error moderno */}
          {error && (
            <Slide direction="down" in={!!error} timeout={400}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: { xs: 2, sm: 2.5 }, 
                  borderRadius: { xs: '16px', sm: '20px' },
                  boxShadow: '0 10px 30px rgba(239, 68, 68, 0.2)'
                }}
                action={
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={() => setError('')}
                  >
                    <Close />
                  </IconButton>
                }
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Perfil del usuario compacto y moderno */}
          <Grow in={showContent} timeout={800}>
            <CompactProfileCard sx={{ mb: { xs: 3, sm: 4 } }}>
              <ElegantGradientBar className="gradient-bar" />
              <CardContent 
                sx={{ 
                  p: { xs: 1.5, sm: 2, md: 2.5 },
                  '&:last-child': { pb: { xs: 1.5, sm: 2, md: 2.5 } }
                }}
              >
                <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} alignItems="center">
                  {/* Avatar compacto */}
                  <Grid 
                    item 
                    xs={12} 
                    sm={12} 
                    md={4} 
                    display="flex" 
                    justifyContent="center"
                    alignItems="center"
                    sx={{ pb: { xs: 1, sm: 1.5, md: 2 } }}
                  >
                    <ModernAvatar
                      src={currentUser?.fotoPerfil && currentUser.fotoPerfil !== ''
                        ? currentUser.fotoPerfil
                        : 'https://res.cloudinary.com/dzrstenqb/image/upload/v1/perfiles/default_profile'
                      }
                      alt={`Foto de perfil de ${currentUser?.nombre || 'Usuario'}`}
                      sx={{ 
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                        fontWeight: 600
                      }}
                    >
                      {currentUser?.nombre?.charAt(0) || 'U'}
                    </ModernAvatar>
                  </Grid>

                  {/* Información del usuario */}
                  <Grid item xs={12} sm={12} md={8}>
                    <Box textAlign={{ xs: 'center', md: 'left' }}>
                      <ModernTitle>
                        {fullName}
                      </ModernTitle>
                      
                      <Box 
                        display="flex" 
                        justifyContent={{ xs: 'center', md: 'flex-start' }} 
                        mb={{ xs: 2.5, sm: 3 }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ModernRoleChip
                            icon={<VerifiedUser />}
                            label={isISC ? 'Docente ISC' : 'Docente Activo'}
                            size={isMobile ? 'small' : 'medium'}
                          />
                          {isISC && (
                            <Chip
                              icon={<Code />}
                              label="ISC"
                              size={isMobile ? 'small' : 'medium'}
                              sx={{
                                fontWeight: 700,
                                color: 'white',
                                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                                borderRadius: '16px',
                                height: 32,
                                '& .MuiChip-icon': { color: 'white' }
                              }}
                            />
                          )}
                        </Stack>
                      </Box>

                      <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                        {userInfo.map((info, index) => (
                          <Grid item xs={12} sm={6} key={index}>
                            <Grow in={showContent} timeout={1000 + (index * 150)}>
                              <ModernInfoCard elevation={0}>
                                <EnhancedShimmerEffect className="info-shimmer" />
                                <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
                                  <ModernIconContainer
                                    className="icon-container"
                                    sx={{
                                      background: `linear-gradient(135deg, ${info.color.primary}, ${info.color.secondary})`,
                                    }}
                                  >
                                    {info.icon}
                                  </ModernIconContainer>
                                  <Box flex={1} minWidth={0}>
                                    <Typography 
                                      variant="caption" 
                                      color="text.secondary"
                                      sx={{ 
                                        textTransform: 'uppercase',
                                        fontWeight: 700,
                                        letterSpacing: '0.75px',
                                        fontSize: { xs: '0.65rem', sm: '0.75rem' }
                                      }}
                                    >
                                      {info.label}
                                    </Typography>
                                    <Typography 
                                      variant={isMobile ? "body2" : "body1"}
                                      color="text.primary"
                                      fontWeight="600"
                                      sx={{ 
                                        wordBreak: 'break-word',
                                        mt: 0.5,
                                        fontSize: { xs: '0.875rem', sm: '1rem' }
                                      }}
                                    >
                                      {info.value}
                                    </Typography>
                                  </Box>
                                  {(info.label === 'Número de Control' || info.label === 'Correo Electrónico') && (
                                    <Tooltip title={copiedField === info.label ? 'Copiado' : 'Copiar'}>
                                      <IconButton
                                        size={isMobile ? 'small' : 'medium'}
                                        aria-label={`Copiar ${info.label.toLowerCase()}`}
                                        onClick={() => handleCopy(info.value, info.label)}
                                        sx={{
                                          color: copiedField === info.label ? 'success.main' : 'text.secondary',
                                          '&:hover': { color: 'primary.main' }
                                        }}
                                      >
                                        <ContentCopy fontSize="inherit" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                              </ModernInfoCard>
                            </Grow>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </CompactProfileCard>
          </Grow>

          {/* Sección de asignaciones moderna */}
          <Grow in={showContent} timeout={1200}>
            <Box>
              <Box 
                display="flex"
                alignItems="center"
                gap={1.5}
                mb={{ xs: 2.5, sm: 3 }}
              >
                <ModernIconContainer
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    width: { xs: 40, sm: 48 },
                    height: { xs: 40, sm: 48 },
                  }}
                >
                  <Dashboard />
                </ModernIconContainer>
                <Typography 
                  variant={isMobile ? "h5" : isTablet ? "h4" : "h3"}
                  fontWeight="700" 
                  sx={{ 
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem', lg: '2.25rem' },
                    background: 'linear-gradient(135deg, #1f2937, #374151)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Panel de Asignaciones
                </Typography>
              </Box>
              
              <Divider 
                sx={{ 
                  mb: { xs: 2.5, sm: 3 },
                  background: 'linear-gradient(90deg, #6366f1, transparent)',
                  height: 2,
                  borderRadius: 1
                }} 
              />
              
              <Paper 
                elevation={0} 
                sx={{ 
                  borderRadius: { xs: '16px', sm: '20px', md: '24px' },
                  overflow: 'hidden',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <TeacherAssignments />
              </Paper>
            </Box>
          </Grow>
        </Box>
      </Fade>
    </ModernContainer>
  );
};

export default ActiveSession;