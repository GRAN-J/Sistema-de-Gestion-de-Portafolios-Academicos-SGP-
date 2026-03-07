/**
 * @file ResetPasswordPage.jsx
 * @description Página para establecer la nueva contraseña usando el token recibido.
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      setMessage('Contraseña actualizada con éxito. Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Token inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.5rem', letterSpacing: '-0.5px', color: 'var(--color-accent)' }}>
          NUEVA CONTRASEÑA
        </h2>
        
        {message && <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '15px', marginBottom: '20px', borderRadius: 'var(--radius)', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}
        {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '15px', marginBottom: '20px', borderRadius: 'var(--radius)', fontWeight: 'bold', textAlign: 'center' }}>{error}</div>}
        
        {!message && (
          <form onSubmit={onSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>NUEVA CONTRASEÑA</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Mínimo 6 caracteres"
                style={{ fontSize: '1rem', padding: '15px' }}
              />
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>CONFIRMAR CONTRASEÑA</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
                placeholder="Repite la contraseña"
                style={{ fontSize: '1rem', padding: '15px' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
            >
              {loading ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
            </button>
          </form>
        )}
        
        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <Link to="/login" style={{ fontWeight: '600', color: '#666' }}>Cancelar</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
