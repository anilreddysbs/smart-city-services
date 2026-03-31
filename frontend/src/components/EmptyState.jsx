import React from 'react';

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {Icon && <Icon size={56} color="var(--border)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />}
      <h3 style={{ marginBottom: '0.75rem', fontSize: '1.35rem', color: 'var(--text)' }}>{title}</h3>
      <p style={{ color: 'var(--text-light)', marginBottom: action ? '2.5rem' : '0', maxWidth: '420px', lineHeight: '1.6' }}>{description}</p>
      {action && action}
    </div>
  );
}

export default EmptyState;
