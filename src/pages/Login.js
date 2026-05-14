import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'stylist') navigate('/estilista');
    } catch (err) {
      setError(err.response?.data?.message || 'Credenciales inválidas');
    } finally { setLoading(false); }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img className="logo-img" src="/images/logo.jpg" alt="Logo" />
        <h1>BarberShop Pro</h1>
        <p className="subtitle">Acceso para Administradores y Estilistas</p>
        {error && <div className="error-msg"><AlertCircle size={16}/> {error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Mail size={14}/> Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div className="form-group">
            <label><Lock size={14}/> Contraseña</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-gold" disabled={loading}>
            <LogIn size={16}/> {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>
        <div style={{marginTop:'24px'}}>
          <a href="/" style={{color:'var(--text-muted)',fontSize:'0.85rem',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:'6px'}}>
            <ArrowLeft size={14}/> Volver al sitio principal
          </a>
        </div>
      </div>
    </div>
  );
};
export default Login;
