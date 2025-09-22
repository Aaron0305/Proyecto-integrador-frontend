import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography,
    Box,
    IconButton,
    Chip,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch,
    CircularProgress,
    Divider,
    Paper,
    Autocomplete,
    RadioGroup,
    Radio,
    Card,
    CardContent
} from '@mui/material';
import {
    Close,
    Edit as EditIcon,
    Save,
    Cancel,
    Person,
    CalendarToday,
    Assignment as AssignmentIcon,
    Description,
    Schedule,
    People
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import { useTheme } from '@mui/material/styles';

const EditAssignment = ({ 
    open, 
    onClose, 
    assignment, 
    onSave, 
    teachers = []
}) => {
    const theme = useTheme();
    
    // Estados del formulario
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: null,
        closeDate: null,
        isGeneral: false,
        assignedTo: []
    });
    
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [selectedTeachers, setSelectedTeachers] = useState([]);
    
    // Estados para edición específica por docente
    const [editMode, setEditMode] = useState('all'); // 'all' | 'specific'
    const [selectedTeacherToEdit, setSelectedTeacherToEdit] = useState(null);
    
    // Inicializar formulario cuando se abre el diálogo
    useEffect(() => {
        if (open && assignment) {
            setFormData({
                title: assignment.title || '',
                description: assignment.description || '',
                dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null,
                closeDate: assignment.closeDate ? new Date(assignment.closeDate) : null,
                isGeneral: assignment.isGeneral || false,
                assignedTo: assignment.assignedTo?.map(teacher => teacher._id) || []
            });
            
            setSelectedTeachers(assignment.assignedTo || []);
            setEditMode('all');
            setSelectedTeacherToEdit(null);
            setErrors({});
        }
    }, [open, assignment]);

    // Validar formulario
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'El título es requerido';
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'La descripción es requerida';
        }
        
        if (!formData.dueDate) {
            newErrors.dueDate = 'La fecha de entrega es requerida';
        }
        
        if (!formData.closeDate) {
            newErrors.closeDate = 'La fecha de cierre es requerida';
        }
        
        if (formData.dueDate && formData.closeDate) {
            if (new Date(formData.closeDate) < new Date(formData.dueDate)) {
                newErrors.closeDate = 'La fecha de cierre debe ser posterior a la fecha de entrega';
            }
        }
        
        if (!formData.isGeneral && formData.assignedTo.length === 0) {
            newErrors.assignedTo = 'Debe seleccionar al menos un docente para asignaciones individuales';
        }

        // Validación para edición específica
        if (editMode === 'specific' && !selectedTeacherToEdit) {
            newErrors.editMode = 'Debe seleccionar un docente específico para aplicar los cambios';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Manejar cambios en el formulario
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Limpiar error del campo
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: undefined
            }));
        }
    };

    // Manejar selección de docentes
    const handleTeacherSelection = (event, newValue) => {
        setSelectedTeachers(newValue);
        setFormData(prev => ({
            ...prev,
            assignedTo: newValue.map(teacher => teacher._id)
        }));
        
        if (errors.assignedTo) {
            setErrors(prev => ({
                ...prev,
                assignedTo: undefined
            }));
        }
    };

    // Guardar cambios
    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        // Validación adicional para edición específica
        if (editMode === 'specific' && !selectedTeacherToEdit) {
            setErrors(prev => ({
                ...prev,
                editMode: 'Debe seleccionar un docente específico'
            }));
            return;
        }

        setSaving(true);
        try {
            const updateData = {
                ...formData,
                _id: assignment._id,
                editMode: editMode,
                specificTeacherId: editMode === 'specific' ? selectedTeacherToEdit?._id : null
            };
            
            await onSave(updateData);
            onClose();
        } catch (error) {
            console.error('Error saving assignment:', error);
        } finally {
            setSaving(false);
        }
    };

    // Manejar cierre del diálogo
    const handleClose = () => {
        setErrors({});
        onClose();
    };

    // Formatear fecha para mostrar
    const formatDate = (date) => {
        if (!date) return 'No especificada';
        return new Date(date).toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!assignment) return null;

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: `linear-gradient(to bottom, ${theme.palette.background.paper}, ${theme.palette.grey[50]})`,
                        minHeight: '80vh'
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
                        <EditIcon sx={{ fontSize: 28 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                            Editar Asignación
                        </Typography>
                    </Box>
                    <IconButton 
                        onClick={handleClose}
                        sx={{ color: 'white' }}
                        disabled={saving}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                    {/* Información actual */}
                    <Paper sx={{ p: 2, mb: 3, background: theme.palette.grey[50] }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                            Información Actual
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Fecha de Entrega Actual:</strong>
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(assignment.dueDate)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Fecha de Cierre Actual:</strong>
                                </Typography>
                                <Typography variant="body1">
                                    {formatDate(assignment.closeDate)}
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Docentes Asignados:</strong>
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                    {assignment.assignedTo?.length > 0 ? (
                                        assignment.assignedTo.map((teacher) => (
                                            <Chip
                                                key={teacher._id}
                                                label={`${teacher.nombre} ${teacher.apellidoPaterno} ${teacher.apellidoMaterno}`}
                                                size="small"
                                                icon={<Person />}
                                                variant="outlined"
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Asignación general (todos los docentes)
                                        </Typography>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Selección de modo de edición */}
                    <Card sx={{ mb: 3, border: `1px solid ${theme.palette.primary.main}` }}>
                        <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                                Alcance de la Edición
                            </Typography>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    value={editMode}
                                    onChange={(e) => {
                                        setEditMode(e.target.value);
                                        if (e.target.value === 'all') {
                                            setSelectedTeacherToEdit(null);
                                        }
                                    }}
                                    row
                                >
                                    <FormControlLabel
                                        value="all"
                                        control={<Radio />}
                                        label="Aplicar cambios a todos los docentes asignados"
                                    />
                                    {assignment.assignedTo && assignment.assignedTo.length > 1 && (
                                        <FormControlLabel
                                            value="specific"
                                            control={<Radio />}
                                            label="Aplicar cambios solo a un docente específico"
                                        />
                                    )}
                                </RadioGroup>
                            </FormControl>

                            {/* Selección de docente específico */}
                            {editMode === 'specific' && assignment.assignedTo && assignment.assignedTo.length > 1 && (
                                <Box sx={{ mt: 2 }}>
                                    <FormControl fullWidth>
                                        <InputLabel>Seleccionar Docente</InputLabel>
                                        <Select
                                            value={selectedTeacherToEdit?._id || ''}
                                            onChange={(e) => {
                                                const teacher = assignment.assignedTo.find(t => t._id === e.target.value);
                                                setSelectedTeacherToEdit(teacher);
                                            }}
                                            label="Seleccionar Docente"
                                        >
                                            {assignment.assignedTo.map((teacher) => (
                                                <MenuItem key={teacher._id} value={teacher._id}>
                                                    {`${teacher.nombre} ${teacher.apellidoPaterno} ${teacher.apellidoMaterno}`}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    {selectedTeacherToEdit && (
                                        <Alert severity="info" sx={{ mt: 2 }}>
                                            Los cambios se aplicarán únicamente para: <strong>
                                                {`${selectedTeacherToEdit.nombre} ${selectedTeacherToEdit.apellidoPaterno} ${selectedTeacherToEdit.apellidoMaterno}`}
                                            </strong>
                                        </Alert>
                                    )}
                                </Box>
                            )}

                            {editMode === 'all' && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Los cambios se aplicarán a <strong>todos los docentes asignados</strong> a esta asignación.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    <Divider sx={{ my: 3 }} />

                    {/* Formulario de edición */}
                    <Typography variant="h6" sx={{ mb: 3, color: 'primary.main' }}>
                        Modificar Datos
                    </Typography>

                    <Grid container spacing={3}>
                        {/* Título */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Título de la Asignación"
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                error={!!errors.title}
                                helperText={errors.title}
                                InputProps={{
                                    startAdornment: <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                }}
                            />
                        </Grid>

                        {/* Descripción */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Descripción"
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                error={!!errors.description}
                                helperText={errors.description}
                                InputProps={{
                                    startAdornment: <Description sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                                }}
                            />
                        </Grid>

                        {/* Fechas */}
                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label="Nueva Fecha de Entrega"
                                value={formData.dueDate}
                                onChange={(newValue) => handleChange('dueDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.dueDate,
                                        helperText: errors.dueDate
                                    }
                                }}
                                format="dd/MM/yyyy HH:mm"
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <DateTimePicker
                                label="Nueva Fecha de Cierre"
                                value={formData.closeDate}
                                onChange={(newValue) => handleChange('closeDate', newValue)}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!errors.closeDate,
                                        helperText: errors.closeDate
                                    }
                                }}
                                format="dd/MM/yyyy HH:mm"
                            />
                        </Grid>

                        {/* Tipo de asignación */}
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={formData.isGeneral}
                                        onChange={(e) => handleChange('isGeneral', e.target.checked)}
                                    />
                                }
                                label="Asignación General (Todos los docentes)"
                            />
                        </Grid>

                        {/* Selección de docentes */}
                        {!formData.isGeneral && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={teachers}
                                    getOptionLabel={(option) => `${option.nombre} ${option.apellidoPaterno} ${option.apellidoMaterno}`}
                                    value={selectedTeachers}
                                    onChange={handleTeacherSelection}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Seleccionar Docentes"
                                            error={!!errors.assignedTo}
                                            helperText={errors.assignedTo || 'Busca y selecciona los docentes'}
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <>
                                                        <People sx={{ mr: 1, color: 'text.secondary' }} />
                                                        {params.InputProps.startAdornment}
                                                    </>
                                                )
                                            }}
                                        />
                                    )}
                                    renderTags={(value, getTagProps) =>
                                        value.map((option, index) => (
                                            <Chip
                                                variant="outlined"
                                                label={`${option.nombre} ${option.apellidoPaterno}`}
                                                {...getTagProps({ index })}
                                                icon={<Person />}
                                                key={option._id}
                                            />
                                        ))
                                    }
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                />
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ 
                    p: 3,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    background: theme.palette.grey[50]
                }}>
                    {/* Información de confirmación */}
                    {editMode === 'specific' && selectedTeacherToEdit && (
                        <Alert severity="info" sx={{ mr: 2, flex: 1 }}>
                            <Typography variant="body2">
                                <strong>Edición específica:</strong> Los cambios se aplicarán solo para {selectedTeacherToEdit.nombre} {selectedTeacherToEdit.apellidoPaterno}
                            </Typography>
                        </Alert>
                    )}
                    
                    {editMode === 'all' && (
                        <Alert severity="warning" sx={{ mr: 2, flex: 1 }}>
                            <Typography variant="body2">
                                <strong>Edición global:</strong> Los cambios se aplicarán a todos los docentes asignados
                            </Typography>
                        </Alert>
                    )}
                    
                    <Box>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            startIcon={<Cancel />}
                            disabled={saving}
                            sx={{ mr: 2 }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                            disabled={saving}
                            sx={{
                                background: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                '&:hover': {
                                    background: `linear-gradient(45deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                }
                            }}
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
};

export default EditAssignment;