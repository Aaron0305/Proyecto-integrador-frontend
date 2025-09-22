import React, { useState, useEffect } from 'react';

import {

    Box,

    Paper,

    Typography,

    Button,

    Card,

    CardContent,

    CardActions,

    Chip,

    Grid,

    Divider,

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

    Zoom,

    Fade,

    Grow,

    Slide,

    Skeleton,

    Table,

    TableBody,

    TableCell,

    TableHead,

    TableRow,

    TableContainer,

    Link

} from '@mui/material';

import {

    Assignment as AssignmentIcon,

    Schedule,

    CheckCircle,

    Warning,

    Search,

    FilterList,

    Refresh,

    Visibility,

    Close,

    CalendarToday,

    ExpandMore,

    ExpandLess,

    RemoveRedEye,

    Person,

    Download

} from '@mui/icons-material';

import { motion, AnimatePresence } from 'framer-motion';

import { useTheme } from '@mui/material/styles';

import { getTeacherAssignmentStats, getTeacherAssignments, getAllTeachersStats } from '../../services/assignmentService';

import { formatDistanceToNow } from 'date-fns';

import { es } from 'date-fns/locale';



// Custom animated components

const AnimatedCard = motion(Card);

const AnimatedBadge = motion(Badge);

const AnimatedButton = motion(Button);



