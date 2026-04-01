import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaBolt, FaBriefcase, FaClipboardCheck, FaUser } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

function WorkerDashboard() {
  const [activeTab, setActiveTab] = useState('incoming');

  const { data: jobsResponse, isLoading: jobsLoading, refetch: refetchJobs } = useQuery({
    queryKey: ['workerJobs'],
    queryFn: () => api.get('/bookings/worker').then((res) => res.data),
    refetchInterval: 10000
  });

  const jobs = jobsResponse?.data || jobsResponse || [];
  const incomingJobs = jobs.filter((job) => job.status === 'Pending');
  const activeJobs = jobs.filter((job) => job.status === 'Accepted');
  const completedJobs = jobs.filter((job) => job.status === 'Completed');
  const visibleJobs = activeTab === 'incoming' ? incomingJobs : activeJobs;

  const updateJobStatus = async (id, status) => {
    try {
      const response = await api.put(`/bookings/${id}/status`, { status });

      if (status === 'Completed') {
        const trustChange = Number(response.data?.trustChange || 0);
        if (trustChange > 0) {
          toast.success(`Job completed. Trust score increased by ${trustChange} points.`);
        } else if (trustChange < 0) {
          toast.warn(`Job completed. Trust score changed by ${trustChange} points.`);
        } else {
          toast.success('Job completed successfully.');
        }
      } else if (status === 'Declined') {
        toast.info('Request declined and removed from your queue.');
      } else {
        toast.success(`Job status updated to ${status}.`);
      }

      refetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update job status.');
    }
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)' }}>Professional Terminal</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Manage incoming requests, active assignments, and your delivery pace.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>Incoming Requests</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '0.35rem' }}>{incomingJobs.length}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>Active Jobs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '0.35rem' }}>{activeJobs.length}</div>
        </div>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700' }}>Completed Jobs</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '900', marginTop: '0.35rem' }}>{completedJobs.length}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <button
          onClick={() => setActiveTab('incoming')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '0.95rem',
            color: activeTab === 'incoming' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'incoming' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Incoming Requests ({incomingJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('active')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.75rem 1.5rem',
            cursor: 'pointer',
            fontWeight: '800',
            fontSize: '0.95rem',
            color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-light)',
            borderBottom: activeTab === 'active' ? '3px solid var(--primary)' : '3px solid transparent',
            transition: 'all 0.2s'
          }}
        >
          Active Schedule ({activeJobs.length})
        </button>
      </div>

      <div style={{ marginBottom: '1.5rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
        Trust score updates are shown after each completed job so workers can see the effect immediately.
      </div>

      {jobsLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading assignments...</div>
      ) : visibleJobs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visibleJobs.map((job) => (
            <div key={job.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem' }}>{job.customer_name}</span>
                  <span className={`badge ${job.status.toLowerCase()}`}>{job.status}</span>
                  {job.priority && (
                    <span className={`badge ${job.priority === 'Emergency' ? 'cancelled' : 'pending'}`}>
                      {job.priority}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>"{job.description}"</p>
                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-light)', fontSize: '0.8rem', fontWeight: '700', flexWrap: 'wrap' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <FaCalendarAlt /> {new Date(job.start_time).toLocaleString()}
                  </span>
                  {job.status !== 'Pending' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FaUser /> {job.customer_phone}
                    </span>
                  )}
                  {job.customer_location && <span>{job.customer_location}</span>}
                  {job.priority === 'Emergency' && job.due_by && (
                    <span style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <FaBolt /> Due by {new Date(job.due_by).toLocaleString()}
                    </span>
                  )}
                  {job.total_price ? <span style={{ color: 'var(--primary)', fontWeight: '800' }}>Rs. {job.total_price}</span> : null}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {job.status === 'Pending' && (
                  <>
                    <button onClick={() => updateJobStatus(job.id, 'Declined')} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                      Decline
                    </button>
                    <button onClick={() => updateJobStatus(job.id, 'Accepted')} className="btn" style={{ padding: '0.5rem 1.5rem' }}>
                      Accept
                    </button>
                  </>
                )}
                {job.status === 'Accepted' && (
                  <button onClick={() => updateJobStatus(job.id, 'Completed')} className="btn" style={{ padding: '0.5rem 1rem' }}>
                    <FaClipboardCheck style={{ marginRight: '0.35rem' }} />
                    Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-light)' }}>
          <FaBriefcase size={32} style={{ marginBottom: '1rem' }} />
          <p>{activeTab === 'incoming' ? 'No incoming requests are waiting right now.' : 'Accepted jobs will appear here as your working schedule.'}</p>
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;
