import axios from 'axios';

// Interceptor para debuggear todas las peticiones
const setupAxiosInterceptors = () => {
    // Interceptor para peticiones salientes
    axios.interceptors.request.use(
        (config) => {
            console.group('🚀 PETICIÓN SALIENTE');
            console.log('📍 URL:', config.url);
            console.log('🔧 Método:', config.method?.toUpperCase());
            console.log('📋 Headers:', config.headers);
            console.log('📦 Data:', config.data);
            console.groupEnd();
            return config;
        },
        (error) => {
            console.error('❌ Error en petición saliente:', error);
            return Promise.reject(error);
        }
    );

    // Interceptor para respuestas entrantes
    axios.interceptors.response.use(
        (response) => {
            console.group('✅ RESPUESTA ENTRANTE');
            console.log('📍 URL:', response.config.url);
            console.log('🔢 Status:', response.status);
            console.log('📋 Headers:', response.headers);
            console.log('📦 Data:', response.data);
            console.groupEnd();
            return response;
        },
        (error) => {
            console.group('❌ ERROR EN RESPUESTA');
            console.log('📍 URL:', error.config?.url);
            console.log('🔢 Status:', error.response?.status);
            console.log('📋 Response Headers:', error.response?.headers);
            console.log('📦 Response Data:', error.response?.data);
            console.log('🔍 Request Headers enviados:', error.config?.headers);
            console.groupEnd();
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;
