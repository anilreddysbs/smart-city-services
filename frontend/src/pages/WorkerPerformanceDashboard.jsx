import React, { useEffect, useState } from 'react';
import api from '../services/api';

function WorkerPerformanceDashboard() {
  const [perf, setPerf] = useState(null);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pRes = await api.get('/performance');
        setPerf(pRes.data);
        const aRes = await api.get('/alerts/alerts');
        setAlerts(aRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  if (!perf) return <div className="container">Analyzing metrics...</div>;

  return (
    <div className="container">
      <h1 className="dashboard-title">V3 Individual Performance Metrics</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card"><h3>Total Engagements</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0'}}>{perf.total_jobs}</p></div>
        <div className="card"><h3>Median Rating</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0', color: 'var(--warning)'}}>★ {parseFloat(perf.average_rating).toFixed(1)}</p></div>
        <div className="card"><h3>Global Trust Score</h3><p style={{fontSize: '2.5rem', color: 'var(--primary)', margin: '0.5rem 0 0 0'}}>{parseFloat(perf.trust_score).toFixed(0)}</p></div>
        <div className="card"><h3>Forecast Monthly Rate</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0', color: 'var(--secondary)'}}>{perf.monthly_jobs}</p></div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem' }}>Dynamic Market Alerts</h3>
        {alerts.length > 0 ? (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {alerts.map(a => (
              <li key={a.id} style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '1.25rem', marginBottom: '1rem', borderRadius: '4px' }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem' }}>{new Date(a.created_at).toLocaleDateString()}</strong>
                <span>{a.alert_message}</span>
              </li>
            ))}
          </ul>
        ) : <p style={{ color: 'var(--text-light)' }}>No intelligent alerts triggered yet within your operating sector.</p>}
      </div>
    </div>
  );
}

export default WorkerPerformanceDashboard;
