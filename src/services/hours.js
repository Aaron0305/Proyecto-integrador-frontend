import apiClient, { API_CONFIG } from '../config/api.js';

const API_URL = API_CONFIG.HOURS_URL;

export const getSummary = async (userId) => {
  try {
    if (!userId) {
      throw new Error('Usuario no proporcionado');
    }

    const response = await apiClient.get(`/api/hours/summary/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el resumen:', error);
    // Devolver datos por defecto si hay error
    return {
      totalHours: 0,
      totalDays: 0,
      averageHoursPerDay: 0
    };
  }
};

export const createHourRecord = async (data) => {
  try {
    const response = await apiClient.post('/api/hours/record', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al registrar horas');
  }
};
