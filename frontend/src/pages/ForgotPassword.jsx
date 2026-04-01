import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaEnvelope, FaShieldAlt } from 'react-icons/fa';

function ForgotPassword() {
  const containerStyle = {
    minHeight: 'calc(100vh - 70px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    padding: '2rem'
  };
  const cardStyle = {
    maxWidth: '520px',
    width: '100%',
    padding: '3rem',
    borderRadius: '24px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
    background: 'white',
    border: '1px solid rgba(255,255,255,0.8)'
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '1.75rem' }}>
            <FaShieldAlt />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginBottom: '0.75rem' }}>
            Password Recovery Not Yet Enabled
          </h2>
          <p style={{ color: '#64748b', lineHeight: '1.6', fontSize: '1.02rem', fontWeight: '500' }}>
            This project does not currently have a backend password reset workflow. To avoid implying a recovery path that is not real, this page is informational only for now.
          </p>
        </div>

        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem 1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0f172a', fontWeight: '800', marginBottom: '0.5rem' }}>
            <FaEnvelope />
            Next recommended implementation
          </div>
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.6' }}>
            Add a server-backed reset-token flow with expiry, rate limiting, and a dedicated reset form before enabling self-service password recovery in the UI.
          </p>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#64748b', fontWeight: '700', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
            <FaArrowLeft size={12} /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
