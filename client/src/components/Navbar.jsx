import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [dbStatus, setDbStatus] = useState(false);

  useEffect(() => {
    // Verificar estado de la DB cada 30 segundos
    const checkDb = async () => {
      try {
        const { data } = await api.get('/health');
        setDbStatus(data.status === 'ok');
      } catch (error) {
        setDbStatus(false);
      }
    };
    checkDb();
    const interval = setInterval(checkDb, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '15px 40px', 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" style={{ 
          color: 'var(--color-accent)', 
          textDecoration: 'none', 
          fontWeight: '800', 
          fontSize: '1.4rem',
          letterSpacing: '-0.5px',
          textTransform: 'uppercase'
        }}>
          ACADEMIA
        </Link>
        
        {/* Indicador de Estado DB */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          fontSize: '0.75rem', 
          textTransform: 'uppercase', 
          color: '#666',
          fontWeight: '600',
          backgroundColor: '#F5F5F5',
          padding: '4px 10px',
          borderRadius: '20px'
        }}>
          <span className={`db-status-dot ${dbStatus ? 'db-online' : 'db-offline'}`}></span>
          {dbStatus ? 'SISTEMA ONLINE' : 'SISTEMA OFFLINE'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--color-text)' }}>
              {user.nombre} <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: '400' }}>({user.rol})</span>
            </span>
            <Link to="/portfolios" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#555' }}>PORTAFOLIOS</Link>
            {user.rol === 'coordinador' && (
              <Link to="/assignments" style={{ fontSize: '0.9rem', fontWeight: '600', color: '#16A085' }}>ASIGNACIONES</Link>
            )}
            {user.rol === 'estudiante' && (
              <Link to="/portfolios/new" className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>+ NUEVO</Link>
            )}
            <button onClick={logout} className="btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>SALIR</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ fontSize: '0.9rem', fontWeight: '600' }}>INICIAR SESIÓN</Link>
            <Link to="/register" className="btn" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              REGISTRARSE
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
