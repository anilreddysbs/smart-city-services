import React, { useEffect, useState } from 'react';
import api from '../services/api';

function CertificationBadge({ workerId }) {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await api.get(`/workers/${workerId}/certifications`);
        setCerts(res.data.filter(c => c.verification_status === 'Verified'));
      } catch (err) {
        console.error(err);
      }
    };
    if (workerId) fetchCerts();
  }, [workerId]);

  if (certs.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '0.5rem 0' }}>
      {certs.map(cert => (
        <span key={cert.id} style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          ✓ {cert.certification_name}
        </span>
      ))}
    </div>
  );
}
export default CertificationBadge;
