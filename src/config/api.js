// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-cloud-flame.vercel.app';

// URLs específicas para diferentes entornos
const API_URLS = {
  development: 'http://localhost:3001',
  production: 'https://backend-cloud-flame.vercel.app'
};

// Determinar el entorno actual
const isDevelopment = import.meta.env.DEV;
const currentAPIUrl = isDevelopment ? API_URLS.development : API_URLS.production;

// Configuración de axios
import axios from 'axios';

const apiClient = axios.create({
  baseURL: currentAPIUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token de autorización
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const API_CONFIG = {
  BASE_URL: currentAPIUrl,
  AUTH_URL: `${currentAPIUrl}/api/auth`,
  USERS_URL: `${currentAPIUrl}/api/users`,
  ASSIGNMENTS_URL: `${currentAPIUrl}/api/assignments`,
  DAILY_RECORDS_URL: `${currentAPIUrl}/api/daily-records`,
  CARRERAS_URL: `${currentAPIUrl}/api/carreras`,
  SEMESTRES_URL: `${currentAPIUrl}/api/semestres`,
  STATS_URL: `${currentAPIUrl}/api/stats`,
  FILES_URL: `${currentAPIUrl}/api/files`,
  HOURS_URL: `${currentAPIUrl}/api/hours`
};

export default apiClient;


