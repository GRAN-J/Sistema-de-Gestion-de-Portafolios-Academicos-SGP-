/**
 * @file api.js
 * @description Configuración centralizada de Axios.
 */

import axios from 'axios';

/**
 * Instancia de Axios con configuración base.
 * @const {import('axios').AxiosInstance}
 */
const api = axios.create({
  baseURL: '/api',
  // Eliminamos 'Content-Type': 'application/json' por defecto aquí
  // para permitir que el navegador establezca multipart/form-data automáticamente cuando se envíe FormData.
});

/**
 * Interceptor de Request.
 */
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    // Si la data es FormData, dejar que el navegador ponga el Content-Type (con boundary)
    // Si no, forzar application/json si no está definido
    if (!(config.data instanceof FormData) && !config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
