/**
 * @file Dashboard.jsx
 * @description Panel principal minimalista estilo Swiss Design.
 */

import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // REDIRECCIÓN ESTUDIANTE: No tiene dashboard, va directo a sus portafolios
    if (user && user.rol === 'estudiante') {
        navigate('/portfolios');
        return;
    }

    if (user) {
      const fetchStats = async () => {
        try {
          const { data } = await api.get('/portfolios/stats');
          setStats(data.data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    }
  }, [user, navigate]);

  if (loading || user?.rol === 'estudiante') return <div className="fade-in" style={{ textAlign: 'center', marginTop: '100px', fontWeight: '600', color: '#888' }}>CARGANDO...</div>;

  return (
    <div className="container fade-in" style={{ marginTop: '40px' }}>
      <header style={{ marginBottom: '60px', paddingBottom: '30px', borderBottom: '1px solid var(--color-border)' }}>
        <h1 style={{ fontSize: '3.5rem', margin: 0, lineHeight: 1, letterSpacing: '-1px', color: 'var(--color-text)' }}>BIENVENIDO</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: '400', color: '#666' }}>{user.nombre}</h2>
          <span style={{ 
            textTransform: 'uppercase', 
            fontWeight: '700', 
            fontSize: '0.8rem', 
            letterSpacing: '1px',
            backgroundColor: 'var(--color-white)',
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            ROL: {user.rol}
          </span>
        </div>
      </header>

      {/* VISTA DOCENTE Y COORDINADOR */}
      <div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '30px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              {user.rol === 'coordinador' ? 'RESUMEN GLOBAL' : 'MIS PROYECTOS ASIGNADOS'}
          </h3>
          
          {stats ? (
            <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '25px' }}>
                    <StatCard title="TOTAL PROYECTOS" count={(stats.borrador || 0) + (stats.enviado || 0) + (stats.aprobado || 0) + (stats.rechazado || 0)} color="#333" highlight />
                    <StatCard title="APROBADOS" count={stats.aprobado} color="#2ECC71" />
                    <StatCard title="RECHAZADOS" count={stats.rechazado} color="#E74C3C" />
                    <StatCard title="PENDIENTES (ENVIADOS)" count={stats.enviado} color="var(--color-accent)" />
                </div>
                {/* Solo Coordinador ve borradores, o si es docente no tiene mucho sentido ver borradores ajenos, pero ya está filtrado por backend */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '60px' }}>
                    <StatCard title="BORRADORES (EN PROGRESO)" count={stats.borrador} color="#999" />
                </div>
            </>
          ) : (
            <p style={{ color: '#888', fontStyle: 'italic' }}>No hay datos disponibles por el momento.</p>
          )}
          
          <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '40px', backgroundColor: 'var(--color-white)', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '20px' }}>GESTIÓN ACADÉMICA</h3>
              <p style={{ marginBottom: '30px', color: '#666' }}>
                  {user.rol === 'coordinador' 
                    ? 'Accede al listado completo de todos los proyectos.' 
                    : 'Revisar y calificar entregas de tus estudiantes asignados.'}
              </p>
              <Link to="/portfolios" className="btn" style={{ minWidth: '250px' }}>
                ADMINISTRAR PORTAFOLIOS
              </Link>
            </div>

            {user.rol === 'coordinador' && (
              <div style={{ flex: 1, textAlign: 'center', padding: '40px', backgroundColor: '#E8F6F3', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ marginBottom: '20px', color: '#16A085' }}>ASIGNACIONES</h3>
                <p style={{ marginBottom: '30px', color: '#555' }}>Gestiona los estudiantes y asigna sus docentes revisores.</p>
                <Link to="/assignments" className="btn" style={{ minWidth: '250px', backgroundColor: '#16A085' }}>
                  GESTIONAR ASIGNACIONES
                </Link>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, highlight, color }) => (
  <div className="card" style={{ 
    textAlign: 'center', 
    padding: '40px 20px',
    border: highlight ? `2px solid ${color}` : 'none',
    boxShadow: 'var(--shadow-md)',
    transition: 'transform 0.2s',
  }}>
    <div style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '10px', color: color || 'var(--color-text)' }}>
      {count || 0}
    </div>
    <div style={{ fontSize: '0.85rem', fontWeight: '700', letterSpacing: '1px', color: '#888', textTransform: 'uppercase' }}>
      {title}
    </div>
  </div>
);

export default Dashboard;
