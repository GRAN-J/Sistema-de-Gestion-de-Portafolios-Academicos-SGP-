/**
 * @file PortfolioList.jsx
 * @description Lista de portafolios con estilo minimalista RAMA WORKS / ACADEMIA.
 */

import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import AuthContext from '../context/AuthContext';
import { Link } from 'react-router-dom';

const PortfolioList = () => {
  const { user } = useContext(AuthContext);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({}); // Nuevo estado para paginación
  const [filters, setFilters] = useState({ estado: '' });

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      let query = `?page=${page}&limit=5`;
      if (filters.estado) query += `&estado=${filters.estado}`;
      const { data } = await api.get(`/portfolios${query}`);
      setPortfolios(data.data);
      setPagination(data.pagination || {}); // Guardar info de paginación si existe
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); 
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿ELIMINAR PROYECTO? ESTA ACCIÓN ES IRREVERSIBLE.')) {
      try {
        await api.delete(`/portfolios/${id}`);
        fetchPortfolios();
      } catch (error) {
        alert('ERROR AL ELIMINAR');
      }
    }
  };

  return (
    <div className="container fade-in" style={{ marginTop: '40px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--color-border)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', margin: 0, lineHeight: 1, letterSpacing: '-1px' }}>PORTAFOLIOS</h1>
          <p style={{ margin: '10px 0 0', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.5px' }}>
            SISTEMA DE GESTIÓN DE PROYECTOS ACADÉMICOS
          </p>
        </div>
        
        {user.rol === 'estudiante' && (
           <Link to="/portfolios/new" className="btn" style={{ fontSize: '0.85rem', padding: '10px 24px' }}>
             + NUEVO PROYECTO
           </Link>
        )}
      </header>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <span style={{ fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', color: '#666' }}>FILTRAR POR:</span>
        <select 
          name="estado" 
          onChange={handleFilterChange} 
          value={filters.estado} 
          style={{ width: '220px', margin: 0, fontSize: '0.9rem' }}
        >
          <option value="">TODOS LOS ESTADOS</option>
          {user.rol === 'estudiante' && <option value="borrador">BORRADOR</option>}
          <option value="enviado">ENVIADO</option>
          <option value="aprobado">APROBADO</option>
          <option value="rechazado">RECHAZADO</option>
        </select>
        
        <button onClick={fetchPortfolios} className="btn-outline" style={{ padding: '12px 20px', fontSize: '0.85rem' }}>
          ACTUALIZAR
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#888', fontWeight: '600', letterSpacing: '1px' }}>CARGANDO DATOS...</div>
      ) : (
        <div style={{ display: 'grid', gap: '25px' }}>
          {portfolios.map((portfolio) => (
            <div key={portfolio._id} className="card" style={{ position: 'relative', borderLeft: `4px solid ${
                portfolio.estado === 'aprobado' ? '#2ECC71' : 
                portfolio.estado === 'rechazado' ? '#E74C3C' : 
                portfolio.estado === 'enviado' ? 'var(--color-accent)' : '#ccc'
            }` }}>
              <div style={{ position: 'absolute', top: '25px', right: '25px' }}>
                <span className={`status-badge status-${portfolio.estado}`}>
                  {portfolio.estado}
                </span>
              </div>
              
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px', marginTop: '5px' }}>{portfolio.titulo}</h3>
              <p style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', marginBottom: '15px', color: '#888' }}>
                AUTOR: {portfolio.autor?.nombre || 'DESCONOCIDO'}
              </p>
              
              <p style={{ marginBottom: '25px', lineHeight: 1.6, color: '#555', maxWidth: '85%' }}>
                {portfolio.descripcion.substring(0, 200)}...
              </p>
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <Link to={`/portfolios/${portfolio._id}`} className="btn-outline" style={{ padding: '8px 20px', fontSize: '0.8rem' }}>
                  VER DETALLES / EDITAR
                </Link>
                
                {user.rol === 'estudiante' && portfolio.estado === 'borrador' && (
                  <button 
                    onClick={() => handleDelete(portfolio._id)} 
                    style={{ backgroundColor: '#E74C3C', color: 'white', border: 'none', padding: '8px 20px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', borderRadius: '4px' }}
                  >
                    ELIMINAR
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {portfolios.length === 0 && (
             <div style={{ padding: '80px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #ddd', color: '#888' }}>
               NO SE ENCONTRARON PROYECTOS CON LOS FILTROS ACTUALES.
             </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center' }}>
        <button 
          disabled={page === 1} 
          onClick={() => setPage(page - 1)} 
          className="btn-outline"
          style={{ 
              width: 'auto', 
              padding: '10px 20px', 
              opacity: page === 1 ? 0.5 : 1, 
              cursor: page === 1 ? 'not-allowed' : 'pointer' 
          }}
        >
          ANTERIOR
        </button>
        <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--color-text)' }}>{page}</span>
        <button 
          disabled={!pagination.next}
          onClick={() => setPage(page + 1)} 
          className="btn-outline"
          style={{ 
              width: 'auto', 
              padding: '10px 20px',
              opacity: !pagination.next ? 0.5 : 1, 
              cursor: !pagination.next ? 'not-allowed' : 'pointer'
          }}
        >
          SIGUIENTE
        </button>
      </div>
    </div>
  );
};

export default PortfolioList;
