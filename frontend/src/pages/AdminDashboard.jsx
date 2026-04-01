import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaTrash, FaSearch, FaUserShield, FaCheckCircle, FaExclamationTriangle, FaUsers, FaChartBar, FaBan, FaUndo, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [allWorkers, setAllWorkers] = useState([]);
  const [flaggedWorkers, setFlaggedWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [workerSearch, setWorkerSearch] = useState('');
  const [activeTab, setActiveTab] = useState('workers'); // 'workers' | 'users'
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [geoStatus, setGeoStatus] = useState('idle');
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', phone: '', password: '', role: 'Customer',
    category: 'Electrician', experience: '0', location: '', latitude: null, longitude: null
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [usersRes, allWorkersRes] = await Promise.all([
        api.get('/admin/users?limit=500&page=1'),
        api.get('/workers?limit=1000')
      ]);
      setUsers(usersRes.data.data ? usersRes.data.data.users : usersRes.data);

      const allW = allWorkersRes.data.data ? allWorkersRes.data.data.workers : allWorkersRes.data;
      setAllWorkers(allW);
      setFlaggedWorkers(allW.filter(w => {
        const jobs = Number(w.total_jobs || 0);
        const lowTrust = jobs > 3 && Number(w.trust_score) < 40;
        const lowRating = jobs > 0 && Number(w.averageRating) < 3.0;
        if (lowTrust) w.flagReason = 'High cancellation rate';
        else if (lowRating) w.flagReason = 'Poor customer ratings';
        return lowTrust || lowRating;
      }));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data.');
    }
  };

  const updateWorkerStatus = async (workerId, status) => {
    setIsProcessing(true);
    try {
      await api.put('/admin/verify-worker', { worker_id: workerId, status });
      toast.success(`Worker ${status === 'Rejected' ? 'suspended' : 'reactivated'} successfully.`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      toast.error("You can't delete your own account.");
      return;
    }
    setIsProcessing(true);
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      toast.success('User deleted successfully.');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post('/auth/register', newUserData);
      toast.success(`${newUserData.role} registered successfully.`);
      setShowCreateModal(false);
      setNewUserData({ name: '', email: '', phone: '', password: '', role: 'Customer', category: 'Electrician', experience: '0', location: '', latitude: null, longitude: null });
      setGeoStatus('idle');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWorkers = allWorkers.filter(w =>
    (w.name || '').toLowerCase().includes(workerSearch.toLowerCase()) ||
    (w.category || '').toLowerCase().includes(workerSearch.toLowerCase())
  );

  const suspendedCount = allWorkers.filter(w => w.verification_status === 'Rejected').length;
  const activeCount = allWorkers.filter(w => w.verification_status === 'Verified').length;
  
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { 'Accept-Language': 'en' } }
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            'Unknown Location';
          const state = data.address?.state || '';
          const locationLabel = state ? `${city}, ${state}` : city;
          setNewUserData((prev) => ({ ...prev, location: locationLabel, latitude, longitude }));
          setGeoStatus('success');
        } catch {
          setNewUserData((prev) => ({ ...prev, location: prev.location || 'My Location', latitude, longitude }));
          setGeoStatus('success');
        }
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div style={{ padding: '2rem 0' }}>

      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FaUserShield color="var(--primary)" /> Admin Dashboard
            </h1>
            <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage professionals, users, and platform health.</p>
          </div>
          <Link to="/dashboard/admin/analytics" className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: '8px' }}>
            <FaChartBar /> View Analytics
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
        {[
          { label: 'Total Users', value: users.length, icon: <FaUsers />, color: 'var(--secondary)' },
          { label: 'Active Professionals', value: activeCount, icon: <FaCheckCircle />, color: 'var(--primary)' },
          { label: 'Suspended Professionals', value: suspendedCount, icon: <FaBan />, color: 'var(--danger)' },
          { label: 'Flagged for Review', value: flaggedWorkers.length, icon: <FaExclamationTriangle />, color: '#d97706' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: stat.color, fontSize: '1.25rem' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--text)', lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Flagged workers alert */}
      {flaggedWorkers.length > 0 && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '1.25rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <FaExclamationTriangle color="#d97706" />
            <strong style={{ color: '#92400e' }}>{flaggedWorkers.length} professional{flaggedWorkers.length > 1 ? 's' : ''} flagged for low performance</strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {flaggedWorkers.map(w => (
              <div key={w.id} style={{ background: 'white', border: '1px solid #fcd34d', borderRadius: '8px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem' }}>{w.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>{w.flagReason} · ⭐ {w.averageRating || 'N/A'} · {w.total_jobs || 0} jobs</div>
                </div>
                <button
                  onClick={() => updateWorkerStatus(w.id, 'Rejected')}
                  disabled={isProcessing}
                  style={{ background: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}
                >
                  Suspend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
        {[
          { key: 'workers', label: `Professionals (${allWorkers.length})` },
          { key: 'users', label: `All Users (${users.length})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '0.85rem 1.75rem',
              border: 'none',
              background: 'none',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-light)',
              borderBottom: activeTab === tab.key ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: '-2px',
              transition: 'color 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workers tab */}
      {activeTab === 'workers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '380px' }}>
              <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={workerSearch}
                onChange={e => setWorkerSearch(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Category</th>
                  <th style={{ padding: '1rem' }}>Location</th>
                  <th style={{ padding: '1rem' }}>Rating</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWorkers.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{w.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{w.category}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-light)', fontSize: '0.85rem' }}>{w.location || '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: '#f59e0b', fontWeight: '800' }}>★</span> {w.averageRating ? Number(w.averageRating).toFixed(1) : 'No ratings'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${w.verification_status === 'Verified' ? 'verified' : w.verification_status === 'Rejected' ? 'cancelled' : 'pending'}`}>
                        {w.verification_status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {w.verification_status === 'Rejected' ? (
                        <button
                          onClick={() => updateWorkerStatus(w.id, 'Verified')}
                          disabled={isProcessing}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <FaUndo size={10} /> Reactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => updateWorkerStatus(w.id, 'Rejected')}
                          disabled={isProcessing}
                          style={{ background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '6px', padding: '0.4rem 0.9rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                        >
                          <FaBan size={10} /> Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>No professionals found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '380px' }}>
              <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="text"
                placeholder="Search by name, email or role..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.9rem' }}
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn"
              style={{ padding: '0.65rem 1.5rem', borderRadius: '8px', fontSize: '0.9rem' }}
            >
              + Add User
            </button>
          </div>

          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Name</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                  <th style={{ padding: '1rem' }}>Role</th>
                  <th style={{ padding: '1rem' }}>Joined</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700' }}>{u.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'Admin' ? 'accepted' : u.role === 'Worker' ? 'verified' : 'pending'}`}>{u.role}</span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-light)' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {u.id !== currentUser.id ? (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="btn btn-danger"
                          style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderRadius: '6px' }}
                        >
                          <FaTrash size={11} /> Delete
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>You</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create user modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontWeight: '900' }}>Add New User</h2>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <select name="role" value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: '700' }}>
                  <option value="Customer">Customer</option>
                  <option value="Worker">Professional</option>
                  <option value="Admin">Admin</option>
                </select>
                <input type="text" placeholder="Full Name" value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} required style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <input type="email" placeholder="Email" value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <input type="text" placeholder="Phone" value={newUserData.phone} onChange={e => setNewUserData({ ...newUserData, phone: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              <input type="password" placeholder="Password" value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              {newUserData.role === 'Worker' && (
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select value={newUserData.category} onChange={e => setNewUserData({ ...newUserData, category: e.target.value })} style={{ flex: 2, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <option>Electrician</option><option>Plumber</option><option>Painter</option><option>Construction Worker</option><option>Maintenance Worker</option>
                  </select>
                  <input type="number" placeholder="Years Exp." value={newUserData.experience} onChange={e => setNewUserData({ ...newUserData, experience: e.target.value })} style={{ width: '90px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </div>
              )}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-light)', fontWeight: '700' }}>Location / City</span>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoStatus === 'loading'}
                    style={{
                      background: geoStatus === 'success' ? 'var(--primary-light)' : geoStatus === 'error' ? '#fee2e2' : 'var(--background-alt)',
                      border: `1px solid ${geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#fca5a5' : 'var(--border)'}`,
                      borderRadius: '6px',
                      padding: '0.25rem 0.65rem',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      cursor: geoStatus === 'loading' ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      color: geoStatus === 'success' ? 'var(--primary)' : geoStatus === 'error' ? '#dc2626' : 'var(--text-muted)'
                    }}
                  >
                    {geoStatus === 'loading' && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
                    {geoStatus !== 'loading' && <FaMapMarkerAlt size={10} />}
                    {geoStatus === 'loading' ? 'Detecting...' : 'Auto Detect'}
                  </button>
                </div>
                <input type="text" placeholder="Location / City" value={newUserData.location} onChange={e => setNewUserData({ ...newUserData, location: e.target.value })} required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, height: '48px', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                <button disabled={isProcessing} type="submit" className="btn" style={{ flex: 2, height: '48px', borderRadius: '8px' }}>{isProcessing ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AdminDashboard;
