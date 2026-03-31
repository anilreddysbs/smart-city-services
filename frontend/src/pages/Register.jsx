import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaHardHat, FaLock, FaEnvelope, FaPhone } from 'react-icons/fa';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Customer',
    category: 'Electrician', experience: '0', location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background-alt)', padding: '3rem 1rem' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)', marginBottom: '0.5rem' }}>Join SmartCity</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.95rem' }}>The trusted collective for urban service professionals.</p>
        </div>
        
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.85rem', border: '1px solid #f87171', fontWeight: '600' }}>{error}</div>}
        
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label>I am signing up as a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', border: formData.role === 'Customer' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: formData.role === 'Customer' ? 'var(--primary-light)' : 'white', transition: 'all 0.2s' }}>
                  <input type="radio" name="role" value="Customer" checked={formData.role === 'Customer'} onChange={handleChange} style={{ display: 'none' }} />
                  <FaUser size={24} color={formData.role === 'Customer' ? 'var(--primary)' : 'var(--text-light)'} />
                  <span style={{ fontWeight: '800', color: formData.role === 'Customer' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Citizen / Client</span>
                </label>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', border: formData.role === 'Worker' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: formData.role === 'Worker' ? 'var(--primary-light)' : 'white', transition: 'all 0.2s' }}>
                  <input type="radio" name="role" value="Worker" checked={formData.role === 'Worker'} onChange={handleChange} style={{ display: 'none' }} />
                  <FaHardHat size={24} color={formData.role === 'Worker' ? 'var(--primary)' : 'var(--text-light)'} />
                  <span style={{ fontWeight: '800', color: formData.role === 'Worker' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>Professional</span>
                </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="form-group">
               <label>Full Name</label>
               <input type="text" name="name" onChange={handleChange} required placeholder="John Doe" />
             </div>
             <div className="form-group">
               <label>Phone Number</label>
               <input type="text" name="phone" onChange={handleChange} required placeholder="+1 555-0000" />
             </div>
          </div>

          <div className="form-group">
             <label>Email Address</label>
             <input type="email" name="email" onChange={handleChange} required placeholder="name@company.com" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div className="form-group">
               <label>Create Password</label>
               <input type="password" name="password" onChange={handleChange} required placeholder="••••••••" />
             </div>
             <div className="form-group">
               <label>Confirm Password</label>
               <input type="password" name="confirmPassword" onChange={handleChange} required placeholder="••••••••" />
             </div>
          </div>

          {formData.role === 'Worker' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
               <div className="form-group">
                 <label>Service Category</label>
                 <select name="category" onChange={handleChange} value={formData.category}>
                   <option value="Electrician">Electrician</option>
                   <option value="Plumber">Plumber</option>
                   <option value="Painter">Painter</option>
                   <option value="Maintenance Worker">Maintenance</option>
                 </select>
               </div>
               <div className="form-group">
                 <label>Exp (Yrs)</label>
                 <input type="number" name="experience" onChange={handleChange} required min="0" />
               </div>
            </div>
          )}
          
          <div className="form-group">
             <label>Primary Location (City)</label>
             <input type="text" name="location" onChange={handleChange} required placeholder="e.g. New York, NY" />
          </div>

          <button type="submit" disabled={loading} className="btn" style={{ height: '52px', marginTop: '1rem' }}>
            {loading ? 'Processing...' : 'Create My Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
