import React from 'react';

function TrustScoreDisplay({ score, completionRate, totalJobs }) {
  const getScoreColor = (s) => {
    if (s >= 80) return 'var(--secondary)';
    if (s >= 50) return 'var(--warning)';
    return 'var(--danger)';
  };
  return (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
      <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '120px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Trust Score</p>
        <h3 style={{ color: getScoreColor(score), margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{score || '0.00'} <span style={{fontSize: '1rem', color: 'var(--text-light)'}}>/ 100</span></h3>
      </div>
      <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '120px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Completion Rate</p>
        <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{completionRate || '100.00'}%</h3>
      </div>
      <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border)', flex: 1, minWidth: '120px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>Total Jobs</p>
        <h3 style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem' }}>{totalJobs || '0'}</h3>
      </div>
    </div>
  );
}
export default TrustScoreDisplay;
