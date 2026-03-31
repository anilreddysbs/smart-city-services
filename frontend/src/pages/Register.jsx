import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaHardHat, FaMapMarkerAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import api from '../services/api';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'Customer',
    category: 'Electrician', experience: '0', location: '',
    latitude: null, longitude: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // Detect location and reverse-geocode to city name using free Nominatim API
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Nominatim is free, no API key needed (OpenStreetMap)
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          // Extract city/town/village from response
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            'Unknown Location';
          const state = data.address?.state || '';
          const locationLabel = state ? `${city}, ${state}` : city;

          setFormData(prev => ({
            ...prev,
            location: locationLabel,
            latitude,
            longitude
          }));
          setGeoStatus('success');
        } catch {
          // If reverse geocode fails, still save coordinates with a generic label
          setFormData(prev => ({ ...prev, latitude, longitude, location: prev.location || 'My Location' }));
          setGeoStatus('success');
        }
      },
      () => {
        setGeoStatus('error');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

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

          {/* Role selector */}
          <div className="form-group">
            <label>I am signing up as a...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { value: 'Customer', label: 'Citizen / Client', Icon: FaUser },
                { value: 'Worker', label: 'Professional', Icon: FaHardHat }
              ].map(({ value, label, Icon }) => (
                <label key={value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.25rem', border: formData.role === value ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', background: formData.role === value ? 'var(--primary-light)' : 'white', transition: 'all 0.2s' }}>
                  <input type="radio" name="role" value={value} checked={formData.role === value} onChange={handleChange} style={{ display: 'none' }} />
                  <Icon size={24} color={formData.role === value ? 'var(--primary)' : 'var(--text-light)'} />
                  <span style={{ fontWeight: '800', color: formData.role === value ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
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

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" name="email" onChange={handleChange} required placeholder="name@company.com" />
          </div>

          {/* Passwords */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>Create Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} name="password" onChange={handleChange} required placeholder="••••••••" style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" onChange={handleChange} required placeholder="••••••••" />
            </div>
          </div>

          {/* Worker-specific fields */}
          {formData.role === 'Worker' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.5rem' }}>
              <div className="form-group">
                <label>Service Category</label>
                <select name="category" onChange={handleChange} value={formData.category}>
                  <option value="Electrician">Electrician</option>
                  <option value="Plumber">Plumber</option>
                  <option value="Painter">Painter</option>
                  <option value="Maintenance Worker">Maintenance</option>
                  <option value="Construction Worker">Construction</option>
                </select>
              </div>
              <div className="form-group">
                <label>Experience (Yrs)</label>
                <input type="number" name="experience" onChange={handleChange} required min="0" value={formData.experience} />
              </div>
            </div>
          )}

          {/* Location with auto-detect */}
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Your Location</span>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoStatus === 'loading'}
                style={{
                  background: geoStatus === 'success' ? 'var(--primary-light)' : geoStatus === 'error' ? '#fee2e2' : 'var(--background-alt)',
                  border: `1px solid ${geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#fca5a5' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '0.3rem 0.75rem',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#dc2626' : 'var(--text-muted)',
                  transition: 'all 0.2s'
                }}
              >
                {geoStatus === 'loading' && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                {geoStatus === 'success' && <FaCheckCircle />}
                {(geoStatus === 'idle' || geoStatus === 'error') && <FaMapMarkerAlt />}
                {geoStatus === 'loading' ? 'Detecting...' :
                  geoStatus === 'success' ? 'Location Set ✓' :
                  geoStatus === 'error' ? 'Permission Denied' :
                  'Detect My Location'}
              </button>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g. New York, NY — or click Detect above"
              style={{ marginTop: '0.5rem' }}
            />
            {formData.latitude && (
              <p style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaMapMarkerAlt size={10} />
                GPS coordinates saved: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
              </p>
            )}
            {geoStatus === 'error' && (
              <p style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.35rem' }}>
                Location access denied. Please type your city manually.
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn" style={{ height: '52px', marginTop: '0.5rem' }}>
            {loading ? 'Creating account...' : 'Create My Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '800' }}>Sign In</Link>
        </p>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default Register;
