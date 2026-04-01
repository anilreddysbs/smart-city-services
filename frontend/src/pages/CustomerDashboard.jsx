import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCalendarAlt, FaHistory, FaCheckCircle, FaStar, FaBriefcase, FaClock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

function CustomerDashboard() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const { data = [], isLoading } = useQuery({
    queryKey: ['customerBookings'],
    queryFn: () => api.get('/bookings/customer').then(res => res.data.data ? res.data.data : res.data),
    refetchInterval: 10000 
  });

  const activeBookings = data.filter(b => b.status === 'Pending' || b.status === 'Accepted');
  const pastBookings = data.filter(b => b.status === 'Completed' || b.status === 'Cancelled');

  const handleUpdateStatus = async (id, status) => {
    if (status === 'Cancelled' && !window.confirm('Are you sure you want to cancel this service?')) return;
    
    setIsProcessing(true);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      queryClient.invalidateQueries(['customerBookings']);
      toast.success(`Service ${status.toLowerCase()} successfully.`);
    } catch (err) {
      toast.error('Failed to update service status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRating = async (bookingId, workerId, workerName) => {
    const rating = prompt(`Rate your experience with ${workerName} (1-5 Stars):`);
    if (!rating) return;
    
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      toast.warn('Please provide a rating between 1 and 5.');
      return;
    }

    const review = prompt('Optional feedback:');
    
    setIsProcessing(true);
    try {
      await api.post('/ratings', { booking_id: bookingId, worker_id: workerId, rating: ratingNum, review });
      toast.success('Thank you for your feedback!');
      queryClient.invalidateQueries(['customerBookings']);
    } catch(err) { 
      toast.error(err.response?.data?.message || 'Failed to submit rating.'); 
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: '3rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text)' }}>My Service Dashboard</h1>
        <p style={{ color: 'var(--text-light)', marginTop: '0.25rem' }}>Track and manage your professional service history.</p>
      </header>
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-light)' }}>Loading your dashboard...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'flex-start' }}>
          
          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <FaClock color="var(--primary)" /> Active Services
            </h3>
            {activeBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeBookings.map(b => (
                  <div key={b.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)' }}>{b.worker_name || 'Awaiting assignment'}</div>
                      <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{b.category}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                         Scheduled for: <strong>{new Date(b.start_time).toLocaleDateString()}</strong>
                      </div>
                      {b.priority === 'Emergency' && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '800', marginTop: '0.35rem' }}>
                          Emergency request (Rs. 500 priority surcharge)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${b.status.toLowerCase()}`}>{b.status}</span>
                      {b.status === 'Pending' && (
                         <button disabled={isProcessing} onClick={() => handleUpdateStatus(b.id, 'Cancelled')} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem' }}>Cancel</button>
                      )}
                      {b.status === 'Accepted' && (
                         <button disabled={isProcessing} onClick={() => handleUpdateStatus(b.id, 'Completed')} className="btn" style={{ padding: '0.5rem 1rem' }}>Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
                 <p>No active service bookings found.</p>
                 <Link to="/workers" className="btn btn-outline" style={{ marginTop: '1rem' }}>Find Professionals</Link>
              </div>
            )}
          </section>

          <section>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <FaHistory color="var(--text-light)" /> Service History
            </h3>
            {pastBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pastBookings.map(b => (
                  <div key={b.id} className="card" style={{ padding: '1.25rem', opacity: b.status === 'Cancelled' ? 0.7 : 1 }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '800' }}>{b.worker_name}</span>
                        <span className={`badge ${b.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{b.status}</span>
                     </div>
                     <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {b.status === 'Completed' ? `Finished on ${new Date(b.end_time).toLocaleDateString()}` : 'Booking Cancelled'}
                     </p>
                     {b.status === 'Completed' && (
                        b.rating_submitted ? (
                           <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaCheckCircle /> Feedback Submitted
                           </div>
                        ) : (
                           <button disabled={isProcessing} className="btn" onClick={() => handleRating(b.id, b.worker_id, b.worker_name)} style={{ width: '100%', padding: '0.5rem' }}>Rate Service</button>
                        )
                     )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-light)', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                History is empty.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default CustomerDashboard;
