/**
 * @file ProtectedRoute.jsx
 * @description Componente de orden superior para proteger rutas en React Router.
 * Redirige al login si el usuario no está autenticado.
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Componente de Ruta Protegida.
 * Verifica el estado de autenticación antes de renderizar el contenido de la ruta.
 * 
 * @component
 * @returns {React.ReactNode} Outlet si está autenticado, o Navigate al login si no.
 */
const ProtectedRoute = () => {
  const { user, loading } = useContext(AuthContext);

  // Mostrar indicador de carga mientras se verifica la sesión
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Cargando sesión...</div>;
  }

  // Si hay usuario, renderizar rutas hijas (Outlet). Si no, redirigir a Login.
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
