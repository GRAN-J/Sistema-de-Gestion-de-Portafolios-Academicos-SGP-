import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Assignments = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, teachersRes] = await Promise.all([
          api.get('/auth/students'),
          api.get('/auth/teachers')
        ]);
        setStudents(studentsRes.data.data);
        setTeachers(teachersRes.data.data);
      } catch (err) {
        setError('Error cargando datos. Verifique permisos de coordinador.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAssign = async (studentId, teacherId) => {
    try {
      setSuccessMsg('');
      setError('');
      
      const res = await api.put('/auth/assign-teacher', {
        studentId,
        teacherId: teacherId || null // Si es vacío, enviamos null para desasignar
      });

      // Actualizar estado local
      setStudents(students.map(student => 
        student._id === studentId 
          ? { ...student, docenteAsignado: res.data.data.docenteAsignado } 
          : student
      ));

      setSuccessMsg(`Asignación actualizada para el estudiante.`);
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al asignar docente');
    }
  };

  if (loading) return <div className="container" style={{textAlign:'center', marginTop:'50px'}}>Cargando...</div>;

  return (
    <div className="container fade-in" style={{ marginTop: '40px' }}>
      <h1 style={{ fontSize: '2rem', borderBottom: '2px solid var(--color-accent)', paddingBottom: '15px', marginBottom: '30px', color: 'var(--color-text)' }}>
        GESTIÓN DE ASIGNACIONES
      </h1>

      {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>{error}</div>}
      {successMsg && <div style={{ backgroundColor: '#E8F6F3', color: '#16A085', padding: '15px', marginBottom: '20px', borderRadius: '4px' }}>{successMsg}</div>}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '15px', textAlign: 'left', color: '#555' }}>ESTUDIANTE</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#555' }}>CORREO</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#555' }}>DOCENTE ASIGNADO</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#555' }}>ACCIÓN</th>
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px', fontWeight: '600' }}>{student.nombre}</td>
                  <td style={{ padding: '15px', color: '#666' }}>{student.correo}</td>
                  <td style={{ padding: '15px' }}>
                    <select
                      value={student.docenteAsignado?._id || student.docenteAsignado || ''}
                      onChange={(e) => handleAssign(student._id, e.target.value)}
                      style={{ 
                        padding: '8px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        width: '100%',
                        maxWidth: '250px',
                        backgroundColor: student.docenteAsignado ? '#E8F6F3' : '#fff'
                      }}
                    >
                      <option value="">-- Sin Asignar --</option>
                      {teachers.map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.nombre}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ padding: '15px', textAlign: 'center' }}>
                     {student.docenteAsignado ? (
                         <span style={{ fontSize: '1.2rem', color: '#2ECC71' }}>✓</span>
                     ) : (
                         <span style={{ fontSize: '1.2rem', color: '#ccc' }}>-</span>
                     )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  No hay estudiantes registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Assignments;