// Componente para renderizar la fila de cada docente con los stats correctos
function TeacherRow({ user, onStatClick }) {
    const [stats, setStats] = React.useState({
        total: 0,
        entregadas: 0,
        retraso: 0,
        pendientes: 0,
        noEntregadas: 0,
        scorePercent: 0
    });

    React.useEffect(() => {
        async function fetchStats() {
            try {
                if (!user?._id) return;
                const token = localStorage.getItem('token');
                // 1. Obtener todas las asignaciones
                const resAll = await fetch(`${API_CONFIG.ASSIGNMENTS_URL}/admin/all`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!resAll.ok) return setStats({ total: 0, entregadas: 0, retraso: 0, pendientes: 0, noEntregadas: 0, scorePercent: 0 });
                const dataAll = await resAll.json();
                const assignments = Array.isArray(dataAll.data?.assignments) ? dataAll.data.assignments : [];
                let entregadas = 0, retraso = 0, pendientes = 0, noEntregadas = 0, total = 0;
                // 2. Para cada asignación, obtener el estado de todos los docentes
                await Promise.all(assignments.map(async (assignment) => {
                    const resStatus = await fetch(`${API_CONFIG.ASSIGNMENTS_URL}/${assignment._id}/teachers-status`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!resStatus.ok) return;
                    const dataStatus = await resStatus.json();
                    const teacherStatusArr = Array.isArray(dataStatus.teachersStatus) ? dataStatus.teachersStatus : [];
                    const teacherStatus = teacherStatusArr.find(ts => ts.teacherId === user._id);
                    if (teacherStatus) {
                        total++;
                        if (teacherStatus.status === 'completed') entregadas++;
                        else if (teacherStatus.status === 'completed-late') retraso++;
                        else if (teacherStatus.status === 'pending') pendientes++;
                        else if (teacherStatus.status === 'not-delivered') noEntregadas++;
                    }
                }));
                // Las entregadas con retraso cuentan la mitad de la puntuación
                const scorePercent = total > 0
                    ? Math.round(((entregadas + (retraso * 0.5)) / total) * 100)
                    : 0;
                setStats({ total, entregadas, retraso, pendientes, noEntregadas, scorePercent });
            } catch {
                setStats({ total: 0, entregadas: 0, retraso: 0, pendientes: 0, noEntregadas: 0, scorePercent: 0 });
            }
        }
        fetchStats();
    }, [user?._id]);
    return (
        <Fade in={true} timeout={300} key={user._id}>
            <AnimatedTableRow>
                <TableCell>
                    <StyledAvatar
                        src={user.fotoPerfil 
                            ? user.fotoPerfil
                            : 'https://res.cloudinary.com/dzrstenqb/image/upload/v1/perfiles/default_profile'
                        }
                        alt={`Foto de perfil de ${user.nombreCompleto}`}
                        onError={(e) => {
                            if (!e.target.src.includes('default_profile')) {
                                e.target.onerror = null;
                                e.target.src = 'https://res.cloudinary.com/dzrstenqb/image/upload/v1/perfiles/default_profile';
                            }
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        {user.numeroControl}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {`${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`}
                    </Typography>
                </TableCell>
                <TableCell>
                    <Typography variant="body2" color="text.secondary">
                        {user.email}
                    </Typography>
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={stats.total} 
                        color="primary" 
                        variant="outlined"
                        size="small"
                        onClick={() => onStatClick(user, 'total')}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                        }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={stats.pendientes} 
                        color="info" 
                        variant="outlined"
                        size="small"
                        onClick={() => onStatClick(user, 'pending')}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'info.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                        }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={stats.entregadas} 
                        color="success" 
                        variant="outlined"
                        size="small"
                        onClick={() => onStatClick(user, 'completed')}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'success.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                        }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={stats.retraso} 
                        color="warning" 
                        variant="outlined"
                        size="small"
                        onClick={() => onStatClick(user, 'completed-late')}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'warning.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                        }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={stats.noEntregadas} 
                        color="error" 
                        variant="outlined"
                        size="small"
                        onClick={() => onStatClick(user, 'not-delivered')}
                        sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'white',
                                transform: 'scale(1.1)',
                            },
                            transition: 'all 0.2s ease'
                        }}
                    />
                </TableCell>
                <TableCell align="center">
                    <Chip 
                        label={`${stats.scorePercent}%`} 
                        color={stats.scorePercent === 100 ? "success" : stats.scorePercent >= 70 ? "primary" : stats.scorePercent > 0 ? "warning" : "default"}
                        variant="filled"
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                    />
                </TableCell>
            </AnimatedTableRow>
        </Fade>
    );
}
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, CircularProgress, Avatar, Chip, Card, CardContent, Grid, Fade, Slide, Zoom } from '@mui/material';
import { Edit, Delete, Menu as MenuIcon, Close as CloseIcon, PersonAdd, Refresh, FilterList, Visibility, MoreVert, Assignment, Assessment } from '@mui/icons-material';
import { AccessTime, CheckCircle, Warning, Cancel } from '@mui/icons-material';
import Drawer from '@mui/material/Drawer';
import { styled, keyframes } from '@mui/material/styles';
import Asignation from './Asignation';
import AdminAssignments from './AdminAssignmentsFixed';
import AdminErrorBoundary from './AdminErrorBoundary';
import { API_CONFIG } from '../../config/api.js';

