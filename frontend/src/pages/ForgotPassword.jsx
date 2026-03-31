import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope, FaCheckCircle, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleIdentityVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulating deep infrastructure identity lookup
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      toast.success('Security handshake successful. Verification token dispatched.');
    }, 2000);
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Credentials updated securely. You can now authenticate.');
      navigate('/login');
    }, 1500);
  };

  const containerStyle = { minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', padding: '2rem' };
  const cardStyle = { maxWidth: '480px', width: '100%', padding: '3rem', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)', background: 'white', border: '1px solid rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' };
  const inputGroupStyle = { marginBottom: '1.5rem', position: 'relative' };
  const labelStyle = { display: 'block', marginBottom: '0.6rem', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem', letterSpacing: '0.02em' };
  const inputStyle = { width: '100%', padding: '0.85rem 1rem 0.85rem 3rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', transition: 'all 0.2s', outline: 'none', background: '#f8fafc' };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.75rem' }}>
            <FaShieldAlt />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
            {step === 1 ? 'Recover Identity' : 'Secure New Passphrase'}
          </h2>
          <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1.05rem', fontWeight: '500' }}>
            {step === 1 
              ? 'Enter your registered email to trigger a cryptographic reset protocol across the city ledger.' 
              : 'Identity verified. Establish your new high-entropy security credentials below.'}
          </p>
        </div>

        {step === 1 ? (
          <form onSubmit={handleIdentityVerification}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Global ID / Email</label>
              <FaEnvelope style={{ position: 'absolute', left: '1.1rem', top: '2.8rem', color: '#94a3b8', zIndex: 1 }} />
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@cityservices.com"
                style={inputStyle}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)' }}
            >
              {loading ? 'Verifying Identity Ledger...' : 'Dispatch Reset Token'}
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordReset}>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>New Complex Passphrase</label>
              <FaLock style={{ position: 'absolute', left: '1.1rem', top: '2.8rem', color: '#94a3b8', zIndex: 1 }} />
              <input 
                type="password" 
                required 
                placeholder="••••••••••••"
                style={inputStyle}
              />
            </div>
            <div style={inputGroupStyle}>
              <label style={labelStyle}>Verify Passphrase</label>
              <FaLock style={{ position: 'absolute', left: '1.1rem', top: '2.8rem', color: '#94a3b8', zIndex: 1 }} />
              <input 
                type="password" 
                required 
                placeholder="••••••••••••"
                style={inputStyle}
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="btn" 
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', fontWeight: '800', borderRadius: '12px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Updating Credentials...' : 'Finalize Identity Recovery'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#64748b', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <FaArrowLeft size={12} /> Back to Authentication Terminal
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
