/**
 * @file Register.jsx
 * @description Página de registro con estilo minimalista RAMA WORKS.
 */

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    rol: 'estudiante',
  });

  const { nombre, correo, password, rol } = formData;
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', letterSpacing: '-0.5px', color: 'var(--color-accent)' }}>
          CREAR CUENTA
        </h2>
        
        {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', marginBottom: '20px', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={nombre}
              onChange={onChange}
              required
              placeholder="Ej: Juan Pérez"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={correo}
              onChange={onChange}
              required
              placeholder="ejemplo@correo.com"
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Contraseña (Mín. 6)</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              minLength="6"
              placeholder="Contraseña segura"
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>Rol</label>
            <select
              name="rol"
              value={rol}
              onChange={onChange}
            >
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="coordinador">Coordinador</option>
            </select>
          </div>
          
          <button type="submit" style={{ width: '100%' }}>
            REGISTRARSE
          </button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <span style={{ color: '#666' }}>¿Ya tienes cuenta?</span> <Link to="/login" style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
