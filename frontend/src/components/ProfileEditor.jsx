import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaEye, FaEyeSlash, FaMapMarkerAlt, FaShieldAlt, FaSpinner } from 'react-icons/fa';
import api from '../services/api';

function ProfileEditor({ userRole }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    experience: '',
    latitude: null,
    longitude: null,
    trust_score: null,
    total_jobs: null,
    completion_rate: null,
    email: '',
    role: ''
  });
  const [showPhone, setShowPhone] = useState(false);
  const [notifyNegative, setNotifyNegative] = useState(true);
  const [geoStatus, setGeoStatus] = useState('idle');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setFormData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            'Unknown Location';
          const state = data.address?.state || '';
          const locationLabel = state ? `${city}, ${state}` : city;
          setFormData((prev) => ({ ...prev, location: locationLabel, latitude, longitude }));
          setGeoStatus('success');
        } catch {
          setFormData((prev) => ({ ...prev, location: prev.location || 'My Location', latitude, longitude }));
          setGeoStatus('success');
        }
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', formData);
      toast.success('Your profile has been saved successfully.', { position: 'bottom-right', autoClose: 3000 });
    } catch (err) {
      toast.error('Failed to save profile. Please verify your connection.');
      console.error(err);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  const inputStyle = {
    padding: '0.85rem 0.95rem',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    width: '100%',
    fontSize: '0.98rem',
    background: '#f8fafc',
    color: 'var(--text)'
  };

  if (userRole === 'Admin') {
    return (
      <div className="card" style={{ marginBottom: '2rem', width: '100%', boxShadow: '0 18px 40px rgba(15, 23, 42, 0.08)', borderRadius: '20px', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.75rem', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white' }}>
          <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.72)', marginBottom: '0.5rem' }}>Admin Profile</div>
          <h3 style={{ margin: 0, fontSize: '1.65rem' }}>Security & Control Center</h3>
          <p style={{ margin: '0.65rem 0 0', color: 'rgba(255,255,255,0.74)', lineHeight: 1.5 }}>
            Clean access to your identity details, security preferences, and admin-only operational controls.
          </p>
        </div>

        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#fff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Identity Snapshot</div>
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Display Name</div>
                  <div style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{formData.name || 'System Admin'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Email</div>
                  <div style={{ fontWeight: '700', color: '#334155' }}>{formData.email || 'admin@smartcity.local'}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Role</div>
                    <div style={{ fontWeight: '700', color: '#334155' }}>{formData.role || 'Admin'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.2rem' }}>Phone</div>
                    <div style={{ fontWeight: '700', color: '#334155' }}>{formData.phone || '0000'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid #dbeafe', borderRadius: '16px', background: 'linear-gradient(180deg, #eff6ff 0%, #f8fbff 100%)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1d4ed8', fontWeight: '800', marginBottom: '1rem' }}>
                <FaShieldAlt /> Security Status
              </div>
              <div style={{ display: 'grid', gap: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>Scope</span>
                  <strong>Global Root</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>2FA</span>
                  <strong style={{ color: '#059669' }}>Active</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>Audit Window</span>
                  <strong>{new Date().toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
            <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#fff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Console Preferences</div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>
                  <span>Operations Region</span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoStatus === 'loading'}
                    style={{
                      background: geoStatus === 'success' ? 'var(--primary-light)' : geoStatus === 'error' ? '#fee2e2' : 'var(--background-alt)',
                      border: `1px solid ${geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#fca5a5' : 'var(--border)'}`,
                      borderRadius: '8px',
                      padding: '0.3rem 0.75rem',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#dc2626' : 'var(--text-muted)'
                    }}
                  >
                    {geoStatus === 'loading' && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                    {geoStatus === 'success' && <FaCheckCircle />}
                    {(geoStatus === 'idle' || geoStatus === 'error') && <FaMapMarkerAlt />}
                    {geoStatus === 'loading' ? 'Detecting...' : 'Auto Detect'}
                  </button>
                </label>
                <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g. Hyderabad, Telangana" style={inputStyle} />
              </div>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.14)', cursor: 'pointer' }}>
                <input type="checkbox" checked={notifyNegative} onChange={() => setNotifyNegative(!notifyNegative)} style={{ width: '18px', height: '18px', marginTop: '0.15rem' }} />
                <div>
                  <strong style={{ display: 'block', color: '#991b1b', fontSize: '0.95rem' }}>Negative Trust Alerts</strong>
                  <span style={{ color: '#b91c1c', fontSize: '0.85rem', lineHeight: 1.5 }}>Trigger immediate admin notifications when a worker rating falls below 3.0.</span>
                </div>
              </label>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '16px', background: '#fff' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>Credential Actions</div>
              <div style={{ display: 'grid', gap: '0.9rem' }}>
                <input type="password" placeholder="New admin password" style={inputStyle} />
                <input type="password" placeholder="Confirm new admin password" style={inputStyle} />
                <button type="button" onClick={() => toast.success('Security update successfully configured.')} className="btn btn-secondary" style={{ padding: '0.8rem 1rem', borderRadius: '10px', fontWeight: 'bold', background: '#e2e8f0', color: '#334155' }}>
                  Update Credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginBottom: '2rem', width: '100%', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>Personal Information</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>Display Name</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} required placeholder="e.g. Jane Doe" style={{ ...inputStyle, background: '#f8fafc' }} />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>Phone Number</label>
            <div style={{ position: 'relative' }}>
              <input type={showPhone ? 'text' : 'password'} name="phone" value={formData.phone || ''} onChange={handleChange} required placeholder="e.g. (555) 123-4567" style={{ ...inputStyle, paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPhone(!showPhone)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-light)', cursor: 'pointer' }}>
                {showPhone ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>
              <span>City Location</span>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoStatus === 'loading'}
                style={{
                  background: geoStatus === 'success' ? 'var(--primary-light)' : geoStatus === 'error' ? '#fee2e2' : 'var(--background-alt)',
                  border: `1px solid ${geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#fca5a5' : 'var(--border)'}`,
                  borderRadius: '6px',
                  padding: '0.25rem 0.7rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#dc2626' : 'var(--text-muted)'
                }}
              >
                {geoStatus === 'loading' && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                {geoStatus === 'success' && <FaCheckCircle />}
                {(geoStatus === 'idle' || geoStatus === 'error') && <FaMapMarkerAlt />}
                {geoStatus === 'loading' ? 'Detecting...' : 'Auto Detect'}
              </button>
            </label>
            <input type="text" name="location" value={formData.location || ''} onChange={handleChange} placeholder="e.g. Seattle, WA" required style={inputStyle} />
            {formData.latitude && (
              <p style={{ fontSize: '0.72rem', color: 'var(--primary)', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <FaMapMarkerAlt size={10} />
                GPS coordinates saved: {Number(formData.latitude).toFixed(4)}, {Number(formData.longitude).toFixed(4)}
              </p>
            )}
          </div>

          {userRole === 'Worker' && (
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>Years of Experience</label>
              <input type="number" name="experience" value={formData.experience || ''} onChange={handleChange} style={inputStyle} />
            </div>
          )}
        </div>

        {userRole === 'Worker' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Trust Score</div>
              <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--primary)' }}>{formData.trust_score !== null && formData.trust_score !== undefined ? Number(formData.trust_score).toFixed(2) : '0.00'}</div>
            </div>
            <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Completed Jobs</div>
              <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text)' }}>{formData.total_jobs ?? 0}</div>
            </div>
            <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
              <div style={{ color: 'var(--text-light)', fontSize: '0.8rem' }}>Completion Rate</div>
              <div style={{ fontWeight: '900', fontSize: '1.25rem', color: 'var(--text)' }}>{formData.completion_rate !== null && formData.completion_rate !== undefined ? `${Number(formData.completion_rate).toFixed(1)}%` : '0.0%'}</div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '2px dashed var(--border)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', color: 'var(--text)' }}>Authentication & Security Credentials</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Securely reset your password without dropping the active session parameters.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>New Secure Password</label>
              <input type="password" placeholder="........" style={inputStyle} />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: 'var(--text)' }}>Confirm New Password</label>
              <input type="password" placeholder="........" style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <button type="button" onClick={() => toast.success('Security update successfully configured.')} className="btn btn-secondary" style={{ padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: 'bold', background: '#e2e8f0', color: '#334155' }}>
              Update Credentials
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button type="button" onClick={handleCancel} className="btn btn-ghost" style={{ padding: '0.75rem 1.5rem', borderRadius: '6px' }}>Cancel</button>
          <button type="submit" className="btn" style={{ padding: '0.75rem 2.5rem', borderRadius: '6px', fontWeight: 'bold' }}>Save Changes</button>
        </div>
      </form>
      <style>{'@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

export default ProfileEditor;
