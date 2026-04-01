import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope } from 'react-icons/fa';
import api from '../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAdminPortal = import.meta.env.VITE_ADMIN_PORTAL === 'true';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      const user = res.data.user;

      if (isAdminPortal) {
        if (user.role !== 'Admin') {
          setError('Access Denied: This portal is strictly for system administrators.');
          localStorage.removeItem('user');
          return;
        }
        navigate('/dashboard/admin');
      } else {
        if (user.role === 'Admin') navigate('/dashboard/admin');
        else if (user.role === 'Worker') navigate('/dashboard/worker');
        else navigate('/dashboard/customer');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-alt)', padding: '2rem' }}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)', marginBottom: '0.5rem' }}>
            {isAdminPortal ? 'Admin Intelligence' : 'Welcome to SmartCity'}
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>
            {isAdminPortal ? 'Authenticate to access the orchestration layer' : 'Sign in to manage your professional services'}
          </p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #f87171', fontWeight: '600' }}>{error}</div>}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
               <FaEnvelope style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
               <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ paddingLeft: '2.8rem' }} placeholder="name@domain.com" />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FaLock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required style={{ paddingLeft: '2.8rem', paddingRight: '3rem' }} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
             <Link to="/forgot-password" style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem' }}>Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn" style={{ width: '100%', height: '52px' }}>
            {loading ? 'Authenticating...' : isAdminPortal ? 'Access Terminal' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
           <p style={{ fontSize: '0.95rem', color: 'var(--text-light)', marginBottom: isAdminPortal ? '1.5rem' : '0' }}>
             {!isAdminPortal ? (
               <>New to SmartCity? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '800' }}>Join Free</Link></>
             ) : (
               <span style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>Protected Administrative Entry Node</span>
             )}
           </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
