import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../services/api';

function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [demand, setDemand] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await api.get('/analytics/platform-stats');
        setStats(statsRes.data);
        const demandRes = await api.get('/analytics/service-demand');
        setDemand(demandRes.data);
      } catch (err) { console.error(err); }
    };
    fetchData();
  }, []);

  if (!stats) return <div className="container">Loading centralized intelligence...</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7'];

  return (
    <div className="container">
      <h1 className="dashboard-title">Smart City Intelligence Layer</h1>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div className="card" style={{ flex: 1, minWidth: '200px' }}><h3>Total Market Workers</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0'}}>{stats.totalWorkers}</p></div>
        <div className="card" style={{ flex: 1, minWidth: '200px' }}><h3>Active (Verified)</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0', color: 'var(--primary)'}}>{stats.activeWorkers}</p></div>
        <div className="card" style={{ flex: 1, minWidth: '200px' }}><h3>Aggregate Bookings</h3><p style={{fontSize: '2.5rem', margin: '0.5rem 0 0 0', color: 'var(--secondary)'}}>{stats.totalBookings}</p></div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Market Distribution by Service</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stats.distribution} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                {stats.distribution.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3>V3 Demand Prediction Forecasting</h3>
          {demand.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={demand}>
              <XAxis dataKey="service_category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="predicted_demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          ) : <p style={{ color: 'var(--text-light)', marginTop: '2rem' }}>Accumulating booking history telemetry... Future demand charts will display here.</p>}
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