const TeacherAssignments = () => {

    const theme = useTheme();

    // Estados principales

    const [assignments, setAssignments] = useState([]);

    const [stats, setStats] = useState(null);

    const [allTeachersStats, setAllTeachersStats] = useState([]);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState('');

    

    // Estados para filtros

    const [statusFilter, setStatusFilter] = useState('all');

    const [searchTerm, setSearchTerm] = useState('');

    const [sortBy, setSortBy] = useState('status,-completedAt,-createdAt'); // Ordenar por estado y fecha de completado primero

    const [expandedFilters, setExpandedFilters] = useState(false);

    

    // Estados para paginación

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const ITEMS_PER_PAGE = 5; // Constante para el número de elementos por página

    

    // Estados para diálogos

    const [selectedAssignment, setSelectedAssignment] = useState(null);

    const [showDetailDialog, setShowDetailDialog] = useState(false);

    const [isRefreshing, setIsRefreshing] = useState(false);



    // Load stats on mount

    useEffect(() => {

        loadStats();

        loadAllTeachersStats();

    }, []);



    // Load assignments when filters change

    useEffect(() => {

        loadAssignments();

    }, [statusFilter, searchTerm, sortBy, page]);



    const loadStats = async () => {

        try {

            const response = await getTeacherAssignmentStats();

            if (response.success) {

                setStats(response.stats);

            }

        } catch (error) {

            console.error('Error loading stats:', error);

        }

    };



    const loadAssignments = async () => {

        try {

            setLoading(true);

            setError('');

            

            const params = {

                search: searchTerm,

                status: statusFilter,

                sort: '-createdAt',

                page: page,

                limit: 5

            };



            const response = await getTeacherAssignments(params);



            if (response.success) {

                setAssignments(response.assignments || []);

                setTotalPages(response.pagination?.totalPages || 1);

            } else {

                setError('No se pudieron cargar las asignaciones');

            }

        } catch (error) {

            console.error('Error al cargar asignaciones:', error);

            setError('Error al cargar asignaciones: ' + (error.message || 'Error desconocido'));

        } finally {

            setLoading(false);

            setIsRefreshing(false);

        }

    };



    const loadAllTeachersStats = async () => {

        try {

            const response = await getAllTeachersStats();

            if (response.success) {

                setAllTeachersStats(response.stats);

            }

        } catch (error) {

            console.error('Error loading all teachers stats:', error);

        }

    };



    const handleRefresh = () => {

        setIsRefreshing(true);

        loadAssignments();

        loadStats();

        loadAllTeachersStats();

    };



    const getStatusColor = (assignment) => {

        // Si el admin ha actualizado el estado específico del docente, usar esa información

        if (assignment.teacherStatus && assignment.teacherStatus.adminUpdated) {

            const { submissionStatus } = assignment.teacherStatus;

            switch (submissionStatus) {

                case 'on-time':

                    return 'success';  // Verde - Entregado a tiempo

                case 'late':

                    return 'warning';  // Naranja oscuro - Entregado con retraso

                case 'closed':

                    return 'error';    // Rojo - No entregado

                default:

                    return 'warning';  // Naranja - Pendiente

            }

        }

        

        // Lógica cuando el propio assignment ya trae el estado mapeado desde backend

        const { status, dueDate, closeDate } = assignment;

        if (status === 'completed') return 'success';    // Verde

        if (status === 'completed-late') return 'warning';  // Naranja oscuro

        if (status === 'not-delivered') return 'error';  // Rojo

        

        // Para asignaciones pendientes

        const now = new Date();

        const due = new Date(dueDate);

        const close = new Date(closeDate);

        

        // Si está cerrada y no entregada

        if (now > close) return 'error';  // Rojo

        

        // Si está vencida pero aún se puede entregar

        if (now > due) return 'warning';  // Naranja oscuro

        

        // Si está pendiente

        return 'warning';  // Naranja

    };



    const getStatusLabel = (assignment) => {

        // Si el admin ha actualizado el estado específico del docente, usar esa información

        if (assignment.teacherStatus && assignment.teacherStatus.adminUpdated) {

            const { submissionStatus } = assignment.teacherStatus;

            switch (submissionStatus) {

                case 'on-time':

                    return 'Entregado';

                case 'late':

                    return 'Entregado con Retraso';

                case 'closed':

                    return 'No Entregado';

                default:

                    return 'Pendiente';

            }

        }

        

        // Lógica cuando el propio assignment ya trae el estado mapeado desde backend

        const { status, dueDate, closeDate } = assignment;

        if (status === 'completed') return 'Entregado';

        if (status === 'completed-late') return 'Entregado con Retraso';

        if (status === 'not-delivered') return 'No Entregado';

        if (status === 'pending') {

            const now = new Date();

            const due = new Date(dueDate);

            const close = new Date(closeDate);

            

            if (now > close) return 'Cerrado - No entregado';

            if (now > due) return 'Vencido - Puede entregarse';

            

            const daysUntilDue = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

            

            if (daysUntilDue <= 0) {

                return 'Vence hoy';

            } else if (daysUntilDue === 1) {

                return 'Vence mañana';

            } else {

                return `${daysUntilDue} días restantes`;

            }

        }

        return status;

    };



    const formatDate = (dateString) => {

        try {

            if (!dateString || dateString === 'Invalid Date') return 'Fecha inválida';

            const date = new Date(dateString);

            if (isNaN(date.getTime())) return 'Fecha inválida';

            return date.toLocaleDateString('es-ES', {

                year: 'numeric',

                month: 'long',

                day: 'numeric'

            });

        } catch (error) {

            console.error('Error formatting date:', error);

            return 'Fecha inválida';

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



    const formatTimeRemaining = (dueDate, closeDate) => {

        try {

            if (!dueDate || !closeDate) return 'Fechas inválidas';

            

            const now = new Date();

            const due = new Date(dueDate);

            const close = new Date(closeDate);

            

            if (isNaN(due.getTime())) return 'Fecha inválida';

            

            if (now > close) return 'Cerrado - No se puede entregar';

            if (now > due) {

                const diffTime = close - now;

                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays < 0) return 'Cerrado';

                if (diffDays === 0) return 'Cierra hoy - Entrega tarde!';

                return `${diffDays} días hasta el cierre - Entrega tarde`;

            }

            

            return formatDistanceToNow(due, { 

                addSuffix: true, 

                locale: es 

            });

        } catch (error) {

            console.error('Error calculating time remaining:', error);

            return 'Error de fecha';

        }

    };



    // Animation variants

    const cardVariants = {

        hidden: { opacity: 0, y: 20 },

        visible: { 

            opacity: 1, 

            y: 0,

            transition: {

                duration: 0.4,

                ease: "easeOut"

            }

        }

    };



    const statsVariants = {

        hover: {

            y: -5,

            transition: {

                duration: 0.2,

                ease: "easeOut"

            }

        }

    };



    if (loading && assignments.length === 0) {

        return (

            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">

                <motion.div

                    animate={{ rotate: 360 }}

                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}

                >

                    <CircularProgress thickness={3} size={60} />

                </motion.div>

            </Box>

        );

    }



    // Función para descargar archivos
    const handleDownloadFile = async (file, assignmentTitle) => {
        try {
            // Usar solo el nombre original del archivo
            const fileName = file.fileName;

            // Obtener la URL del archivo
            const fileUrl = file.cloudinaryUrl || file.fileUrl || file.url;
            
            if (!fileUrl) {
                console.error('No se encontró URL para el archivo');
                return;
            }

            // Crear un enlace temporal para la descarga
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.target = '_blank';
            
            // Para archivos que no se pueden descargar directamente, usar la API del backend
            if (file.mimeType === 'application/pdf' || file.fileType === 'pdf' || 
                file.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                file.fileType === 'docx' || file.fileType === 'txt' || file.fileType === 'png' ||
                file.fileType === 'jpg' || file.fileType === 'jpeg') {
                
                // Usar la ruta del backend para descarga con nombre original
                const downloadUrl = `/api/files/download?url=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}&mimeType=${encodeURIComponent(file.mimeType || 'application/octet-stream')}`;
                link.href = downloadUrl;
            }
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error al descargar archivo:', error);
            // Fallback: abrir en nueva pestaña
            const fileUrl = file.cloudinaryUrl || file.fileUrl || file.url;
            if (fileUrl) {
                window.open(fileUrl, '_blank');
            }
        }
    };



    return (

        <Box sx={{ p: 3 }}>

            {/* Estadísticas de todos los profesores */}

            <Paper sx={{ mb: 3, p: 2 }}>

                <Typography variant="h6" gutterBottom>

                    Estadísticas de Docentes

                </Typography>

                <TableContainer>

                    <Table>

                        <TableHead>

                            <TableRow>

                                <TableCell align="center"></TableCell>

                                <TableCell align="center"></TableCell>

                                <TableCell align="center"></TableCell>

                                <TableCell align="center"></TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {allTeachersStats.map((teacherStat) => (

                                <TableRow key={teacherStat.teacherId}>

                                    <TableCell>

                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                            <Person />

                                            <Typography>{teacherStat.teacherName}</Typography>

                                        </Box>

                                    </TableCell>

                                    <TableCell align="center">

                                        <Chip 

                                            label={teacherStat.stats.completed}

                                            color="success"

                                            size="small"

                                        />

                                    </TableCell>

                                    <TableCell align="center">

                                        <Chip 

                                            label={teacherStat.stats.pending}

                                            color="primary"

                                            size="small"

                                        />

                                    </TableCell>

                                    <TableCell align="center">

                                        <Chip 

                                            label={teacherStat.stats.overdue}

                                            color="error"

                                            size="small"

                                        />

                                    </TableCell>

                                    <TableCell align="center">

                                        <Chip 

                                            label={teacherStat.stats.total}

                                            color="default"

                                            size="small"

                                        />

                                    </TableCell>

                                    <TableCell align="center">

                                        {new Date(teacherStat.lastUpdated).toLocaleString()}

                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                </TableContainer>

            </Paper>



            {/* Stats cards with animations */}

            {stats && (

                <Grid container spacing={2} sx={{ mb: 3 }}>

                    {[

                        { 

                            icon: <AssignmentIcon sx={{ fontSize: 40 }} />, 

                            value: stats.total, 

                            label: 'Total',

                            color: 'primary',

                            filterValue: 'all'

                        },

                        { 

                            icon: <Schedule sx={{ fontSize: 40 }} />, 

                            value: stats.pending, 

                            label: 'Pendiente',

                            color: 'warning',

                            filterValue: 'pending'

                        },

                        { 

                            icon: <CheckCircle sx={{ fontSize: 40 }} />, 

                            value: stats.completed, 

                            label: 'Entregadas',

                            color: 'success',

                            filterValue: 'completed'

                        },

                        { 

                            icon: <CheckCircle sx={{ fontSize: 40 }} />, 

                            value: typeof stats.completedLate === 'number' ? stats.completedLate : 0,

                            label: 'Entregadas con Retraso',

                            color: 'warning',

                            filterValue: 'completed-late'

                        },

                        { 

                            icon: <Warning sx={{ fontSize: 40 }} />, 

                            value: typeof stats.notDelivered === 'number' ? stats.notDelivered : (stats.overdue || 0), 

                            label: 'No Entregadas',

                            color: 'error',

                            filterValue: 'not-delivered'

                        }

                    ].map((stat, index) => (

                        <Grid item xs={6} sm={3} key={index}>

                            <motion.div

                                initial="hidden"

                                animate="visible"

                                variants={{

                                    hidden: { opacity: 0, y: 20 },

                                    visible: { 

                                        opacity: 1, 

                                        y: 0,

                                        transition: {

                                            delay: index * 0.1,

                                            duration: 0.5

                                        }

                                    },

                                    hover: {

                                        y: -5,

                                        transition: {

                                            duration: 0.2,

                                            ease: "easeOut"

                                        }

                                    }

                                }}

                                whileHover="hover"

                            >

                                <Card 

                                    onClick={() => {

                                        setStatusFilter(stat.filterValue);

                                        setPage(1);

                                    }}

                                    data-stat={stat.filterValue}

                                    sx={{ 

                                        height: '100%', 

                                        borderRadius: 3,

                                        boxShadow: theme.shadows[4],

                                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[100]} 100%)`,

                                        cursor: 'pointer',

                                        border: statusFilter === stat.filterValue ? `2px solid ${theme.palette[stat.color].main}` : 'none',

                                        minWidth: 0 // Asegura tamaño igual

                                    }}

                                >

                                    <CardContent sx={{ 

                                        textAlign: 'center', 

                                        py: 3,

                                        position: 'relative',

                                        overflow: 'hidden'

                                    }}>

                                        <Box sx={{

                                            position: 'absolute',

                                            top: -20,

                                            right: -20,

                                            width: 80,

                                            height: 80,

                                            borderRadius: '50%',

                                            background: theme.palette[stat.color].light,

                                            opacity: 0.2

                                        }} />

                                        <AnimatedBadge 

                                            badgeContent={stat.value} 

                                            color={stat.color} 

                                            max={999}

                                            animate={{

                                                scale: [1, 1.1, 1]

                                            }}

                                            transition={{

                                                duration: 1.5,

                                                repeat: Infinity,

                                                repeatType: "reverse"

                                            }}

                                        >

                                            {React.cloneElement(stat.icon, { 

                                                color: stat.color,

                                                sx: { 

                                                    fontSize: 40,

                                                    filter: `drop-shadow(0 2px 4px ${theme.palette[stat.color].light})`

                                                }

                                            })}

                                        </AnimatedBadge>

                                        <Typography variant="h4" sx={{ 

                                            mt: 1,

                                            fontWeight: 'bold',

                                            background: `linear-gradient(to right, ${theme.palette[stat.color].main}, ${theme.palette[stat.color].dark})`,

                                            WebkitBackgroundClip: 'text',

                                            WebkitTextFillColor: 'transparent',

                                            minWidth: 0 // Asegura tamaño igual

                                        }}>

                                            {stat.value}

                                        </Typography>

                                        <Typography variant="body2" color="text.secondary" sx={{ 

                                            mt: 1,

                                            textTransform: 'uppercase',

                                            letterSpacing: 1,

                                            fontWeight: 'medium',

                                            minWidth: 0 // Asegura tamaño igual

                                        }}>

                                            {stat.label}

                                        </Typography>

                                    </CardContent>

                                </Card>

                            </motion.div>

                        </Grid>

                    ))}

                </Grid>

            )}



            {/* Error message with animation */}

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



            {/* Assignments table */}

            {assignments.length === 0 ? (

                <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ duration: 0.5 }}

                >

                    <Paper sx={{ 

                        p: 4, 

                        textAlign: 'center',

                        borderRadius: 3,

                        background: `linear-gradient(to bottom right, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`

                    }}>

                        <motion.div

                            animate={{

                                y: [0, -10, 0],

                            }}

                            transition={{

                                duration: 3,

                                repeat: Infinity,

                                ease: "easeInOut"

                            }}

                        >

                            <AssignmentIcon sx={{ 

                                fontSize: 64, 

                                color: 'text.secondary', 

                                mb: 2,

                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'

                            }} />

                        </motion.div>

                        <Typography variant="h5" color="text.secondary" gutterBottom>

                            No se encontraron asignaciones

                        </Typography>

                        <Typography variant="body1" color="text.secondary">

                            Cuando tengas asignaciones, aparecerán aquí

                        </Typography>

                        <Button 

                            variant="outlined" 

                            sx={{ mt: 2 }}

                            onClick={handleRefresh}

                            startIcon={<Refresh />}

                        >

                            Actualizar

                        </Button>

                    </Paper>

                </motion.div>

            ) : (

                <Paper sx={{ 

                        width: '100%', 

                        overflow: 'hidden', 

                        borderRadius: 2, 

                        mb: 3,

                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'

                    }}>

                    <Table stickyHeader>

                        <TableHead>

                            <TableRow sx={{

                                backgroundColor: 'background.paper',

                                transition: 'all 0.3s ease',

                                '& th, & td': {

                                    color: 'text.primary',

                                    fontWeight: 'bold',

                                    fontSize: '0.95rem',

                                    textTransform: 'uppercase',

                                    letterSpacing: '0.5px',

                                    borderBottom: 'none'

                                },

                                '&:hover': {

                                    backgroundColor: theme => `${theme.palette.primary.main}15`

                                }

                            }}>

                                <TableCell sx={{ 

                                    display: 'flex',

                                    alignItems: 'center',

                                    gap: 1

                                }}>

                                    <AssignmentIcon sx={{ fontSize: 20, color: 'inherit' }} />

                                    Título

                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Schedule sx={{ fontSize: 20 }} />

                                        Estado

                                    </Box>

                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <CalendarToday sx={{ fontSize: 20 }} />

                                        Fecha de Entrega

                                    </Box>

                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <CalendarToday sx={{ fontSize: 20 }} />

                                        Fecha de Cierre

                                    </Box>

                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Person sx={{ fontSize: 20 }} />

                                        Creado por

                                    </Box>

                                </TableCell>

                                <TableCell sx={{ fontWeight: 'bold' }}>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

                                        <Visibility sx={{ fontSize: 20 }} />

                                        Detalles

                                    </Box>

                                </TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody sx={{

                            '& tr:nth-of-type(odd)': {

                                backgroundColor: theme.palette.action.hover

                            }

                        }}>

                            {assignments.map((assignment) => {

                                const isOverdue = assignment.status === 'pending' && new Date(assignment.dueDate) < new Date();

                                const status = isOverdue ? 'vencido' : assignment.status;

                                

                                return (

                                    <TableRow 

                                        key={assignment._id}

                                        hover

                                        sx={{

                                            '&:last-child td, &:last-child th': { border: 0 },

                                            borderLeft: `4px solid ${theme.palette[getStatusColor(assignment)].main}`

                                        }}

                                    >

                                        <TableCell>

                                            <Typography 

                                                variant="subtitle1" 

                                                sx={{ 

                                                    fontWeight: 'medium',

                                                    color: theme.palette[getStatusColor(assignment)].main,

                                                    '&:hover': {

                                                        color: theme.palette[getStatusColor(assignment)].dark,

                                                    }

                                                }}

                                            >

                                                {assignment.title}

                                            </Typography>

                                            <Typography 

                                                variant="body2" 

                                                color="text.secondary" 

                                                sx={{ 

                                                    display: '-webkit-box',

                                                    WebkitLineClamp: 2,

                                                    WebkitBoxOrient: 'vertical',

                                                    overflow: 'hidden',

                                                    maxWidth: '400px'

                                                }}

                                            >

                                                {assignment.description && assignment.description.startsWith('https://') ? (

                                                    <Link

                                                        href={assignment.description}

                                                        target="_blank"

                                                        rel="noopener noreferrer"

                                                        sx={{

                                                            color: 'primary.main',

                                                            textDecoration: 'none',

                                                            '&:hover': {

                                                                textDecoration: 'underline',

                                                                color: 'primary.dark'

                                                            },

                                                            maxWidth: '100%',

                                                            display: 'inline-block',

                                                            overflow: 'hidden',

                                                            textOverflow: 'ellipsis',

                                                            whiteSpace: 'nowrap'

                                                        }}

                                                    >

                                                        {assignment.description.length > 50 

                                                            ? `${assignment.description.substring(0, 50)}...` 

                                                            : assignment.description}

                                                    </Link>

                                                ) : (

                                                    assignment.description

                                                )}

                                            </Typography>

                                        </TableCell>

                                        <TableCell>

                                            <Chip

                                                label={getStatusLabel(assignment)}

                                                color={getStatusColor(assignment)}

                                                size="small"

                                                sx={{ fontWeight: 'bold' }}

                                            />

                                        </TableCell>

                                        <TableCell>

                                            <Box>

                                                <Typography variant="body2">

                                                    {formatDateWithTime(assignment.dueDate)}

                                                </Typography>

                                                {assignment.status === 'pending' && (

                                                    <Typography variant="caption" color={isOverdue ? 'error' : 'warning.main'}>

                                                        {formatTimeRemaining(assignment.dueDate, assignment.closeDate)}

                                                    </Typography>

                                                )}

                                            </Box>

                                        </TableCell>

                                        <TableCell>

                                            {formatDateWithTime(assignment.closeDate)}

                                        </TableCell>

                                        <TableCell>

                                            {assignment.createdBy?.nombre} {assignment.createdBy?.apellidoPaterno} {assignment.createdBy?.apellidoMaterno}

                                        </TableCell>

                                        <TableCell>

                                            <Box sx={{ display: 'flex', gap: 1 }}>

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

                                            </Box>

                                        </TableCell>

                                    </TableRow>

                                );

                            })}

                        </TableBody>

                    </Table>

                </Paper>

            )}



            {/* Pagination with animation */}

            {totalPages > 1 && (

                <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: 0.3 }}

                >

                    <Box display="flex" justifyContent="center" mt={4} mb={2}>

                        <AnimatedButton

                            disabled={page === 1}

                            onClick={() => setPage(page - 1)}

                            variant="outlined"

                            sx={{ mr: 2 }}

                            whileHover={{ 

                                backgroundColor: theme.palette.primary.light,

                                color: theme.palette.primary.contrastText

                            }}

                        >

                            Anterior

                        </AnimatedButton>

                        <Box sx={{ 

                            display: 'flex', 

                            alignItems: 'center',

                            mx: 2 

                        }}>

                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (

                                <motion.div

                                    key={pageNum}

                                    whileHover={{ scale: 1.1 }}

                                    whileTap={{ scale: 0.9 }}

                                >

                                    <Button

                                        onClick={() => setPage(pageNum)}

                                        variant={pageNum === page ? "contained" : "text"}

                                        sx={{ 

                                            minWidth: 36,

                                            height: 36,

                                            borderRadius: '50%',

                                            mx: 0.5,

                                            ...(pageNum === page && {

                                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,

                                                color: 'white'

                                            })

                                        }}

                                    >

                                        {pageNum}

                                    </Button>

                                </motion.div>

                            ))}

                        </Box>

                        <AnimatedButton

                            disabled={page === totalPages}

                            onClick={() => setPage(page + 1)}

                            variant="outlined"

                            sx={{ ml: 2 }}

                            whileHover={{ 

                                backgroundColor: theme.palette.primary.light,

                                color: theme.palette.primary.contrastText

                            }}

                        >

                            Siguiente

                        </AnimatedButton>

                    </Box>

                </motion.div>

            )}



            {/* Assignment detail dialog with improved design */}

            <Dialog

                open={showDetailDialog}

                onClose={() => setShowDetailDialog(false)}

                maxWidth="lg"

                fullWidth

                TransitionComponent={Slide}

                transitionDuration={400}

                PaperProps={{

                    sx: {

                        borderRadius: 4,

                        overflow: 'hidden',

                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

                        background: 'transparent',

                        maxHeight: '90vh'

                    }

                }}

            >

                {selectedAssignment && (

                    <motion.div

                        initial={{ opacity: 0, scale: 0.9 }}

                        animate={{ opacity: 1, scale: 1 }}

                        exit={{ opacity: 0, scale: 0.9 }}

                        transition={{ duration: 0.4, ease: "easeOut" }}

                        style={{ 

                            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,

                            borderRadius: 16

                        }}

                    >

                        {/* Header with blue background */}

                        <DialogTitle sx={{ 

                            py: 3,

                            px: 4,

                            background: theme.palette.primary.main,

                            color: 'white',

                            position: 'relative',

                            overflow: 'hidden'

                        }}>

                            {/* Decorative circles */}

                            <Box sx={{

                                position: 'absolute',

                                top: -50,

                                right: -50,

                                width: 120,

                                height: 120,

                                borderRadius: '50%',

                                background: 'rgba(255,255,255,0.1)',

                                backdropFilter: 'blur(10px)'

                            }} />

                            <Box sx={{

                                position: 'absolute',

                                bottom: -30,

                                left: -30,

                                width: 80,

                                height: 80,

                                borderRadius: '50%',

                                background: 'rgba(255,255,255,0.05)',

                                backdropFilter: 'blur(5px)'

                            }} />

                            

                            <Box sx={{ 

                                display: 'flex',

                                justifyContent: 'space-between',

                                alignItems: 'flex-start',

                                position: 'relative',

                                zIndex: 1

                            }}>

                                <Box sx={{ flex: 1, mr: 2 }}>

                                    <Typography variant="subtitle1" sx={{ 

                                        fontWeight: 'medium',

                                        mb: 0.5,

                                        opacity: 0.9,

                                        fontSize: '0.875rem',

                                        textTransform: 'uppercase',

                                        letterSpacing: 1

                                    }}>

                                        Título de la Asignación

                                    </Typography>

                                    <Typography variant="h4" sx={{ 

                                        fontWeight: 'bold',

                                        mb: 2,

                                        textShadow: '0 2px 4px rgba(0,0,0,0.3)'

                                    }}>

                                        {selectedAssignment.title}

                                    </Typography>

                                    <motion.div

                                        initial={{ scale: 0 }}

                                        animate={{ scale: 1 }}

                                        transition={{ delay: 0.2 }}

                                    >

                                        <Chip

                                            icon={

                                                getStatusColor(selectedAssignment) === 'success' ? <CheckCircle /> :

                                                getStatusColor(selectedAssignment) === 'error' ? <Warning /> :

                                                <Schedule />

                                            }

                                            label={getStatusLabel(selectedAssignment)}

                                            color={getStatusColor(selectedAssignment)}

                                            sx={{ 

                                                fontWeight: 'bold',

                                                fontSize: '0.875rem',

                                                height: 32,

                                                background: 'rgba(255,255,255,0.2)',

                                                backdropFilter: 'blur(10px)',

                                                border: '1px solid rgba(255,255,255,0.3)',

                                                color: 'white',

                                                '& .MuiChip-icon': {

                                                    color: 'white'

                                                }

                                            }}

                                        />

                                    </motion.div>

                                </Box>

                                

                                <IconButton 

                                    onClick={() => setShowDetailDialog(false)}

                                    sx={{ 

                                        color: 'white',

                                        background: 'rgba(255,255,255,0.2)',

                                        backdropFilter: 'blur(10px)',

                                        border: '2px solid rgba(255,255,255,0.3)',

                                        width: 40,

                                        height: 40,

                                        '&:hover': {

                                            background: 'rgba(255,255,255,0.35)',

                                            border: '2px solid rgba(255,255,255,0.5)',

                                            transform: 'scale(1.05)',

                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'

                                        },

                                        transition: 'all 0.2s ease',

                                        '& .MuiSvgIcon-root': {

                                            fontSize: '1.5rem',

                                            fontWeight: 'bold'

                                        }

                                    }}

                                >

                                    <Close />

                                </IconButton>

                            </Box>

                        </DialogTitle>



                        <DialogContent sx={{ p: 0, maxHeight: 'calc(90vh - 200px)', overflowY: 'auto' }}>

                            <Box sx={{ p: 4 }}>

                                {/* Description Section */}

                                <motion.div

                                    initial={{ opacity: 0, y: 20 }}

                                    animate={{ opacity: 1, y: 0 }}

                                    transition={{ delay: 0.1 }}

                                >

                                    <Paper sx={{ 

                                        p: 3, 

                                        mb: 3,

                                        borderRadius: 3,

                                        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,

                                        border: `1px solid ${theme.palette.divider}`,

                                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'

                                    }}>

                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>

                                            <AssignmentIcon sx={{ 

                                                mr: 2, 

                                                color: 'primary.main',

                                                fontSize: 28

                                            }} />

                                            <Typography variant="h6" sx={{ 

                                                fontWeight: 'bold',

                                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,

                                                WebkitBackgroundClip: 'text',

                                                WebkitTextFillColor: 'transparent'

                                            }}>

                                                Descripción de la Asignación

                                            </Typography>

                                        </Box>

                                        {/* Función para convertir URLs en enlaces */}

                                        {(() => {

                                            const urlRegex = /(https?:\/\/[^\s]+)/g;

                                            const description = selectedAssignment.description || 'Sin descripción disponible.';

                                            const parts = description.split(urlRegex);

                                            

                                            return (

                                                <Typography variant="body1" sx={{ 

                                                    whiteSpace: 'pre-line',

                                                    lineHeight: 1.8,

                                                    color: 'text.primary',

                                                    fontSize: '1rem'

                                                }}>

                                                    {parts.map((part, i) => {

                                                        if (part.match(urlRegex)) {

                                                            return (

                                                                <Link

                                                                    key={i}

                                                                    href={part}

                                                                    target="_blank"

                                                                    rel="noopener noreferrer"

                                                                    sx={{

                                                                        color: 'primary.main',

                                                                        textDecoration: 'none',

                                                                        '&:hover': {

                                                                            textDecoration: 'underline',

                                                                            color: 'primary.dark'

                                                                        },

                                                                        fontWeight: 'medium'

                                                                    }}

                                                                >

                                                                    {part}

                                                                </Link>

                                                            );

                                                        }

                                                        return part;

                                                    })}

                                                </Typography>

                                            );

                                        })()}

                                    </Paper>

                                </motion.div>



                                {/* Information Cards Grid */}

                                <Grid container spacing={3} sx={{ mb: 3 }}>

                                    {/* Dates Card */}

                                    <Grid item xs={12} md={6}>

                                        <motion.div

                                            initial={{ opacity: 0, x: -20 }}

                                            animate={{ opacity: 1, x: 0 }}

                                            transition={{ delay: 0.2 }}

                                        >

                                            <Paper sx={{ 

                                                p: 3,

                                                height: '100%',

                                                borderRadius: 3,

                                                background: `linear-gradient(135deg, ${theme.palette.info.light}15 0%, ${theme.palette.info.main}08 100%)`,

                                                border: `1px solid ${theme.palette.info.light}30`,

                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'

                                            }}>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>

                                                    <CalendarToday sx={{ 

                                                        mr: 2, 

                                                        color: 'info.main',

                                                        fontSize: 28

                                                    }} />

                                                    <Typography variant="h6" sx={{ 

                                                        fontWeight: 'bold',

                                                        color: 'info.main'

                                                    }}>

                                                        Fechas Importantes

                                                    </Typography>

                                                </Box>

                                                

                                                {/* Due Date */}

                                                <Box sx={{ 

                                                    mb: 3,

                                                    p: 2,

                                                    borderRadius: 2,

                                                    background: 'rgba(255,255,255,0.7)',

                                                    backdropFilter: 'blur(10px)',

                                                    border: '1px solid rgba(255,255,255,0.2)'

                                                }}>

                                                    <Typography variant="caption" sx={{ 

                                                        fontWeight: 'bold',

                                                        textTransform: 'uppercase',

                                                        letterSpacing: 1,

                                                        color: 'text.secondary'

                                                    }}>

                                                        📅 Fecha de Entrega

                                                    </Typography>

                                                    <Typography variant="h6" sx={{ 

                                                        fontWeight: 'bold',

                                                        color: 'text.primary',

                                                        mt: 0.5

                                                    }}>

                                                        {formatDateWithTime(selectedAssignment.dueDate)}

                                                    </Typography>

                                                    {selectedAssignment.status === 'pending' && (

                                                        <Typography variant="caption" sx={{ 

                                                            color: new Date(selectedAssignment.dueDate) < new Date() ? 'error.main' : 'warning.main',

                                                            fontWeight: 'medium'

                                                        }}>

                                                            {formatTimeRemaining(selectedAssignment.dueDate, selectedAssignment.closeDate)}

                                                        </Typography>

                                                    )}

                                                </Box>



                                                {/* Close Date */}

                                                <Box sx={{ 

                                                    p: 2,

                                                    borderRadius: 2,

                                                    background: 'rgba(255,255,255,0.7)',

                                                    backdropFilter: 'blur(10px)',

                                                    border: '1px solid rgba(255,255,255,0.2)'

                                                }}>

                                                    <Typography variant="caption" sx={{ 

                                                        fontWeight: 'bold',

                                                        textTransform: 'uppercase',

                                                        letterSpacing: 1,

                                                        color: 'text.secondary'

                                                    }}>

                                                        🚫 Fecha de Cierre

                                                    </Typography>

                                                    <Typography variant="h6" sx={{ 

                                                        fontWeight: 'bold',

                                                        color: 'error.main',

                                                        mt: 0.5

                                                    }}>

                                                        {formatDateWithTime(selectedAssignment.closeDate)}

                                                    </Typography>

                                                </Box>

                                            </Paper>

                                        </motion.div>

                                    </Grid>

                                    

                                    {/* Creator Info Card */}

                                    <Grid item xs={12} md={6}>

                                        <motion.div

                                            initial={{ opacity: 0, x: 20 }}

                                            animate={{ opacity: 1, x: 0 }}

                                            transition={{ delay: 0.3 }}

                                        >

                                            <Paper sx={{ 

                                                p: 3,

                                                height: '100%',

                                                borderRadius: 3,

                                                background: `linear-gradient(135deg, ${theme.palette.success.light}15 0%, ${theme.palette.success.main}08 100%)`,

                                                border: `1px solid ${theme.palette.success.light}30`,

                                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'

                                            }}>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>

                                                    <Person sx={{ 

                                                        mr: 2, 

                                                        color: 'success.main',

                                                        fontSize: 28

                                                    }} />

                                                    <Typography variant="h6" sx={{ 

                                                        fontWeight: 'bold',

                                                        color: 'success.main'

                                                    }}>

                                                        Información del Creador

                                                    </Typography>

                                                </Box>

                                                

                                                <Box sx={{ 

                                                    p: 2,

                                                    borderRadius: 2,

                                                    background: 'rgba(255,255,255,0.7)',

                                                    backdropFilter: 'blur(10px)',

                                                    border: '1px solid rgba(255,255,255,0.2)',

                                                    mb: 2

                                                }}>

                                                    <Typography variant="caption" sx={{ 

                                                        fontWeight: 'bold',

                                                        textTransform: 'uppercase',

                                                        letterSpacing: 1,

                                                        color: 'text.secondary'

                                                    }}>

                                                        👤 Nombre Completo

                                                    </Typography>

                                                    <Typography variant="h6" sx={{ 

                                                        fontWeight: 'bold',

                                                        color: 'text.primary',

                                                        mt: 0.5

                                                    }}>

                                                        {selectedAssignment.createdBy?.nombre} {selectedAssignment.createdBy?.apellidoPaterno} {selectedAssignment.createdBy?.apellidoMaterno}

                                                    </Typography>

                                                </Box>



                                                <Box sx={{ 

                                                    p: 2,

                                                    borderRadius: 2,

                                                    background: 'rgba(255,255,255,0.7)',

                                                    backdropFilter: 'blur(10px)',

                                                    border: '1px solid rgba(255,255,255,0.2)'

                                                }}>

                                                    <Typography variant="caption" sx={{ 

                                                        fontWeight: 'bold',

                                                        textTransform: 'uppercase',

                                                        letterSpacing: 1,

                                                        color: 'text.secondary'

                                                    }}>

                                                        📅 Fecha de Creación

                                                    </Typography>

                                                    <Typography variant="body1" sx={{ 

                                                        fontWeight: 'medium',

                                                        color: 'text.primary',

                                                        mt: 0.5

                                                    }}>

                                                        {formatDate(selectedAssignment.createdAt)}

                                                    </Typography>

                                                </Box>



                                                {selectedAssignment.completedAt && (

                                                    <motion.div

                                                        initial={{ opacity: 0, scale: 0.9 }}

                                                        animate={{ opacity: 1, scale: 1 }}

                                                        transition={{ delay: 0.4 }}

                                                    >

                                                        <Box sx={{ 

                                                            mt: 2,

                                                            p: 2,

                                                            borderRadius: 2,

                                                            background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,

                                                            color: 'white',

                                                            textAlign: 'center'

                                                        }}>

                                                            <CheckCircle sx={{ mb: 1 }} />

                                                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>

                                                                ✅ Completado el

                                                            </Typography>

                                                            <Typography variant="body2">

                                                                {formatDate(selectedAssignment.completedAt)}

                                                            </Typography>

                                                        </Box>

                                                    </motion.div>

                                                )}

                                            </Paper>

                                        </motion.div>

                                    </Grid>

                                </Grid>

                                

                                {/* Attachments Section */}

                                {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (

                                    <motion.div

                                        initial={{ opacity: 0, y: 20 }}

                                        animate={{ opacity: 1, y: 0 }}

                                        transition={{ delay: 0.4 }}

                                    >

                                        <Paper sx={{ 

                                            p: 3,

                                            borderRadius: 3,

                                            background: `linear-gradient(135deg, ${theme.palette.warning.light}15 0%, ${theme.palette.warning.main}08 100%)`,

                                            border: `1px solid ${theme.palette.warning.light}30`,

                                            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'

                                        }}>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>

                                                <AssignmentIcon sx={{ 

                                                    mr: 2, 

                                                    color: 'warning.main',

                                                    fontSize: 28

                                                }} />

                                                <Typography variant="h6" sx={{ 

                                                    fontWeight: 'bold',

                                                    color: 'warning.main'

                                                }}>

                                                    📎 Archivos Adjuntos ({selectedAssignment.attachments.length})

                                                </Typography>

                                            </Box>

                                            

                                            <Grid container spacing={2}>

                                                {selectedAssignment.attachments.map((file, index) => (

                                                    <Grid item xs={12} sm={6} md={4} key={index}>

                                                        <motion.div

                                                            whileHover={{ 

                                                                scale: 1.02,

                                                                y: -5

                                                            }}

                                                            whileTap={{ scale: 0.98 }}

                                                            transition={{ duration: 0.2 }}

                                                        >

                                                            <Paper sx={{ 

                                                                p: 2,

                                                                cursor: 'pointer',

                                                                borderRadius: 2,

                                                                background: 'rgba(255,255,255,0.9)',

                                                                backdropFilter: 'blur(10px)',

                                                                border: '1px solid rgba(255,255,255,0.2)',

                                                                transition: 'all 0.3s ease',

                                                                '&:hover': {

                                                                    background: 'rgba(255,255,255,1)',

                                                                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',

                                                                    borderColor: theme.palette.primary.main

                                                                }

                                                            }}

                                                            onClick={() => handleDownloadFile(file, selectedAssignment.title)}

                                                            >

                                                                <Box sx={{ 

                                                                    display: 'flex',

                                                                    alignItems: 'center',

                                                                    mb: 1

                                                                }}>

                                                                    <Box sx={{

                                                                        width: 40,

                                                                        height: 40,

                                                                        borderRadius: 2,

                                                                        background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,

                                                                        display: 'flex',

                                                                        alignItems: 'center',

                                                                        justifyContent: 'center',

                                                                        mr: 2

                                                                    }}>

                                                                        <Download sx={{ color: 'white', fontSize: 20 }} />

                                                                    </Box>

                                                                    <Box sx={{ flex: 1, minWidth: 0 }}>

                                                                        <Typography variant="subtitle2" sx={{ 

                                                                            fontWeight: 'bold',

                                                                            color: 'text.primary',

                                                                            overflow: 'hidden',

                                                                            textOverflow: 'ellipsis',

                                                                            whiteSpace: 'nowrap'

                                                                        }}>

                                                                            {file.fileName}

                                                                        </Typography>

                                                                        <Typography variant="caption" color="text.secondary">

                                                                            📄 {file.fileType?.toUpperCase() || 'DESCONOCIDO'}

                                                                        </Typography>

                                                                    </Box>

                                                                </Box>

                                                                

                                                                <Typography variant="caption" sx={{ 

                                                                    display: 'block',

                                                                    color: 'text.secondary',

                                                                    textAlign: 'center',

                                                                    fontWeight: 'medium'

                                                                }}>

                                                                    💾 {file.fileSize ? `${Math.round(file.fileSize / 1024)} KB` : 'Tamaño desconocido'}

                                                                </Typography>

                                                            </Paper>

                                                        </motion.div>

                                                    </Grid>

                                                ))}

                                            </Grid>

                                        </Paper>

                                    </motion.div>

                                )}

                            </Box>

                        </DialogContent>

                        

                        {/* Footer with actions */}

                        <DialogActions sx={{ 

                            p: 3,

                            borderTop: `1px solid ${theme.palette.divider}`,

                            background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.background.paper} 100%)`,

                            justifyContent: 'space-between'

                        }}>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>

                                <Typography variant="caption" color="text.secondary">

                                    💾 Haz clic en los archivos para descargarlos

                                </Typography>

                            </Box>

                            

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>

                            </motion.div>

                        </DialogActions>

                    </motion.div>

                )}

            </Dialog>



        </Box>

    );

};



export default TeacherAssignments;