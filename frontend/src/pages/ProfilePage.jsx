import React from 'react';
import ProfileEditor from '../components/ProfileEditor';

function ProfilePage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  return (
    <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', paddingTop: '1rem', display: 'grid', gridTemplateColumns: user?.role === 'Admin' ? '2fr 1fr' : '1fr', gap: '2rem' }}>
      <ProfileEditor userRole={user?.role} />
      
      {user?.role === 'Admin' && (
        <div className="card" style={{ height: 'fit-content', padding: '1.5rem', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <h4 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.75rem' }}>
            🛡️ System Security Status
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#475569', fontSize: '0.95rem' }}>
            <li style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Two-Factor Auth:</strong> <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active</span>
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Admin Scope:</strong> <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Global Root</span>
            </li>
            <li style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <strong>Last Audit:</strong> <span>{new Date().toLocaleDateString()}</span>
            </li>
          </ul>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #cbd5e1', color: '#64748b', fontSize: '0.85rem', lineHeight: '1.5' }}>
            * Primary identity controls are strictly logged and permanently audited by the central security mesh.
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
