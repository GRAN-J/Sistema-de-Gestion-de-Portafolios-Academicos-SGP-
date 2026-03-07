/**
 * @file ForgotPasswordPage.jsx
 * @description Página para solicitar el envío del correo de recuperación de contraseña.
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/auth/forgot-password', { correo: email });
      setMessage('Si el correo existe, recibirás un enlace de recuperación en breve.');
      setEmail('');
    } catch (err) {
      // Mensaje genérico por seguridad, aunque el backend devuelva 500
      setError('Ocurrió un error al procesar tu solicitud. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1.5rem', letterSpacing: '-0.5px', color: 'var(--color-accent)' }}>
          RECUPERAR CONTRASEÑA
        </h2>
        
        <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', lineHeight: '1.5' }}>
          Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
        </p>

        {message && <div style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '15px', marginBottom: '20px', borderRadius: 'var(--radius)', fontWeight: 'bold', textAlign: 'center' }}>{message}</div>}
        {error && <div style={{ backgroundColor: '#FFEBEE', color: '#C62828', padding: '15px', marginBottom: '20px', borderRadius: 'var(--radius)', fontWeight: 'bold', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.5px' }}>CORREO ELECTRÓNICO</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
              style={{ fontSize: '1rem', padding: '15px' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', fontSize: '1rem', padding: '14px' }}
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR ENLACE'}
          </button>
        </form>
        
        <div style={{ marginTop: '25px', textAlign: 'center', fontSize: '0.9rem', borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
          <Link to="/login" style={{ fontWeight: '600', color: '#666' }}>← Volver al Inicio de Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