// Animaciones personalizadas
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8); }
  100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.3); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Componentes estilizados
const StyledCard = styled(Card)(() => ({
  background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const GlowButton = styled(Button)(() => ({
  borderRadius: '12px',
  padding: '12px 24px',
  background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${glow} 2s infinite`,
    transform: 'translateY(-2px)',
  },
}));

const AnimatedTableRow = styled(TableRow)(() => ({
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(25, 118, 210, 0.04)',
    transform: 'scale(1.01)',
  },
}));

const HeaderBox = styled(Box)(() => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  padding: '20px',
  marginBottom: '24px',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${slideIn} 3s infinite`,
  },
}));

const StyledAvatar = styled(Avatar)(() => ({
  width: 56,
  height: 56,
  border: '3px solid #fff',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${pulse} 1s infinite`,
  },
}));

// Chip de filtro mejorado con estilos sólidos
const FilterChip = styled(Chip)(({ theme, selected, chipcolor }) => ({
  fontWeight: 'bold',
  px: 2,
  height: 40,
  fontSize: '0.9rem',
  borderRadius: '20px',
  border: '2px solid transparent',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  // Estados por defecto (no seleccionado)
  ...(chipcolor === 'primary' && !selected && {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    color: theme.palette.primary.main,
    borderColor: 'rgba(25, 118, 210, 0.3)',
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: 'white',
      borderColor: theme.palette.primary.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
    }
  }),
  
  ...(chipcolor === 'info' && !selected && {
    backgroundColor: 'rgba(2, 136, 209, 0.08)',
    color: theme.palette.info.main,
    borderColor: 'rgba(2, 136, 209, 0.3)',
    '&:hover': {
      backgroundColor: theme.palette.info.main,
      color: 'white',
      borderColor: theme.palette.info.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(2, 136, 209, 0.4)',
    }
  }),
  
  ...(chipcolor === 'success' && !selected && {
    backgroundColor: 'rgba(46, 125, 50, 0.08)',
    color: theme.palette.success.main,
    borderColor: 'rgba(46, 125, 50, 0.3)',
    '&:hover': {
      backgroundColor: theme.palette.success.main,
      color: 'white',
      borderColor: theme.palette.success.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
    }
  }),
  
  ...(chipcolor === 'warning' && !selected && {
    backgroundColor: 'rgba(237, 108, 2, 0.08)',
    color: theme.palette.warning.main,
    borderColor: 'rgba(237, 108, 2, 0.3)',
    '&:hover': {
      backgroundColor: theme.palette.warning.main,
      color: 'white',
      borderColor: theme.palette.warning.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(237, 108, 2, 0.4)',
    }
  }),
  
  ...(chipcolor === 'error' && !selected && {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    color: theme.palette.error.main,
    borderColor: 'rgba(211, 47, 47, 0.3)',
    '&:hover': {
      backgroundColor: theme.palette.error.main,
      color: 'white',
      borderColor: theme.palette.error.main,
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
    }
  }),
  
  // Estados seleccionados
  ...(chipcolor === 'primary' && selected && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    borderColor: theme.palette.primary.main,
    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      borderColor: theme.palette.primary.dark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(25, 118, 210, 0.5)',
    }
  }),
  
  ...(chipcolor === 'info' && selected && {
    backgroundColor: theme.palette.info.main,
    color: 'white',
    borderColor: theme.palette.info.main,
    boxShadow: '0 4px 12px rgba(2, 136, 209, 0.4)',
    '&:hover': {
      backgroundColor: theme.palette.info.dark,
      borderColor: theme.palette.info.dark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(2, 136, 209, 0.5)',
    }
  }),
  
  ...(chipcolor === 'success' && selected && {
    backgroundColor: theme.palette.success.main,
    color: 'white',
    borderColor: theme.palette.success.main,
    boxShadow: '0 4px 12px rgba(46, 125, 50, 0.4)',
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
      borderColor: theme.palette.success.dark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(46, 125, 50, 0.5)',
    }
  }),
  
  ...(chipcolor === 'warning' && selected && {
    backgroundColor: theme.palette.warning.main,
    color: 'white',
    borderColor: theme.palette.warning.main,
    boxShadow: '0 4px 12px rgba(237, 108, 2, 0.4)',
    '&:hover': {
      backgroundColor: theme.palette.warning.dark,
      borderColor: theme.palette.warning.dark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(237, 108, 2, 0.5)',
    }
  }),
  
  ...(chipcolor === 'error' && selected && {
    backgroundColor: theme.palette.error.main,
    color: 'white',
    borderColor: theme.palette.error.main,
    boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)',
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
      borderColor: theme.palette.error.dark,
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(211, 47, 47, 0.5)',
    }
  }),
}));

export default function Structure() {
    // Filtro de estado de asignaciones
    const [statusFilter, setStatusFilter] = useState('total');
    const [teacherStatsByUser, setTeacherStatsByUser] = useState({});

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editSession, setEditSession] = useState(null);
    const [form, setForm] = useState({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [reporteDrawerOpen, setReporteDrawerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [asignationOpen, setAsignationOpen] = useState(false);
    const [adminAssignmentsOpen, setAdminAssignmentsOpen] = useState(false);
    const [teacherStats, setTeacherStats] = useState({});
    const [selectedTeacherFilter, setSelectedTeacherFilter] = useState(null);

    // Función para obtener estadísticas de cada usuario individualmente
    const fetchUserStats = useCallback(async (userId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !userId) return null;

            // 1. Obtener todas las asignaciones
            const resAll = await fetch(`${API_CONFIG.ASSIGNMENTS_URL}/admin/all`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!resAll.ok) return null;
            
            const dataAll = await resAll.json();
            const assignments = Array.isArray(dataAll.data?.assignments) ? dataAll.data.assignments : [];
            
            let entregadas = 0, retraso = 0, pendientes = 0, noEntregadas = 0, total = 0;
            
            // 2. Para cada asignación, obtener el estado del docente específico
            await Promise.all(assignments.map(async (assignment) => {
                try {
                    const resStatus = await fetch(`${API_CONFIG.ASSIGNMENTS_URL}/${assignment._id}/teachers-status`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    if (!resStatus.ok) return;
                    
                    const dataStatus = await resStatus.json();
                    const teacherStatusArr = Array.isArray(dataStatus.teachersStatus) ? dataStatus.teachersStatus : [];
                    const teacherStatus = teacherStatusArr.find(ts => ts.teacherId === userId);
                    
                    if (teacherStatus) {
                        total++;
                        if (teacherStatus.status === 'completed') entregadas++;
                        else if (teacherStatus.status === 'completed-late') retraso++;
                        else if (teacherStatus.status === 'pending') pendientes++;
                        else if (teacherStatus.status === 'not-delivered') noEntregadas++;
                    }
                } catch (error) {
                    console.error('Error fetching assignment status:', error);
                }
            }));

            return {
                total,
                entregadas,
                retraso,
                pendientes,
                noEntregadas,
                scorePercent: total > 0 ? Math.round(((entregadas + (retraso * 0.5)) / total) * 100) : 0
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return null;
        }
    }, []);

    // Función optimizada para obtener usuarios con cache
    const fetchUsers = useCallback(async (force = false) => {
        if (users.length > 0 && !force) return; // Evita recargas innecesarias
        try {
            setRefreshing(true);
            const response = await fetch(API_CONFIG.USERS_URL, {
                headers: {
                    'Cache-Control': force ? 'no-cache' : 'max-age=300',
                    'Pragma': force ? 'no-cache' : 'cache'
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || 'Error al obtener los usuarios');
            }
            const data = await response.json();
            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('Formato de respuesta inválido');
            }
            // Si los usuarios no tienen registros, los obtenemos por usuario
            const usersWithRegistros = await Promise.all(data.users.map(async (user) => {
                if (user.registros && Array.isArray(user.registros) && user.registros.length > 0) {
                    return user;
                }
                // Fetch de registros individuales si no vienen incluidos
                try {
                    const res = await fetch(`${API_CONFIG.USERS_URL}/${user._id}/registros`);
                    if (res.ok) {
                        const registrosData = await res.json();
                        return { ...user, registros: Array.isArray(registrosData) ? registrosData : [] };
                    }
                } catch {
                    // Si falla, dejar registros vacío
                }
                return { ...user, registros: [] };
            }));
            setUsers(usersWithRegistros);
            
            // Obtener estadísticas para cada usuario
            const statsPromises = usersWithRegistros.map(async (user) => {
                const stats = await fetchUserStats(user._id);
                return { userId: user._id, stats };
            });
            
            const allStats = await Promise.all(statsPromises);
            const statsMap = {};
            allStats.forEach(({ userId, stats }) => {
                if (stats) {
                    statsMap[userId] = stats;
                }
            });
            
            setTeacherStatsByUser(statsMap);
            setError(null);
        } catch (err) {
            console.error('Error detallado:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [users.length, fetchUserStats]);

    // Función para obtener estadísticas
    const fetchTeacherStats = useCallback(async () => {
        console.log('Iniciando fetchTeacherStats');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }
            
            console.log('Realizando petición a la API de estadísticas');
            const response = await fetch(`${API_CONFIG.STATS_URL}/teachers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Respuesta de la API:', response.status);
            const responseData = await response.text();
            console.log('Respuesta completa:', responseData);

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${responseData}`);
            }

            const data = JSON.parse(responseData);
            console.log('Datos recibidos:', data);
            
            if (!Array.isArray(data)) {
                throw new Error('Los datos recibidos no son un array');
            }

            // Convertir array de estadísticas a objeto para fácil acceso
            const statsMap = {};
            data.forEach(stat => {
                if (stat && stat.teacherId) {
                    statsMap[stat.teacherId] = {
                        teacherName: stat.teacherName,
                        email: stat.email,
                        total: stat.total || 0,
                        completed: stat.completed || 0,
                        pending: stat.pending || 0,
                        overdue: stat.overdue || 0
                    };
                }
            });
            
            console.log('StatsMap procesado:', statsMap);
            setTeacherStats(statsMap);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
        }
    }, []);

    // Cargar usuarios y estadísticas junto con los usuarios
    useEffect(() => {
        const loadData = async () => {
            try {
                await fetchUsers();
                await fetchTeacherStats();
            } catch (error) {
                console.error('Error cargando datos:', error);
            }
        };
        loadData();
    }, [fetchUsers, fetchTeacherStats]);

    // Función de búsqueda mejorada
    // Filtrar usuarios según el filtro de estado seleccionado - CORREGIDO
    const filteredUsers = useMemo(() => {
        if (statusFilter === 'total') return users;
        
        return users.filter(user => {
            const stats = teacherStatsByUser[user._id];
            if (!stats) return false;
            
            switch (statusFilter) {
                case 'pendientes':
                    return stats.pendientes > 0;
                case 'entregadas':
                    return stats.entregadas > 0;
                case 'retraso':
                    return stats.retraso > 0;
                case 'noentregadas':
                    return stats.noEntregadas > 0;
                default:
                    return true;
            }
        });
    }, [users, teacherStatsByUser, statusFilter]);

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
        setEditSession(null);
        setForm({ nombre: '', encargado: '', inicioServicio: '', finServicio: '', horasAcumuladas: '' });
    }, []);
    
    const handleChange = useCallback((e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }, [form]);
    
    const handleSave = useCallback(() => {
        if (editSession) {
            setUsers(users.map(s => s.id === editSession.id ? { ...editSession, ...form } : s));
        } else {
            setUsers([...users, { ...form, id: Date.now() }]);
        }
        handleCloseDialog();
    }, [editSession, form, users, handleCloseDialog]);
    
    // Función para refrescar datos
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await Promise.all([
                fetchUsers(true),
                fetchTeacherStats()
            ]);
        } catch (error) {
            console.error('Error al refrescar datos:', error);
        } finally {
            setRefreshing(false);
        }
    }, [fetchUsers, fetchTeacherStats]);

    const handleOpenAsignation = useCallback(() => {
        setAsignationOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleCloseAsignation = useCallback(() => {
        setAsignationOpen(false);
    }, []);

    const handleOpenAdminAssignments = useCallback(() => {
        setAdminAssignmentsOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    const handleCloseAdminAssignments = useCallback(() => {
        setAdminAssignmentsOpen(false);
        // Limpiar el filtro de docente seleccionado cuando se cierra
        setSelectedTeacherFilter(null);
    }, []);

    // Función para manejar clics en estadísticas
    const handleStatClick = useCallback((user, filterType) => {
        console.log(`Mostrando ${filterType} para el docente:`, user.nombreCompleto || `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`);
        
        // Mapear filterType a los valores esperados por el backend
        let statusFilter = 'all';
        switch (filterType) {
            case 'total':
                statusFilter = 'all';
                break;
            case 'pending':
                statusFilter = 'pending';
                break;
            case 'completed':
                statusFilter = 'completed';
                break;
            case 'completed-late':
                statusFilter = 'completed-late';
                break;
            case 'not-delivered':
                statusFilter = 'not-delivered';
                break;
            default:
                statusFilter = 'all';
        }
        
        // Configurar el filtro de docente y el tipo de estado
        setSelectedTeacherFilter({
            teacherId: user._id,
            teacherName: user.nombreCompleto || `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`,
            statusFilter: statusFilter,
            filterType: filterType
        });
        
        // Abrir el panel de administración de asignaciones
        setAdminAssignmentsOpen(true);
        setMobileDrawerOpen(false);
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>
            {/* Filtros de estado tipo tabs - MEJORADOS */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 2, alignItems: 'center', justifyContent: 'flex-end', px: 3 }}>
                <FilterChip
                    label={<><Assignment sx={{ mr: 0.5 }} />Total</>}
                    chipcolor="primary"
                    selected={statusFilter === 'total'}
                    onClick={() => setStatusFilter('total')}
                />
                <FilterChip
                    label={<><AccessTime sx={{ mr: 0.5 }} />Pendientes</>}
                    chipcolor="info"
                    selected={statusFilter === 'pendientes'}
                    onClick={() => setStatusFilter('pendientes')}
                />
                <FilterChip
                    label={<><CheckCircle sx={{ mr: 0.5 }} />Entregadas</>}
                    chipcolor="success"
                    selected={statusFilter === 'entregadas'}
                    onClick={() => setStatusFilter('entregadas')}
                />
                <FilterChip
                    label={<><Warning sx={{ mr: 0.5 }} />Con Retraso</>}
                    chipcolor="warning"
                    selected={statusFilter === 'retraso'}
                    onClick={() => setStatusFilter('retraso')}
                />
                <FilterChip
                    label={<><Cancel sx={{ mr: 0.5 }} />No Entregadas</>}
                    chipcolor="error"
                    selected={statusFilter === 'noentregadas'}
                    onClick={() => setStatusFilter('noentregadas')}
                />
            </Box>
            
            {/* Contenido principal */}
            <Box sx={{ 
                flex: 1, 
                padding: 3, 
                pt: 10, // Aumentado el padding top para dar más espacio después del navbar
                mx: 'auto', // Centrar el contenido
                width: '100%',
                maxWidth: '1400px', // Limitar el ancho máximo para mejor legibilidad
            }}>
                {/* Header futurista */}
                <Fade in={true} timeout={1000}>
                    <HeaderBox sx={{
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', // Cambiado a tonos de azul más profesionales
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        borderRadius: '16px',
                        mb: 4, // Aumentado el margen inferior
                    }}>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mb: 2,
                            px: 2, // Añadido padding horizontal
                        }}>
                            <IconButton
                                color="inherit"
                                onClick={() => setMobileDrawerOpen(true)}
                                sx={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                    backdropFilter: 'blur(10px)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                        transform: 'scale(1.1)',
                                    },
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography 
                                variant="h4" 
                                component="h1" 
                                sx={{ 
                                    fontWeight: 600,
                                    flexGrow: 1,
                                    letterSpacing: '0.5px',
                                    textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                                }}
                            >
                                Panel de Administración
                            </Typography>
                        </Box>
                        <Typography 
                            variant="subtitle1" 
                            sx={{ 
                                opacity: 0.9, 
                                fontWeight: 300,
                                px: 2,
                                pb: 2
                            }}
                        >
                            Gestiona docentes, consulta registros y administra el sistema
                        </Typography>
                    </HeaderBox>
                </Fade>

                {/* Tabla de usuarios */}
                <Zoom in={true} timeout={1000}>
                    <StyledCard sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    }}>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ 
                                        backgroundColor: '#f5f7fa',
                                        '& th': { 
                                            fontWeight: 600,
                                            color: '#1976d2',
                                            fontSize: '0.95rem',
                                            py: 2
                                        }
                                    }}>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Foto</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Número de Control</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Nombre Completo</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>Email</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Total</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Pendientes</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Entregadas</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>Entregadas con Retraso</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>No Entregadas</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 'bold', color: 'primary.main' }}>ScoreCard</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                                <CircularProgress size={60} thickness={4} />
                                                <Typography sx={{ mt: 2, fontSize: '1.1rem' }}>
                                                    Cargando usuarios...
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                                <Typography color="error" variant="h6">
                                                    ⚠️ Error: {error}
                                                </Typography>
                                                <Button 
                                                    onClick={handleRefresh} 
                                                    sx={{ mt: 2 }}
                                                    variant="outlined"
                                                >
                                                    Reintentar
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredUsers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                                                <Typography variant="h6" color="text.secondary">
                                                    {statusFilter === 'total' 
                                                        ? 'No hay usuarios registrados'
                                                        : `No hay docentes con ${statusFilter === 'pendientes' ? 'asignaciones pendientes' :
                                                            statusFilter === 'entregadas' ? 'asignaciones entregadas' :
                                                            statusFilter === 'retraso' ? 'asignaciones entregadas con retraso' :
                                                            statusFilter === 'noentregadas' ? 'asignaciones no entregadas' : 'este filtro'
                                                        }`
                                                    }
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <TeacherRow key={user._id} user={user} onStatClick={handleStatClick} />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </StyledCard>
                </Zoom>
            </Box>

            {/* Drawer de navegación (menú hamburguesa) */}
            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={() => setMobileDrawerOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                        color: 'white',
                    },
                }}
            >
                <Box sx={{ width: 300, padding: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ color: '#4fc3f7', fontWeight: 'bold' }}>
                            Menú de Administración
                        </Typography>
                        <IconButton onClick={() => setMobileDrawerOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    {/* Gestión de Docentes */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 1, fontWeight: 'bold', color: '#4fc3f7' }}>
                        GESTIÓN DE DOCENTES
                    </Typography>
                    <Button
                        startIcon={<Assignment />}
                        fullWidth
                        variant="contained"
                        sx={{
                            justifyContent: 'flex-start',
                            mb: 1.5,
                            py: 1.2,
                            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                            },
                        }}
                        onClick={handleOpenAsignation}
                    >
                        Nueva Asignación
                    </Button>

                    {/* Gestión de Asignaciones */}
                    <Typography variant="subtitle2" sx={{ mb: 1, mt: 2, fontWeight: 'bold', color: '#4fc3f7' }}>
                        GESTIÓN DE ASIGNACIONES
                    </Typography>
                    <Button
                        startIcon={<Assessment />}
                        fullWidth
                        variant="contained"
                        sx={{
                            justifyContent: 'flex-start',
                            mb: 1.5,
                            py: 1.2,
                            background: 'linear-gradient(45deg, #2e7d32 30%, #4caf50 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)',
                            },
                        }}
                        onClick={handleOpenAdminAssignments}
                    >
                        Administrar Asignaciones
                    </Button>
                    <Box sx={{ flexGrow: 1 }} />
                </Box>
            </Drawer>

            {/* Dialog para editar/agregar */}
            <Dialog 
                open={dialogOpen} 
                onClose={handleCloseDialog}
                maxWidth="md"
                fullWidth
                sx={{
                    '& .MuiDialog-paper': {
                        borderRadius: '16px',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f5f7fa 100%)',
                    },
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 'bold',
                }}>
                    {editSession ? 'Editar Docente' : 'Agregar Nuevo Docente'}
                </DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="nombre"
                                label="Nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="numeroControl"
                                label="Número de Control"
                                value={form.numeroControl}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="carrera"
                                label="Carrera"
                                value={form.carrera}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ mb: 2 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button 
                        onClick={handleCloseDialog}
                        variant="outlined"
                        sx={{ 
                            borderRadius: '12px',
                            color: 'text.secondary',
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            '&:hover': {
                                borderColor: 'rgba(0, 0, 0, 0.24)',
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                    >
                        Cancelar
                    </Button>
                    <GlowButton
                        onClick={handleSave}
                        variant="contained"
                        sx={{ ml: 2 }}
                    >
                        {editSession ? 'Guardar Cambios' : 'Crear Docente'}
                    </GlowButton>
                </DialogActions>
            </Dialog>

            {/* Diálogo de Asignaciones */}
            <Asignation
                open={asignationOpen}
                onClose={handleCloseAsignation}
                users={users}
            />

            {/* Diálogo de Administración de Asignaciones */}
            <AdminErrorBoundary>
                <AdminAssignments
                    open={adminAssignmentsOpen}
                    onClose={handleCloseAdminAssignments}
                    initialFilter={selectedTeacherFilter}
                />
            </AdminErrorBoundary>
        </Box>
    );
}