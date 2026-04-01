import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaCheckCircle, FaClock, FaHistory, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const emptyDraft = { rating: 0, review: '' };

function CustomerDashboard() {
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [activeRatingBookingId, setActiveRatingBookingId] = React.useState(null);
  const [ratingDraft, setRatingDraft] = React.useState(emptyDraft);

  const { data = [], isLoading } = useQuery({
    queryKey: ['customerBookings'],
    queryFn: () => api.get('/bookings/customer').then((res) => (res.data.data ? res.data.data : res.data)),
    refetchInterval: 10000
  });

  const activeBookings = data.filter((booking) => booking.status === 'Pending' || booking.status === 'Accepted');
  const pastBookings = data.filter((booking) => booking.status === 'Completed' || booking.status === 'Cancelled');

  const resetRatingForm = () => {
    setActiveRatingBookingId(null);
    setRatingDraft(emptyDraft);
  };

  const handleUpdateStatus = async (id, status) => {
    setIsProcessing(true);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      queryClient.invalidateQueries(['customerBookings']);
      if (status === 'Completed') {
        toast.info('Mock Payment: Transaction successful. Funds transferred to worker.');
      }
      toast.success(`Service ${status.toLowerCase()} successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update service status.');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRatingForm = (bookingId) => {
    setActiveRatingBookingId(bookingId);
    setRatingDraft(emptyDraft);
  };

  const handleRatingSubmit = async (bookingId, workerId) => {
    if (ratingDraft.rating < 1 || ratingDraft.rating > 5) {
      toast.warn('Please choose a rating between 1 and 5 stars.');
      return;
    }

    setIsProcessing(true);
    try {
      await api.post('/ratings', {
        booking_id: bookingId,
        worker_id: workerId,
        rating: ratingDraft.rating,
        review: ratingDraft.review.trim()
      });
      toast.success('Thank you for your feedback!');
      resetRatingForm();
      queryClient.invalidateQueries(['customerBookings']);
    } catch (err) {
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
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)' }}>{booking.worker_name || 'Awaiting assignment'}</div>
                      <div style={{ color: 'var(--secondary)', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{booking.category}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        Scheduled for: <strong>{new Date(booking.start_time).toLocaleDateString()}</strong>
                      </div>
                      <div style={{ fontWeight: '800', color: 'var(--primary)', marginTop: '0.25rem' }}>Rs. {booking.total_price}</div>
                      {booking.priority === 'Emergency' && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: '800', marginTop: '0.35rem' }}>
                          Emergency request (Rs. 600 priority surcharge)
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span className={`badge ${booking.status.toLowerCase()}`}>{booking.status}</span>
                      {booking.status === 'Pending' && (
                        <button disabled={isProcessing} onClick={() => handleUpdateStatus(booking.id, 'Cancelled')} className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem' }}>
                          Cancel
                        </button>
                      )}
                      {booking.status === 'Accepted' && (
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Service in progress</span>
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
                {pastBookings.map((booking) => {
                  const isEditingRating = activeRatingBookingId === booking.id;

                  return (
                    <div key={booking.id} className="card" style={{ padding: '1.25rem', opacity: booking.status === 'Cancelled' ? 0.7 : 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: '800' }}>{booking.worker_name}</span>
                        <span className={`badge ${booking.status.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{booking.status}</span>
                      </div>
                      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {booking.status === 'Completed' ? `Finished on ${new Date(booking.end_time).toLocaleDateString()}` : 'Booking Cancelled'}
                      </p>

                      {booking.status === 'Completed' && (
                        booking.rating_submitted ? (
                          <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCheckCircle /> Feedback Submitted
                          </div>
                        ) : isEditingRating ? (
                          <div style={{ marginTop: '0.75rem', padding: '0.9rem', border: '1px solid var(--border)', borderRadius: '10px', background: 'var(--background-alt)' }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-light)', marginBottom: '0.75rem' }}>Rate this service</div>
                            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.85rem' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setRatingDraft((current) => ({ ...current, rating: star }))}
                                  style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    color: star <= ratingDraft.rating ? '#f59e0b' : '#cbd5e1',
                                    fontSize: '1.25rem'
                                  }}
                                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                >
                                  <FaStar />
                                </button>
                              ))}
                            </div>
                            <textarea
                              rows="3"
                              value={ratingDraft.review}
                              onChange={(e) => setRatingDraft((current) => ({ ...current, review: e.target.value }))}
                              placeholder="Share a quick note about the service (optional)"
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: '8px', resize: 'vertical', marginBottom: '0.85rem' }}
                            />
                            <div style={{ display: 'flex', gap: '0.6rem' }}>
                              <button
                                disabled={isProcessing || ratingDraft.rating === 0}
                                className="btn"
                                onClick={() => handleRatingSubmit(booking.id, booking.worker_id)}
                                style={{ flex: 1, padding: '0.55rem' }}
                              >
                                Submit Rating
                              </button>
                              <button
                                type="button"
                                disabled={isProcessing}
                                className="btn btn-outline"
                                onClick={resetRatingForm}
                                style={{ padding: '0.55rem 0.85rem' }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button className="btn" onClick={() => openRatingForm(booking.id)} style={{ width: '100%', padding: '0.5rem' }}>
                            Rate Service
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
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
