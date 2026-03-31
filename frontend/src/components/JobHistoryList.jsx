import React, { useEffect, useState } from 'react';
import api from '../services/api';

function JobHistoryList({ workerId }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/workers/${workerId}/history`);
        setHistory(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    if (workerId) fetchHistory();
  }, [workerId]);

  if (history.length === 0) return (
    <div className="card" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-light)' }}>No completed jobs recorded yet on the ledger.</p>
    </div>
  );

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Professional Ledger</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {history.map(job => (
          <div key={job.id} style={{ padding: '1rem', borderLeft: '4px solid var(--primary)', background: 'var(--surface)', borderRadius: '0 8px 8px 0', border: '1px solid var(--border)', borderLeftWidth: '4px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <strong>{job.service_type}</strong>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontWeight: 500 }}>
                {new Date(job.completed_date).toLocaleDateString()}
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Client Overview: {job.customer_name}</p>
            {job.rating ? (
              <p style={{ color: 'var(--warning)', margin: 0, fontWeight: 'bold' }}>★ {job.rating} / 5</p>
            ) : (
              <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', margin: 0, fontStyle: 'italic' }}>Pending Rating</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
export default JobHistoryList;
