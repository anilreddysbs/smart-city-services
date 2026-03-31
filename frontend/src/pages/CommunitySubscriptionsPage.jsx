import React, { useEffect, useState } from 'react';
import api from '../services/api';

function CommunitySubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [form, setForm] = useState({ community_name: '', service_category: 'Maintenance Worker', subscription_type: 'Monthly Maintenance', end_date: '' });

  useEffect(() => {
    fetchSubs();
  }, []);

  const fetchSubs = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubs(res.data);
    } catch(err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions/create', form);
      fetchSubs();
      setForm({ ...form, community_name: '' });
      alert('Subscription contract verified and integrated.');
    } catch(err) { alert('Failed to initialize subscription'); }
  }

  return (
    <div className="container">
      <h1 className="dashboard-title">Community Service Architecture</h1>
      <div className="grid">
        <div className="card">
          <h3>Provision New Contract</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group"><label>Apartment or Community Scope Name</label><input type="text" value={form.community_name} onChange={e=>setForm({...form, community_name: e.target.value})} required/></div>
            <div className="form-group"><label>Target Workforce Resource</label><select value={form.service_category} onChange={e=>setForm({...form, service_category: e.target.value})}><option>Maintenance Worker</option><option>Electrician</option><option>Plumber</option></select></div>
            <div className="form-group"><label>SLA Plan Scale</label><select value={form.subscription_type} onChange={e=>setForm({...form, subscription_type: e.target.value})}><option>Monthly Maintenance</option><option>Quarterly Overhaul</option></select></div>
            <div className="form-group"><label>Contract End Boundary</label><input type="date" value={form.end_date} onChange={e=>setForm({...form, end_date: e.target.value})} required/></div>
            <button className="btn" type="submit">Deploy Subscription</button>
          </form>
        </div>
        <div className="card">
          <h3>Active Deployed Subscriptions</h3>
          {subs.length > 0 ? (
            <ul style={{ padding: 0 }}>
              {subs.map(s => (
                <li key={s.id} style={{ background: 'var(--background)', padding: '1.5rem', border: '1px solid var(--border)', marginBottom: '1rem', listStyle: 'none', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)' }}>{s.community_name} ({s.subscription_type})</h4>
                  <p style={{ margin: 0, fontSize: '1rem' }}>Resource: <strong>{s.service_category}</strong></p>
                  <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-light)', fontSize: '0.875rem' }}>Contract Expires: {new Date(s.end_date).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-light)' }}>There are zero community packages active for your account.</p>}
        </div>
      </div>
    </div>
  );
}

export default CommunitySubscriptionsPage;
