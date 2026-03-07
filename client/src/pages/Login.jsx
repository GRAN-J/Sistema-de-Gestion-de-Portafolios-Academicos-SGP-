/**
 * @file Login.jsx
 * @description Página de inicio de sesión minimalista.
 */

import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const { correo, password } = formData;
  const { login, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(correo, password);
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', letterSpacing: '-0.5px', color: 'var(--color-accent)' }}>
          INICIAR SESIÓN
        </h2>
        
        {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '12px', marginBottom: '20px', borderRadius: '6px', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={onSubmit}>
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
          
          <div style={{ marginBottom: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>Contraseña</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#666', textDecoration: 'underline' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
          
          <button type="submit" style={{ width: '100%' }}>
            INGRESAR
          </button>
        </form>
        
        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <span style={{ color: '#666' }}>¿Nuevo usuario?</span> <Link to="/register" style={{ fontWeight: '600', color: 'var(--color-accent)' }}>Crear Cuenta</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
