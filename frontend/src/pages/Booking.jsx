import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FaCalendarAlt, FaClipboardList, FaCheckCircle, FaArrowRight, FaArrowLeft, FaMapMarkerAlt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

function Booking() {
  const { workerId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    description: '',
    start_time: '',
    priority: 'Normal',
    customer_location: '',
    customer_latitude: null,
    customer_longitude: null
  });
  const [geoStatus, setGeoStatus] = useState('idle');
  const [selectedCategory, setSelectedCategory] = useState('Electrician');

  const serviceRates = {
    'Electrician': 200,
    'Plumber': 150,
    'Painter': 150,
    'Construction Worker': 100,
    'Maintenance Worker': 100
  };

  const calculateTotal = () => {
    if (!form.start_time) return 0;
    const durationHours = 1;
    const category = worker?.category || selectedCategory;
    const rate = serviceRates[category] || 0;
    const emergencyFee = form.priority === 'Emergency' ? 600 : 0;
    return (rate * durationHours) + emergencyFee;
  };

  const { data: worker, isLoading } = useQuery({
    queryKey: ['worker', workerId],
    queryFn: () => api.get(`/workers/${workerId}`).then(res => res.data.data || res.data),
    enabled: !!workerId
  });

  const handleSubmit = async () => {
    try {
      const result = await api.post('/bookings', {
        requested_category: worker?.category || selectedCategory,
        description: form.description,
        start_time: form.start_time,
        priority: form.priority,
        customer_location: form.customer_location,
        customer_latitude: form.customer_latitude,
        customer_longitude: form.customer_longitude,
        worker_id: workerId || null
      });
      toast.success(`Request sent to ${result.data?.alerted_workers || 0} workers. First accepter gets assigned.`);
      navigate('/dashboard/customer');
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error('Schedule Conflict Block: Time slot dynamically occupied securely.');
      } else {
        toast.error(err.response?.data?.error || 'Failed to initialize booking boundary.');
      }
    }
  };
  
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
          setForm(prev => ({ ...prev, customer_location: locationLabel, customer_latitude: latitude, customer_longitude: longitude }));
          setGeoStatus('success');
        } catch {
          setForm(prev => ({ ...prev, customer_location: prev.customer_location || 'My Location', customer_latitude: latitude, customer_longitude: longitude }));
          setGeoStatus('success');
        }
      },
      () => setGeoStatus('error'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (isLoading && workerId) return <div className="container" style={{ textAlign: 'center', padding: '4rem', fontSize: '1.25rem', color: 'var(--text-light)' }}>Pulling intelligence ledgers...</div>;

  return (
    <div className="container" style={{ maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{workerId ? 'Book a Professional' : 'Book a Service'}</h1>
        <p style={{ color: 'var(--text-light)' }}>
          {workerId 
            ? `Raising a ${worker?.category || 'service'} request specifically for this professional.` 
            : 'Raising a general service request. All matching professionals will be alerted, and the first to accept gets assigned.'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem', padding: '0 2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= 1 ? 1 : 0.4 }}>
          <div style={{ width: '40px', height: '40px', background: step >= 1 ? 'var(--primary)' : 'var(--background)', color: step >= 1 ? 'white' : 'var(--text-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>1</div>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Select Date & Time</span>
        </div>
        <div style={{ flex: 1, height: '4px', background: step >= 2 ? 'var(--primary)' : 'var(--border)', margin: '18px 1rem 0 1rem', borderRadius: '2px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= 2 ? 1 : 0.4 }}>
          <div style={{ width: '40px', height: '40px', background: step >= 2 ? 'var(--primary)' : 'var(--background)', color: step >= 2 ? 'white' : 'var(--text-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>2</div>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Job Details</span>
        </div>
        <div style={{ flex: 1, height: '4px', background: step >= 3 ? 'var(--primary)' : 'var(--border)', margin: '18px 1rem 0 1rem', borderRadius: '2px' }}></div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: step >= 3 ? 1 : 0.4 }}>
          <div style={{ width: '40px', height: '40px', background: step >= 3 ? 'var(--primary)' : 'var(--background)', color: step >= 3 ? 'white' : 'var(--text-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem', fontWeight: 'bold' }}>3</div>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Confirm Booking</span>
        </div>
      </div>

      <div className="card" style={{ padding: '2.5rem', borderTop: '4px solid var(--primary)', borderRadius: '8px' }}>
        {step === 1 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><FaCalendarAlt color="var(--primary)" /> Select Appointment Time</h3>
            
            { !workerId && (
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Service Category</label>
              <select value={selectedCategory} onChange={(e)=>setSelectedCategory(e.target.value)} style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="Painter">Painter</option>
                <option value="Construction Worker">Construction Worker</option>
                <option value="Maintenance Worker">Maintenance Worker</option>
              </select>
            </div>
            )}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Expected Start Time</label>
              <input type="datetime-local" value={form.start_time} onChange={e=>setForm({...form, start_time: e.target.value})} style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={(e)=>setForm({...form, priority: e.target.value})} style={{ padding: '0.75rem', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <option value="Normal">Normal</option>
                <option value="Emergency">Emergency (higher cost, attend by EOD)</option>
              </select>
            </div>
            {form.priority === 'Emergency' && (
              <p style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: '700', marginTop: '0.75rem' }}>
                Emergency jobs include priority handling and additional fee.
              </p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem' }}>
              <button disabled={!form.start_time || !form.end_time} className="btn" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Confirm Time <FaArrowRight /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}><FaClipboardList color="var(--primary)" /> Describe Your Job</h3>
            <div className="form-group">
              <label>Job Description</label>
              <textarea rows="5" placeholder="Provide a brief summary of the exact service you need..." value={form.description} onChange={e=>setForm({...form, description: e.target.value})} style={{ padding: '1rem', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: '4px' }}></textarea>
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Service Location</span>
                <button type="button" onClick={handleDetectLocation} disabled={geoStatus === 'loading'} style={{ background: 'var(--background-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {geoStatus === 'loading' ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> : <FaMapMarkerAlt />}
                  {geoStatus === 'loading' ? 'Detecting...' : 'Detect My Location'}
                </button>
              </label>
              <input
                type="text"
                value={form.customer_location}
                onChange={(e)=>setForm({...form, customer_location: e.target.value})}
                placeholder="Street / Area / City"
                style={{ marginTop: '0.5rem', padding: '0.75rem', fontSize: '1rem', border: '1px solid var(--border)', borderRadius: '4px', width: '100%' }}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaArrowLeft /> Back</button>
              <button disabled={!form.description || !form.customer_location} className="btn" onClick={() => setStep(3)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Continue to Review <FaArrowRight /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: 'fadeIn 0.3s ease-out', textAlign: 'center' }}>
            <FaCheckCircle color="#10b981" size={72} style={{ marginBottom: '1.5rem' }} />
            <h3 style={{ marginBottom: '1rem' }}>Final Booking Review</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please verify your service parameters directly before confirming.</p>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '8px', textAlign: 'left', marginBottom: '2.5rem', border: '1px solid var(--border)' }}>
               <p style={{ margin: '0 0 0.75rem 0' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block' }}>Service Category:</strong> {worker?.category || selectedCategory}</p>
               <p style={{ margin: '0 0 0.75rem 0' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block' }}>Start Time:</strong> {new Date(form.start_time).toLocaleString()}</p>
               <p style={{ margin: '0 0 0.75rem 0' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block' }}>Priority:</strong> {form.priority}</p>
               <p style={{ margin: '0 0 0.75rem 0' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block' }}>Location:</strong> {form.customer_location}</p>
               <p style={{ margin: '0 0 0.75rem 0' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block' }}>Est. Total Cost:</strong> <strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>₹{calculateTotal()}</strong></p>
               <p style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'flex-start' }}><strong style={{ color: 'var(--text-light)', minWidth: '130px', display: 'inline-block', flexShrink: 0 }}>Job Description:</strong> <span>{form.description}</span></p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaArrowLeft /> Back to Job Details</button>
              <button className="btn" onClick={handleSubmit} style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>Confirm & Book Now <FaCheckCircle /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default Booking;
