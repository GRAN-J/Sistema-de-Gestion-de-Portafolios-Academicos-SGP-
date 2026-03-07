/**
 * @file PortfolioForm.jsx
 * @description Formulario para crear y editar portafolios (Estilo RAMA WORKS / ACADEMIA).
 * Actualizado para soportar carga de archivos y reglas de negocio.
 */

import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import AuthContext from '../context/AuthContext';

const PortfolioForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estado inicial del portafolio
  const [portfolio, setPortfolio] = useState({
    titulo: '',
    descripcion: '',
    enlaceRepositorio: '',
    tecnologiasUtilizadas: '',
    estado: 'borrador',
    observacionesDocente: '',
    archivos: [], 
    permiteEdicion: false, 
    docenteAsignado: '', // ID del docente
  });

  const [initialStatus, setInitialStatus] = useState('borrador'); 
  const [selectedFiles, setSelectedFiles] = useState([]); 
  const [teachers, setTeachers] = useState([]); // Lista de docentes para el coordinador

  const isEdit = !!id;
  const isTeacher = user.rol === 'docente';
  const isCoordinator = user.rol === 'coordinador';

  useEffect(() => {
    // Si es coordinador, cargar lista de docentes
    if (isCoordinator) {
        const fetchTeachers = async () => {
            try {
                const { data } = await api.get('/auth/teachers');
                setTeachers(data.data);
            } catch (err) {
                console.error('Error cargando docentes:', err);
            }
        };
        fetchTeachers();
    }

    if (isEdit) {
      const fetchPortfolio = async () => {
        try {
          const { data } = await api.get(`/portfolios/${id}`);
          setPortfolio({
            ...data.data,
            tecnologiasUtilizadas: data.data.tecnologiasUtilizadas.join(', '),
            archivos: data.data.archivos || (data.data.archivo ? [data.data.archivo] : []),
            docenteAsignado: data.data.docenteAsignado?._id || data.data.docenteAsignado || '',
          });
          setInitialStatus(data.data.estado);
        } catch (err) {
          setError('No se pudo cargar el proyecto. Verifique permisos.');
          console.error(err);
        }
      };
      fetchPortfolio();
    }
  }, [id, isEdit, isCoordinator]);

  const onChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setPortfolio({ ...portfolio, [e.target.name]: value });
  };

  const onFileChange = (e) => {
    // Convertir FileList a Array
    setSelectedFiles(Array.from(e.target.files));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('titulo', portfolio.titulo);
      formData.append('descripcion', portfolio.descripcion);
      formData.append('enlaceRepositorio', portfolio.enlaceRepositorio);
      formData.append('tecnologiasUtilizadas', portfolio.tecnologiasUtilizadas);
      
      if (portfolio.estado) formData.append('estado', portfolio.estado);
      if (portfolio.observacionesDocente) formData.append('observacionesDocente', portfolio.observacionesDocente);
      
      // Enviar permiso de edición (solo si es docente)
      if (isTeacher) {
          formData.append('permiteEdicion', portfolio.permiteEdicion);
      }
      
      // Enviar asignación de docente (solo si es coordinador)
      if (isCoordinator && portfolio.docenteAsignado) {
          formData.append('docenteAsignado', portfolio.docenteAsignado);
      }

      // Adjuntar múltiples archivos
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
            formData.append('archivos', file);
        });
      }

      if (isEdit) {
        await api.put(`/portfolios/${id}`, formData);
      } else {
        await api.post('/portfolios', formData);
      }
      navigate('/portfolios');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar.');
    } finally {
      setLoading(false);
    }
  };

  // Función para descargar un archivo específico
  const handleDownload = async (filename, originalName) => {
    try {
      const response = await api.get(`/portfolios/${id}/download/${filename}`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || 'archivo_proyecto.pdf'); 
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error al descargar:', err);
      alert('No se pudo descargar el archivo.');
    }
  };

  // Función para visualizar el archivo (Solo PDF)
  const handlePreview = async (filename, mimeType) => {
      if (mimeType !== 'application/pdf') {
          alert('La previsualización solo está disponible para archivos PDF. Por favor descargue el archivo para verlo.');
          return;
      }

      try {
          const response = await api.get(`/portfolios/${id}/download/${filename}`, {
              responseType: 'blob',
          });
          const file = new Blob([response.data], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
      } catch (err) {
          console.error('Error al abrir archivo:', err);
          alert('No se pudo abrir el archivo.');
      }
  };

  // Bloquear inputs si es docente o si el estudiante ya envió el proyecto
  // Regla: Estudiante solo edita si el estado INICIAL era 'borrador' O si el docente habilitó 'permiteEdicion'
  const isReadOnly = (isTeacher || isCoordinator) || (!isTeacher && !isCoordinator && initialStatus !== 'borrador' && !portfolio.permiteEdicion);
  
  // Docente puede editar observaciones siempre
  // Coordinador puede editar docente asignado siempre
  // Estudiante puede cambiar estado solo si es 'borrador' (para enviarlo)

  // Mostrar botón de descarga si existen archivos y usuario tiene permiso
  const canDownload = portfolio.archivos && portfolio.archivos.length > 0 && (
      user.rol === 'coordinador' || 
      user.rol === 'docente' || 
      (user.rol === 'estudiante')
  );

  return (
    <div className="container fade-in" style={{ maxWidth: '800px', marginTop: '40px' }}>
      <div className="card" style={{ padding: '50px', border: 'none', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '2.5rem', borderBottom: '2px solid var(--color-accent)', paddingBottom: '20px', marginBottom: '40px', color: 'var(--color-text)' }}>
          {isEdit ? 'EDITAR PROYECTO' : 'NUEVO PROYECTO'}
        </h1>
        
        {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '15px', marginBottom: '30px', borderRadius: 'var(--radius)', fontWeight: 'bold' }}>{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>TÍTULO DEL PROYECTO</label>
            <input
              type="text"
              name="titulo"
              value={portfolio.titulo}
              onChange={onChange}
              disabled={isReadOnly}
              required
              placeholder="Ej: SISTEMA DE GESTIÓN ACADÉMICA"
              style={{ fontSize: '1.2rem', fontWeight: '600', padding: '15px' }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>DESCRIPCIÓN</label>
            <textarea
              name="descripcion"
              value={portfolio.descripcion}
              onChange={onChange}
              disabled={isReadOnly}
              required
              placeholder="Describe los objetivos y funcionalidades principales..."
              style={{ width: '100%', padding: '15px', minHeight: '150px', fontSize: '1rem', lineHeight: '1.6' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>ENLACE AL REPOSITORIO (OPCIONAL)</label>
                <input
                  type="url"
                  name="enlaceRepositorio"
                  value={portfolio.enlaceRepositorio}
                  onChange={onChange}
                  disabled={isReadOnly}
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>TECNOLOGÍAS</label>
                <input
                  type="text"
                  name="tecnologiasUtilizadas"
                  value={portfolio.tecnologiasUtilizadas}
                  onChange={onChange}
                  disabled={isReadOnly}
                  placeholder="React, Node.js, MongoDB..."
                />
              </div>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                ARCHIVOS DEL PROYECTO (PDF/DOC)
            </label>
            
            {portfolio.archivos && portfolio.archivos.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                    {portfolio.archivos.map((archivo, index) => (
                        <div key={index} style={{ marginBottom: '10px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>📄 <strong>{archivo.nombreOriginal || archivo.nombre}</strong> <small>({(archivo.tamaño / 1024).toFixed(2)} KB)</small></span>
                            
                            {canDownload && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {/* Botón Ver (Solo PDF) */}
                                    {archivo.tipo === 'application/pdf' && (
                                        <button 
                                            type="button" 
                                            onClick={() => handlePreview(archivo.nombreServidor, archivo.tipo)}
                                            className="btn-outline"
                                            style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                                        >
                                            VISUALIZAR
                                        </button>
                                    )}

                                    {/* Botón Descargar */}
                                    <button 
                                        type="button" 
                                        onClick={() => handleDownload(archivo.nombreServidor, archivo.nombreOriginal)}
                                        className="btn-outline"
                                        style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid var(--color-accent)', color: 'var(--color-accent)' }}
                                    >
                                        DESCARGAR
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!isReadOnly && (
                <>
                    <input
                      type="file"
                      name="archivos"
                      onChange={onFileChange}
                      accept=".pdf,.doc,.docx"
                      multiple // Permitir múltiples archivos
                      style={{ padding: '10px' }}
                    />
                    <small style={{display: 'block', color: '#666', marginTop: '5px'}}>
                        Puedes seleccionar varios archivos a la vez. Nota: Al subir nuevos archivos se reemplazarán los anteriores.
                    </small>
                </>
            )}
          </div>

          {/* Sección de Estado y Revisión */}
          <div style={{ marginTop: '40px', padding: '30px', backgroundColor: '#F9F9F9', borderRadius: 'var(--radius)', borderLeft: '4px solid var(--color-accent)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#555' }}>
                ESTADO Y REVISIÓN
            </h3>
            
            {/* 
                NOTA: El selector de asignación de docente se ha movido a la página 'Assignments.jsx'.
                La asignación ahora es global por estudiante, no por proyecto individual.
            */}

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem' }}>ESTADO ACTUAL</label>
              
              <select
                name="estado"
                value={portfolio.estado}
                onChange={onChange}
                disabled={(!isTeacher && initialStatus !== 'borrador') || isCoordinator} 
                style={{ width: '100%', padding: '15px', fontSize: '1rem', fontWeight: '600', color: 'var(--color-text)' }}
              >
                {!isTeacher && <option value="borrador">BORRADOR (EDICIÓN)</option>}
                {!isTeacher && <option value="enviado">ENVIADO (LISTO PARA REVISIÓN)</option>}
                
                {/* Opción de 'Enviado' solo visual para docente si ese es el estado actual, pero no seleccionable como cambio */}
                {isTeacher && portfolio.estado === 'enviado' && (
                    <option value="enviado" disabled>ENVIADO (PENDIENTE DE REVISIÓN)</option>
                )}

                {isTeacher && (
                  <>
                    <option value="aprobado">APROBADO</option>
                    <option value="rechazado">RECHAZADO</option>
                  </>
                )}
              </select>
              
              {!isTeacher && portfolio.estado === 'borrador' && (
                  <small style={{ display: 'block', marginTop: '8px', color: '#666', fontStyle: 'italic' }}>
                      Selecciona "ENVIADO" cuando hayas terminado para que el docente pueda revisarlo. Una vez enviado, no podrás editarlo.
                  </small>
              )}

              {/* Checkbox para permitir edición (Solo visible para docente cuando rechaza) */}
              {isTeacher && portfolio.estado === 'rechazado' && (
                  <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center' }}>
                      <input 
                          type="checkbox" 
                          id="permiteEdicion" 
                          name="permiteEdicion" 
                          checked={portfolio.permiteEdicion}
                          onChange={onChange}
                          style={{ width: '20px', height: '20px', marginRight: '10px' }}
                      />
                      <label htmlFor="permiteEdicion" style={{ fontWeight: '600', color: '#E74C3C' }}>
                          PERMITIR QUE EL ESTUDIANTE CORRIJA Y REENVÍE
                      </label>
                  </div>
              )}
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '0.9rem' }}>OBSERVACIONES DEL DOCENTE</label>
              <textarea
                name="observacionesDocente"
                value={portfolio.observacionesDocente}
                onChange={onChange}
                disabled={!isTeacher}
                placeholder={isTeacher ? "Ingrese sus comentarios..." : "Sin observaciones aún."}
                style={{ width: '100%', padding: '15px', minHeight: '100px', backgroundColor: isTeacher ? 'white' : 'transparent', border: isTeacher ? '1px solid var(--color-border)' : 'none' }}
              />
              
              {/* Mostrar quién revisó el proyecto si ya fue calificado */}
              {portfolio.docenteRevisor && (portfolio.estado === 'aprobado' || portfolio.estado === 'rechazado') && (
                <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#666', fontStyle: 'italic', textAlign: 'right' }}>
                  Revisado por: <strong>{portfolio.docenteRevisor.nombre}</strong> ({portfolio.docenteRevisor.correo})
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
              <button 
                  type="button" 
                  onClick={() => navigate('/portfolios')}
                  className="btn-outline"
                  style={{ fontSize: '1rem', padding: '14px 30px' }}
              >
              CANCELAR
              </button>
              
              {/* Botón visible si NO es solo lectura O si es Docente (Coordinador ya no guarda nada aquí) */}
              {(!isReadOnly || isTeacher) && !isCoordinator && (
                  <button 
                      type="submit" 
                      disabled={loading} 
                      className="btn"
                      style={{ fontSize: '1rem', padding: '14px 40px', minWidth: '200px' }}
                  >
                  {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                  </button>
              )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioForm;
