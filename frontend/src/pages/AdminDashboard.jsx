import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [flaggedWorkers, setFlaggedWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [isProcessing, setIsProcessing] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '', email: '', phone: '', password: '', role: 'Customer',
    category: 'Electrician', experience: '0', location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, usersRes, allWorkersRes] = await Promise.all([
        api.get('/admin/workers/pending'),
        api.get('/admin/users?limit=500&page=1'),
        api.get('/workers?limit=1000')
      ]);
      setPendingWorkers(workersRes.data.data ? workersRes.data.data : workersRes.data);
      setUsers(usersRes.data.data ? usersRes.data.data.users : usersRes.data);
      
      const allW = allWorkersRes.data.data ? allWorkersRes.data.data.workers : allWorkersRes.data;
      // Precision algorithmic mapping focusing on high-risk verified nodes
      setFlaggedWorkers(allW.filter(w => {
        const jobsCount = Number(w.total_jobs || 0);
        // Only flag established accounts (grace period for < 3 jobs)
        const hasLowTrust = jobsCount > 3 && Number(w.trust_score) < 40;
        const hasLowRating = jobsCount > 0 && Number(w.averageRating) < 3.0;
        
        if (hasLowTrust) w.flagReason = "Frequent Historical Handshake Cancellation";
        else if (hasLowRating) w.flagReason = "Consistently Poor Client Sentiment Analysis";
        
        return hasLowTrust || hasLowRating;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = (id) => {
    setDismissedIds(prev => [...prev, id]);
    toast.info('Administrative Override Applied: Protocol warning silenced for this session.');
  };

  const verifyWorker = async (workerId, status) => {
    if (status === 'Rejected' && !window.confirm('Suspending this professional node will disconnect all active contracts. Proceed?')) return;

    setIsProcessing(true);
    try {
      await api.put('/admin/verify-worker', { worker_id: workerId, status });
      toast.success(`Infrastructure state transition: Protocol ${status} finalized.`);
      fetchData();
    } catch (err) {
      toast.error('Handshake failure detected in moderation queue.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === currentUser.id) {
      toast.error('Identity Conflict: Self-deletion is cryptographically restricted.');
      return;
    }
    const confirmPurge = window.confirm(`Permanently purge ${targetUser.email} and all associated ledger history?`);
    if (!confirmPurge) return;
    
    setIsProcessing(true);
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      toast.success('Professional identity successfully purged from global directory.');
      fetchData();
    } catch (err) {
      toast.error('Recursive termination failure.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      await api.post('/auth/register', newUserData);
      toast.success(`Protocol initiated: Registered ${newUserData.role} successfully.`);
      setShowCreateModal(false);
      setNewUserData({ name: '', email: '', phone: '', password: '', role: 'Customer', category: 'Electrician', experience: '0', location: '' });
      fetchData();
    } catch (err) {
      toast.error('Network identity allocation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const activeFlagged = flaggedWorkers.filter(w => !dismissedIds.includes(w.id));

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <div className="dashboard-header" style={{ marginBottom: '3rem' }}>
        <h1 className="dashboard-title" style={{ fontSize: '2.5rem', fontWeight: '900' }}>Administrative Intelligence</h1>
        <p style={{ color: 'var(--text-light)' }}>Unified terminal for urban workforce moderation and verification integrity.</p>
      </div>
      
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', color: '#1e293b' }}>
           <span style={{ height: '12px', width: '12px', borderRadius: '50%', background: '#ef4444' }}></span> 
           Critical Moderation Queue
        </h2>
        {activeFlagged.length > 0 ? (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem', marginTop: '1.5rem' }}>
            {activeFlagged.map(worker => (
              <div key={`flagged-${worker.id}`} className="card" style={{ border: '1px solid #fecaca', background: '#fffafb', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.05)' }}>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{worker.name}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: '800', textTransform: 'uppercase', background: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>At Risk</span>
                  </div>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{worker.category}</p>
                  
                  <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#fff1f2', borderRadius: '12px', border: '1.5px solid #fecaca' }}>
                    <p style={{ color: '#b91c1c', fontSize: '0.85rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Protocol Flag: {worker.flagReason}</p>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                      <span><strong>Trust:</strong> {Number(worker.trust_score).toFixed(0)}/100</span>
                      <span><strong>Rating:</strong> {worker.averageRating || 'Unrated'} Stars</span>
                      <span><strong>Jobs:</strong> {worker.total_jobs || 0}</span>
                    </div>
                  </div>
                </div>
                <div style={{ padding: '1rem 1.5rem', background: '#ffffff', borderTop: '1px solid #fecaca', borderRadius: '0 0 16px 16px', display: 'flex', gap: '0.75rem' }}>
                  <button disabled={isProcessing} onClick={() => handleDismiss(worker.id)} style={{ flex: 1, height: '40px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Dismiss Alert</button>
                  <button disabled={isProcessing} onClick={() => verifyWorker(worker.id, 'Rejected')} style={{ flex: 1, height: '40px', borderRadius: '8px', border: 'none', background: '#dc2626', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>Suspend Profile</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
           <div style={{ padding: '3rem', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', marginTop: '1.5rem' }}>
             <p style={{ color: '#64748b', fontStyle: 'italic' }}>Geometric workforce patterns within normal bounds. Zero active flags detected.</p>
           </div>
        )}

        <h2>Pending Approvals</h2>
        {pendingWorkers.length > 0 ? (
          <div className="grid" style={{ marginTop: '1.5rem' }}>
            {pendingWorkers.map(worker => (
              <div key={worker.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{worker.name}</h3>
                  <span className="badge pending">Pending</span>
                </div>
                <p className="card-subtitle">{worker.category}</p>
                <div style={{ margin: '1rem 0' }}>
                  <p><strong>Email:</strong> {worker.email}</p>
                  <p><strong>Exp:</strong> {worker.experience} yrs</p>
                  <p><strong>Location:</strong> {worker.location}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => verifyWorker(worker.id, 'Verified')} className="btn btn-secondary">Approve</button>
                  <button onClick={() => verifyWorker(worker.id, 'Rejected')} className="btn btn-danger">Reject</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ marginTop: '1rem' }}>No pending approvals.</p>
        )}
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <h2 style={{ margin: 0 }}>All Users</h2>
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="btn btn-secondary" 
              style={{ padding: '0.45rem 1.25rem', height: 'fit-content', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}
            >
              + Register New Node
            </button>
          </div>
          <div style={{ position: 'relative', minWidth: '300px' }}>
            <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text" 
              placeholder="Search by name, email or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.8rem', border: '1px solid var(--border)', borderRadius: '6px' }}
            />
          </div>
        </div>

        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
             <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', animation: 'slideUp 0.3s' }}>
                <h2 style={{ marginBottom: '1.5rem' }}>Provision New Identity</h2>
                <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <select name="role" value={newUserData.role} onChange={e => setNewUserData({...newUserData, role: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', fontWeight: 'bold' }}>
                         <option value="Customer">Customer</option>
                         <option value="Worker">Professional</option>
                         <option value="Admin">System Admin</option>
                      </select>
                      <input type="text" placeholder="Full Name" value={newUserData.name} onChange={e => setNewUserData({...newUserData, name: e.target.value})} required style={{ flex: 1.5, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   </div>
                   <input type="email" placeholder="Email Address" value={newUserData.email} onChange={e => setNewUserData({...newUserData, email: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   <input type="text" placeholder="Phone Number" value={newUserData.phone} onChange={e => setNewUserData({...newUserData, phone: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   <input type="password" placeholder="Temporal Password" value={newUserData.password} onChange={e => setNewUserData({...newUserData, password: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   
                   {newUserData.role === 'Worker' && (
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <select value={newUserData.category} onChange={e => setNewUserData({...newUserData, category: e.target.value})} style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                           <option value="Electrician">Electrician</option>
                           <option value="Plumber">Plumber</option>
                           <option value="Painter">Painter</option>
                           <option value="Construction Worker">Construction Worker</option>
                        </select>
                        <input type="number" placeholder="Exp (Yrs)" value={newUserData.experience} onChange={e => setNewUserData({...newUserData, experience: e.target.value})} style={{ width: '80px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                     </div>
                   )}

                   <input type="text" placeholder="Assigned Location" value={newUserData.location} onChange={e => setNewUserData({...newUserData, location: e.target.value })} required style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }} />
                   
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, height: '48px', borderRadius: '8px', border: '1.5px solid var(--border)', background: 'white', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                      <button disabled={isProcessing} type="submit" className="btn" style={{ flex: 2, height: '48px', borderRadius: '8px', fontWeight: 'bold' }}>{isProcessing ? 'Deploying...' : 'Provision Resource'}</button>
                   </div>
                </form>
             </div>
          </div>
        )}

        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid var(--border)' }}>
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
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', animation: 'fadeIn 0.3s ease-out' }}>
                  <td style={{ padding: '1rem' }}><strong>{u.name}</strong></td>
                  <td style={{ padding: '1rem', color: 'var(--text-light)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}><span className={`badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                  <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {u.id !== currentUser.id ? (
                      <button 
                        onClick={() => handleDeleteUser(u)} 
                        className="btn btn-danger" 
                        style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                      >
                        <FaTrash /> Delete
                      </button>
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>Protected Administrator</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
