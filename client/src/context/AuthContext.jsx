/**
 * @file AuthContext.jsx
 * @description Contexto de React para manejar el estado global de autenticación.
 * Provee funciones de login, registro, logout y acceso al usuario actual en toda la app.
 */

import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Contexto de Autenticación.
 * @type {React.Context}
 */
const AuthContext = createContext();

/**
 * Proveedor del Contexto de Autenticación.
 * Envuelve la aplicación para dar acceso al estado de sesión.
 * 
 * @component
 * @param {Object} props - Props del componente.
 * @param {React.ReactNode} props.children - Componentes hijos.
 */
export const AuthProvider = ({ children }) => {
  // Estado del usuario autenticado (null si no hay sesión)
  const [user, setUser] = useState(null);
  
  // Estado de carga inicial (para verificar sesión persistente)
  const [loading, setLoading] = useState(true);
  
  // Estado para mensajes de error de autenticación
  const [error, setError] = useState(null);

  /**
   * Efecto para cargar el usuario desde localStorage al iniciar la app.
   * Permite mantener la sesión activa al recargar la página.
   */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  /**
   * Función para iniciar sesión.
   * Realiza petición al backend y guarda el token en localStorage.
   * 
   * @async
   * @param {String} correo - Correo electrónico.
   * @param {String} password - Contraseña.
   * @returns {Promise<Object>} Datos del usuario autenticado.
   */
  const login = async (correo, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/login', { correo, password });
      
      // Persistir sesión
      localStorage.setItem('user', JSON.stringify(data));
      
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      // Extraer mensaje de error del backend
      const message = err.response?.data?.message || 'Error al iniciar sesión';
      setError(message);
      throw err;
    }
  };

  /**
   * Función para registrar un nuevo usuario.
   * 
   * @async
   * @param {Object} userData - Datos del usuario (nombre, correo, password, rol).
   * @returns {Promise<Object>} Datos del usuario registrado.
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.post('/auth/register', userData);
      
      // Auto-login al registrarse
      localStorage.setItem('user', JSON.stringify(data));
      
      setUser(data);
      setLoading(false);
      return data;
    } catch (err) {
      setLoading(false);
      const message = err.response?.data?.message || 'Error al registrarse';
      setError(message);
      throw err;
    }
  };

  /**
   * Función para cerrar sesión.
   * Limpia el estado y elimina el token de localStorage.
   */
  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    // Opcional: Redirigir o limpiar otros estados
  };

  // Valores expuestos por el contexto
  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
