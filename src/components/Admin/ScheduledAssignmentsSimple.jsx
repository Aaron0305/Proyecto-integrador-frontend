import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Box,
    IconButton,
    Button,
    Stack,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Autocomplete,
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress
} from '@mui/material';
import { 
    Close as CloseIcon, 
    Schedule,
    Add as AddIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const ScheduledAssignmentsSimple = ({ open, onClose }) => {
    // Estados principales
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAssignment, setEditingAssignment] = useState(null);

    // Estados del formulario
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        publishDate: null,
        dueDate: null,
        closeDate: null,
        isGeneral: false,
        assignedTo: [],
        status: 'scheduled'
    });

    // Lista de docentes simulada
    const mockTeachers = [
        { id: '1', name: 'Juan Pérez García', email: 'juan.perez@tesjo.edu.mx' },
        { id: '2', name: 'María López Martínez', email: 'maria.lopez@tesjo.edu.mx' },
        { id: '3', name: 'Carlos Rodríguez Sánchez', email: 'carlos.rodriguez@tesjo.edu.mx' },
        { id: '4', name: 'Ana Sofía Mendoza', email: 'ana.mendoza@tesjo.edu.mx' },
        { id: '5', name: 'Roberto García Díaz', email: 'roberto.garcia@tesjo.edu.mx' }
    ];

    // Cargar asignaciones programadas
    useEffect(() => {
        if (open) {
            loadAssignments();
        }
    }, [open]);

    const loadAssignments = async () => {
        setLoading(true);
        try {
            // Simular datos de asignaciones programadas
            const mockAssignments = [
                {
                    id: '1',
                    title: 'Planeación Didáctica Semestre Agosto-Diciembre 2025',
                    description: 'Entrega de planeación didáctica para el próximo semestre académico',
                    publishDate: new Date('2025-08-01T10:00:00'),
                    dueDate: new Date('2025-08-15T23:59:00'),
                    closeDate: new Date('2025-08-20T23:59:00'),
                    status: 'scheduled',
                    isGeneral: true,
                    assignedTo: mockTeachers.slice(0, 3),
                    createdAt: new Date('2025-08-01T10:00:00'),
                    completedBy: []
                },
                {
                    id: '2',
                    title: 'Reporte de Actividades Mensuales',
                    description: 'Entrega del reporte mensual de actividades docentes',
                    publishDate: new Date('2025-08-02T14:30:00'),
                    dueDate: new Date('2025-08-30T18:00:00'),
                    closeDate: new Date('2025-09-05T18:00:00'),
                    status: 'scheduled',
                    isGeneral: false,
                    assignedTo: [mockTeachers[0], mockTeachers[2]],
                    createdAt: new Date('2025-08-02T14:30:00'),
                    completedBy: []
                }
            ];
            
            setTimeout(() => {
                setAssignments(mockAssignments);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Error loading assignments:', error);
            setLoading(false);
        }
    };

    const handleNewAssignment = () => {
        setFormData({
            title: '',
            description: '',
            publishDate: null,
            dueDate: null,
            closeDate: null,
            isGeneral: false,
            assignedTo: [],
            status: 'scheduled'
        });
        setEditingAssignment(null);
        setShowForm(true);
    };

    const handleSaveAssignment = () => {
        if (!formData.title || !formData.description || !formData.publishDate) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        const newAssignment = {
            id: editingAssignment ? editingAssignment.id : Date.now().toString(),
            ...formData,
            status: 'scheduled',
            createdAt: editingAssignment ? editingAssignment.createdAt : new Date(),
            completedBy: editingAssignment ? editingAssignment.completedBy : []
        };

        if (editingAssignment) {
            setAssignments(prev => prev.map(a => a.id === editingAssignment.id ? newAssignment : a));
        } else {
            setAssignments(prev => [...prev, newAssignment]);
        }

        setShowForm(false);
        setEditingAssignment(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'info';
            case 'active': return 'success';
            case 'completed': return 'primary';
            case 'expired': return 'error';
            default: return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'scheduled': return 'Programada';
            case 'active': return 'Activa';
            case 'completed': return 'Completada';
            case 'expired': return 'Expirada';
            default: return status || 'Sin estado';
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ 
                    background: `linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #9c27b0 100%)`,
                    color: 'white',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule />
                        <Typography variant="h6">Nueva Asignación Programada</Typography>
                    </Box>
                    <IconButton 
                        onClick={onClose}
                        sx={{ color: 'white' }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                
                <DialogContent sx={{ p: 3 }}>
                    {!showForm ? (
                        <Box>
                            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Lista de Asignaciones</Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleNewAssignment}
                                    sx={{
                                        background: `linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)`,
                                        '&:hover': {
                                            background: `linear-gradient(135deg, #9c27b0 0%, #1976d2 100%)`,
                                        }
                                    }}
                                >
                                    Nueva Asignación
                                </Button>
                            </Box>

                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ 
                                                background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
                                            }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Título</strong></TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Estado</strong></TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Fecha de Publicación</strong></TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Fecha de Entrega</strong></TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Docentes</strong></TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}><strong>Acciones</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {assignments.map((assignment) => (
                                                <TableRow key={assignment.id} hover>
                                                    <TableCell>
                                                        <Box>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
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
                                                                    maxWidth: '300px'
                                                                }}
                                                            >
                                                                {assignment.description || 'Sin descripción disponible'}
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={getStatusLabel(assignment.status)} 
                                                            size="small"
                                                            color={getStatusColor(assignment.status)}
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {assignment.publishDate ? formatDate(assignment.publishDate) : 'Sin fecha'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">
                                                            {assignment.dueDate ? formatDate(assignment.dueDate) : 'Sin fecha'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                            {assignment.assignedTo ? assignment.assignedTo.length : 0} docentes
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <IconButton size="small" color="primary">
                                                            <ViewIcon />
                                                        </IconButton>
                                                        <IconButton size="small" color="secondary">
                                                            <EditIcon />
                                                        </IconButton>
                                                        <IconButton size="small" color="error">
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Box>
                    ) : (
                        <Box>
                            <Typography variant="h6" sx={{ mb: 3 }}>
                                {editingAssignment ? 'Editar Asignación' : 'Nueva Asignación Programada'}
                            </Typography>
                            
                            <Stack spacing={3}>
                                <TextField
                                    label="Título de la Asignación"
                                    fullWidth
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                                
                                <TextField
                                    label="Descripción"
                                    fullWidth
                                    required
                                    multiline
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                                
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <DateTimePicker
                                        label="Fecha de Publicación"
                                        value={formData.publishDate}
                                        onChange={(newValue) => setFormData({...formData, publishDate: newValue})}
                                        slotProps={{ textField: { fullWidth: true, required: true } }}
                                    />
                                    
                                    <DateTimePicker
                                        label="Fecha de Entrega"
                                        value={formData.dueDate}
                                        onChange={(newValue) => setFormData({...formData, dueDate: newValue})}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Box>
                                
                                <DateTimePicker
                                    label="Fecha de Cierre"
                                    value={formData.closeDate}
                                    onChange={(newValue) => setFormData({...formData, closeDate: newValue})}
                                    slotProps={{ textField: { fullWidth: true } }}
                                />
                                
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.isGeneral}
                                            onChange={(e) => setFormData({...formData, isGeneral: e.target.checked})}
                                        />
                                    }
                                    label="Asignación General (Todos los docentes)"
                                />
                                
                                {!formData.isGeneral && (
                                    <Autocomplete
                                        multiple
                                        options={mockTeachers}
                                        getOptionLabel={(option) => option.name}
                                        value={formData.assignedTo}
                                        onChange={(event, newValue) => {
                                            setFormData({...formData, assignedTo: newValue});
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Seleccionar Docentes"
                                                placeholder="Buscar docentes..."
                                            />
                                        )}
                                    />
                                )}
                                
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveAssignment}
                                        sx={{
                                            background: `linear-gradient(135deg, #4caf50 0%, #388e3c 100%)`,
                                            '&:hover': {
                                                background: `linear-gradient(135deg, #388e3c 0%, #4caf50 100%)`,
                                                transform: 'translateY(-1px)',
                                                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                            }
                                        }}
                                    >
                                        {editingAssignment ? 'Actualizar' : 'Crear'} Asignación
                                    </Button>
                                </Box>
                            </Stack>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </LocalizationProvider>
    );
};

export default ScheduledAssignmentsSimple;
