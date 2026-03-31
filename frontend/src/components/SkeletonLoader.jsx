import React from 'react';
import '../dashboard.css';

function SkeletonLoader({ count = 1, type = 'card' }) {
  return (
    <div style={{ display: 'flex', flexDirection: type === 'list' ? 'column' : 'row', flexWrap: 'wrap', gap: '1.5rem' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton ${type === 'list' ? 'skeleton-list' : 'skeleton-card'}`}></div>
      ))}
    </div>
  );
}

export default SkeletonLoader;
