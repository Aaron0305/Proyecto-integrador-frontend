import React, { useState, useEffect, useCallback } from 'react';
import {
    FormControlLabel,
    Box,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    IconButton,
    Tooltip,
    Badge,
    Slide,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableContainer,
    InputAdornment,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import { Checkbox } from '@mui/material';
import {
    Assignment as AssignmentIcon,
    Schedule,
    CheckCircle,
    Warning,
    Search,
    Refresh,
    Visibility,
    Done,
    Close,
    CalendarToday,
    FileDownload,
    Person,
    School,
    AdminPanelSettings,
    Edit as EditIcon,
    PlaylistAddCheck,
    AssignmentInd
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { 
    getAdminAllAssignments, 
    markAssignmentCompletedByAdmin,
    getAdminAssignmentStats,
    updateAssignmentByAdmin,
    getTeachersStatusForAssignment,
    updateTeacherStatusInAssignment
} from '../../services/assignmentService';
import EditAssignment from './EditAssignment';
import ScheduledAssignments from './ScheduledAssignmentsSimple';

// Custom animated components
const AnimatedBadge = motion(Badge);

const AdminAssignments = ({ open, onClose, initialFilter }) => {
    console.log('🔄 AdminAssignmentsFixed - Rendering with props:', { open, onClose: !!onClose, initialFilter });
    
    const theme = useTheme();
    console.log('🎨 Theme loaded:', !!theme);
    
    // Estados principales
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [teachers, setTeachers] = useState([]);
    
    // Estados para filtros
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('-createdAt');
    const [teacherFilter, setTeacherFilter] = useState('all');
    
    // Estados para paginación
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Estados para diálogos
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [showDetailDialog, setShowDetailDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showScheduledDialog, setShowScheduledDialog] = useState(false);
    const [showTeacherStatusDialog, setShowTeacherStatusDialog] = useState(false);
    const [assignmentTeachers, setAssignmentTeachers] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadStats = useCallback(async () => {
        try {
            console.log('🔍 Loading stats...');
            const response = await getAdminAssignmentStats();
            console.log('📊 Stats response:', response);
            if (response && response.success) {
                setStats(response.data);
                console.log('✅ Stats loaded:', response.data);
            } else {
                console.error('❌ Stats response invalid:', response);
            }
        } catch (error) {
            console.error('❌ Error loading admin stats:', error);
            console.error('❌ Stats error details:', error.response || error.message);
        }
    }, []);

    const loadAssignments = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            console.log('🔍 Loading assignments with filters:', {
                statusFilter,
                searchTerm,
                sortBy,
                page,
                teacherFilter
            });
            
            const params = {
                status: statusFilter,
                search: searchTerm,
                sort: sortBy,
                page: page,
                limit: 10,
                ...(teacherFilter !== 'all' && { teacherId: teacherFilter })
            };

            console.log('📤 Calling getAdminAllAssignments with params:', params);
            const response = await getAdminAllAssignments(params);
            
            console.log('📥 Response received:', response);
            
            if (response && response.success) {
                console.log('✅ Setting assignments:', response.data?.assignments?.length || 0);
                console.log('✅ Setting teachers:', response.data?.teachers?.length || 0);
                
                setAssignments(response.data?.assignments || []);
                setTotalPages(response.data?.pagination?.pages || 1);
                setTeachers(response.data?.teachers || []);
            } else {
                setError('Error en la respuesta del servidor');
                console.error('❌ Invalid response:', response);
            }
        } catch (error) {
            console.error('❌ Error loading assignments:', error);
            console.error('❌ Error stack:', error.stack);
            console.error('❌ Error response:', error.response);
            console.error('❌ Error message:', error.message);
            
            let errorMessage = 'Error desconocido';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.error) {
                errorMessage = error.error;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            setError('Error cargando asignaciones: ' + errorMessage);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [statusFilter, searchTerm, sortBy, page, teacherFilter]);

    // Aplicar filtro inicial cuando se abre el diálogo
    useEffect(() => {
        if (open && initialFilter) {
            console.log('🔄 Applying initial filter:', initialFilter);
            
            // Aplicar los filtros desde initialFilter
            if (initialFilter.teacherId) {
                setTeacherFilter(initialFilter.teacherId);
            }
            if (initialFilter.statusFilter) {
                setStatusFilter(initialFilter.statusFilter);
            }
        } else if (open && !initialFilter) {
            // Resetear filtros si no hay filtro inicial
            setTeacherFilter('all');
            setStatusFilter('all');
        }
    }, [open, initialFilter]);

    // Cargar datos cuando se abre el diálogo
    useEffect(() => {
        if (open) {
            console.log('🔄 Dialog opened, loading data...');
            loadStats();
            loadAssignments();
        }
    }, [open, loadStats, loadAssignments]);

    // Resetear página cuando cambien los filtros
    useEffect(() => {
        if (page !== 1) {
            console.log('🔄 Resetting page to 1 due to filter change');
            setPage(1);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, searchTerm, sortBy, teacherFilter]);

    const handleRefresh = useCallback(() => {
        console.log('🔄 === REFRESH MANUAL TRIGGERED ===');
        console.log('📊 Current filter states:', {
            statusFilter,
            searchTerm,
            sortBy,
            teacherFilter,
            page
        });
        console.log('📈 Current stats:', stats);
        console.log('📋 Current assignments count:', assignments.length);
        
        setIsRefreshing(true);
        loadAssignments();
        loadStats();
    }, [loadAssignments, loadStats, statusFilter, searchTerm, sortBy, teacherFilter, page, stats, assignments.length]);

    const handleCompleteAssignment = async (assignmentId) => {
        try {
            setActionLoading(true);
            setError('');
            
            const response = await markAssignmentCompletedByAdmin(assignmentId);
            
            if (response.success) {
                await loadAssignments();
                await loadStats();
                setShowDetailDialog(false);
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error completing assignment:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error marcando como completado';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditAssignment = (assignment) => {
        setSelectedAssignment(assignment);
        setShowEditDialog(true);
    };

    // Nueva función para manejar el diálogo de estados de docentes
    const handleManageTeacherStates = async (assignment) => {
        try {
            setActionLoading(true);
            setSelectedAssignment(assignment);
            
            // Usar el servicio en lugar de fetch directo
            const data = await getTeachersStatusForAssignment(assignment._id);
            setAssignmentTeachers(data.teachersStatus || []);
            setShowTeacherStatusDialog(true);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al cargar los estados de los docentes');
        } finally {
            setActionLoading(false);
        }
    };

    // Función para actualizar el estado de un docente específico
    const handleUpdateTeacherStatus = async (teacherId, newStatus) => {
        try {
            setActionLoading(true);
            
            // Usar el servicio en lugar de fetch directo
            await updateTeacherStatusInAssignment(selectedAssignment._id, teacherId, newStatus);
            
            // Recargar los estados actualizados
            await handleManageTeacherStates(selectedAssignment);
            await loadAssignments(); // Recargar la lista principal
        } catch (error) {
            console.error('Error:', error);
            setError(error.message || 'Error al actualizar el estado del docente');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveAssignment = async (updatedData) => {
        try {
            setActionLoading(true);
            setError('');
            
            const response = await updateAssignmentByAdmin(updatedData._id, updatedData);
            
            if (response.success) {
                await loadAssignments();
                await loadStats();
                setShowEditDialog(false);
                setSelectedAssignment(null);
                
                // Mostrar mensaje específico según el tipo de operación
                if (response.type === 'specific_assignment_created') {
                    // Podríamos mostrar una notificación especial aquí
                    console.log('✅ Asignación específica creada para el docente seleccionado');
                } else {
                    console.log('✅ Asignación actualizada para todos los docentes');
                }
            } else {
                throw new Error(response.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('Error updating assignment:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Error actualizando asignación';
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Confirmar cambios de estado en el modal (siempre habilitado)
    const handleConfirmTeacherStates = async () => {
        try {
            setActionLoading(true);

            // Determinar a quién aplicar y qué estado
            let targets = assignmentTeachers.filter(t => t.visible !== false);

            if (groupStatus) {
                const selected = targets.filter(t => t.selected);
                const applyTo = selected.length > 0 ? selected : targets;
                targets = applyTo.map(t => ({ ...t, status: groupStatus }));
            }
            // Si no hay estado grupal, usamos el estado elegido por fila (teacher.status)

            // Ejecutar actualizaciones (aplicar para todos los targets)
            const updates = targets.map(t =>
                updateTeacherStatusInAssignment(selectedAssignment._id, t._id, t.status || 'pending')
            );
            await Promise.all(updates);

            // Recargar estados y lista principal
            await handleManageTeacherStates(selectedAssignment);
            await loadAssignments();
            setShowTeacherStatusDialog(false);
        } catch (error) {
            setError(error.message || 'Error al confirmar los cambios de estado');
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'success';
            case 'completed-late':
                return 'warning';
            case 'not-delivered':
                return 'error';
            case 'pending':
                return 'info';
            default:
                return 'grey'; // Cambiar 'default' por 'grey' que sí existe en theme.palette
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed':
                return 'Entregado';
            case 'completed-late':
                return 'Entregado con Retraso';
            case 'not-delivered':
                return 'No Entregado';
            case 'pending':
                return 'Pendiente';
            default:
                return status || 'Desconocido';
        }
    };

    const formatDateWithTime = (dateString) => {
        try {
            if (!dateString || dateString === 'Invalid Date') return 'Fecha inválida';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Fecha inválida';
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date with time:', error);
            return 'Fecha inválida';
        }
    };

    const formatDateCompact = (dateString) => {
        try {
            if (!dateString || dateString === 'Invalid Date') return 'N/A';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'N/A';
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting compact date:', error);
            return 'N/A';
        }
    };

    const [groupStatus, setGroupStatus] = React.useState('');
    // Si no está abierto, no renderizar nada
    if (!open) {
        console.log('🚪 AdminAssignmentsFixed - Dialog closed, not rendering');
        return null;
    }

    console.log('🎬 AdminAssignmentsFixed - About to render Dialog with states:', {
        assignments: assignments.length,
        stats: !!stats,
        loading,
        error: !!error,
        teachers: teachers.length
    });
    return (
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="xl"
                fullWidth
                TransitionComponent={Slide}
                transitionDuration={300}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: theme?.palette?.background?.paper && theme?.palette?.grey?.[50] 
                            ? `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`
                            : '#ffffff',
                        minHeight: '90vh'
                    }
                }}
        >
            <DialogTitle sx={{ 
                py: 2,
                px: 3,
                background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AdminPanelSettings sx={{ fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                        Gestión de Asignaciones
                    </Typography>
                    {/* <Button
                        variant="contained"
                        color="secondary"
                        startIcon={<Schedule />}
                        onClick={() => setShowScheduledDialog(true)}
                        sx={{ ml: 2 }}
                    >
                        Programadas
                    </Button> */}
                </Box>
                <IconButton 
                    onClick={() => {
                        // Resetear filtros al cerrar
                        setTeacherFilter('all');
                        setStatusFilter('all');
                        setSearchTerm('');
                        setPage(1);
                        onClose();
                    }}
                    sx={{ color: 'white' }}
                >
                    <Close />
                </IconButton>
            </DialogTitle>

            {/* Indicador de filtro activo */}
            {initialFilter && initialFilter.teacherId && (
                <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    px: 3, 
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                }}>
                    <Person />
                    <Typography variant="body2">
                        Filtrando por: <strong>{initialFilter.teacherName}</strong>
                        {initialFilter.statusFilter && initialFilter.statusFilter !== 'all' && (
                            <> - Estado: <strong>{getStatusLabel(initialFilter.statusFilter)}</strong></>
                        )}
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        sx={{ 
                            ml: 2, 
                            color: 'white', 
                            borderColor: 'white',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'white'
                            }
                        }}
                        onClick={() => {
                            setTeacherFilter('all');
                            setStatusFilter('all');
                            setSearchTerm('');
                            setPage(1);
                        }}
                    >
                        Limpiar Filtros
                    </Button>
                </Box>
            )}

            <DialogContent sx={{ p: 3 }}>
                {/* Estadísticas generales */}
                {stats && stats.overview && (
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {[
                            { 
                                icon: <AssignmentIcon sx={{ fontSize: 32 }} />, 
                                value: stats.overview.total, 
                                label: 'Total',
                                color: 'primary',
                                filterValue: 'all'
                            },
                            { 
                                icon: <Schedule sx={{ fontSize: 32 }} />, 
                                value: stats.overview.pending, 
                                label: 'Pendientes',
                                color: 'info',
                                filterValue: 'pending'
                            },
                            { 
                                icon: <CheckCircle sx={{ fontSize: 32 }} />, 
                                value: stats.overview.completed, 
                                label: 'Entregadas',
                                color: 'success',
                                filterValue: 'completed'
                            },
                            { 
                                icon: <Warning sx={{ fontSize: 32 }} />, 
                                value: stats.overview['completed-late'] || 0, 
                                label: 'Entregadas con Retraso',
                                color: 'warning',
                                filterValue: 'completed-late'
                            },
                            { 
                                icon: <Close sx={{ fontSize: 32 }} />, 
                                value: stats.overview['not-delivered'] || 0, 
                                label: 'No Entregadas',
                                color: 'error',
                                filterValue: 'not-delivered'
                            }
                        ].map((stat, index) => (
                            <Grid item xs={6} sm={4} md={2.4} key={index}>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -5 }}
                                >
                                    <Card 
                                        onClick={() => {
                                            setStatusFilter(stat.filterValue);
                                            setPage(1);
                                        }}
                                        sx={{ 
                                            height: '100%', 
                                            borderRadius: 2,
                                            boxShadow: theme.shadows[3],
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            border: statusFilter === stat.filterValue ? `2px solid ${theme.palette[stat.color].main}` : 'none',
                                            '&:hover': {
                                                boxShadow: theme.shadows[6],
                                                transform: 'translateY(-2px)'
                                            }
                                        }}
                                    >
                                        <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                            <AnimatedBadge 
                                                badgeContent={stat.value} 
                                                color={stat.color} 
                                                max={999}
                                            >
                                                {React.cloneElement(stat.icon, { 
                                                    color: stat.color,
                                                    sx: { fontSize: 32 }
                                                })}
                                            </AnimatedBadge>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                {stat.label}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Controles de filtros */}
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar asignaciones..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={statusFilter}
                                    label="Estado"
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <MenuItem value="all">Todos</MenuItem>
                                    <MenuItem value="pending">Pendientes</MenuItem>
                                    <MenuItem value="completed">Entregadas</MenuItem>
                                    <MenuItem value="completed-late">Entregadas con Retraso</MenuItem>
                                    <MenuItem value="not-delivered">No Entregadas</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Ordenar por</InputLabel>
                                <Select
                                    value={sortBy}
                                    label="Ordenar por"
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <MenuItem value="-createdAt">Más recientes</MenuItem>
                                    <MenuItem value="createdAt">Más antiguas</MenuItem>
                                    <MenuItem value="dueDate">Fecha de entrega</MenuItem>
                                    <MenuItem value="-dueDate">Fecha de entrega (desc)</MenuItem>
                                    <MenuItem value="title">Título A-Z</MenuItem>
                                    <MenuItem value="-title">Título Z-A</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Docente</InputLabel>
                                <Select
                                    value={teacherFilter}
                                    onChange={(e) => setTeacherFilter(e.target.value)}
                                    label="Docente"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <Person color="action" />
                                        </InputAdornment>
                                    }
                                >
                                    <MenuItem value="all">Todos los docentes</MenuItem>
                                    {teachers.map((teacher) => (
                                        <MenuItem key={teacher._id} value={teacher._id}>
                                            {`${teacher.nombre} ${teacher.apellidoPaterno} ${teacher.apellidoMaterno}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                startIcon={<Refresh />}
                            >
                                Actualizar
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Mensajes de error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Alert 
                                severity="error" 
                                sx={{ mb: 2 }} 
                                onClose={() => setError('')}
                                variant="filled"
                            >
                                {error}
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tabla de asignaciones */}
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress size={60} />
                    </Box>
                ) : assignments.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                        <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No se encontraron asignaciones
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ajusta los filtros para ver más resultados
                        </Typography>
                    </Paper>
                ) : (
                    <TableContainer 
                        component={Paper} 
                        sx={{ 
                            borderRadius: 2, 
                            mb: 3,
                            maxHeight: '70vh',
                            overflowX: 'auto',
                            '& .MuiTable-root': {
                                minWidth: '1000px'
                            }
                        }}
                    >
                        <Table stickyHeader size="medium">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', width: '25%', maxWidth: '300px' }}>Título</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '20%', maxWidth: '200px' }}>Docente</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '12%', maxWidth: '120px' }}>Estado</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '15%', maxWidth: '150px' }}>Fecha de Entrega</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '15%', maxWidth: '150px' }}>Fecha de Cierre</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', width: '13%', maxWidth: '130px' }}>Detalles</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {assignments.map((assignment) => {
                                    return (
                                        <TableRow 
                                            key={assignment._id}
                                            hover
                                            sx={{
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                borderLeft: `4px solid ${theme?.palette?.[getStatusColor(assignment.status)]?.main || '#ccc'}`,
                                                height: '72px',
                                                '& .MuiTableCell-root': {
                                                    padding: '8px 12px'
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ maxWidth: '300px', padding: '12px 16px' }}>
                                                <Typography 
                                                    variant="subtitle2" 
                                                    sx={{ 
                                                        fontWeight: 'medium',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 1,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.2',
                                                        mb: 0.5
                                                    }}
                                                    title={assignment.title}
                                                >
                                                    {assignment.title}
                                                </Typography>
                                                <Typography 
                                                    variant="caption" 
                                                    color="text.secondary" 
                                                    sx={{ 
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        lineHeight: '1.1',
                                                        fontSize: '0.75rem'
                                                    }}
                                                    title={assignment.description}
                                                >
                                                    {assignment.description}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: '200px', padding: '12px 16px' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <School sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                                        {(() => {
                                                            if (teacherFilter !== 'all') {
                                                                const selectedTeacher = assignment.assignedTo?.find(teacher => teacher._id === teacherFilter);
                                                                if (selectedTeacher) {
                                                                    return (
                                                                        <>
                                                                            <Typography 
                                                                                variant="body2" 
                                                                                sx={{ 
                                                                                    fontWeight: 'medium',
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap'
                                                                                }}
                                                                                title={`${selectedTeacher.nombre} ${selectedTeacher.apellidoPaterno} ${selectedTeacher.apellidoMaterno}`}
                                                                            >
                                                                                {`${selectedTeacher.nombre} ${selectedTeacher.apellidoPaterno} ${selectedTeacher.apellidoMaterno}`}
                                                                            </Typography>
                                                                            <Typography 
                                                                                variant="caption" 
                                                                                color="text.secondary"
                                                                                sx={{ 
                                                                                    overflow: 'hidden',
                                                                                    textOverflow: 'ellipsis',
                                                                                    whiteSpace: 'nowrap',
                                                                                    display: 'block'
                                                                                }}
                                                                                title={selectedTeacher.email}
                                                                            >
                                                                                {selectedTeacher.email}
                                                                            </Typography>
                                                                        </>
                                                                    );
                                                                }
                                                            }
                                                            
                                                            if (assignment.assignedTo && assignment.assignedTo.length > 0) {
                                                                const firstTeacher = assignment.assignedTo[0];
                                                                return (
                                                                    <>
                                                                        <Typography 
                                                                            variant="body2" 
                                                                            sx={{ 
                                                                                fontWeight: 'medium',
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap'
                                                                            }}
                                                                            title={`${firstTeacher.nombre} ${firstTeacher.apellidoPaterno} ${firstTeacher.apellidoMaterno}${assignment.assignedTo.length > 1 ? ` +${assignment.assignedTo.length - 1} más` : ''}`}
                                                                        >
                                                                            {`${firstTeacher.nombre} ${firstTeacher.apellidoPaterno} ${firstTeacher.apellidoMaterno}`}
                                                                            {assignment.assignedTo.length > 1 && ` +${assignment.assignedTo.length - 1} más`}
                                                                        </Typography>
                                                                        <Typography 
                                                                            variant="caption" 
                                                                            color="text.secondary"
                                                                            sx={{ 
                                                                                overflow: 'hidden',
                                                                                textOverflow: 'ellipsis',
                                                                                whiteSpace: 'nowrap',
                                                                                display: 'block'
                                                                            }}
                                                                            title={firstTeacher.email}
                                                                        >
                                                                            {firstTeacher.email}
                                                                        </Typography>
                                                                    </>
                                                                );
                                                            }
                                                            
                                                            return (
                                                                <>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                                        Sin asignar
                                                                    </Typography>
                                                                    <Typography variant="caption" color="text.secondary">
                                                                        Sin email
                                                                    </Typography>
                                                                </>
                                                            );
                                                        })()}
                                                    </Box>
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: '120px', padding: '12px 8px' }}>
                                                <Chip
                                                    label={getStatusLabel(assignment.status)}
                                                    color={getStatusColor(assignment.status)}
                                                    size="small"
                                                    sx={{ 
                                                        fontWeight: 'bold',
                                                        fontSize: '0.75rem',
                                                        height: '24px'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: '150px', padding: '12px 8px' }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        fontSize: '0.75rem',
                                                        lineHeight: '1.2'
                                                    }}
                                                    title={formatDateWithTime(assignment.dueDate)}
                                                >
                                                    {formatDateCompact(assignment.dueDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: '150px', padding: '12px 8px' }}>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                        fontSize: '0.75rem',
                                                        lineHeight: '1.2'
                                                    }}
                                                    title={formatDateWithTime(assignment.closeDate)}
                                                >
                                                    {formatDateCompact(assignment.closeDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell sx={{ maxWidth: '130px', padding: '12px 8px' }}>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Ver Detalles">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedAssignment(assignment);
                                                                setShowDetailDialog(true);
                                                            }}
                                                            color="primary"
                                                        >
                                                            <Visibility />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    {assignment.status === 'pending' && (
                                                        <Tooltip title="Marcar como Completado">
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Editar Asignación">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditAssignment(assignment)}
                                                            color="info"
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                    
                                                    <Tooltip title="Gestionar Estados de Docentes">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleManageTeacherStates(assignment)}
                                                            color="secondary"
                                                            disabled={actionLoading}
                                                        >
                                                            <PlaylistAddCheck />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <Box display="flex" justifyContent="center" mt={2}>
                        <Button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            variant="outlined"
                            sx={{ mr: 2 }}
                        >
                            Anterior
                        </Button>
                        <Typography sx={{ px: 2, py: 1, alignSelf: 'center' }}>
                            Página {page} de {totalPages}
                        </Typography>
                        <Button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            variant="outlined"
                            sx={{ ml: 2 }}
                        >
                            Siguiente
                        </Button>
                    </Box>
                )}
            </DialogContent>

            {/* Diálogo de detalles rediseñado - Moderno y elegante */}
            <Dialog
                open={showDetailDialog}
                onClose={() => setShowDetailDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 4,
                        overflow: 'hidden',
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }
                }}
            >
                {selectedAssignment && (
                    <>
                        {/* Header con azul marino */}
                        <DialogTitle sx={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 3,
                            backgroundColor: '#1e3a8a',
                            borderBottom: '2px solid #1e40af',
                            minHeight: '80px'
                        }}>
                            <Box sx={{ flex: 1, mr: 2 }}>
                                <Typography variant="h4" sx={{ 
                                    fontWeight: 'bold', 
                                    color: 'white',
                                    mb: 1,
                                    fontSize: '1.5rem'
                                }}>
                                    <Typography component="span" sx={{ 
                                        fontWeight: 'normal',
                                        mr: 1
                                    }}>
                                        Título:
                                    </Typography>
                                    {selectedAssignment?.title || 'Sin título'}
                                </Typography>
                                <Chip
                                    label={getStatusLabel(selectedAssignment?.status)}
                                    sx={{ 
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase',
                                        letterSpacing: 0.5,
                                        fontSize: '0.75rem',
                                        border: '1px solid rgba(255, 255, 255, 0.3)'
                                    }}
                                />
                            </Box>
                            <IconButton 
                                onClick={() => setShowDetailDialog(false)}
                                size="large"
                                sx={{ 
                                    color: 'white',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                        borderColor: 'rgba(255, 255, 255, 0.5)'
                                    }
                                }}
                            >
                                <Close />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ p: 0 }}>
                            {/* Descripción con diseño card */}
                            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'grey.100' }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 2, 
                                    color: 'text.primary',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    📝 Descripción
                                </Typography>
                                <Typography variant="body1" sx={{ 
                                    whiteSpace: 'pre-line',
                                    lineHeight: 1.7,
                                    color: 'text.secondary',
                                    fontSize: '1rem'
                                }}>
                                    {selectedAssignment.description}
                                </Typography>
                            </Box>

                            {/* Información organizada en tarjetas */}
                            <Box sx={{ p: 3 }}>
                                <Grid container spacing={3}>
                                    {/* Tarjeta del Docente */}
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={0} sx={{ 
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 100%)',
                                            border: '1px solid #bae6fd',
                                            height: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{ 
                                                mb: 2, 
                                                color: 'primary.main',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                👨‍🏫 Información del Docente
                                            </Typography>
                                            <Box sx={{ space: 2 }}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ 
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontWeight: 600
                                                    }}>
                                                        Docente Asignado
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 500,
                                                        color: 'text.primary'
                                                    }}>
                                                        {selectedAssignment.assignedTo && selectedAssignment.assignedTo.length > 0 ? 
                                                            `${selectedAssignment.assignedTo[0].nombre} ${selectedAssignment.assignedTo[0].apellidoPaterno} ${selectedAssignment.assignedTo[0].apellidoMaterno}` :
                                                            'Sin asignar'
                                                        }
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{ 
                                                        color: 'text.secondary',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontWeight: 600
                                                    }}>
                                                        Correo Electrónico
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 500,
                                                        color: 'text.primary'
                                                    }}>
                                                        {selectedAssignment.assignedTo && selectedAssignment.assignedTo.length > 0 ?
                                                            selectedAssignment.assignedTo[0].email :
                                                            'Sin email'
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Tarjeta de Fechas */}
                                    <Grid item xs={12} md={6}>
                                        <Paper elevation={0} sx={{ 
                                            p: 3,
                                            borderRadius: 3,
                                            background: 'linear-gradient(145deg, #fef3c7 0%, #fde68a 100%)',
                                            border: '1px solid #fbbf24',
                                            height: '100%'
                                        }}>
                                            <Typography variant="h6" sx={{ 
                                                mb: 2, 
                                                color: '#d97706',
                                                fontWeight: 600,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1
                                            }}>
                                                📅 Fechas Importantes
                                            </Typography>
                                            <Box sx={{ space: 2 }}>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ 
                                                        color: '#92400e',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontWeight: 600
                                                    }}>
                                                        Fecha de Entrega
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 500,
                                                        color: '#78350f'
                                                    }}>
                                                        {formatDateWithTime(selectedAssignment.dueDate)}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" sx={{ 
                                                        color: '#92400e',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontWeight: 600
                                                    }}>
                                                        Fecha de Cierre
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 500,
                                                        color: '#78350f'
                                                    }}>
                                                        {formatDateWithTime(selectedAssignment.closeDate)}
                                                    </Typography>
                                                </Box>
                                                <Box>
                                                    <Typography variant="caption" sx={{ 
                                                        color: '#92400e',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: 1,
                                                        fontWeight: 600
                                                    }}>
                                                        Creado el
                                                    </Typography>
                                                    <Typography variant="body1" sx={{ 
                                                        fontWeight: 500,
                                                        color: '#78350f'
                                                    }}>
                                                        {formatDateWithTime(selectedAssignment.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    {/* Tarjeta de Archivos (si existen) */}
                                    {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                                        <Grid item xs={12}>
                                            <Paper elevation={0} sx={{ 
                                                p: 3,
                                                borderRadius: 3,
                                                background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)',
                                                border: '1px solid #86efac'
                                            }}>
                                                <Typography variant="h6" sx={{ 
                                                    mb: 2, 
                                                    color: '#059669',
                                                    fontWeight: 600,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1
                                                }}>
                                                    📎 Archivos Adjuntos
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                    {selectedAssignment.attachments.map((file, index) => (
                                                        <Chip
                                                            key={index}
                                                            icon={<FileDownload />}
                                                            label={file.fileName}
                                                            onClick={() => {
                                                                const downloadUrl = `/api/files/download?url=${encodeURIComponent(file.fileUrl)}&fileName=${encodeURIComponent(file.fileName)}&mimeType=${encodeURIComponent(file.mimeType || 'application/octet-stream')}`;
                                                                window.open(downloadUrl, '_blank');
                                                            }}
                                                            sx={{ 
                                                                backgroundColor: 'white',
                                                                border: '1px solid #86efac',
                                                                color: '#059669',
                                                                cursor: 'pointer',
                                                                '&:hover': {
                                                                    backgroundColor: '#059669',
                                                                    color: 'white',
                                                                    transform: 'translateY(-2px)',
                                                                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)'
                                                                },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </Paper>
                                        </Grid>
                                    )}
                                </Grid>
                            </Box>
                        </DialogContent>

                        {/* Footer minimalista */}
                        <Box sx={{ 
                            p: 3, 
                            borderTop: '1px solid',
                            borderColor: 'grey.100',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            background: '#fafbfc'
                        }}>
                            <Button 
                                onClick={() => setShowDetailDialog(false)}
                                variant="contained"
                                sx={{
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                        transform: 'translateY(-1px)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                Cerrar
                            </Button>
                        </Box>
                    </>
                )}
            </Dialog>

            {/* Diálogo de edición de asignación */}
            <EditAssignment 
                open={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                assignment={selectedAssignment}
                onSave={handleSaveAssignment}
                teachers={teachers}
                loading={actionLoading}
            />

            {/* Diálogo de asignaciones programadas */}
            <ScheduledAssignments
                open={showScheduledDialog}
                onClose={() => setShowScheduledDialog(false)}
                teachers={teachers}
            />

{/* Diálogo para gestionar estados de docentes */}
<Dialog
  open={showTeacherStatusDialog}
  onClose={() => setShowTeacherStatusDialog(false)}
  maxWidth="md"
  fullWidth
  TransitionComponent={Slide}
  transitionDuration={300}
>
  {/* CABECERA */}
  <DialogTitle
    sx={{
      backgroundColor: "primary.main",
      color: "primary.contrastText",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 3,
      py: 2,
    }}
  >
    <Box display="flex" alignItems="center" gap={1}>
      <PlaylistAddCheck />
      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
        Gestionar Estados de Docentes
      </Typography>
    </Box>
    <IconButton
      onClick={() => setShowTeacherStatusDialog(false)}
      sx={{ color: "primary.contrastText" }}
    >
      <Close />
    </IconButton>
  </DialogTitle>

  {/* CONTENIDO */}
  <DialogContent sx={{ p: 3 }}>
    {selectedAssignment && (
      <>
        {/* INFO DE LA ASIGNACIÓN (título y descripción explícitos) */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📝 <strong>Título:</strong> {selectedAssignment.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ whiteSpace: "pre-line" }}
          >
            <strong>Descripción:</strong>{" "}
            {selectedAssignment.description || "Sin descripción disponible."}
          </Typography>
        </Paper>

        {/* SUBTÍTULO */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Estados de Entrega por Docente
        </Typography>

        {assignmentTeachers.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            {actionLoading
              ? "Cargando docentes..."
              : "No hay docentes asignados a esta actividad."}
          </Typography>
        ) : (
          <>
            {/* SELECCIÓN GRUPAL */}
            <Paper
              elevation={0}
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "background.default",
                border: "1px solid",
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={
                      assignmentTeachers.length > 0 &&
                      assignmentTeachers
                        .filter((t) => t.visible !== false)
                        .every((t) => t.selected)
                    }
                    indeterminate={
                      assignmentTeachers
                        .filter((t) => t.visible !== false)
                        .some((t) => t.selected) &&
                      !assignmentTeachers
                        .filter((t) => t.visible !== false)
                        .every((t) => t.selected)
                    }
                    onChange={(e) => {
                      const checked = e.target.checked
                      setAssignmentTeachers((prev) =>
                        prev.map((t) =>
                          t.visible === false ? t : { ...t, selected: checked }
                        )
                      )
                    }}
                  />
                }
                label={`Seleccionar todos los docentes (${assignmentTeachers.filter(
                  (t) => t.selected
                ).length}/${assignmentTeachers.filter(
                  (t) => t.visible !== false
                ).length} seleccionados)`}
              />

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Estado grupal</InputLabel>
                <Select
                  label="Estado grupal"
                  value={groupStatus || ""}
                  onChange={(e) => setGroupStatus(e.target.value)}
                >
                  <MenuItem value="completed">Entregado</MenuItem>
                  <MenuItem value="completed-late">
                    Entregado con Retraso
                  </MenuItem>
                  <MenuItem value="not-delivered">No Entregado</MenuItem>
                  <MenuItem value="pending">Pendiente</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmTeacherStates}
              >
                Confirmar
              </Button>
              <Button
                variant="text"
                color="inherit"
                onClick={() => {
                  setGroupStatus("")
                  setAssignmentTeachers((prev) =>
                    prev.map((t) => ({ ...t, selected: false }))
                  )
                }}
              >
                Limpiar
              </Button>
            </Paper>

            {/* LISTA DE DOCENTES */}
            <Grid container spacing={2}>
              {assignmentTeachers.map((teacher, index) => (
                <Grid item xs={12} key={index}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "0.2s",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      {/* INFO DOCENTE */}
                      <Box display="flex" alignItems="center" gap={2}>
                        <Checkbox
                          checked={!!teacher.selected}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setAssignmentTeachers((prev) =>
                              prev.map((t, i) =>
                                i === index ? { ...t, selected: checked } : t
                              )
                            )
                          }}
                          sx={{ mr: 1 }}
                        />
                        <AssignmentInd color="primary" />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {teacher.nombre} {teacher.apellidoPaterno}{" "}
                            {teacher.apellidoMaterno || ""}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {teacher.email}
                          </Typography>
                        </Box>
                      </Box>

                      {/* SELECTOR DE ESTADO */}
                      <Box display="flex" alignItems="center" gap={2}>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                          <InputLabel>Seleccionar Estado</InputLabel>
                          <Select
                            value={teacher.status || "pending"}
                            label="Seleccionar Estado"
                            onChange={(e) =>
                              setAssignmentTeachers((prev) =>
                                prev.map((t, i) =>
                                  i === index
                                    ? { ...t, status: e.target.value }
                                    : t
                                )
                              )
                            }
                            disabled={actionLoading}
                          >
                            <MenuItem value="completed">
                              <Chip
                                size="small"
                                label="Entregado"
                                sx={{
                                  backgroundColor: "#4caf50",
                                  color: "white",
                                  minWidth: 100,
                                }}
                              />
                            </MenuItem>
                            <MenuItem value="completed-late">
                              <Chip
                                size="small"
                                label="Entregado con Retraso"
                                sx={{
                                  backgroundColor: "#ff9800",
                                  color: "white",
                                  minWidth: 100,
                                }}
                              />
                            </MenuItem>
                            <MenuItem value="not-delivered">
                              <Chip
                                size="small"
                                label="No Entregado"
                                sx={{
                                  backgroundColor: "#f44336",
                                  color: "white",
                                  minWidth: 100,
                                }}
                              />
                            </MenuItem>
                            <MenuItem value="pending">
                              <Chip
                                size="small"
                                label="Pendiente"
                                sx={{
                                  backgroundColor: "#795548",
                                  color: "white",
                                  minWidth: 100,
                                }}
                              />
                            </MenuItem>
                          </Select>
                        </FormControl>

                        {/* ESTADO ACTUAL */}
                        <Chip
                          size="small"
                          label={
                            teacher.status === "completed"
                              ? "Entregado"
                              : teacher.status === "completed-late"
                              ? "Entregado con Retraso"
                              : teacher.status === "not-delivered"
                              ? "No Entregado"
                              : "Pendiente"
                          }
                          sx={{
                            backgroundColor:
                              teacher.status === "completed"
                                ? "#4caf50"
                                : teacher.status === "completed-late"
                                ? "#ff9800"
                                : teacher.status === "not-delivered"
                                ? "#f44336"
                                : "#795548",
                            color: "white",
                          }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </>
    )}
  </DialogContent>

  {/* ACCIONES */}
  <DialogActions sx={{ p: 2 }}>
    <Button
      onClick={() => setShowTeacherStatusDialog(false)}
      variant="outlined"
    >
      Cerrar
    </Button>
  </DialogActions>
</Dialog>

        </Dialog>
    );
};

export default AdminAssignments;