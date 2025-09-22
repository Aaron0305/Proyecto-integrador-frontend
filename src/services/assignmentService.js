import apiClient, { API_CONFIG } from '../config/api.js';

const API_URL = API_CONFIG.ASSIGNMENTS_URL;

// Configurar token de autorización
const getAuthHeaders = () => {
    return {
        headers: {
            'Content-Type': 'application/json'
        }
    };
};

// Funciones para el admin
export const getAdminAllAssignments = async (params = {}) => {
    try {
        const queryParams = new URLSearchParams();
        
        // Agregar parámetros de filtrado y paginación
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
                queryParams.append(key, params[key]);
            }
        });
        
        const queryString = queryParams.toString();
        const url = queryString ? `${API_URL}/admin/all?${queryString}` : `${API_URL}/admin/all`;
        
        console.log('🔍 Making API request to:', url);
        console.log('📋 Query params:', params);
        
        const response = await apiClient.get(url.replace(API_URL, '/api/assignments'), getAuthHeaders());
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las asignaciones' };
    }
};

export const getAdminAssignmentStats = async () => {
    try {
        const response = await apiClient.get('/api/assignments/admin/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las estadísticas' };
    }
};

export const markAssignmentCompletedByAdmin = async (assignmentId) => {
    try {
        const response = await apiClient.patch(`/api/assignments/admin/${assignmentId}/complete`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al marcar como completada' };
    }
};

export const updateAssignmentByAdmin = async (assignmentId, assignmentData) => {
    try {
        const response = await apiClient.put(`/api/assignments/admin/${assignmentId}`, assignmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar la asignación' };
    }
};

// Nuevas funciones para gestión de estados de docentes
export const getTeachersStatusForAssignment = async (assignmentId) => {
    try {
        const response = await apiClient.get(`/api/assignments/${assignmentId}/teachers-status`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener los estados de los docentes' };
    }
};

export const updateTeacherStatusInAssignment = async (assignmentId, teacherId, status) => {
    try {
        const response = await apiClient.patch(`/api/assignments/${assignmentId}/teacher-status`, { teacherId, status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el estado del docente' };
    }
};

// Funciones para usuarios generales
export const getAllAssignments = async () => {
    try {
        const response = await apiClient.get('/api/assignments/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las asignaciones' };
    }
};

export const getUserAssignments = async () => {
    try {
        const response = await apiClient.get('/api/assignments/my-assignments');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener mis asignaciones' };
    }
};

export const updateAssignmentStatus = async (assignmentId, status) => {
    try {
        const response = await apiClient.patch(`/api/assignments/${assignmentId}/status`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al actualizar el estado' };
    }
};

export const getAssignmentById = async (assignmentId) => {
    try {
        const response = await apiClient.get(`/api/assignments/${assignmentId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener la asignación' };
    }
};

export const getUserDashboardStats = async () => {
    try {
        const response = await apiClient.get('/api/assignments/dashboard-stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las estadísticas del dashboard' };
    }
};

export const getFilteredAssignments = async (filters) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await apiClient.get(`/api/assignments/filtered?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las asignaciones filtradas' };
    }
};

// Funciones para docentes
export const getTeacherAssignmentStats = async () => {
    try {
        const response = await apiClient.get('/api/assignments/teacher/stats');
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las estadísticas del docente' };
    }
};

export const getTeacherFilteredAssignments = async (filters) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await apiClient.get(`/api/assignments/teacher/assignments?${queryParams}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al obtener las asignaciones del docente' };
    }
};

// Alias para compatibilidad
export const getTeacherAssignments = getTeacherFilteredAssignments;

// Función para obtener estadísticas de todos los docentes
export const getAllTeachersStats = async () => {
    // Por ahora devolvemos un objeto vacío ya que esta ruta no existe en el backend
    // TODO: Implementar la ruta /admin/teachers-stats en el backend si es necesaria
    return { teachers: [], totalTeachers: 0 };
};

export const markAssignmentCompleted = async (assignmentId) => {
    try {
        const response = await apiClient.patch(`/api/assignments/teacher/${assignmentId}/complete`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al marcar como completada' };
    }
};

// Función para crear asignaciones
export const createAssignment = async (assignmentData) => {
    try {
        const response = await apiClient.post('/api/assignments', assignmentData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: 'Error al crear la asignación' };
    }
};

export default {
    getAdminAllAssignments,
    getAdminAssignmentStats,
    markAssignmentCompletedByAdmin,
    updateAssignmentByAdmin,
    getTeachersStatusForAssignment,
    updateTeacherStatusInAssignment,
    getAllAssignments,
    getUserAssignments,
    updateAssignmentStatus,
    getAssignmentById,
    getUserDashboardStats,
    getFilteredAssignments,
    getTeacherAssignmentStats,
    getTeacherFilteredAssignments,
    getTeacherAssignments,
    getAllTeachersStats,
    markAssignmentCompleted,
    createAssignment
};
