import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaCheckCircle, FaBriefcase, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('incoming');

  const { data: jobs = [], isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['workerJobs', activeTab],
    queryFn: () => api.get('/bookings/worker').then(res => res.data),
    refetchInterval: 30000 
  });

  const { data: myBookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => api.get('/bookings/customer').then(res => res.data.data || res.data),
    refetchInterval: 30000 
  });

  const assignedJobs = jobs.filter(j => j.worker_id !== null);
  const liveJobs = jobs.filter(j => j.worker_id === null);

  const updateJobStatus = async (id, status) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      toast.success(`Job status updated to ${status}.`);
      refetchJobs();
    } catch (err) {
      toast.error('Failed to update job status.');
    }
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)' }}>Professional Terminal</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage your assignments and service requests.</p>
      </header>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
         <button onClick={() => setActiveTab('incoming')} style={{ 
           background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
           fontWeight: '800', fontSize: '0.95rem', color: activeTab === 'incoming' ? 'var(--primary)' : 'var(--text-light)',
           borderBottom: activeTab === 'incoming' ? '3px solid var(--primary)' : '3px solid transparent',
           transition: 'all 0.2s'
         }}>
            Assigned Jobs ({assignedJobs.length})
         </button>
         <button onClick={() => setActiveTab('live')} style={{ 
           background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
           fontWeight: '800', fontSize: '0.95rem', color: activeTab === 'live' ? 'var(--primary)' : 'var(--text-light)',
           borderBottom: activeTab === 'live' ? '3px solid var(--primary)' : '3px solid transparent',
           transition: 'all 0.2s'
         }}>
            Live Service Jobs ({liveJobs.length})
         </button>
         <button onClick={() => setActiveTab('bookings')} style={{ 
           background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
           fontWeight: '800', fontSize: '0.95rem', color: activeTab === 'bookings' ? 'var(--primary)' : 'var(--text-light)',
           borderBottom: activeTab === 'bookings' ? '3px solid var(--primary)' : '3px solid transparent',
           transition: 'all 0.2s'
         }}>
            My Requests ({myBookings.length})
         </button>
      </div>

      {activeTab === 'incoming' ? (
        <div>
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading assignments...</div>
          ) : assignedJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {assignedJobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                       <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{job.customer_name}</span>
                       <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
                       {job.priority && (
                         <span className={`badge ${job.priority === 'Emergency' ? 'cancelled' : 'pending'}`}>
                           {job.priority}
                         </span>
                       )}
                    </div>
                    <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{job.description}"</p>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaCalendarAlt /> {new Date(job.start_time).toLocaleDateString()}
                       </span>
                       {job.status !== 'Pending' && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <FaUser /> {job.customer_phone}
                         </span>
                       )}
                       {job.customer_location && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            📍 {job.customer_location}
                         </span>
                       )}
                       {job.priority === 'Emergency' && job.due_by && (
                         <span style={{ color: 'var(--danger)' }}>
                           Due: {new Date(job.due_by).toLocaleString()}
                         </span>
                       )}
                       <span style={{ color: 'var(--primary)', fontWeight: '800' }}>₹{job.total_price}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {job.status === 'Pending' && (
                      <button onClick={() => updateJobStatus(job.id, 'Accepted')} className="btn" style={{ padding: '0.5rem 1.5rem' }}>Accept</button>
                    )}
                    {job.status === 'Accepted' && (
                      <button onClick={() => updateJobStatus(job.id, 'Completed')} className="btn" style={{ padding: '0.5rem 1.5rem' }}>Mark Completed</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
               <FaBriefcase size={32} style={{ marginBottom: '1rem' }} />
               <p>No jobs explicitly assigned to your portfolio yet.</p>
            </div>
          )}
        </div>
      ) : activeTab === 'live' ? (
        <div>
          {jobsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading live requests...</div>
          ) : liveJobs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {liveJobs.map(job => (
                <div key={job.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                       <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{job.customer_name}</span>
                       <span className={`badge pending`}>Open Request</span>
                       {job.priority && (
                         <span className={`badge ${job.priority === 'Emergency' ? 'cancelled' : 'pending'}`}>
                           {job.priority}
                         </span>
                       )}
                    </div>
                    <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{job.description}"</p>
                    <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <FaCalendarAlt /> {new Date(job.start_time).toLocaleDateString()}
                       </span>
                       {job.customer_location && (
                         <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            📍 {job.customer_location}
                         </span>
                       )}
                       {job.priority === 'Emergency' && job.due_by && (
                         <span style={{ color: 'var(--danger)' }}>
                           Due: {new Date(job.due_by).toLocaleString()}
                         </span>
                       )}
                       <span style={{ color: 'var(--primary)', fontWeight: '800' }}>₹{job.total_price}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => updateJobStatus(job.id, 'Accepted')} className="btn" style={{ padding: '0.5rem 1.5rem' }}>Accept Job</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
               <FaBriefcase size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
               <p>No open live service requests in your area.</p>
            </div>
          )}
        </div>
      ) : (
        <div>
          {myBookings.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myBookings.map(b => (
                <div key={b.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{b.worker_name}</div>
                    <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem' }}>{b.category}</div>
                  </div>
                  <span className={`badge ${b.status.toLowerCase()}`}>{b.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
               <p>You haven't requested any services from other professionals.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;
